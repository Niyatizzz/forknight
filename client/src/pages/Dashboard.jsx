import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Github,
  Trophy,
  Star,
  GitBranch,
  Calendar,
  Target,
  Flame,
  Award,
  TrendingUp,
  Users,
  Code,
  GitPullRequest,
  BookOpen,
  Zap,
  Crown,
  LogOut,
  Search,
  Filter,
  CheckCircle,
  Lock,
} from "lucide-react";

import { apiGet, apiPost } from "../utils/api";

const getRarityColor = (rarity) => {
  switch (rarity) {
    case "common":
      return "from-gray-600 to-gray-700";
    case "uncommon":
      return "from-green-600 to-green-700";
    case "rare":
      return "from-blue-600 to-blue-700";
    case "epic":
      return "from-purple-600 to-purple-700";
    case "legendary":
      return "from-yellow-500 to-yellow-600";
    default:
      return "from-purple-500 to-purple-600";
  }
};

const AchievementCard = ({ achievement }) => {
  if (!achievement) return null;
  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 ${
        achievement.unlocked
          ? `bg-gradient-to-br ${getRarityColor(
              achievement.rarity
            )} backdrop-blur-sm`
          : "bg-black/40 backdrop-blur-sm border border-purple-500/20"
      }`}
    >
      {/* Rarity Indicator */}
      {achievement.unlocked && achievement.rarity && (
        <div className="absolute top-2 right-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              achievement.rarity === "common"
                ? "bg-gray-600/80 text-gray-100"
                : achievement.rarity === "uncommon"
                ? "bg-green-600/80 text-green-100"
                : achievement.rarity === "rare"
                ? "bg-blue-600/80 text-blue-100"
                : achievement.rarity === "epic"
                ? "bg-purple-600/80 text-purple-100"
                : achievement.rarity === "legendary"
                ? "bg-yellow-600/80 text-yellow-100"
                : "bg-purple-600/80 text-purple-100"
            }`}
          >
            {achievement.rarity}
          </div>
        </div>
      )}

      {/* Lock Indicator */}
      {!achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-5 h-5 text-purple-400" />
        </div>
      )}

      <div className="p-6">
        {/* Achievement Icon */}
        <div className="text-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl mb-2 ${
              achievement.unlocked
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-purple-600/20 text-purple-400"
            }`}
          >
            {achievement.unlocked ? (
              achievement.icon || "🏆"
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h4
            className={`font-bold text-lg mb-2 ${
              achievement.unlocked ? "text-white" : "text-purple-300"
            }`}
          >
            {achievement.name}
          </h4>
          <p
            className={`text-lg mb-2 ${
              achievement.unlocked ? "text-white" : "text-purple-300"
            }`}
          >
            {achievement.description}
          </p>

          <h5
            className={`font-bold text-sm mb-3 ${
              achievement.unlocked ? "text-purple-100" : "text-purple-400"
            }`}
          >
            {achievement.unlocked ? `${achievement.xp}xp` : "???"}
          </h5>

          {/* Category */}
          {achievement.category && (
            <div className="mb-3">
              <span className="inline-block bg-purple-600/30 text-purple-200 px-2 py-1 rounded-full text-xs">
                {achievement.category}
              </span>
            </div>
          )}

          {/* Progress */}
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-purple-300 mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-purple-900/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (achievement.progress / achievement.maxProgress) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* XP Reward */}
          {achievement.xpReward && (
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm font-semibold">
              <Zap className="w-4 h-4" />+{achievement.xpReward} XP
            </div>
          )}

          {/* Unlock Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="mt-2 text-xs text-purple-300">
              Unlocked {formatUnlockDate(achievement.unlockedAt)}
            </div>
          )}

          {/* Completion Badge */}
          {achievement.unlocked && (
            <div className="absolute top-2 left-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  /* remote state */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null); // profile + stats
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [repos, setRepos] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [achievementSearch, setAchievementSearch] = useState("");
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [achievementSort, setAchievementSort] = useState("recent");

  // Derived filtered list based on search and filter
  const filteredAchievements = achievements
    .filter((achievement) => {
      if (achievementFilter === "unlocked") return achievement.unlocked;
      if (achievementFilter === "locked") return !achievement.unlocked;
      return true;
    })
    .filter((achievement) =>
      (achievement.title || achievement.name || "").toLowerCase().includes(achievementSearch.toLowerCase())
    );

  // Group achievements by category if needed
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = achievement.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  // Compute stats
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const lockedCount = totalCount - unlockedCount;
  const percentage =
    totalCount > 0 ? ((unlockedCount / totalCount) * 100).toFixed(1) : 0;

  const achievementStats = {
    unlocked: unlockedCount,
    locked: lockedCount,
    total: totalCount,
    percentage,
  };
  const [totalXP, setTotalXP] = useState(0);

  // ── Load dashboard data ───────────────────────────────────────────────────
  // Strategy:
  //   1. Hit /api/github/progress to see if we have a synced record in MongoDB.
  //   2. If not found (404), trigger /api/github/sync automatically (first login).
  //   3. Then load the rest of the data in parallel from MongoDB-backed endpoints.
  useEffect(() => {
    const load = async () => {
      try {
        // Step 1 — try reading persisted progress
        let progress;
        try {
          progress = await apiGet("/api/github/progress");
        } catch (e) {
          if (e.message.includes("404")) {
            // First login — kick off initial sync
            const syncResult = await apiPost("/api/github/sync", {});
            progress = syncResult.progress;
          } else {
            throw e;
          }
        }

        // Step 2 — load remaining data in parallel (all MongoDB-backed except
        //           weekly-activity, challenges and repos which still call GitHub)
        const [profile, weekly, ach, repoList, challengeList] =
          await Promise.all([
            apiGet("/api/github/profile"),
            apiGet("/api/github/weekly-activity"),
            apiGet("/api/github/achievements"),
            apiGet("/api/github/repos"),
            apiGet("/api/github/challenges"),
          ]);

        // Step 3 — build user state from server-computed progress
        setTotalXP(progress.xp);

        setUser({
          name:         profile.name || profile.login,
          level:        progress.level,
          xp:           progress.xp,
          xpToNext:     progress.xpToNext,
          streak:       weekly.commits,     // weekly commit count for display
          dayStreak:    progress.streak,    // persisted streak from MongoDB
          totalCommits: progress.totalCommits,
          totalPRs:     progress.totalPRs,
          totalRepos:   progress.totalPRs !== undefined ? (repoList?.length ?? 0) : 0,
          rank:         progress.rank,
        });

        setWeeklyStats(weekly);
        setAchievements(ach.achievements);
        setRepos(repoList);

        if (challengeList?.challenges) {
          setChallenges(challengeList.challenges);
        } else {
          setChallenges([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    load();
  }, []);

  // Updated challenge card component for better progress display
  const ChallengeCard = ({ challenge }) => {
    const progressPercentage = Math.min(
      (challenge.progress / challenge.total) * 100,
      100
    );
    const isCompleted = challenge.progress >= challenge.total;

    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden">
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              COMPLETE
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl text-purple-400">
              {getChallengeIcon(challenge.type)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{challenge.name}</h3>
              <p className="text-sm text-purple-300">{challenge.description}</p>
              {challenge.timeframe && (
                <p className="text-xs text-purple-400 mt-1">
                  Timeframe: {challenge.timeframe}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              +{challenge.xp} XP
            </div>
            {challenge.actualProgress &&
              challenge.actualProgress > challenge.total && (
                <div className="text-xs text-green-400">
                  {challenge.actualProgress} total!
                </div>
              )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-purple-300 mb-1">
            <span>Progress</span>
            <span>
              {challenge.progress}/{challenge.total}
            </span>
          </div>
          <div className="w-full bg-purple-900/50 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-pink-500 to-purple-500"
              }`}
              style={{
                width: `${progressPercentage}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="text-center">
          <div
            className={`text-3xl font-bold ${
              isCompleted ? "text-green-400" : "text-purple-400"
            }`}
          >
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-purple-300">
            {isCompleted ? "Completed!" : "Complete"}
          </div>
        </div>
      </div>
    );
  };
  const getChallengeIcon = (type) => {
    switch (type) {
      case "streak":
        return <Flame className="w-5 h-5" />;
      case "pr":
        return <GitPullRequest className="w-5 h-5" />;
      case "review":
        return <BookOpen className="w-5 h-5" />;
      case "issues":
        return <Target className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };
  /* ───── loading / error fallbacks ───── */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  /* ---- side‑nav items (static) ---- */
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "challenges",
      label: "Challenges",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: "repositories",
      label: "Repositories",
      icon: <GitBranch className="w-5 h-5" />,
    },
  ];
  const handleLogout = async () => {
    try {
      await apiPost("/api/auth/logout");
      window.location.href = "/"; // or use navigate("/") if using react-router
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white flex">
      {/* Side Navbar */}
      <div className="w-64 bg-black/30 backdrop-blur-md border-r border-purple-500/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/20">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Forknight
            </h1>
          </Link>

          <p className="text-purple-300 text-xs">
            Level up your open source game
          </p>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-purple-300">Level {user.level}</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-purple-300 mb-1">
              <span>XP</span>
              <span>{user.xp.toLocaleString()}</span>
            </div>
            <div className="w-full bg-purple-900/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${((user.xp % 50) / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-600/50 to-pink-600/50 border border-purple-500/30 text-white"
                    : "text-purple-300 hover:text-white hover:bg-purple-600/20"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-purple-600/20 rounded-lg p-2">
              <div className="text-lg font-bold text-green-400">
                {user.streak}
              </div>
              <div className="text-xs text-purple-300">Streak</div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-2">
              <div className="text-lg font-bold text-yellow-400">
                {user.totalRepos}
              </div>
              <div className="text-xs text-purple-300">Repos</div>
            </div>
          </div>
        </div>
        {/* Logout */}
        <div className="p-4 border-t border-purple-500/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
               bg-gradient-to-r from-pink-600/40 to-purple-600/40
               hover:from-pink-600/60 hover:to-purple-600/60
               text-white font-semibold py-3 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
                <p className="text-purple-300 text-sm">
                  {activeTab === "dashboard" && "Welcome back, ready to code?"}
                  {activeTab === "challenges" &&
                    "Complete challenges to earn XP and badges"}
                  {activeTab === "achievements" &&
                    "Show off your coding accomplishments"}
                  {activeTab === "leaderboard" &&
                    "See how you stack up against other devs"}
                  {activeTab === "repositories" &&
                    "Manage your GitHub repositories"}
                  {activeTab === "profile" &&
                    "Customize your developer profile"}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-purple-800/30 rounded-lg">
                {/* Rank Badge */}
                <div className="bg-purple-600/40 rounded-full px-4 py-1 text-sm font-medium text-white">
                  <span className="text-purple-300">Rank: </span>
                  <span className="text-white font-bold">{user.rank}</span>
                </div>

                {/* Greeting Section */}
                <div className="text-right">
                  <p className="text-sm text-purple-300">Hey there,</p>
                  <p className="text-xl font-extrabold text-white">
                    <span className="inline-block align-middle text-2xl mr-1 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      🎮
                    </span>
                    <span className="align-middle">
                      {user.name}
                      <span className="text-purple-300"> !</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="max-w-6xl mx-auto">
              {/* User Stats Banner */}
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                    <p className="text-purple-300 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      {user.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-yellow-400">
                      Level {user.level}
                    </div>
                    <div className="text-sm text-purple-300">
                      {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-purple-300 mb-1">
                    <span>Progress to Level {user.level + 1}</span>
                    <span>{user.xpToNext} XP to go</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((user.xp % 50) / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {user.totalCommits}
                    </div>
                    <div className="text-sm text-purple-300">Total Commits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {user.totalPRs}
                    </div>
                    <div className="text-sm text-purple-300">Pull Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {user.totalRepos}
                    </div>
                    <div className="text-sm text-purple-300">Repositories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                      <Flame className="w-5 h-5" />
                      {user.dayStreak}
                    </div>
                    <div className="text-sm text-purple-300">Day Streak</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Activity */}
                <div className="lg:col-span-2">
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      This Week's Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-600/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-purple-300">
                            Commits
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {weeklyStats.commits}
                        </div>
                      </div>
                      <div className="bg-purple-600/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GitPullRequest className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-purple-300">
                            Pull Requests
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {weeklyStats.prs}
                        </div>
                      </div>
                      <div className="bg-purple-600/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-purple-300">
                            Reviews
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {weeklyStats.reviews}
                        </div>
                      </div>
                      <div className="bg-purple-600/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-orange-400" />
                          <span className="text-sm text-purple-300">
                            Issues Closed
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-orange-400">
                          {weeklyStats.issues}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Challenges */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Active Challenges
                    </h3>
                    <div className="space-y-4">
                      {challenges.slice(0, 2).map((challenge) => (
                        <div
                          key={challenge.id}
                          className="bg-purple-600/20 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="text-purple-400">
                                {getChallengeIcon(challenge.type)}
                              </div>
                              <span className="font-semibold">
                                {challenge.name}
                              </span>
                            </div>
                            <div className="text-yellow-400 font-bold">
                              +{challenge.xp} XP
                            </div>
                          </div>
                          <p className="text-sm text-purple-300 mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-purple-900/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (challenge.progress / challenge.total) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-purple-300">
                              {challenge.progress}/{challenge.total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Recent Achievements */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Recent Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.slice(0, 15).map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-3 rounded-xl text-center ${
                            achievement.unlocked
                              ? "bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border border-yellow-500/20"
                              : "bg-purple-600/20 border border-purple-500/20 opacity-50"
                          }`}
                        >
                          <div className="text-2xl mb-1">
                            {achievement.icon}
                          </div>
                          <div className="text-xs font-semibold">
                            {achievement.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "challenges" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl text-purple-400">
                          {getChallengeIcon(challenge.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            {challenge.name}
                          </h3>
                          <p className="text-sm text-purple-300">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        +{challenge.xp} XP
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-purple-300 mb-1">
                        <span>Progress</span>
                        <span>
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                      <div className="w-full bg-purple-900/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (challenge.progress / challenge.total) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {Math.round(
                          (challenge.progress / challenge.total) * 100
                        )}
                        %
                      </div>
                      <div className="text-sm text-purple-300">Complete</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === "achievements" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-6 rounded-2xl border ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-500/20"
                        : "bg-black/20 border-purple-500/20 opacity-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">{achievement.icon}</div>
                      <h3 className="text-xl font-bold mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-purple-300">
                        {achievement.description}
                      </p>
                      <div className="mt-4">
                        {achievement.unlocked ? (
                          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                            Unlocked!
                          </div>
                        ) : (
                          <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {activeTab === "achievements" && (
            <div className="max-w-6xl mx-auto">
              {/* Achievement Stats Overview */}
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400">
                      {achievementStats.unlocked}
                    </div>
                    <div className="text-sm text-purple-300">Unlocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400">
                      {achievementStats.locked}
                    </div>
                    <div className="text-sm text-purple-300">Locked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400">
                      {achievementStats.total}
                    </div>
                    <div className="text-sm text-purple-300">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-400">
                      {achievementStats.percentage}%
                    </div>
                    <div className="text-sm text-purple-300">Completion</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-purple-900/50 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${achievementStats.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search achievements..."
                      value={achievementSearch}
                      onChange={(e) => setAchievementSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <select
                      value={achievementFilter}
                      onChange={(e) => setAchievementFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                    >
                      <option value="all">All Achievements</option>
                      <option value="unlocked">Unlocked Only</option>
                      <option value="locked">Locked Only</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={achievementSort}
                      onChange={(e) => setAchievementSort(e.target.value)}
                      className="w-full px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="category">By Category</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Achievement Categories */}
              {achievementSort === "category" && (
                <div className="space-y-8">
                  {Object.entries(achievementsByCategory).map(
                    ([category, categoryAchievements]) => (
                      <div
                        key={category}
                        className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
                      >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                            {category === "Commits" && (
                              <Code className="w-6 h-6" />
                            )}
                            {category === "Pull Requests" && (
                              <GitPullRequest className="w-6 h-6" />
                            )}
                            {category === "Reviews" && (
                              <BookOpen className="w-6 h-6" />
                            )}
                            {category === "Issues" && (
                              <Target className="w-6 h-6" />
                            )}
                            {category === "Streaks" && (
                              <Flame className="w-6 h-6" />
                            )}
                            {category === "Repositories" && (
                              <GitBranch className="w-6 h-6" />
                            )}
                            {category === "Social" && (
                              <Users className="w-6 h-6" />
                            )}
                            {category === "Special" && (
                              <Star className="w-6 h-6" />
                            )}
                            {![
                              "Commits",
                              "Pull Requests",
                              "Reviews",
                              "Issues",
                              "Streaks",
                              "Repositories",
                              "Social",
                              "Special",
                            ].includes(category) && (
                              <Award className="w-6 h-6" />
                            )}
                          </div>
                          {category}
                          <span className="text-sm text-purple-300 font-normal">
                            (
                            {
                              categoryAchievements.filter((a) => a.unlocked)
                                .length
                            }
                            /{categoryAchievements.length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryAchievements.map((achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Achievement Grid (for non-category view) */}
              {achievementSort !== "category" && (
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-2xl font-bold mb-6">
                    {achievementFilter === "all" && "All Achievements"}
                    {achievementFilter === "unlocked" &&
                      "Unlocked Achievements"}
                    {achievementFilter === "locked" && "Locked Achievements"}
                    {achievementSearch && ` - "${achievementSearch}"`}
                  </h3>
                  {filteredAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAchievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                      <p className="text-xl text-purple-300 mb-2">
                        No achievements found
                      </p>
                      <p className="text-sm text-purple-400">
                        {achievementSearch
                          ? "Try a different search term"
                          : "Keep coding to unlock achievements!"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Achievement Card Component */}
          <AchievementCard />

          {activeTab === "leaderboard" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  Global Leaderboard
                </h3>
                <div className="space-y-4">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        player.name === user.name
                          ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30"
                          : "bg-purple-600/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{player.badge}</div>
                        <div>
                          <div className="font-bold text-lg">{player.name}</div>
                          <div className="text-sm text-purple-300">
                            Level {player.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {player.xp.toLocaleString()} XP
                        </div>
                        <div className="text-sm text-purple-300">
                          Rank #{player.rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "repositories" && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {repos.length === 0 ? (
                  <div className="col-span-full text-center text-purple-300">
                    No repositories found.
                  </div>
                ) : (
                  repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 transition hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {repo.name}
                        </h3>
                        <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                          {repo.language || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm text-purple-300 mb-4">
                        {repo.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-purple-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {repo.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          {repo.forks}
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
