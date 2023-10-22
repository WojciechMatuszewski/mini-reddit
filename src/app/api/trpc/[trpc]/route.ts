import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return { prisma };
    }
  });
};

export { handler as GET, handler as POST };
