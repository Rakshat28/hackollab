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
    const project = await ctx.db.project.create({
      data: {
        name: input.name,
        githubUrl: input.githubUrl,
        UserToProject: {
          create: {
            userId: ctx.user.userId!
          }
        }
      }
    });
    // Run repo indexing and commit polling in the background
    (async () => {
      try {
        await indexGithubRepo(input.githubUrl, input.githubToken, project.id);
      } catch (err) {
        console.error('Error indexing GitHub repo:', err);
      }
      try {
        await pollCommits(project.id);
      } catch (err) {
        console.error('Error polling commits:', err);
      }
    })();
    return project;
  }),

  getProjects: protectedProcedure.query(async ({ctx}) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject : {
          some: {
            userId : ctx.user.userId!
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
  .mutation(async ({ input }) => {
    return await pollCommits(input.projectId);
  }),

  getProjectById: protectedProcedure.input(z.object({
  projectId: z.string()
})).query(async ({ ctx, input }) => {
  return await ctx.db.project.findUnique({
    where: { id: input.projectId },
    include: {
      commits: true,
    }
  });
})

});
