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
  if (!req.isAuthenticated()) return next();

  try {
    console.log(`Syncing ${req.user.username}...`);
    await runSync(req.user);
    console.log("Sync complete.");
  } catch (err) {
    console.error(err);
  }

  next();
};

export default autoSync;
