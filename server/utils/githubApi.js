// utils/githubApi.js
import axios from "axios";
import dayjs from "dayjs";

/**
 * Helper: call GitHub REST API with token.
 */
export const callRest = async (token, url, params = {}) => {
  const { data } = await axios.get(url, {
    baseURL: "https://api.github.com",
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

/**
 * Helper: call GitHub GraphQL API with token.
 */
export const callGraphQL = async (token, query, variables = {}) => {
  const { data } = await axios.post(
    "https://api.github.com/graphql",
    { query, variables },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data;
};

/* ------------------------------------------------------------------ */
/*  Public functions used in routes                                   */
/* ------------------------------------------------------------------ */

/** Get authenticated user's basic profile info */
export const getProfile = async (token) => {
  const user = await callRest(token, "/user");
  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
  };
};

/** Get total public repos owned by the user (GraphQL) */
export const getRepoCount = async (token) => {
  const query = `
    query {
      viewer {
        repositories(ownerAffiliations: OWNER) {
          totalCount
        }
      }
    }
  `;
  const data = await callGraphQL(token, query);
  return data.viewer.repositories.totalCount;
};

/** Get total pull requests opened by the user (GraphQL) */
export const getTotalPRs = async (token) => {
  const query = `
    query {
      viewer {
        pullRequests {
          totalCount
        }
      }
    }
  `;
  const data = await callGraphQL(token, query);
  return data.viewer.pullRequests.totalCount;
};

/** Get total issues raised by the user (GraphQL) */
export const getTotalIssues = async (token) => {
  const query = `
    query {
      viewer {
        issues {
          totalCount
        }
      }
    }
  `;
  const data = await callGraphQL(token, query);
  return data.viewer.issues.totalCount;
};

/** Get total contributions (commits) from the contribution calendar (GraphQL) */
export const getTotalCommits = async (token) => {
  const query = `
    query {
      viewer {
        contributionsCollection {
          totalCommitContributions
        }
      }
    }
  `;
  const data = await callGraphQL(token, query);
  return data.viewer.contributionsCollection.totalCommitContributions;
};

/**
 * Fetch the most recent public events for a user (up to 100).
 * Kept for challenges controller which still uses event data.
 */
export const getRecentEvents = async (token, login) => {
  const data = await callRest(token, `/users/${login}/events`, { per_page: 100 });
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch the full contribution calendar for the graph — returns the complete
 * weeks/days structure with contribution counts for every day.
 * Used to render the heatmap on the dashboard.
 *
 * @param {string} token
 * @returns {{ totalContributions: number, weeks: Array<{ contributionDays: Array<{ date, contributionCount, weekday }> }> }}
 */
export const getContributionGraph = async (token) => {
  const to   = dayjs().endOf("day").toISOString();
  const from = dayjs().subtract(365, "day").startOf("day").toISOString();

  const query = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const data = await callGraphQL(token, query, { from, to });
  return data.viewer.contributionsCollection.contributionCalendar;
};

/**
 * Fetch the full contribution calendar for the past year using GraphQL.
 * Includes PRIVATE repo contributions — this is the correct source for streak
 * calculation.  Returns an array of date strings ("YYYY-MM-DD") that had at
 * least 1 contribution.
 *
 * @param {string} token  GitHub OAuth access token
 * @returns {string[]}    Array of ISO date strings with contributions
 */
export const getContributionDays = async (token) => {
  // Request the last 365 days so we can calculate any realistic streak
  const to   = dayjs().endOf("day").toISOString();
  const from = dayjs().subtract(365, "day").startOf("day").toISOString();

  const query = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const data = await callGraphQL(token, query, { from, to });
  const weeks = data.viewer.contributionsCollection.contributionCalendar.weeks;

  // Flatten all days and keep only those with at least 1 contribution
  const activeDays = [];
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        activeDays.push(day.date); // "YYYY-MM-DD"
      }
    }
  }

  return activeDays;
};

/** Get contribution stats for the past 7 days (GraphQL) */
export const getWeeklyStats = async (token) => {
  const to = dayjs().endOf("day").toISOString();
  const from = dayjs().subtract(7, "day").startOf("day").toISOString();

  const query = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
        }
      }
    }
  `;
  const data = await callGraphQL(token, query, { from, to });
  const c = data.viewer.contributionsCollection;
  return {
    commits:  c.totalCommitContributions,
    prs:      c.totalPullRequestContributions,
    reviews:  c.totalPullRequestReviewContributions,
    issues:   c.totalIssueContributions,
  };
};
