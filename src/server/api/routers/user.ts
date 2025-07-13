import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  updateGeminiKey: protectedProcedure
    .input(z.object({
      geminiApiKey: z.string().min(1, "API key is required")
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.update({
          where: { id: ctx.user.userId! },
          data: { geminiApiKey: input.geminiApiKey }
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update API key"
        });
      }
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User ID not found in context"
          });
        }

        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            emailAddress: true,
            geminiApiKey: true,
            credit: true
          }
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found in database"
          });
        }

        return user;
      } catch (error) {
        console.error("Error in getProfile:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user profile"
        });
      }
    })
}); 