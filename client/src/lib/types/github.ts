export interface GitHubEntry {
  date: string;
  has_contributions: boolean;
  contribution_count: number;
}

export interface GitHubContributionsData {
  entries: GitHubEntry[];
  total: number;
}
