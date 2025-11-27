"use client";
// ↑ Tells Next.js this file runs in the browser (needed for interactive contexts)

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/** 
 * A single QueryClient instance handles all server data caching for React Query.
 * Creating it outside the component avoids re-creating on every render.
 */
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}