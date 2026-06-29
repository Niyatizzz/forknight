// services/progressionService.js
/**
 * All game-progression logic lives here.
 * Controllers stay thin — they only call these functions.
 *
 * Exported functions:
 *   calculateLevel(xp)
 *   calculateRank(xp)
 *   calculateXP(stats)
 *   calculateAchievements(stats, alreadyUnlocked)
 *   calculateStreak(pushEvents)
 */

import ACHIEVEMENT_RULES from "./achievementRules.js";

// ── Level & Rank ─────────────────────────────────────────────────────────────

/**
 * Returns the current level for a given XP total.
 * Formula: every 100 XP = 1 level, starting at level 1.
 */
export const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

/**
 * Returns the XP required to reach the next level.
 */
export const xpToNextLevel = (xp) => 100 - (xp % 100);

/**
 * Maps total XP to a human-readable rank title.
 */
export const calculateRank = (xp) => {
  if (xp >= 2000) return "Open Source Knight";
  if (xp >= 1200) return "Legendary Coder";
  if (xp >= 800)  return "Elite Contributor";
  if (xp >= 500)  return "Pro Hacker";
  if (xp >= 300)  return "Skilled Dev";
  if (xp >= 150)  return "Code Explorer";
  if (xp >= 50)   return "Rookie Committer";
  return "Newbie";
};

// ── XP Calculation ────────────────────────────────────────────────────────────

/**
 * Derives the base XP total from raw GitHub contribution stats.
 * This is the XP earned purely from contributions (NOT achievements).
 * Achievement XP is stored separately in XPTransaction and summed on top.
 *
 * @param {object} stats
 * @param {number} stats.totalCommits
 * @param {number} stats.totalPRs
 * @param {number} stats.totalIssues
 * @param {number} stats.totalReviews
 * @returns {number} contribution-based XP
 */
export const calculateContributionXP = ({ totalCommits, totalPRs, totalIssues, totalReviews }) => {
  const commitXP  = totalCommits  * 2;   // 2 XP per commit
  const prXP      = totalPRs      * 15;  // 15 XP per PR
  const issueXP   = totalIssues   * 5;   // 5 XP per issue
  const reviewXP  = totalReviews  * 10;  // 10 XP per review
  return commitXP + prXP + issueXP + reviewXP;
};

/**
 * Full XP = contribution XP + sum of all unlocked achievement rewards.
 *
 * @param {object}   contributionStats  { totalCommits, totalPRs, totalIssues, totalReviews }
 * @param {number}   achievementXP      Sum of rewardXP from all unlocked achievements
 * @returns {number} totalXP
 */
export const calculateXP = (contributionStats, achievementXP = 0) => {
  return calculateContributionXP(contributionStats) + achievementXP;
};

// ── Achievement Engine ────────────────────────────────────────────────────────

/**
 * Iterates the achievement rules and returns newly unlocked achievements.
 * Already-unlocked achievements are NEVER re-awarded.
 *
 * @param {object}   stats             Combined contribution + weekly stats
 * @param {string[]} alreadyUnlocked   Array of achievementId strings already in DB
 * @returns {{ newlyUnlocked: object[], totalNewXP: number }}
 */
export const calculateAchievements = (stats, alreadyUnlocked = []) => {
  const alreadyUnlockedSet = new Set(alreadyUnlocked);
  const newlyUnlocked = [];

  for (const rule of ACHIEVEMENT_RULES) {
    // Skip already unlocked
    if (alreadyUnlockedSet.has(rule.id)) continue;

    // Evaluate condition safely
    try {
      if (rule.condition(stats)) {
        newlyUnlocked.push({
          achievementId: rule.id,
          title:         rule.title,
          description:   rule.description,
          icon:          rule.icon,
          rewardXP:      rule.rewardXP,
          source:        rule.source,
        });
      }
    } catch (err) {
      console.error(`Achievement condition error for "${rule.id}":`, err.message);
    }
  }

  const totalNewXP = newlyUnlocked.reduce((sum, a) => sum + a.rewardXP, 0);
  return { newlyUnlocked, totalNewXP };
};

/**
 * Merges all achievement rules with the user's unlocked list so the
 * dashboard can show locked achievements too.
 *
 * @param {object[]} unlockedDocs  Achievement documents from MongoDB
 * @returns {object[]} Full list with unlocked=true/false
 */
export const buildAchievementList = (unlockedDocs) => {
  const unlockedMap = new Map(
    unlockedDocs.map((doc) => [doc.achievementId, doc])
  );

  return ACHIEVEMENT_RULES.map((rule) => {
    const doc = unlockedMap.get(rule.id);
    return {
      id:          rule.id,
      title:       rule.title,
      description: rule.description,
      icon:        rule.icon,
      rewardXP:    rule.rewardXP,
      unlocked:    !!doc,
      unlockedAt:  doc ? doc.unlockedAt : null,
    };
  });
};

// ── Streak Calculation ────────────────────────────────────────────────────────

/**
 * Calculates the current commit streak from an array of GitHub push events.
 * A streak is defined as consecutive calendar days that contain at least
 * one PushEvent.  The streak resets if there's a gap of more than 1 day.
 *
 * @param {object[]} events  GitHub /users/{login}/events response
 * @returns {number} current streak in days
 */
export const calculateStreak = (events) => {
  // Collect unique days that had a push
  const commitDaySet = new Set();

  for (const event of events) {
    if (event.type === "PushEvent" && event.payload?.commits?.length > 0) {
      const day = new Date(event.created_at).toDateString();
      commitDaySet.add(day);
    }
  }

  if (commitDaySet.size === 0) return 0;

  // Sort dates descending (most recent first)
  const sortedDays = Array.from(commitDaySet)
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(sortedDays[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const daysSinceLast = Math.floor((today - mostRecent) / 86_400_000);

  // If the last commit was more than 1 day ago, streak is broken
  if (daysSinceLast > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);

    const gap = Math.floor((prev - curr) / 86_400_000);
    if (gap === 1) {
      streak++;
    } else {
      break; // gap found — streak ends here
    }
  }

  return streak;
};
