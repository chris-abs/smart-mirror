import type { NewsArticle } from "../../../lib/types/news";

/**
 * Check if an article contains betting-related content
 * Filters out articles containing "bet" or "bets" as whole words
 * (not substrings like "between" or "betray")
 */
export function containsBettingContent(
  article: Pick<NewsArticle, "title" | "description">
): boolean {
  const betRegex = /\b(bet|bets)\b/gi;
  const title = article.title || "";
  const description = article.description || "";
  return betRegex.test(title) || betRegex.test(description);
}

/**
 * Filter out articles containing betting content
 */
export function filterBettingArticles<T extends Pick<NewsArticle, "title" | "description">>(
  articles: T[]
): T[] {
  return articles.filter((article) => !containsBettingContent(article));
}

