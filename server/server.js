import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import githubRoutes from "./routes/github.js";
import connectDB from "./config/db.js";
import autoSync from "./middleware/autoSync.js";

dotenv.config();

// Connect to MongoDB at startup
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  "http://localhost:5144",
  "http://localhost:5145",
  "https://forknight-ten.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl or Postman) or if origin is allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Middleware
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // true only when you switch to HTTPS
      httpOnly: true,
      sameSite: "None", // or "none" + secure:true when you test over HTTPS
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/github", githubRoutes);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      // Save accessToken on the user object
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

// Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get("/", (req, res) => {
  res.send("🌐 Forknight server is running!");
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
  }),
  autoSync, // run initial sync for brand-new users (no-op for returning users)
  (req, res) => {
    const allowedOrigins = ["http://localhost:5145", "http://localhost:5144"];
    const origin = req.headers.origin;

    const redirectURL = allowedOrigins.includes(origin)
      ? `${origin}/dashboard`
      : "http://localhost:5144/dashboard"; // fallback default

    res.redirect(redirectURL);
  }
);

app.get("/api/github/data", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const accessToken = req.user.accessToken;

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const repos = await response.json();

    // You can also filter PRs, commits, etc. here
    res.json({ repos });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch GitHub data", error: err });
  }
});

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Placeholder logic – replace with real GitHub data processing
  res.json({
    leaderboard: [
      { username: "user1", score: 120 },
      { username: "user2", score: 100 },
    ],
  });
});

app.post("/api/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Forknight server running at http://localhost:${PORT}`);
});
