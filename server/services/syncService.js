// services/syncService.js
/**
 * Orchestrates a full GitHub → MongoDB sync for a user.
 *
 * Steps:
 *   1. Fetch all required GitHub data
 *   2. Calculate streak from recent push events
 *   3. Derive contribution XP
 *   4. Evaluate achievement rules → find newly unlocked achievements
 *   5. Write achievements + XP transactions to MongoDB (no duplicates)
 *   6. Recalculate total XP (contribution + all achievement XP)
 *   7. Persist updated User document
 *   8. Return structured response
 */

import {
  getProfile,
  getRepoCount,
  getTotalPRs,
  getTotalIssues,
  getTotalCommits,
  getWeeklyStats,
  getContributionDays,
} from "../utils/githubApi.js";

import {
  calculateContributionXP,
  calculateXP,
  calculateLevel,
  calculateRank,
  calculateStreakFromDays,
  calculateAchievements,
  xpToNextLevel,
} from "./progressionService.js";

import User        from "../models/User.js";
import Achievement from "../models/Achievement.js";
import XPTransaction from "../models/XPTransaction.js";

/**
 * Run a full sync for the given user.
 *
 * @param {object} sessionUser  The Passport user object (has .accessToken, .username, .id)
 * @returns {object}  Sync response shaped per the API spec
 */
export const runSync = async (sessionUser) => {
  const { accessToken, username: login } = sessionUser;
  const githubId = String(sessionUser.id);

  // ── 1. Fetch GitHub data in parallel ──────────────────────────────────────
  const [profile, repoCount, totalPRs, totalIssues, totalCommits, weeklyStats, contributionDays] =
    await Promise.all([
      getProfile(accessToken),
      getRepoCount(accessToken),
      getTotalPRs(accessToken),
      getTotalIssues(accessToken),
      getTotalCommits(accessToken),
      getWeeklyStats(accessToken),
      getContributionDays(accessToken),  // GraphQL calendar — includes private repos
    ]);

  console.log("✅ GitHub data fetched:", { totalCommits, repoCount, totalPRs, totalIssues });

  // ── 2. Streak (GraphQL calendar — counts private + public contributions) ───
  const currentStreak = calculateStreakFromDays(contributionDays);
  console.log(`🔥 Streak: ${currentStreak} days (from ${contributionDays.length} active days)`);

  // ── 3. Build stats object used by achievement engine ──────────────────────
  const stats = {
    totalCommits,
    totalPRs,
    totalIssues,
    totalReviews:  weeklyStats.reviews, // all-time reviews not in REST API; use cumulative weekly
    currentStreak,
    weeklyCommits: weeklyStats.commits,
    weeklyPRs:     weeklyStats.prs,
    weeklyIssues:  weeklyStats.issues,
    weeklyReviews: weeklyStats.reviews,
  };

  console.log(`🔍 Syncing GitHub ID: ${githubId}`);
  const existing = await User.findOne({ githubId });
  let user = existing;
  // ── 4. Find or create the User document ───────────────────────────────────
  //let user = await User.findOne({ githubId });

  if (!user) {
    user = new User({
      githubId,
      username:    login,
      displayName: profile.name || login,
      avatar:      profile.avatarUrl,
      email:       profile.email || "",
      accessToken,
    });
  } else {
    // Always keep the token fresh
    user.accessToken = accessToken;
    user.username = login;
    user.displayName = profile.name || login;
    user.avatar = profile.avatarUrl;
    user.email = profile.email || "";
  }

  // ── 5. Determine already-unlocked achievements ────────────────────────────
  const existingAchievements = await Achievement.find({ userId: user._id }).lean();
  const alreadyUnlockedIds   = existingAchievements.map((a) => a.achievementId);

  // ── 6. Run achievement engine ─────────────────────────────────────────────
  const { newlyUnlocked, totalNewXP } = calculateAchievements(stats, alreadyUnlockedIds);

  // ── 7. Persist new achievements + XP transactions ─────────────────────────
  const now = new Date();

  if (newlyUnlocked.length > 0) {
    // insertMany with ordered:false so one duplicate (race condition) doesn't
    // abort the rest.  The unique index on (userId, achievementId) is the
    // true guard.
    const achievementDocs = newlyUnlocked.map((a) => ({
      userId:        user._id,
      achievementId: a.achievementId,
      title:         a.title,
      description:   a.description,
      icon:          a.icon,
      rewardXP:      a.rewardXP,
      unlockedAt:    now,
    }));

    await Achievement.insertMany(achievementDocs, { ordered: false }).catch((err) => {
      // E11000 = duplicate key — safe to ignore, already unlocked
      if (err.code !== 11000 && err.writeErrors?.every((e) => e.code === 11000)) {
        throw err;
      }
    });

    const xpTxDocs = newlyUnlocked.map((a) => ({
      userId:   user._id,
      reason:   a.title,
      xpEarned: a.rewardXP,
      source:   a.source || "achievement",
    }));

    await XPTransaction.insertMany(xpTxDocs);
  }

  // ── 8. Compute total achievement XP from DB (source of truth) ─────────────
  const allAchievements    = await Achievement.find({ userId: user._id }).lean();
  const totalAchievementXP = allAchievements.reduce((sum, a) => sum + (a.rewardXP || 0), 0);

  // ── 9. Final XP, level, rank ───────────────────────────────────────────────
  const finalXP    = calculateXP({ totalCommits, totalPRs, totalIssues, totalReviews: weeklyStats.reviews }, totalAchievementXP);
  const finalLevel = calculateLevel(finalXP);
  const finalRank  = calculateRank(finalXP);
  const nextXP     = xpToNextLevel(finalXP);


  user = await User.findOneAndUpdate(
    { githubId },
    {
      githubId,
      username:          login,
      displayName:       profile.name || login,
      avatar:            profile.avatarUrl,
      email:             profile.email || "",
      accessToken,
      totalXP:           finalXP,
      currentLevel:      finalLevel,
      currentRank:       finalRank,
      currentStreak,
      longestStreak:     Math.max(user.longestStreak || 0, currentStreak),
      totalCommits,
      totalPullRequests: totalPRs,
      totalIssues,
      totalReviews:      weeklyStats.reviews,
      totalRepos:        repoCount,
      lastSync:          now,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Sync complete for ${login} — XP: ${finalXP}, Level: ${finalLevel}, Rank: ${finalRank}, Streak: ${currentStreak}`);
  // ── 11. Build response ─────────────────────────────────────────────────────
  return {
    profile: {
      githubId:    user.githubId,
      username:    user.username,
      displayName: user.displayName,
      avatar:      user.avatar,
      email:       user.email,
    },
    progress: {
      xp:          finalXP,
      level:       finalLevel,
      rank:        finalRank,
      streak:      currentStreak,
      longestStreak: user.longestStreak,
      nextLevelXP: finalXP + nextXP, // XP needed to hit next level
      xpToNext:    nextXP,
      totalCommits,
      totalPRs,
      totalIssues,
      totalReviews: weeklyStats.reviews,
      totalRepos:  repoCount,
      weeklyStats,
    },
    newAchievements: newlyUnlocked,
    lastSync: now.toISOString(),
  };
};
