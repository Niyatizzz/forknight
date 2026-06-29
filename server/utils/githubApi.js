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

/** Get total public repos of the user */
export const getRepoCount = async (token) => {
  const { public_repos } = await callRest(token, "/user");
  return public_repos;
};

/** Get total pull requests by user */
export const getTotalPRs = async (token, login) => {
  const { total_count } = await callRest(token, "/search/issues", {
    q: `type:pr+author:${login}`,
  });
  return total_count;
};

/** Get total issues raised by user */
export const getTotalIssues = async (token, login) => {
  const { total_count } = await callRest(token, "/search/issues", {
    q: `type:issue+author:${login}`,
  });
  return total_count;
};

/** Get total contributions (commits) using GraphQL */
export const getTotalCommits = async (token) => {
  const query = `
    query {
      viewer {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;
  const data = await callGraphQL(token, query);
  return data.viewer.contributionsCollection.contributionCalendar
    .totalContributions;
};

/**
 * Fetch the most recent public events for a user (up to 100).
 * Used for streak calculation.
 */
export const getRecentEvents = async (token, login) => {
  const data = await callRest(token, `/users/${login}/events`, { per_page: 100 });
  return Array.isArray(data) ? data : [];
};

/** Get total stats for past 7 days */
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
    commits: c.totalCommitContributions,
    prs: c.totalPullRequestContributions,
    reviews: c.totalPullRequestReviewContributions,
    issues: c.totalIssueContributions,
  };
};
