// middleware/autoSync.js
/**
 * Auto-sync middleware.
 *
 * When a user completes GitHub OAuth for the FIRST TIME (no User document
 * exists in MongoDB), this middleware automatically runs a full sync so
 * their progression is populated before they hit the dashboard.
 *
 * On subsequent logins the middleware is a no-op — data already exists.
 *
 * Usage: attach to the OAuth callback success handler in server.js.
 */

import User       from "../models/User.js";
import { runSync } from "../services/syncService.js";

const autoSync = async (req, res, next) => {
  // Only run if Passport has authenticated the user
  if (!req.isAuthenticated()) return next();

  try {
    const githubId = String(req.user.id);
    const existing = await User.findOne({ githubId });

    if (!existing) {
      // New user — run initial sync silently
      console.log(`🆕 New user ${req.user.username} — running initial sync…`);
      await runSync(req.user);
      console.log(`✅ Initial sync complete for ${req.user.username}`);
    }
    // Existing user — skip sync, let them trigger it manually
  } catch (err) {
    // Never block the login flow on a sync error
    console.error("Auto-sync error (non-fatal):", err.message);
  }

  return next();
};

export default autoSync;
