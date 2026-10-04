/**
 * Vercel Serverless Function: GET/POST /api/data
 * Single source of truth for credentials — works from ANY device worldwide.
 */

const ALL_RESELLERS = [
  { id: "17909518904974", username: "beta123", password: "beta1230", email: "beta123@gmail.com", balance: 999, createdKeys: 1, status: "Active", panels: ["all"], totpSecret: "YLOG2E3ANGTE4B23", twofa_setup_done: false },
  { id: "1790951896372", username: "MADHUKARBETA", password: "reseller4@123", email: "madhukarsarkar004@gmail.com", balance: 260, createdKeys: 0, status: "Active", panels: ["all"], totpSecret: "JBSWY3DPEHPK3PXP", twofa_setup_done: false },
  { id: "1", username: "HYPER X (Root Owner)", password: "adminPassword123", email: "admin@prtvshow.online", balance: 9922, createdKeys: 77, status: "Active (Root)", panels: ["all"], totpSecret: "JBSWY3DPEHPK3PXP", twofa_setup_done: false },
  { id: "2", username: "AlphaDistro", password: "alphaPass@2026", email: "alpha.dist@outlook.com", balance: 250, createdKeys: 88, status: "Active", panels: ["BASIC PANEL", "EXTERNAL PANEL", "FPS BOOSTER"], totpSecret: "KRUGKIDROVUWG2ZA", twofa_setup_done: false },
  { id: "3", username: "ViperKeys", password: "viperKey#99", email: "viper.resell@yahoo.com", balance: 50, createdKeys: 49, status: "Active", panels: ["AIMSILENT EXE", "UID BYPASS", "VAULT PANEL"], totpSecret: "MFRGGZDFMZTWQ2LK", twofa_setup_done: false }
];

const DEFAULT_DATA = {
  hyperx_admin_user: "HYPER X",
  hyperx_admin_pass: "admin123",
  tx99_resellers: ALL_RESELLERS
};

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Load from env var if set, else use defaults
  let data = DEFAULT_DATA;
  if (process.env.HYPERX_CREDENTIALS) {
    try {
      const parsed = JSON.parse(process.env.HYPERX_CREDENTIALS);
      if (parsed && parsed.tx99_resellers) data = parsed;
    } catch (_) {}
  }

  if (req.method === "GET") {
    return res.status(200).json(data);
  }

  // POST: accept silently (Vercel can't persist to disk)
  if (req.method === "POST") {
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
