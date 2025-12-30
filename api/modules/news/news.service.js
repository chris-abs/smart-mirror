import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

if (!API_KEY) {
  console.warn("[News] Missing NEWS_API_KEY in .env");
}

export async function getBreakingNews(country = "us", pageSize = 10) {
  if (!API_KEY) {
    throw new Error("News API key is not configured");
  }

  const url = `${BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `News API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || "Unknown",
          id: article.source?.id || null,
        },
        author: article.author || null,
      })),
      totalResults: data.totalResults,
      country,
    };
  } catch (error) {
    console.error("[News] Breaking news API error:", error);
    throw error;
  }
}

export async function getUFCNews(pageSize = 10) {
  if (!API_KEY) {
    throw new Error("News API key is not configured");
  }

  // Filter by language=en to exclude non-English articles (e.g., Russian)
  const url = `${BASE_URL}/everything?q=UFC&sortBy=publishedAt&language=en&pageSize=${pageSize}&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `News API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || "Unknown",
          id: article.source?.id || null,
        },
        author: article.author || null,
      })),
      totalResults: data.totalResults,
    };
  } catch (error) {
    console.error("[News] UFC news API error:", error);
    throw error;
  }
}
