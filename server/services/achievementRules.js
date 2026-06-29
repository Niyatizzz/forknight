// services/achievementRules.js
/**
 * Central achievement configuration.
 *
 * Each entry describes ONE achievement.  The progression engine will iterate
 * this array, evaluate condition(stats) and unlock dynamically — no
 * achievement logic is scattered across controllers.
 *
 * Adding a new achievement = adding one object here.  Nothing else changes.
 *
 * stats shape (passed in from progressionService):
 * {
 *   totalCommits   : number,
 *   totalPRs       : number,
 *   totalIssues    : number,
 *   totalReviews   : number,
 *   currentStreak  : number,
 *   weeklyCommits  : number,
 *   weeklyPRs      : number,
 *   weeklyIssues   : number,
 *   weeklyReviews  : number,
 * }
 */

const ACHIEVEMENT_RULES = [
  // ── Commit milestones ────────────────────────────────────────────────
  {
    id: "first_blood",
    title: "First Blood",
    description: "Made your very first commit",
    icon: "🩸",
    rewardXP: 50,
    source: "achievement",
    condition: (s) => s.totalCommits >= 1,
  },
  {
    id: "code_ninja",
    title: "Code Ninja",
    description: "Reached 50 commits",
    icon: "🥷",
    rewardXP: 100,
    source: "achievement",
    condition: (s) => s.totalCommits >= 50,
  },
  {
    id: "commit_beast",
    title: "Commit Beast",
    description: "Reached 200 commits",
    icon: "🦁",
    rewardXP: 150,
    source: "achievement",
    condition: (s) => s.totalCommits >= 200,
  },
  {
    id: "commit_legend",
    title: "Commit Legend",
    description: "Reached 500 commits",
    icon: "🌟",
    rewardXP: 300,
    source: "achievement",
    condition: (s) => s.totalCommits >= 500,
  },

  // ── Pull request milestones ──────────────────────────────────────────
  {
    id: "pr_master",
    title: "PR Master",
    description: "Opened 10 pull requests",
    icon: "🔀",
    rewardXP: 100,
    source: "achievement",
    condition: (s) => s.totalPRs >= 10,
  },
  {
    id: "merge_lord",
    title: "Merge Lord",
    description: "Opened 50 pull requests",
    icon: "👑",
    rewardXP: 200,
    source: "achievement",
    condition: (s) => s.totalPRs >= 50,
  },

  // ── Issue milestones ─────────────────────────────────────────────────
  {
    id: "bug_hunter",
    title: "Bug Hunter",
    description: "Raised 10 issues",
    icon: "🐛",
    rewardXP: 75,
    source: "achievement",
    condition: (s) => s.totalIssues >= 10,
  },
  {
    id: "issue_crusher",
    title: "Issue Crusher",
    description: "Raised 50 issues",
    icon: "💥",
    rewardXP: 150,
    source: "achievement",
    condition: (s) => s.totalIssues >= 50,
  },

  // ── Streak achievements ──────────────────────────────────────────────
  {
    id: "day_one_streaker",
    title: "Day One Streaker",
    description: "Maintained a 1-day coding streak",
    icon: "🔥",
    rewardXP: 50,
    source: "streak",
    condition: (s) => s.currentStreak >= 1,
  },
  {
    id: "consistency_champ",
    title: "Consistency Champ",
    description: "Maintained a 7-day coding streak",
    icon: "🏅",
    rewardXP: 200,
    source: "streak",
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Maintained a 30-day coding streak",
    icon: "⚡",
    rewardXP: 500,
    source: "streak",
    condition: (s) => s.currentStreak >= 30,
  },

  // ── Weekly activity achievements ─────────────────────────────────────
  {
    id: "weekend_warrior",
    title: "Weekend Warrior",
    description: "Made 10 commits in a single week",
    icon: "💪",
    rewardXP: 75,
    source: "achievement",
    condition: (s) => s.weeklyCommits >= 10,
  },
  {
    id: "push_to_the_limit",
    title: "Push to the Limit",
    description: "Made 20 commits in a single week",
    icon: "🚀",
    rewardXP: 100,
    source: "achievement",
    condition: (s) => s.weeklyCommits >= 20,
  },
  {
    id: "open_source_enthusiast",
    title: "Open Source Enthusiast",
    description: "Opened 3 PRs in a single week",
    icon: "🌍",
    rewardXP: 80,
    source: "achievement",
    condition: (s) => s.weeklyPRs >= 3,
  },
  {
    id: "bug_fixer",
    title: "Bug Fixer",
    description: "Raised 3 issues in a single week",
    icon: "🔧",
    rewardXP: 80,
    source: "achievement",
    condition: (s) => s.weeklyIssues >= 3,
  },
  {
    id: "weekly_legend",
    title: "Weekly Legend",
    description: "5+ commits, 5+ PRs, and 5+ issues in one week",
    icon: "🏆",
    rewardXP: 150,
    source: "achievement",
    condition: (s) =>
      s.weeklyCommits >= 5 && s.weeklyPRs >= 5 && s.weeklyIssues >= 5,
  },
];

export default ACHIEVEMENT_RULES;
