"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { apiRequest } from "@/lib/api-client";

export function useApiSWR<T>(
  key: string | null,
  config?: SWRConfiguration<T, Error>,
) {
  return useSWR<T, Error>(key, (url: string) => apiRequest<T>(url), {
    revalidateOnFocus: false,
    ...config,
  });
}
