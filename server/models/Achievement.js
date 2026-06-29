// models/Achievement.js
import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "🏆",
    },
    rewardXP: {
      type: Number,
      default: 0,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one user can never unlock the same achievement twice
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);
