import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
      name: z.string(),
      githubUrl: z.string(),
      githubToken: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
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

      return project;
    } catch (err) {
      if(err instanceof TRPCError){
        throw err;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not create project",
        cause: err
      });
    }
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
  })
});
