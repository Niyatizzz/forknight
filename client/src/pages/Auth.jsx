import React, { useState, useEffect } from "react";

import {
  Github,
  Trophy,
  Shield,
  Zap,
  ArrowRight,
  Star,
  GitBranch,
  Users,
  Code,
  Award,
  CheckCircle,
  Lock,
  Eye,
  ArrowLeft,
} from "lucide-react";

export default function GitHubAuthPage() {
  const [showGitHubAuth, setShowGitHubAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ ONLY correct OAuth trigger
  const handleConnect = () => {
    window.location.href = "https://forknight.onrender.com/auth/github";
  };

  const handleCloseAuth = () => {
    setShowGitHubAuth(false);
  };

  const handleCancel = () => {
    window.location.href = "/";
  };

  const permissions = [
    {
      icon: Eye,
      title: "Public Repository Access",
      description: "View your public repos and contributions",
    },
    {
      icon: GitBranch,
      title: "Pull Request History",
      description: "Track your PRs for XP calculation",
    },
    {
      icon: Code,
      title: "Issue Participation",
      description: "Monitor issues you've opened or commented on",
    },
    {
      icon: Users,
      title: "Organization Membership",
      description: "Show team leaderboards and competitions",
    },
  ];

  const achievements = [
    { name: "First Connection", xp: 100, icon: Shield, color: "text-blue-400" },
    { name: "GitHub Veteran", xp: 500, icon: Trophy, color: "text-yellow-400" },
    { name: "Code Explorer", xp: 250, icon: Code, color: "text-green-400" },
    {
      name: "Open Source Knight",
      xp: 1000,
      icon: Award,
      color: "text-purple-400",
    },
  ];

  // const handleConnect = () => {
  //   const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  //   const redirectUri = "http://localhost:5144";
  //   window.location.href = "http://localhost:5000/auth/github";
  // };

  // const handleCloseAuth = () => {
  //   setShowGitHubAuth(false);
  // };

  // const handleAuthorize = () => {
  //   const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  //   const redirectUri = "http://localhost:5144"; // or 5173 or your Vercel URL

  //   const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user repo`;

  //   window.location.href = githubOAuthUrl;
  // };

  // const handleCancel = () => {
  //   window.history.back();
  // };

  // GitHub OAuth Popup Component - ForkNight themed
  const GitHubAuthPopup = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <button
          onClick={handleCloseAuth}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Authorize ForkNight
          </h3>
          <p className="text-white/70">
            ForkNight wants to access your GitHub account
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h4 className="font-semibold text-white mb-2">
              This application will be able to:
            </h4>
            <ul className="text-sm text-white/80 space-y-1">
              <li>• Read access to public repositories</li>
              <li>• Read access to your profile information</li>
              <li>• Read access to repository metadata</li>
              <li>• Read access to pull requests</li>
            </ul>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> This application is requesting access to
              your public repositories only. Private repositories will not be
              accessible.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCloseAuth}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-colors font-semibold"
          >
            Authorize
          </button>
        </div>

        <p className="text-xs text-white/50 mt-4 text-center">
          Authorizing will connect your GitHub account
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-2">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ForkNight</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={handleCancel}
              className="text-white/70 hover:text-white transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-6">
              <Zap className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-300">
                Level Up Your Open Source Journey
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Turn{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Commits
              </span>
              <br />
              Into{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Conquests
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Transform your GitHub contributions into an epic gaming
              experience. Earn XP, unlock badges, climb leaderboards, and turn
              open source burnout into pure excitement.
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center text-green-300 justify-center mb-2">
                <CheckCircle className="w-6 h-6 mr-3" />
                <span className="font-semibold text-lg">
                  Authorization Successful!
                </span>
              </div>
              <p className="text-green-200 text-center">
                Welcome to ForkNight! Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 mb-8">
              <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-4"></div>
              <span className="text-white/80 text-lg">
                Connecting to GitHub...
              </span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Connect Button and Info */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Github className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-white">
                    Ready to Level Up?
                  </h3>
                  <p className="text-white/70 mb-8">
                    Connect your GitHub account to transform your contributions
                    into an epic gaming experience
                  </p>

                  <button
                    onClick={handleConnect}
                    disabled={isLoading || isSuccess}
                    className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Github className="w-6 h-6" />
                    <span>Connect with GitHub</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>

                  <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-white/60">
                    <Lock className="w-4 h-4" />
                    <span>Secure OAuth 2.0 Authentication</span>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-white">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>What We'll Access</span>
                </h4>

                <div className="space-y-4">
                  {permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <permission.icon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">
                          {permission.title}
                        </p>
                        <p className="text-sm text-white/60">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-blue-300">
                      Your Privacy Matters
                    </span>
                  </div>
                  <p className="text-sm text-white/70">
                    We only read public data and never modify your repositories.
                    You can revoke access anytime from your GitHub settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Achievements Preview */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-white">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>Instant Achievements</span>
                </h4>

                <p className="text-white/70 mb-6">
                  You'll unlock these badges immediately after connecting:
                </p>

                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                    >
                      <div className="flex items-center space-x-3">
                        <achievement.icon
                          className={`w-6 h-6 ${achievement.color}`}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {achievement.name}
                          </p>
                          <p className="text-sm text-white/60">
                            Achievement unlocked
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">
                          +{achievement.xp}
                        </p>
                        <p className="text-xs text-white/60">XP</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-yellow-300">
                      Bonus XP Opportunity!
                    </span>
                  </div>
                  <p className="text-sm text-white/80">
                    Connect within the next 24 hours to earn a{" "}
                    <span className="font-bold text-yellow-300">
                      2x XP multiplier
                    </span>{" "}
                    on your first week
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h4 className="text-xl font-semibold mb-6 text-white">
                  What Happens Next?
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Analyze Your History
                      </p>
                      <p className="text-sm text-white/60">
                        We'll scan your past contributions and award retroactive
                        XP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Create Your Profile
                      </p>
                      <p className="text-sm text-white/60">
                        Generate your developer profile with stats and
                        achievements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-white">Start Gaming</p>
                      <p className="text-sm text-white/60">
                        Begin earning XP for every contribution you make
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-white/60 mb-4">
              Join <span className="font-bold text-white">10,000+</span>{" "}
              developers who've already leveled up their open source game
            </p>
            <div className="flex justify-center space-x-8 text-sm text-white/50">
              <div>🏆 50M+ XP Earned</div>
              <div>⚡ 500K+ Badges Unlocked</div>
              <div>🔥 10K+ Active Streaks</div>
            </div>
          </div>
        </div>

        {/* GitHub Auth Popup */}
        {showGitHubAuth && <GitHubAuthPopup />}
      </div>
    </div>
  );
}
