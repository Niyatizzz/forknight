// controllers/dashboardController.js
/**
 * Dashboard read endpoints.
 *
 * Architecture: sync on every login via POST /api/github/sync (called in the
 * OAuth callback in server.js).  All dashboard GET endpoints read the freshly
 * synced MongoDB data — GitHub is NOT re-contacted here except for
 * weekly-activity, repos, and challenges which are inherently time-sensitive.
 */

import User          from "../models/User.js";
import Achievement   from "../models/Achievement.js";
import XPTransaction from "../models/XPTransaction.js";
import { buildAchievementList, xpToNextLevel } from "../services/progressionService.js";
import { getWeeklyStats, getContributionGraph } from "../utils/githubApi.js";

// ── Helper: find user or 404 ──────────────────────────────────────────────────
const findUser = async (githubId, res) => {
  const user = await User.findOne({ githubId: String(githubId) });
  if (!user) {
    res.status(404).json({ message: "User not found. Please sync first." });
    return null;
  }
  return user;
};

// ── GET /api/github/profile ───────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await findUser(req.user.id, res);
    if (!user) return;

    return res.json({
      login:       user.username,
      name:        user.displayName,
      avatarUrl:   user.avatar,
      email:       user.email,
      publicRepos: user.totalRepos || 0,
    });
  } catch (err) {
    console.error("getProfile error:", err.message);
    return res.status(500).json({ message: "Failed to read profile" });
  }
};

// ── GET /api/github/stats ─────────────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const user = await findUser(req.user.id, res);
    if (!user) return;

    return res.json({
      repos:        user.totalRepos       || 0,
      totalPRs:     user.totalPullRequests || 0,
      totalIssues:  user.totalIssues       || 0,
      totalCommits: user.totalCommits      || 0,
    });
  } catch (err) {
    console.error("getStats error:", err.message);
    return res.status(500).json({ message: "Failed to read stats" });
  }
};

// ── GET /api/github/weekly-activity ──────────────────────────────────────────
// Weekly activity is inherently time-sensitive so we still call GitHub here,
// but the rest of the dashboard reads from MongoDB.
export const getWeeklyActivity = async (req, res) => {
  try {
    const data = await getWeeklyStats(req.user.accessToken);
    return res.json(data);
  } catch (err) {
    console.error("getWeeklyActivity error:", err.message);
    return res.status(500).json({ message: "Failed to fetch weekly activity" });
  }
};

// ── GET /api/github/achievements ─────────────────────────────────────────────
export const getAchievements = async (req, res) => {
  try {
    const user = await findUser(req.user.id, res);
    if (!user) return;

    const unlockedDocs = await Achievement.find({ userId: user._id }).lean();
    const achievementList = buildAchievementList(unlockedDocs);

    const totalXP = unlockedDocs.reduce((sum, a) => sum + (a.rewardXP || 0), 0);

    return res.json({ achievements: achievementList, totalXP });
  } catch (err) {
    console.error("getAchievements error:", err.message);
    return res.status(500).json({ message: "Failed to read achievements" });
  }
};

// ── GET /api/github/repos ─────────────────────────────────────────────────────
// Repo list is always fresh from GitHub (no point caching it).
export const getRepos = async (req, res) => {
  try {
    const response = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: { Authorization: `token ${req.user.accessToken}` },
    });

    if (!response.ok) throw new Error("GitHub API error");

    const repos = await response.json();

    const mapped = repos.map((repo) => ({
      id:          repo.id,
      name:        repo.name,
      description: repo.description,
      stars:       repo.stargazers_count,
      forks:       repo.forks_count,
      language:    repo.language,
      url:         repo.html_url,
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("getRepos error:", err.message);
    return res.status(500).json({ message: "Failed to fetch repositories" });
  }
};

// ── GET /api/github/challenges ────────────────────────────────────────────────
// Challenges require live event data — still fetched from GitHub.
export const getChallenges = async (req, res) => {
  const { accessToken, username } = req.user;
  const login = username;

  try {
    const now          = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 86_400_000);
    const oneWeekAgo    = new Date(now - 7  * 86_400_000);

    const eventsRes = await fetch(
      `https://api.github.com/users/${login}/events?per_page=100`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!eventsRes.ok) throw new Error(`GitHub API error: ${eventsRes.status}`);

    const events = await eventsRes.json();

    const recentEvents = events.filter((e) => new Date(e.created_at) >= thirtyDaysAgo);
    const weeklyEvents = events.filter((e) => new Date(e.created_at) >= oneWeekAgo);

    // Count commits + unique commit days in last 30 days
    let commitsLast30Days = 0;
    const commitDates = new Set();

    recentEvents.forEach((e) => {
      if (e.type === "PushEvent" && e.payload.commits) {
        commitsLast30Days += e.payload.commits.length;
        commitDates.add(new Date(e.created_at).toDateString());
      }
    });

    // PRs merged last week
    let prsLastWeek = weeklyEvents.filter(
      (e) =>
        e.type === "PullRequestEvent" &&
        e.payload.action === "closed" &&
        e.payload.pull_request?.merged
    ).length;

    // Commit streak
    const { calculateStreak } = await import("../services/progressionService.js");
    const commitStreak = calculateStreak(recentEvents);

    // Use GitHub Search for more accurate counts
    const [searchCommitsRes, searchPRsRes] = await Promise.all([
      fetch(
        `https://api.github.com/search/commits?q=author:${login}+committer-date:>=${
          thirtyDaysAgo.toISOString().split("T")[0]
        }&per_page=100`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.cloak-preview+json",
          },
        }
      ),
      fetch(
        `https://api.github.com/search/issues?q=author:${login}+type:pr+created:>=${
          oneWeekAgo.toISOString().split("T")[0]
        }&per_page=100`,
        { headers: { Authorization: `token ${accessToken}` } }
      ),
    ]);

    let searchCommits = 0;
    let searchPRs     = 0;

    if (searchCommitsRes.ok) {
      const d = await searchCommitsRes.json();
      searchCommits = d.total_count || 0;
    }
    if (searchPRsRes.ok) {
      const d = await searchPRsRes.json();
      searchPRs = d.total_count || 0;
    }

    const finalCommitCount = Math.max(commitsLast30Days, searchCommits);
    const finalPRCount     = Math.max(prsLastWeek, searchPRs);

    const challenges = [
      {
        id: 1, name: "Commit Streak",
        description: "Make 400 commits in 30 days",
        progress: finalCommitCount, total: 400, xp: 500,
        type: "streak", timeframe: "30 days", actualProgress: finalCommitCount,
      },
      {
        id: 2, name: "PR Perfectionist",
        description: "Get 5 PRs merged this week",
        progress: finalPRCount, total: 5, xp: 300,
        type: "pr", timeframe: "7 days", actualProgress: finalPRCount,
      },
      {
        id: 3, name: "Daily Coder",
        description: "Code for 10 consecutive days",
        progress: Math.min(commitStreak, 10), total: 10, xp: 200,
        type: "streak", timeframe: "consecutive days", actualProgress: commitStreak,
      },
      {
        id: 4, name: "Active Contributor",
        description: "Make commits on 15 different days this month",
        progress: Math.min(commitDates.size, 15), total: 15, xp: 400,
        type: "consistency", timeframe: "30 days", actualProgress: commitDates.size,
      },
      {
        id: 5, name: "Issue Crusher",
        description: "Close 10 issues in a week",
        progress: 4, total: 10, xp: 250, type: "issues",
      },
      {
        id: 6, name: "Review Master",
        description: "Review 5 pull requests",
        progress: 1, total: 5, xp: 200, type: "review",
      },
      {
        id: 7, name: "Rapid Fire Commits",
        description: "Push 10 commits in a day",
        progress: 6, total: 10, xp: 150, type: "streak",
      },
      {
        id: 8, name: "Open Source Starter",
        description: "Create your first public repo",
        progress: 1, total: 1, xp: 100, type: "repo",
      },
      {
        id: 9, name: "Bug Basher",
        description: "Fix 3 bugs reported by others",
        progress: 1, total: 3, xp: 200, type: "issues",
      },
      {
        id: 10, name: "Weekly Warrior",
        description: "Complete all weekly tasks",
        progress: 2, total: 4, xp: 400, type: "weekly",
      },
    ];

    return res.json({
      challenges,
      debug: {
        eventsCount: events.length,
        recentEventsCount: recentEvents.length,
        weeklyEventsCount: weeklyEvents.length,
        commitDatesCount: commitDates.size,
        finalCommitCount,
        finalPRCount,
        commitStreak,
      },
    });
  } catch (err) {
    console.error("getChallenges error:", err.message);
    return res.status(500).json({ message: "Failed to fetch challenges", error: err.stack });
  }
};

// ── GET /api/github/progress ──────────────────────────────────────────────────
// Returns the full progress object for the current user from MongoDB.
export const getProgress = async (req, res) => {
  try {
    const user = await findUser(req.user.id, res);
    if (!user) return;

    const nextXP = xpToNextLevel(user.totalXP);

    return res.json({
      xp:           user.totalXP,
      level:        user.currentLevel,
      rank:         user.currentRank,
      streak:       user.currentStreak,
      longestStreak: user.longestStreak,
      nextLevelXP:  user.totalXP + nextXP,
      xpToNext:     nextXP,
      totalCommits: user.totalCommits,
      totalPRs:     user.totalPullRequests,
      totalIssues:  user.totalIssues,
      totalReviews: user.totalReviews,
      lastSync:     user.lastSync,
      repoCount: user.totalRepos,
    });
  } catch (err) {
    console.error("getProgress error:", err.message);
    return res.status(500).json({ message: "Failed to read progress" });
  }
};

// ── GET /api/github/contribution-graph ───────────────────────────────────────
// Returns the full year contribution calendar for the heatmap graph.
// Always fetched live from GitHub — this is display data, not progression data.
export const getContributionGraphData = async (req, res) => {
  try {
    const data = await getContributionGraph(req.user.accessToken);
    return res.json(data);
  } catch (err) {
    console.error("getContributionGraphData error:", err.message);
    return res.status(500).json({ message: "Failed to fetch contribution graph" });
  }
};

// ── GET /api/github/xp-history ────────────────────────────────────────────────
export const getXPHistory = async (req, res) => {
  try {
    const user = await findUser(req.user.id, res);
    if (!user) return;

    const history = await XPTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json(history);
  } catch (err) {
    console.error("getXPHistory error:", err.message);
    return res.status(500).json({ message: "Failed to read XP history" });
  }
};
