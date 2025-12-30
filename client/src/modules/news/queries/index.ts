import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../../lib/api";
import type {
  BreakingNewsResponse,
  UFCNewsResponse,
} from "../../../lib/types/news";

export const breakingNewsKey = ["news", "breaking"] as const;
export const ufcNewsKey = ["news", "ufc"] as const;

function buildBreakingNewsQueryKey(country: string, pageSize: number) {
  return [...breakingNewsKey, country, pageSize] as const;
}

function buildBreakingNewsUrl(country: string, pageSize: number): string {
  return `/api/news/breaking?country=${encodeURIComponent(
    country
  )}&pageSize=${pageSize}`;
}

export function useBreakingNews(country: string = "us", pageSize: number = 10) {
  return useQuery<BreakingNewsResponse>({
    queryKey: buildBreakingNewsQueryKey(country, pageSize),
    queryFn: () => apiGet<BreakingNewsResponse>(buildBreakingNewsUrl(country, pageSize)),
    refetchInterval: 15 * 60 * 1000, 
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, 
  });
}

function buildUFCNewsQueryKey(pageSize: number) {
  return [...ufcNewsKey, pageSize] as const;
}

function buildUFCNewsUrl(pageSize: number): string {
  return `/api/news/ufc?pageSize=${pageSize}`;
}


export function useUFCNews(pageSize: number = 10) {
  return useQuery<UFCNewsResponse>({
    queryKey: buildUFCNewsQueryKey(pageSize),
    queryFn: () => apiGet<UFCNewsResponse>(buildUFCNewsUrl(pageSize)),
    refetchInterval: 15 * 60 * 1000, 
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
}

