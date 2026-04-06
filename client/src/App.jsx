import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

const AuthGitHubRedirect = () => {
  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://forknight.onrender.com";
    window.location.href = `${API_BASE_URL}/auth/github`;
  }, []);

  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/github" element={<AuthGitHubRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other routes here, for example:
        <Route path="/about" element={<About />} />
        */}
      </Routes>
    </Router>
  );
};

export default App;
