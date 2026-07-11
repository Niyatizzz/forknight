import {
  Github, GitBranch, ArrowRight, ArrowLeft, Shield,
  CheckCircle, Zap, Lock, Eye, Code, Users, GitPullRequest,
} from "lucide-react";

const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{children}</span>
);

const PermissionRow = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
    <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-purple-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
  </div>
);

const AchievementPreview = ({ icon, name, xp, color }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-base`}>{icon}</div>
      <p className="text-sm font-medium text-white">{name}</p>
    </div>
    <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
      <Zap className="w-3 h-3" />+{xp} XP
    </span>
  </div>
);

export default function Auth() {
  const handleConnect = () => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${base}/auth/github`;
  };

  const permissions = [
    { icon: Eye,           title: "Read your profile",         description: "Name, avatar, bio and email" },
    { icon: GitPullRequest,title: "Read pull requests",        description: "Count and history for XP" },
    { icon: Code,          title: "Read contributions",        description: "Commits, issues, reviews" },
    { icon: Users,         title: "Read organizations",        description: "Team leaderboard support" },
  ];

  const instantAchievements = [
    { icon: "🩸", name: "First Blood",   xp: 50,  color: "bg-red-500/20"    },
    { icon: "🔥", name: "Day Streaker",  xp: 50,  color: "bg-orange-500/20" },
    { icon: "🥷", name: "Code Ninja",    xp: 100, color: "bg-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">ForkNight</span>
        </div>
        <a href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </a>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-4">GitHub OAuth</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Start your <GradientText>quest</GradientText>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Connect your GitHub account to start earning XP, unlocking badges and tracking your coding streak.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Left: connect card */}
          <div className="space-y-4">
            {/* Main CTA */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-purple-500/25">
                <Github className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to level up?</h2>
              <p className="text-sm text-slate-400 mb-6">One click to connect. We handle the rest.</p>
              <button onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:scale-105">
                <Github className="w-5 h-5" />
                Connect with GitHub
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-600">
                <Lock className="w-3 h-3" />Secure OAuth 2.0 · Read-only access
              </div>
            </div>

            {/* Permissions */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-green-400" />
                <p className="text-sm font-semibold text-white">What we access</p>
              </div>
              <div className="space-y-2">
                {permissions.map((p) => <PermissionRow key={p.title} {...p} />)}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">We never write to your repositories. You can revoke access any time from your GitHub settings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: what you get */}
          <div className="space-y-4">
            {/* Instant achievements */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-semibold text-white">Instant achievements</p>
              </div>
              <p className="text-xs text-slate-500 mb-4">Unlock these the moment you connect:</p>
              <div className="space-y-2">
                {instantAchievements.map((a) => <AchievementPreview key={a.name} {...a} />)}
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5">
              <p className="text-sm font-semibold text-white mb-4">What happens next</p>
              <div className="space-y-4">
                {[
                  { n: "1", t: "Sync your GitHub", d: "We fetch your contribution history, commits, PRs and issues." },
                  { n: "2", t: "Award your XP",    d: "Your lifetime stats are converted to XP and achievements unlocked." },
                  { n: "3", t: "Start gaming",      d: "Dashboard goes live — track streaks, challenges and your rank." },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{n}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
