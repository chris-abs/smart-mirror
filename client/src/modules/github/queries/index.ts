import { useQuery } from "@tanstack/react-query";

import { apiGet } from "../../../lib/api";
import type { GitHubContributionsData } from "../../../lib/types/github";

export const githubKey = ["github"] as const;

export function useGitHubContributions() {
  return useQuery<GitHubContributionsData>({
    queryKey: [...githubKey, "contributions"],
    queryFn: () => apiGet<GitHubContributionsData>("/api/github/contributions"),
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour - GitHub contributions don't change frequently
  });
}
