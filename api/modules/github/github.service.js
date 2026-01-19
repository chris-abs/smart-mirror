import { Octokit } from "@octokit/core";

let octokit = null;

function getOctokit() {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }
    try {
      octokit = new Octokit({
        auth: token,
      });
    } catch (error) {
      throw new Error(`Failed to initialize Octokit: ${error.message}`);
    }
  }
  return octokit;
}

export async function getContributionsData() {
  const octokit = getOctokit();
  const username = process.env.GITHUB_USERNAME;
  
  if (!username) {
    throw new Error("GITHUB_USERNAME environment variable is not set");
  }

  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999); 
  
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  oneYearAgo.setHours(0, 0, 0, 0); 
  
  const startDate = oneYearAgo.toISOString();

  try {
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      username,
      from: startDate,
      to: endDate.toISOString(),
    };

    const response = await octokit.graphql(query, variables);

    if (!response.user) {
      throw new Error(`User ${username} not found`);
    }

    const contributionCalendar = response.user.contributionsCollection?.contributionCalendar;
    if (!contributionCalendar) {
      throw new Error("Failed to fetch contribution calendar");
    }

    const contributionsMap = new Map();

    for (const week of contributionCalendar.weeks || []) {
      for (const day of week.contributionDays || []) {
        const dateStr = day.date.split("T")[0];
        const count = day.contributionCount || 0;
        
        if (count > 0) {
          contributionsMap.set(dateStr, count);
        }
      }
    }

    const totalContributions = contributionCalendar.totalContributions || 0;

    const entries = [];
    const currentDate = new Date(oneYearAgo);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    while (currentDate <= todayEnd) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const contributionCount = contributionsMap.get(dateStr) || 0;

      let level = 0;
      if (contributionCount >= 20) {
        level = 4;
      } else if (contributionCount >= 10) {
        level = 3;
      } else if (contributionCount >= 5) {
        level = 2;
      } else if (contributionCount >= 1) {
        level = 1;
      }

      entries.push({
        date: dateStr,
        has_contributions: contributionCount > 0,
        contribution_count: contributionCount,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      entries,
      total: totalContributions,
    };
  } catch (error) {
    console.error("[GitHub] Error fetching contributions:", error);
    throw new Error(
      error.message || "Failed to fetch GitHub contributions"
    );
  }
}
