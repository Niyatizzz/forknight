// src/utils/api.js
const BASE = import.meta.env.VITE_API_BASE_URL || "https://forknight-server.onrender.com";

export const apiGet = async (path) => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // send cookies for session
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
};

export const apiPost = async (path, body = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include", // keep this for session-based auth
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
};
