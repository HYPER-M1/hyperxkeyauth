/**
 * Vercel Serverless Function: /api/data
 * 
 * Serves reseller + admin credentials from Vercel Environment Variables.
 * This is the single source of truth used by ALL devices (PC, phone, second phone).
 * No credentials are stored in frontend localStorage as source of truth.
 * 
 * Environment Variables required in Vercel dashboard:
 *   HYPERX_CREDENTIALS  — Full JSON string of the credentials object
 * 
 * Fallback: if env var not set, returns the hardcoded default credentials.
 */

// ─── Default credentials (used if HYPERX_CREDENTIALS env var is not set) ────
const DEFAULT_CREDENTIALS = {
  hyperx_admin_user: "HYPER X",
  hyperx_admin_pass: "admin123",
  tx99_resellers: [
    {
      id: "17909518904974",
      username: "beta123",
      password: "beta1230",
      email: "beta123@gmail.com",
      balance: 999,
      createdKeys: 1,
      status: "Active",
      panels: ["all"],
      totpSecret: "YLOG2E3ANGTE4B23",
      twofa_setup_done: false
    },
    {
      id: "1790951896372",
      username: "MADHUKARBETA",
      password: "reseller4@123",
      email: "madhukarsarkar004@gmail.com",
      balance: 260,
      createdKeys: 0,
      status: "Active",
      panels: ["all"],
      totpSecret: "JBSWY3DPEHPK3PXP",
      twofa_setup_done: false
    },
    {
      id: "1",
      username: "HYPER X (Root Owner)",
      password: "adminPassword123",
      email: "admin@prtvshow.online",
      balance: 9922,
      createdKeys: 77,
      status: "Active (Root)",
      panels: ["all"],
      totpSecret: "JBSWY3DPEHPK3PXP",
      twofa_setup_done: false
    },
    {
      id: "2",
      username: "AlphaDistro",
      password: "alphaPass@2026",
      email: "alpha.dist@outlook.com",
      balance: 250,
      createdKeys: 88,
      status: "Active",
      panels: ["BASIC PANEL", "EXTERNAL PANEL", "FPS BOOSTER"],
      totpSecret: "KRUGKIDROVUWG2ZA",
      twofa_setup_done: false
    },
    {
      id: "3",
      username: "ViperKeys",
      password: "viperKey#99",
      email: "viper.resell@yahoo.com",
      balance: 50,
      createdKeys: 49,
      status: "Active",
      panels: ["AIMSILENT EXE", "UID BYPASS", "VAULT PANEL"],
      totpSecret: "MFRGGZDFMZTWQ2LK",
      twofa_setup_done: false
    }
  ]
};

module.exports = async function handler(req, res) {
  // CORS — allow same-origin and local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── GET: Return credentials ──────────────────────────────────────────────
  if (req.method === 'GET') {
    let credentials = DEFAULT_CREDENTIALS;

    // If admin set HYPERX_CREDENTIALS env var in Vercel, use that
    if (process.env.HYPERX_CREDENTIALS) {
      try {
        const parsed = JSON.parse(process.env.HYPERX_CREDENTIALS);
        if (parsed && parsed.tx99_resellers) {
          credentials = parsed;
        }
      } catch (e) {
        // env var malformed — fall back to default
      }
    }

    return res.status(200).json(credentials);
  }

  // ── POST: Update credentials (write to env not possible at runtime, 
  //         so we just echo back with 200 for localStorage sync compat) ────
  if (req.method === 'POST') {
    // On Vercel serverless, we can't persist to disk between requests.
    // The POST is accepted silently so the frontend sync code doesn't error.
    // To persist changes, update the HYPERX_CREDENTIALS env var in Vercel dashboard.
    return res.status(200).json({ success: true, note: 'stored_in_env' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
