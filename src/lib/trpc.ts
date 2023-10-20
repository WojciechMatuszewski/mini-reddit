import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "../server/router";

export const getTRPCClient = () => {
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc"
      })
    ]
  });

  return client;
};
