import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Trophy, GitBranch, Calendar, Target, Flame, Award,
  TrendingUp, Code, GitPullRequest, BookOpen, Zap, Crown,
  LogOut, Search, Filter, CheckCircle, Lock, Star, Users,
  Sword, Shield,
} from "lucide-react";
import { apiGet, apiPost } from "../utils/api";

/* ── CSS animations injected once ──────────────────────────────── */
const STYLES = `
  @keyframes xpPop {
    0%   { opacity:1; transform: translateY(0) scale(1); }
    60%  { opacity:1; transform: translateY(-28px) scale(1.2); }
    100% { opacity:0; transform: translateY(-44px) scale(0.9); }
  }
  @keyframes streakPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(251,146,60,0); }
    50%       { box-shadow: 0 0 0 8px rgba(251,146,60,0.15); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.5) rotate(-10deg); opacity:0; }
    70%  { transform: scale(1.15) rotate(3deg);  opacity:1; }
    100% { transform: scale(1) rotate(0deg);     opacity:1; }
  }
  @keyframes floatUp {
    0%   { opacity:0; transform: translateY(8px); }
    100% { opacity:1; transform: translateY(0);   }
  }
  @keyframes progressFill {
    from { width: 0%; }
  }
  .xp-pop     { animation: xpPop 0.9s ease forwards; }
  .badge-pop  { animation: badgePop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
  .float-up   { animation: floatUp 0.4s ease forwards; }
  .shimmer-bar {
    background: linear-gradient(90deg, #a855f7 0%, #ec4899 40%, #f59e0b 60%, #ec4899 80%, #a855f7 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }
  .streak-glow { animation: streakPulse 2s ease-in-out infinite; }
  @keyframes levelUp {
    0%   { box-shadow: 0 0 0 0 rgba(168,85,247,0); }
    40%  { box-shadow: 0 0 0 20px rgba(168,85,247,0.3); }
    100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); }
  }
  @keyframes toastIn {
    0%   { transform: translateX(110%); opacity: 0; }
    100% { transform: translateX(0);    opacity: 1; }
  }
  @keyframes toastOut {
    0%   { transform: translateX(0);    opacity: 1; }
    100% { transform: translateX(110%); opacity: 0; }
  }
  @keyframes tabFade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .level-up    { animation: levelUp 0.8s ease-out forwards; }
  .toast-in    { animation: toastIn  0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
  .toast-out   { animation: toastOut 0.3s ease-in forwards; }
  .tab-fade    { animation: tabFade  0.25s ease forwards; }
`;

/* ── Design tokens ──────────────────────────────────────────────── */
const card    = "rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm";
const cardHov = "rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-200";

/* ── Style injector ─────────────────────────────────────────────── */
const StyleInjector = () => {
  useEffect(() => {
    if (document.getElementById("fk-styles")) return;
    const tag = document.createElement("style");
    tag.id = "fk-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);
  return null;
};

/* ── XP floating pop ─────────────────────────────────────────────── */
const XPPop = ({ amount, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 950); return () => clearTimeout(t); }, []);
  return (
    <span className="xp-pop pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 font-extrabold text-sm z-50 whitespace-nowrap">
      +{amount} XP ⚡
    </span>
  );
};

/* ── Toast notification ──────────────────────────────────────────── */
const Toast = ({ icon, title, sub, onClose }) => {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setLeaving(true); setTimeout(onClose, 320); }, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1a2e] border border-yellow-500/30 shadow-2xl shadow-yellow-500/10 max-w-xs ${leaving ? "toast-out" : "toast-in"}`}>
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="font-bold text-sm text-white">{title}</p>
        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
      </div>
      <button onClick={() => { setLeaving(true); setTimeout(onClose, 320); }}
        className="ml-2 text-slate-600 hover:text-white text-lg leading-none shrink-0">×</button>
    </div>
  );
};

/* ── Toast container ─────────────────────────────────────────────── */
const ToastContainer = ({ toasts, dismiss }) => (
  <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
    ))}
  </div>
);

/* ── Shared helpers ─────────────────────────────────────────────── */
const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{children}</span>
);

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  : "";

/* ── Stat pill (sidebar quick stats) ───────────────────────────── */
const StatPill = ({ value, label, color }) => (
  <div className="bg-white/5 rounded-xl p-3 text-center">
    <p className={`text-lg font-bold ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

/* ── Weekly stat card ───────────────────────────────────────────── */
const WeekCard = ({ icon: Icon, label, value, color }) => (
  <div className={`${card} p-4 transition-all duration-200 hover:scale-[1.04] hover:border-purple-500/40 cursor-default`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
    <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
  </div>
);

/* ── Challenge row ──────────────────────────────────────────────── */
const ChallengeRow = ({ challenge }) => {
  const pct = Math.min((challenge.progress / challenge.total) * 100, 100);
  const done = challenge.progress >= challenge.total;
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white text-sm">{challenge.name}</p>
            {done && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold">Done</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{challenge.description}</p>
          {challenge.timeframe && <p className="text-xs text-purple-500 mt-0.5">{challenge.timeframe}</p>}
        </div>
        <span className="text-sm font-bold text-yellow-400 shrink-0 ml-4">+{challenge.xp} XP</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-fill ${done ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0">{challenge.progress}/{challenge.total}</span>
      </div>
    </div>
  );
};

/* ── Achievement card ───────────────────────────────────────────── */
const AchievementCard = ({ achievement }) => {
  if (!achievement) return null;
  const name = achievement.title || achievement.name || "Achievement";
  const xp   = achievement.rewardXP ?? achievement.xp ?? 0;
  return (
    <div className={`relative ${card} p-5 transition-all duration-200 hover:scale-[1.03] hover:border-purple-500/50 overflow-hidden group ${achievement.unlocked ? "badge-pop" : ""}`}>
      {achievement.unlocked && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl" />
          <div className="absolute top-3 left-3"><CheckCircle className="w-4 h-4 text-green-400" /></div>
        </>
      )}
      {!achievement.unlocked && (
        <div className="absolute top-3 right-3"><Lock className="w-4 h-4 text-slate-600" /></div>
      )}
      <div className="text-center pt-2 relative z-10">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-3 transition-transform duration-200 group-hover:scale-110 ${
          achievement.unlocked
            ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/20"
            : "bg-white/5 border border-white/10"
        }`}>
          {achievement.unlocked ? (achievement.icon || "🏆") : <Lock className="w-6 h-6 text-slate-600" />}
        </div>
        <p className={`font-bold text-sm mb-1 ${achievement.unlocked ? "text-white" : "text-slate-500"}`}>{name}</p>
        <p className={`text-xs leading-relaxed mb-2 ${achievement.unlocked ? "text-slate-400" : "text-slate-600"}`}>{achievement.description}</p>
        {achievement.unlocked
          ? <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400"><Zap className="w-3 h-3" />+{xp} XP</span>
          : <span className="text-xs text-slate-600">??? XP</span>
        }
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-xs text-slate-600 mt-1">{formatDate(achievement.unlockedAt)}</p>
        )}
      </div>
    </div>
  );
};

/* ── Repo card ──────────────────────────────────────────────────── */
const RepoCard = ({ repo }) => (
  <a href={repo.url} target="_blank" rel="noopener noreferrer"
    className={`${cardHov} p-5 block group`}>
    <div className="flex items-start justify-between mb-2">
      <p className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate mr-3">{repo.name}</p>
      {repo.language && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 shrink-0">{repo.language}</span>
      )}
    </div>
    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{repo.description || "No description."}</p>
    <div className="flex items-center gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{repo.stars}</span>
      <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" />{repo.forks}</span>
    </div>
  </a>
);

/* ── Nav item ───────────────────────────────────────────────────── */
const NavItem = ({ id, label, icon, active, onClick }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-purple-600/40 to-pink-600/30 border border-purple-500/30 text-white"
        : "text-slate-500 hover:text-white hover:bg-white/5"
    }`}>
    {icon}
    {label}
  </button>
);

/* ── Contribution Graph ─────────────────────────────────────────── */
/**
 * Renders a GitHub-style contribution heatmap.
 * Data shape: { totalContributions, weeks: [{ contributionDays: [{ date, contributionCount, weekday }] }] }
 */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["","Mon","","Wed","","Fri",""];

// Each cell is 11px wide + 2px gap = 13px per column
const COL_W  = 13;
// Day label column is 28px wide
const DAY_COL = 28;

const cellColor = (count) => {
  if (count === 0)  return "bg-white/5 border-white/5";
  if (count <= 2)   return "bg-emerald-900 border-emerald-800/60";
  if (count <= 5)   return "bg-emerald-700 border-emerald-600/60";
  if (count <= 9)   return "bg-emerald-500 border-emerald-400/60";
  return                   "bg-emerald-400 border-emerald-300/80";
};

const ContributionGraph = ({ data }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  if (!data?.weeks) return null;
  const { weeks, totalContributions } = data;

  // Build month label positions — one label per month change
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const m = new Date(firstDay.date + "T00:00:00").getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: MONTHS[m], left: DAY_COL + wi * COL_W });
      lastMonth = m;
    }
  });

  const handleEnter = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, ...day });
  };

  return (
    <div className={`${card} p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Contribution Activity
        </h2>
        <span className="text-xs text-slate-500">
          <span className="text-emerald-400 font-bold">{totalContributions.toLocaleString()}</span>
          {" "}contributions in the last year
        </span>
      </div>

      <div className="overflow-x-auto pb-1" ref={containerRef}>
        <div className="inline-block">

          {/* Month label row */}
          <div className="relative h-4 mb-0.5" style={{ width: DAY_COL + weeks.length * COL_W }}>
            {monthLabels.map(({ label, left }) => (
              <span
                key={`${label}-${left}`}
                className="absolute bottom-0 text-[10px] text-slate-500 leading-none"
                style={{ left }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1 shrink-0" style={{ width: DAY_COL - 4 }}>
              {DAYS.map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-slate-600 leading-[11px] text-right">
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {wi === 0 && week.contributionDays[0]?.weekday > 0 &&
                  Array.from({ length: week.contributionDays[0].weekday }).map((_, pi) => (
                    <div key={`pad-${pi}`} className="w-[11px] h-[11px]" />
                  ))
                }
                {week.contributionDays.map((day) => (
                  <div
                    key={day.date}
                    className={`w-[11px] h-[11px] rounded-[2px] border cursor-default transition-all duration-100 hover:scale-125 hover:ring-1 hover:ring-white/25 ${cellColor(day.contributionCount)}`}
                    onMouseEnter={(e) => handleEnter(e, day)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-slate-600">Less</span>
            {[0, 2, 4, 7, 11].map((n) => (
              <div key={n} className={`w-[11px] h-[11px] rounded-[2px] border ${cellColor(n)}`} />
            ))}
            <span className="text-[10px] text-slate-600">More</span>
          </div>
        </div>
      </div>

      {/* Fixed tooltip */}
      {tooltip && (
        <div
          className="fixed z-[200] -translate-x-1/2 -translate-y-full mb-1 px-2.5 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/15 text-xs text-white shadow-xl pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          <span className="font-bold text-emerald-400">
            {tooltip.contributionCount} contribution{tooltip.contributionCount !== 1 ? "s" : ""}
          </span>
          <span className="text-slate-400 ml-1">
            on {new Date(tooltip.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
const Dashboard = () => {
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [user, setUser]             = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [repos, setRepos]           = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [lastSync, setLastSync]     = useState(null);
  const [contributionGraph, setContributionGraph] = useState(null);
  const [achSearch, setAchSearch]   = useState("");
  const [achFilter, setAchFilter]   = useState("all");
  const [toasts, setToasts]         = useState([]);
  const prevUnlocked = useRef(0);
  const prevLevel    = useRef(0);

  const addToast = (t) => setToasts((p) => [...p, { ...t, id: Date.now() + Math.random() }]);
  const dismiss  = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  /* Derived */
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const pct = achievements.length ? ((unlockedCount / achievements.length) * 100).toFixed(1) : 0;

  const filteredAch = achievements
    .filter((a) => achFilter === "all" ? true : achFilter === "unlocked" ? a.unlocked : !a.unlocked)
    .filter((a) => (a.title || a.name || "").toLowerCase().includes(achSearch.toLowerCase()));

  /* Data load */
  const loadDashboard = async () => {
    try {
      setLoading(true); setError(null);
      let progress;
      try {
        progress = await apiGet("/api/github/progress");
      } catch (e) {
        if (e.message.includes("404")) {
          const r = await apiPost("/api/github/sync", {});
          progress = r.progress;
        } else throw e;
      }
      const [profile, weekly, ach, repoList, challengeList] = await Promise.all([
        apiGet("/api/github/profile"),
        apiGet("/api/github/weekly-activity"),
        apiGet("/api/github/achievements"),
        apiGet("/api/github/repos"),
        apiGet("/api/github/challenges"),
      ]);
      setLastSync(progress.lastSync || null);
      setUser({
        name:         profile.name || profile.login,
        avatar:       profile.avatarUrl || null,           // ← GitHub avatar
        level:        progress.level,
        xp:           progress.xp,
        xpToNext:     progress.xpToNext,
        dayStreak:    progress.streak,
        totalCommits: progress.totalCommits,
        totalPRs:     progress.totalPRs,
        totalIssues:  progress.totalIssues,
        totalRepos:   progress.repoCount ?? repoList.length,
        rank:         progress.rank,
      });
      setWeeklyStats(weekly);
      setAchievements(ach.achievements);
      setRepos(repoList);
      setChallenges(challengeList?.challenges || []);
      setContributionGraph(null); // loaded separately below — never blocks core data

      // ── Gamification toasts ──────────────────────────────────────
      const newUnlocked = ach.achievements.filter((a) => a.unlocked).length;
      if (prevUnlocked.current > 0 && newUnlocked > prevUnlocked.current) {
        const diff = newUnlocked - prevUnlocked.current;
        addToast({ icon: "🏆", title: `${diff} badge${diff > 1 ? "s" : ""} unlocked!`, sub: "Check your achievements tab" });
      }
      prevUnlocked.current = newUnlocked;

      if (prevLevel.current > 0 && progress.level > prevLevel.current) {
        addToast({ icon: "⚡", title: `Level up! You're now Level ${progress.level}`, sub: progress.rank });
      }
      prevLevel.current = progress.level;

      setLoading(false);

      // Fetch the contribution graph after the dashboard is visible.
      // This is slow (GraphQL 365-day calendar) so we don't block on it.
      apiGet("/api/github/contribution-graph")
        .then((graphData) => setContributionGraph(graphData))
        .catch((err) => console.warn("Contribution graph unavailable:", err.message));
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleLogout = async () => {
    try { await apiPost("/api/auth/logout"); window.location.href = "/"; }
    catch { alert("Logout failed. Try again."); }
  };

  /* Loading / error screens */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <StyleInjector />
      <div className="text-center w-64">
        {/* Animated logo */}
        <div className="relative mx-auto mb-6 w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-40 scale-110 blur-md" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GitBranch className="w-7 h-7 text-white" />
          </div>
        </div>
        <p className="font-extrabold text-lg text-white mb-1">ForkNight</p>
        <p className="text-slate-500 text-sm mb-6">Syncing your GitHub data…</p>
        {/* Animated XP bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full shimmer-bar rounded-full" style={{ width: "100%" }} />
        </div>
        <p className="text-xs text-slate-600 mt-3">Fetching contributions, badges & XP</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-red-400 font-semibold mb-2">Failed to load dashboard</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={loadDashboard} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors">Try again</button>
      </div>
    </div>
  );

  const navItems = [
    { id: "dashboard",    label: "Dashboard",     icon: <TrendingUp className="w-4 h-4" /> },
    { id: "challenges",   label: "Challenges",    icon: <Trophy className="w-4 h-4" /> },
    { id: "achievements", label: "Achievements",  icon: <Award className="w-4 h-4" /> },
    { id: "repositories", label: "Repositories",  icon: <GitBranch className="w-4 h-4" /> },
  ];

  const tabSubtitles = {
    dashboard:    "Welcome back, ready to code?",
    challenges:   "Complete challenges to earn XP",
    achievements: "Your coding accomplishments",
    repositories: "Your GitHub repositories",
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex">
      <StyleInjector />
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* ── Background orbs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-60 shrink-0 relative z-10 flex flex-col border-r border-white/8 bg-white/3 backdrop-blur-sm">

        {/* Logo */}
        <div className="p-5 border-b border-white/8">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">ForkNight</span>
          </Link>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-white/8">
          <div className="rounded-xl bg-white/5 border border-white/8 p-4">
            <div className="flex items-center gap-3 mb-3">
              {user.avatar
                ? <img src={user.avatar} alt={user.name}
                    className="w-10 h-10 rounded-full ring-2 ring-purple-500/40 shrink-0 object-cover" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
              }
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500">Lv.{user.level} · <span className="text-purple-400">{user.rank}</span></p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{user.xp.toLocaleString()} XP</span>
              <span>{user.xpToNext} to go</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full shimmer-bar rounded-full progress-fill"
                style={{ width: `${((user.xp % 100) / 100) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.id} {...item} active={activeTab === item.id} onClick={setActiveTab} />
          ))}
        </nav>

        {/* Quick stats */}
        <div className="p-3 border-t border-white/8">
          <div className="grid grid-cols-2 gap-2">
            <StatPill value={user.dayStreak} label="Day Streak" color="text-orange-400" />
            <StatPill value={user.totalRepos} label="Repos" color="text-yellow-400" />
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Top bar */}
        <header className="border-b border-white/8 bg-white/3 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-xl capitalize tracking-tight">{activeTab}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{tabSubtitles[activeTab]}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-400">
              <Crown className="w-3.5 h-3.5" />{user.rank}
            </span>
            {/* Sync status */}
            <p className={`hidden sm:flex items-center gap-1.5 text-xs ${lastSync ? "text-green-500" : "text-yellow-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${lastSync ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
              {lastSync
                ? `Synced ${new Date(lastSync).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "Not synced"}
            </p>
            {/* Avatar */}
            {user.avatar
              ? <img src={user.avatar} alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-purple-500/40 object-cover" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
            }
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── Dashboard tab ─────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="max-w-5xl mx-auto space-y-6 tab-fade">

              {/* Hero banner */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/15 border border-purple-500/20 p-6 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name}
                          className="w-16 h-16 rounded-2xl ring-2 ring-purple-500/50 object-cover shrink-0" />
                      : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                    }
                    <div>
                      <p className="text-2xl font-extrabold">{user.name}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Sword className="w-3.5 h-3.5 text-purple-400" />{user.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right relative">
                    <p className="text-3xl font-extrabold text-yellow-400 cursor-default select-none">
                      Lv.{user.level}
                    </p>
                    <p className="text-xs text-slate-500">{user.xp.toLocaleString()} XP total</p>
                  </div>
                </div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Level {user.level + 1} in {user.xpToNext} XP</span>
                  <span>{Math.round(((user.xp % 100) / 100) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-5">
                  <div className="h-full shimmer-bar rounded-full progress-fill"
                    style={{ width: `${((user.xp % 100) / 100) * 100}%` }} />
                </div>
                <div className="grid grid-cols-5 gap-3 text-center">
                  {[
                    { v: user.totalCommits, l: "Commits",    c: "text-green-400",  bg: "bg-green-500/10"  },
                    { v: user.totalPRs,     l: "PRs",         c: "text-blue-400",   bg: "bg-blue-500/10"   },
                    { v: user.totalIssues,  l: "Issues",      c: "text-pink-400",   bg: "bg-pink-500/10"   },
                    { v: user.totalRepos,   l: "Repos",       c: "text-yellow-400", bg: "bg-yellow-500/10" },
                    { v: user.dayStreak,    l: "Day Streak",  c: "text-orange-400", bg: "bg-orange-500/10", streak: true },
                  ].map(({ v, l, c, bg, streak }) => (
                    <div key={l} className={`${bg} rounded-xl py-3 px-2 border border-white/5 transition-transform hover:scale-105 ${streak ? "streak-glow" : ""}`}>
                      <p className={`text-xl font-extrabold ${c}`}>
                        {streak ? <span className="flex items-center justify-center gap-1">{v}<Flame className="w-4 h-4 text-orange-400 animate-pulse" /></span> : v}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly activity */}
                <div className="lg:col-span-2 space-y-4">                  <div className={`${card} p-5`}>
                    <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-purple-400" />This week
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <WeekCard icon={Code}          label="Commits"   value={weeklyStats.commits}  color="text-green-400" />
                      <WeekCard icon={GitPullRequest} label="PRs"        value={weeklyStats.prs}      color="text-blue-400"  />
                      <WeekCard icon={BookOpen}       label="Reviews"   value={weeklyStats.reviews}  color="text-yellow-400"/>
                      <WeekCard icon={Target}         label="Issues"    value={weeklyStats.issues}   color="text-orange-400"/>
                    </div>
                  </div>
                  {/* Active challenges preview */}
                  <div className={`${card} p-5`}>
                    <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-yellow-400" />Active challenges
                    </h2>
                    <div className="space-y-3">
                      {challenges.slice(0, 3).map((c) => <ChallengeRow key={c.id} challenge={c} />)}
                    </div>
                  </div>
                </div>

                {/* Sidebar: unlocked badges */}
                <div className={`${card} p-5`}>
                  <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-yellow-400" />Badges
                  </h2>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500">{unlockedCount} of {achievements.length} unlocked</p>
                    <p className="text-xs font-bold text-purple-400">{pct}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  {/* Badges grid — icon + name */}
                  <div className="grid grid-cols-3 gap-2">
                    {achievements.filter((a) => a.unlocked).slice(0, 9).map((a) => (
                      <div key={a.id}
                        className="group relative flex flex-col items-center gap-1 p-2 rounded-xl bg-gradient-to-br from-yellow-500/15 to-orange-500/15 border border-yellow-500/15 hover:border-yellow-400/40 hover:scale-105 transition-all duration-200 cursor-default">
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{a.icon}</span>
                        <p className="text-[10px] font-semibold text-yellow-200/80 leading-tight text-center line-clamp-2">
                          {a.title || a.name}
                        </p>
                      </div>
                    ))}
                    {achievements.filter((a) => a.unlocked).length === 0 && (
                      <div className="col-span-3 py-6 text-center">
                        <p className="text-2xl mb-2">🔒</p>
                        <p className="text-xs text-slate-600">Keep coding to unlock badges!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Contribution Graph — full width below the grid ── */}
              {contributionGraph
                ? <ContributionGraph data={contributionGraph} />
                : (
                  <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        Contribution Activity
                      </h2>
                      <span className="text-xs text-slate-600 animate-pulse">Loading graph…</span>
                    </div>
                    {/* Skeleton rows */}
                    <div className="space-y-1.5">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex gap-0.5">
                          {[...Array(53)].map((_, j) => (
                            <div key={j}
                              className="w-[11px] h-[11px] rounded-[2px] bg-white/5 border border-white/5"
                              style={{ opacity: Math.random() > 0.7 ? 0.25 : 0.08 }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

            </div>
          )}

          {/* ── Challenges tab ────────────────────── */}
          {activeTab === "challenges" && (
            <div className="max-w-4xl mx-auto space-y-5 tab-fade">
              <div className="grid sm:grid-cols-2 gap-4">
                {challenges.map((c) => {
                  const pct = Math.min((c.progress / c.total) * 100, 100);
                  const done = c.progress >= c.total;
                  return (
                    <div key={c.id} className={`${card} p-5 relative overflow-hidden`}>
                      {done && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? "bg-green-500/15" : "bg-purple-500/15"}`}>
                          {c.type === "streak" && <Flame className={`w-5 h-5 ${done ? "text-green-400" : "text-orange-400"}`} />}
                          {c.type === "pr"     && <GitPullRequest className={`w-5 h-5 ${done ? "text-green-400" : "text-blue-400"}`} />}
                          {c.type === "review" && <BookOpen className={`w-5 h-5 ${done ? "text-green-400" : "text-yellow-400"}`} />}
                          {c.type === "issues" && <Target className={`w-5 h-5 ${done ? "text-green-400" : "text-pink-400"}`} />}
                          {!["streak","pr","review","issues"].includes(c.type) && <Code className={`w-5 h-5 ${done ? "text-green-400" : "text-purple-400"}`} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-white">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.description}</p>
                        </div>
                        <span className="text-sm font-bold text-yellow-400 shrink-0">+{c.xp}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full progress-fill ${done ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{c.progress}/{c.total}</span>
                      </div>
                      {c.timeframe && <p className="text-xs text-purple-500 mt-2">{c.timeframe}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Achievements tab ──────────────────── */}
          {activeTab === "achievements" && (
            <div className="max-w-5xl mx-auto space-y-5 tab-fade">
              {/* Overview */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/15 border border-purple-500/20 p-5">
                <div className="grid grid-cols-4 gap-4 text-center mb-4">
                  {[
                    { v: unlockedCount, l: "Unlocked",  c: "text-yellow-400" },
                    { v: achievements.length - unlockedCount, l: "Locked", c: "text-slate-500" },
                    { v: achievements.length, l: "Total",  c: "text-white" },
                    { v: `${pct}%`, l: "Completion",   c: "text-purple-400" },
                  ].map(({ v, l, c }) => (
                    <div key={l}>
                      <p className={`text-2xl font-extrabold ${c}`}>{v}</p>
                      <p className="text-xs text-slate-500">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Search & filter */}
              <div className={`${card} p-4 flex flex-col sm:flex-row gap-3`}>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search achievements…" value={achSearch}
                    onChange={(e) => setAchSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select value={achFilter} onChange={(e) => setAchFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer">
                    <option value="all">All</option>
                    <option value="unlocked">Unlocked</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredAch.length > 0
                ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAch.map((a) => <AchievementCard key={a.id} achievement={a} />)}
                  </div>
                : <div className={`${card} p-10 text-center`}>
                    <Award className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No achievements match your filter.</p>
                  </div>
              }
            </div>
          )}

          {/* ── Repositories tab ──────────────────── */}
          {activeTab === "repositories" && (
            <div className="max-w-5xl mx-auto tab-fade">
              {repos.length === 0
                ? <div className={`${card} p-10 text-center`}>
                    <GitBranch className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No repositories found.</p>
                  </div>
                : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repos.map((r) => <RepoCard key={r.id} repo={r} />)}
                  </div>
              }
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
