// models/XPTransaction.js
import mongoose from "mongoose";

const xpTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Human-readable reason for the XP award
    reason: {
      type: String,
      required: true,
      // Examples: "First Blood", "PR Master", "Commit Milestone: 50", "Weekly Warrior"
    },
    xpEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    // Source category for filtering / analytics
    source: {
      type: String,
      enum: ["achievement", "commit", "pull_request", "issue", "review", "streak", "bonus"],
      required: true,
    },
  },
  {
    timestamps: true, // createdAt will serve as the transaction timestamp
  }
);

export default mongoose.model("XPTransaction", xpTransactionSchema);
