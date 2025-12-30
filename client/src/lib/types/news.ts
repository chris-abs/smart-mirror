export type NewsSource = {
  name: string;
  id: string | null;
};

export type NewsArticle = {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: NewsSource;
  author: string | null;
};

export type BreakingNewsResponse = {
  articles: NewsArticle[];
  totalResults: number;
  country: string;
};

export type UFCNewsResponse = {
  articles: NewsArticle[];
  totalResults: number;
};

