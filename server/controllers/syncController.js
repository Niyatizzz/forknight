// controllers/syncController.js
/**
 * Thin controller — delegates all work to syncService.
 * Only handles HTTP concerns (auth check, error response shape).
 */

import { runSync } from "../services/syncService.js";

/**
 * POST /api/github/sync
 * Triggers a full GitHub → MongoDB sync for the authenticated user.
 */
export const syncGitHub = async (req, res) => {
  try {
    const result = await runSync(req.user);
    return res.json(result);
  } catch (err) {
    console.error("Sync error:", err.message);
    return res.status(500).json({
      message: "GitHub sync failed",
      error: err.message,
    });
  }
};
