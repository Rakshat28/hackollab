
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter
});

/**
 * This is the type for your tRPC API routes, you can import this type
 * from other files to create type safe API calls
 */
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
