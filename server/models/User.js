// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    displayName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },

    // ── Progression ──────────────────────────────────────────────────
    totalXP: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
    },
    currentRank: {
      type: String,
      default: "Newbie",
    },

    // ── Streaks ───────────────────────────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },

    // ── GitHub contribution stats ─────────────────────────────────────
    totalCommits: {
      type: Number,
      default: 0,
    },
    totalPullRequests: {
      type: Number,
      default: 0,
    },
    totalIssues: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalRepos: {
    type: Number,
    default: 0,
    },

    // ── Sync metadata ─────────────────────────────────────────────────
    lastContributionDate: {
      type: Date,
      default: null,
    },
    lastSync: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

export default mongoose.model("User", userSchema);
