import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
      name: z.string(),
      githubUrl: z.string(),
      githubToken: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const existingProject = await ctx.db.project.findFirst({
      where : {
        OR : [
          {name : input.name},
          {githubUrl: input.githubUrl}
        ]
      }
    });
    if(existingProject){
      throw new TRPCError({
        code : "CONFLICT",
        message: "Project already exists"
      })
    };
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { geminiApiKey: true }
    });
    if (!user?.geminiApiKey) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Gemini API key available. Please add your API key first."
      });
    }
    const project = await ctx.db.project.create({
      data: {
        name: input.name,
        githubUrl: input.githubUrl,
        UserToProject: {
          create: {
            userId: ctx.user.userId
          }
        }
      }
    });
    try {
      await indexGithubRepo(input.githubUrl, input.githubToken, project.id, user.geminiApiKey);
      const embeddingCount = await ctx.db.sourceCodeEmbedding.count({
        where: { projectId: project.id }
      });
      if (embeddingCount === 0) {
        await ctx.db.project.delete({ where: { id: project.id } });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to index the project codebase. Please check your GitHub URL, token, and Gemini API key, then try again."
        });
      }
    } catch (err) {
      await ctx.db.project.delete({ where: { id: project.id } });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to index the project codebase. Please check your GitHub URL, token, and Gemini API key, then try again."
      });
    }
    return project;
  }),

  getProjects: protectedProcedure.query(async ({ctx}) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject : {
          some: {
            userId : ctx.user.userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        githubUrl: true
      }
    })
    return projects;
  }),

  getCommits: protectedProcedure.input(z.object({
    projectId : z.string()
  })).query(async ({ctx,input}) => {
    return await ctx.db.commit.findMany({where: { projectId : input.projectId}})
  }),

  pollCommits: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { geminiApiKey: true }
    });
    return await pollCommits(input.projectId, user?.geminiApiKey ?? undefined);
  }),

  getProjectById: protectedProcedure.input(z.object({
  projectId: z.string()
})).query(async ({ ctx, input }) => {
  return await ctx.db.project.findUnique({
    where: { id: input.projectId },
    include: {
      commits: true,
      SourceCodeEmbedding: {
        select: {
          id: true
        }
      }
    }
  });
}),

  reindexProject: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { geminiApiKey: true }
    });
    if (!user?.geminiApiKey) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Gemini API key available. Please add your API key first."
      });
    }
    const project = await ctx.db.project.findUnique({
      where: { id: input.projectId },
      select: { githubUrl: true }
    });
    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found"
      });
    }
    await ctx.db.sourceCodeEmbedding.deleteMany({
      where: { projectId: input.projectId }
    });
    try {
      console.log('Starting project re-indexing...');
      const githubToken = process.env.GITHUB_TOKEN;
      await indexGithubRepo(project.githubUrl, githubToken, input.projectId, user.geminiApiKey);
      const embeddingCount = await ctx.db.sourceCodeEmbedding.count({
        where: { projectId: input.projectId }
      });
      if (embeddingCount === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to re-index project: No embeddings were created. Please check your GitHub URL, token, and Gemini API key, then try again."
        });
      }
      console.log('Project re-indexing completed successfully');
      return { success: true, message: "Project re-indexed successfully" };
    } catch (error) {
      console.error('Error during re-indexing:', error);
      const embeddingCount = await ctx.db.sourceCodeEmbedding.count({
        where: { projectId: input.projectId }
      });
      if (embeddingCount > 0) {
        return {
          success: true,
          message: `Partial re-indexing completed. ${embeddingCount} files indexed successfully. Some files may have failed due to API limits.`
        };
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to re-index project: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  })

});
