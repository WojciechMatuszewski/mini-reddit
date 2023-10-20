"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        mutations: {},
        queries: {
          suspense: true,
          throwOnError: true
        }
      }
    });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};