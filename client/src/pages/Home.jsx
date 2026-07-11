import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Github, Zap, Trophy, Users, ArrowRight, Star,
  GitBranch, Code, Award, Flame, GitPullRequest,
  Shield, TrendingUp, CheckCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tiny reusable components
───────────────────────────────────────────── */
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
    {children}
  </span>
);

const GradientText = ({ children, from = "from-purple-400", to = "to-pink-400" }) => (
  <span className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`}>
    {children}
  </span>
);

/* Stat counter card */
const StatCard = ({ icon: Icon, value, label, color, delay }) => (
  <div
    className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

/* Feature card */
const FeatureCard = ({ icon: Icon, title, desc, gradient, delay }) => (
  <div
    className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/8 transition-all duration-300 overflow-hidden"
    style={{ animationDelay: delay }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient} rounded-2xl`} />
    <div className="relative z-10">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* Step card for "How it works" */
const StepCard = ({ number, title, desc, accent, items }) => (
  <div className="relative flex gap-5">
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${accent} shrink-0`}>
        {number}
      </div>
      {number < 3 && <div className="w-px flex-1 mt-3 bg-gradient-to-b from-purple-500/40 to-transparent" />}
    </div>
    <div className="pb-10">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-3">{desc}</p>
      {items && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item.label} className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color} bg-white/5`}>
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* XP action pill */
const XPPill = ({ emoji, action, xp, color }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-colors">
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium text-white">{action}</span>
    </div>
    <span className={`text-sm font-bold ${color}`}>+{xp} XP</span>
  </div>
);

/* ─────────────────────────────────────────────
   Mock Dashboard Preview widget
───────────────────────────────────────────── */
const DashboardPreview = () => (
  <div className="relative w-full max-w-sm mx-auto">
    {/* Glow behind the card */}
    <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/30 to-pink-600/20 rounded-3xl blur-2xl" />
    <div className="relative rounded-2xl border border-white/15 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-slate-500">forknight.app/dashboard</span>
      </div>
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* User row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">N</div>
          <div>
            <p className="text-sm font-semibold text-white">nihitakolukula</p>
            <p className="text-xs text-purple-400">Level 14 · Pro Hacker</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-yellow-400">1,340 XP</p>
          </div>
        </div>
        {/* XP bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress to Level 15</span><span>60 XP to go</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: "40%" }} />
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[["222", "Commits"], ["18", "PRs"], ["7🔥", "Streak"], ["31", "Repos"]].map(([v, l]) => (
            <div key={l} className="bg-white/5 rounded-lg py-2">
              <p className="text-sm font-bold text-white">{v}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>
        {/* Achievement row */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Recent Badges</p>
          <div className="flex gap-2">
            {["🩸", "🥷", "🔀", "🔥", "💪"].map((icon, i) => (
              <div key={i} className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/20 flex items-center justify-center text-base">{icon}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const words = ["Commits", "Pull Requests", "Issues", "Code Reviews", "Streaks"];

  const handleConnect = () => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${base}/auth/github`;
  };

  /* Typewriter */
  useEffect(() => {
    const word = words[wordIdx];
    const speed = deleting ? 40 : 120;
    const timer = setTimeout(() => {
      if (!deleting && typedText === word) {
        setTimeout(() => setDeleting(true), 1800);
      } else if (deleting && typedText === "") {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      } else {
        setTypedText((t) =>
          deleting ? t.slice(0, -1) : word.slice(0, t.length + 1)
        );
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [typedText, deleting, wordIdx]);

  const features = [
    { icon: Zap, title: "Earn XP", desc: "Every commit, PR, issue and review earns experience points. Watch your total climb in real time.", gradient: "from-yellow-500/20 to-orange-500/20", delay: "0s" },
    { icon: Trophy, title: "Unlock Badges", desc: "Collect achievements like \"Bug Hunter\", \"Merge Lord\" and \"Unstoppable\". Show them off on your profile.", gradient: "from-purple-500/20 to-pink-500/20", delay: "0.05s" },
    { icon: Flame, title: "Streak Tracking", desc: "Maintain daily coding streaks for bonus XP. Includes private repo commits — nothing gets missed.", gradient: "from-orange-500/20 to-red-500/20", delay: "0.1s" },
    { icon: TrendingUp, title: "Level System", desc: "Rise through 8 ranks from Newbie to Open Source Knight. Every 100 XP earns you a new level.", gradient: "from-blue-500/20 to-purple-500/20", delay: "0.15s" },
    { icon: GitPullRequest, title: "Live Challenges", desc: "Time-boxed challenges like \"Make 5 PRs this week\" keep you pushing harder with real rewards.", gradient: "from-green-500/20 to-teal-500/20", delay: "0.2s" },
    { icon: Shield, title: "Private Repo Support", desc: "We use GitHub's contribution calendar via GraphQL — your private commits count toward XP and streaks.", gradient: "from-pink-500/20 to-rose-500/20", delay: "0.25s" },
  ];

  const xpActions = [
    { emoji: "🚀", action: "Commit pushed", xp: "2", color: "text-green-400" },
    { emoji: "🔀", action: "Pull request opened", xp: "15", color: "text-blue-400" },
    { emoji: "🐛", action: "Issue filed", xp: "5", color: "text-pink-400" },
    { emoji: "👀", action: "Code review submitted", xp: "10", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden">

      {/* ── Background ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* ── Nav ────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ForkNight</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it works</a>
          <a href="#rewards" className="text-sm text-slate-400 hover:text-white transition-colors">Rewards</a>
        </div>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
        >
          <Github className="w-4 h-4" />
          Get Started
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div className="mb-6">
              <Badge><Zap className="w-3 h-3" /> GitHub Gamification Platform</Badge>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Turn{" "}
              <span className="relative inline-block">
                <GradientText from="from-purple-400" to="to-pink-400">
                  {typedText}
                </GradientText>
                <span className="text-purple-400 animate-pulse">|</span>
              </span>
              <br />
              into{" "}
              <GradientText from="from-pink-400" to="to-yellow-400">
                Conquests
              </GradientText>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              ForkNight turns every GitHub contribution into XP, badges and levels.
              Stop coding in silence — start levelling up.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={handleConnect}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-semibold transition-all duration-200 shadow-xl shadow-purple-500/30 hover:scale-105"
              >
                <Github className="w-5 h-5" />
                Connect with GitHub
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-slate-300 hover:border-purple-500/50 hover:text-white font-semibold transition-all duration-200"
              >
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free to use</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Private repos counted</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No write access</div>
            </div>
          </div>

          {/* Right: dashboard preview */}
          <div className="flex justify-center lg:justify-end">
            <DashboardPreview />
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mt-20">
          <StatCard icon={Code}  value="10K+"  label="Commits gamified"  color="from-blue-500 to-purple-500"  delay="0s" />
          <StatCard icon={Users} value="500+"  label="Active players"    color="from-purple-500 to-pink-500"  delay="0.1s" />
          <StatCard icon={Award} value="50+"   label="Unique badges"     color="from-pink-500 to-red-500"     delay="0.2s" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <Badge><Star className="w-3 h-3" /> Features</Badge>
          <h2 className="text-4xl font-extrabold mt-4 mb-4">
            Everything you need to{" "}
            <GradientText>level up</GradientText>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            ForkNight hooks into the GitHub APIs you already use and turns the numbers into a game.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Steps */}
          <div>
            <Badge><TrendingUp className="w-3 h-3" /> How it works</Badge>
            <h2 className="text-4xl font-extrabold mt-4 mb-10">
              Up and running in{" "}
              <GradientText>three steps</GradientText>
            </h2>
            <StepCard
              number={1}
              title="Connect GitHub"
              desc="One click OAuth. We request read-only access to your profile and contributions — we never write anything."
              accent="from-purple-500 to-pink-500"
              items={[{ label: "OAuth 2.0", color: "text-purple-400" }, { label: "Read-only", color: "text-green-400" }]}
            />
            <StepCard
              number={2}
              title="We sync your data"
              desc="We fetch your commit calendar, PRs, issues and reviews from GitHub's GraphQL API — including private repos."
              accent="from-blue-500 to-purple-500"
              items={[{ label: "GraphQL API", color: "text-blue-400" }, { label: "Private repos", color: "text-yellow-400" }]}
            />
            <StepCard
              number={3}
              title="Watch the game unfold"
              desc="XP, levels, streaks and badges update every login. New achievements unlock automatically as you hit milestones."
              accent="from-pink-500 to-orange-500"
              items={[{ label: "Auto-achievements", color: "text-pink-400" }, { label: "Persistent XP", color: "text-orange-400" }]}
            />
          </div>

          {/* XP actions */}
          <div id="rewards">
            <Badge><Zap className="w-3 h-3" /> XP Rewards</Badge>
            <h2 className="text-3xl font-extrabold mt-4 mb-2">
              Every action <GradientText>earns XP</GradientText>
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              XP is calculated from your lifetime stats on GitHub — more contributions = more XP, always.
            </p>
            <div className="space-y-3 mb-8">
              {xpActions.map((a) => <XPPill key={a.action} {...a} />)}
            </div>

            {/* Rank ladder */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Rank ladder</p>
              <div className="space-y-2">
                {[
                  ["Newbie", "0 XP", "text-slate-400"],
                  ["Rookie Committer", "50 XP", "text-green-400"],
                  ["Code Explorer", "150 XP", "text-blue-400"],
                  ["Skilled Dev", "300 XP", "text-purple-400"],
                  ["Pro Hacker", "500 XP", "text-yellow-400"],
                  ["Elite Contributor", "800 XP", "text-orange-400"],
                  ["Legendary Coder", "1200 XP", "text-pink-400"],
                  ["Open Source Knight ⚔️", "2000 XP", "text-amber-300"],
                ].map(([rank, xp, color]) => (
                  <div key={rank} className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${color}`}>{rank}</span>
                    <span className="text-slate-500">{xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-900/40 to-pink-900/20 p-12 text-center">
          {/* Background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">Start your quest</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Ready to become an{" "}
              <GradientText from="from-purple-400" to="to-yellow-400">
                Open Source Knight?
              </GradientText>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Connect your GitHub account in seconds. Your XP history starts building the moment you log in.
            </p>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all duration-200 shadow-2xl shadow-purple-500/30 hover:scale-105"
            >
              <Github className="w-6 h-6" />
              Connect with GitHub
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-xs text-slate-600">No credit card. No write access. Just your GitHub login.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GitBranch className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-400">ForkNight</span>
          </div>
          <p>Built for developers who code. © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
