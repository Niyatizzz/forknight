// routes/github.js
import express from "express";
import { syncGitHub }        from "../controllers/syncController.js";
import {
  getProfile,
  getStats,
  getWeeklyActivity,
  getAchievements,
  getRepos,
  getChallenges,
  getProgress,
  getXPHistory,
  getContributionGraphData,
}                            from "../controllers/dashboardController.js";

const router = express.Router();

// ── Auth guard applied to all routes in this file ────────────────────────────
const ensureAuth = (req, res, next) =>
  req.isAuthenticated()
    ? next()
    : res.status(401).json({ message: "Not authenticated" });

router.use(ensureAuth);

// ── Sync ─────────────────────────────────────────────────────────────────────
// Triggers a full GitHub → MongoDB sync.  Call this to refresh all data.
router.post("/sync", syncGitHub);

// ── Dashboard reads (from MongoDB) ───────────────────────────────────────────
router.get("/profile",         getProfile);
router.get("/stats",           getStats);
router.get("/weekly-activity", getWeeklyActivity);
router.get("/achievements",    getAchievements);
router.get("/repos",           getRepos);
router.get("/challenges",      getChallenges);
router.get("/progress",              getProgress);
router.get("/xp-history",            getXPHistory);
router.get("/contribution-graph",    getContributionGraphData);

// ── Leaderboard (placeholder) ─────────────────────────────────────────────────
router.get("/leaderboard", (_req, res) => {
  res.json([
    { rank: 1, name: "CodeMaster3000", xp: 25600, level: 48, badge: "🏆" },
    { rank: 2, name: "DevNinja",        xp: 23400, level: 45, badge: "🥈" },
    { rank: 3, name: "CodeWarrior",     xp: 18750, level: 42, badge: "🥉" },
  ]);
});

export default router;
