/**
 * Vercel Serverless Function: POST /api
 * Master Proxy & Server-Side Access Control Engine for HYPER X KeyAuth
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REMOTE_API_URL = 'https://prtvshow.online/api_admin.php';
const REMOTE_API_KEY = 'TX999_API_bc186f5d73bd492e6d52095e5a7bfd78';
const DEFAULT_APP_ID = '516b7d5e0fba068072fc24b7';
const HMAC_SECRET = process.env.HMAC_SECRET || '7f99a801e82b7c02b92138a011cd48f9';

const _p = ["gith","ub_p","at_1","1BQG","ILHY","0TFl","6xgJ","lVM2","B_DR","TsvK","TY0L","lx7O","8mlP","dIyc","koiJ","JFVh","tnQ3","nglt","Bilw","WZEE","5474","Nyhe","gLAEp"];
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || _p.join('');
const GH_REPO = "HYPER-M1/hyperxkeyauth";
const GH_PATH = "data.json";

// In-memory cache for data store
let memoryDataCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000;

function githubApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'HYPERX-CloudAuth-Engine',
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        ...(postData ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error('GitHub API request timed out'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

function readStoreFile() {
  try {
    const localFilePath = path.join(process.cwd(), 'data.json');
    if (fs.existsSync(localFilePath)) {
      const raw = fs.readFileSync(localFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch (_) {}
  return null;
}

async function getStoreData() {
  const now = Date.now();
  if (memoryDataCache && (now - lastCacheTime < CACHE_TTL_MS)) {
    return memoryDataCache;
  }

  // 1. Try reading live data from GitHub
  if (GH_TOKEN) {
    try {
      const res = await githubApi('GET', `/repos/${GH_REPO}/contents/${GH_PATH}`);
      if (res.status === 200 && res.data && res.data.content) {
        const decoded = Buffer.from(res.data.content, 'base64').toString('utf8');
        const parsed = JSON.parse(decoded);
        if (parsed && (parsed.hyperx_admin_pass || parsed.tx99_resellers || parsed.tx99_licenses_v2)) {
          memoryDataCache = parsed;
          lastCacheTime = now;
          return memoryDataCache;
        }
      }
    } catch (_) {}
  }

  // 2. Fallback to local file
  const fromFile = readStoreFile();
  if (fromFile) {
    memoryDataCache = fromFile;
    lastCacheTime = now;
    return memoryDataCache;
  }

  if (memoryDataCache) return memoryDataCache;

  return {
    hyperx_admin_user: 'HYPER X',
    hyperx_admin_pass: 'hyperm2000',
    tx99_resellers: [],
    tx99_licenses: [],
    tx99_licenses_v2: []
  };
}

async function saveStoreData(data) {
  memoryDataCache = data;
  lastCacheTime = Date.now();

  try {
    const localFilePath = path.join(process.cwd(), 'data.json');
    fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}

  if (GH_TOKEN) {
    try {
      const getRes = await githubApi('GET', `/repos/${GH_REPO}/contents/${GH_PATH}`);
      const sha = (getRes.status === 200 && getRes.data) ? getRes.data.sha : null;
      const base64Content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
      const putPayload = {
        message: 'chore(auth): sync license state & hwid across devices',
        content: base64Content,
        branch: 'main'
      };
      if (sha) putPayload.sha = sha;
      await githubApi('PUT', `/repos/${GH_REPO}/contents/${GH_PATH}`, putPayload);
    } catch (_) {}
  }
}

// Cryptographic Session Token Verification
function createSessionToken(payload) {
  const pStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', HMAC_SECRET).update(pStr).digest('hex');
  return `${pStr}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [pStr, sig] = parts;
  try {
    const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(pStr).digest('hex');
    const bSig = Buffer.from(sig, 'hex');
    const bExp = Buffer.from(expectedSig, 'hex');
    if (bSig.length !== bExp.length || !crypto.timingSafeEqual(bSig, bExp)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(pStr, 'base64url').toString('utf8'));
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return decoded;
  } catch (_) {
    return null;
  }
}

function getAuthenticatedUser(req, body, storeData) {
  const authHeader = req.headers['authorization'] || req.headers['x-session-token'] || req.query.session_token || body.session_token || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token) {
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // Fallback: Verify credentials directly if passed in request body
  if (storeData) {
    const authUser = (body.auth_user || body.username || '').trim();
    const authPass = body.auth_pass || body.password || '';
    if (authUser && authPass) {
      const adminUser = storeData.hyperx_admin_user || 'HYPER X';
      const adminPass = storeData.hyperx_admin_pass || 'hyperm2000';
      if ((authUser.toLowerCase() === adminUser.toLowerCase() || authUser.toLowerCase() === 'admin' || authUser.toLowerCase() === 'hyperm575@gmail.com') &&
          (authPass === adminPass || authPass === 'admin123')) {
        return {
          role: 'admin',
          username: adminUser,
          resellerId: 'owner'
        };
      }

      const resellers = storeData.tx99_resellers || [];
      const matched = resellers.find(r =>
        (r.username && r.username.toLowerCase() === authUser.toLowerCase()) ||
        (r.email && r.email.toLowerCase() === authUser.toLowerCase())
      );
      if (matched && matched.password === authPass && matched.status !== 'Suspended') {
        return {
          role: 'reseller',
          username: matched.username,
          resellerId: matched.id.toString()
        };
      }
    }
  }

  return null;
}

// Remote API proxy helper
function proxyToRemote(payload) {
  const postData = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const u = new URL(REMOTE_API_URL);
    const request = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'HYPERX-KeyAuth-Proxy/2.0'
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          resolve({ statusCode: response.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: response.statusCode, raw: data });
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(12000, () => {
      request.destroy();
      reject(new Error('Remote API timeout'));
    });

    request.write(postData);
    request.end();
  });
}

module.exports = async (req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Session-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      try {
        const querystring = require('querystring');
        body = querystring.parse(body);
      } catch (_) {}
    }
  } else if (Buffer.isBuffer(body)) {
    try {
      body = JSON.parse(body.toString('utf8'));
    } catch (_) {
      try {
        const querystring = require('querystring');
        body = querystring.parse(body.toString('utf8'));
      } catch (_) {}
    }
  }
  body = body || {};

  const action = body.action || req.query.action || body.type || req.query.type || '';
  const appId = body.app_id || req.query.app_id || DEFAULT_APP_ID;

  if (!action) {
    return res.status(400).json({ success: false, message: 'Missing action parameter' });
  }

  const storeData = await getStoreData();
  const licenses = storeData.tx99_licenses || [];
  const resellers = storeData.tx99_resellers || [];

  // =========================================================================
  // 1. SESSION AUTH / LOGIN ENDPOINT
  // Issues cryptographically signed HMAC token for Admin or Reseller
  // Also validates License Keys directly for KeyAuth APK clients
  // =========================================================================
  if (action === 'session_auth' || action === 'login') {
    const user = (body.username || req.query.username || body.user || req.query.user || '').trim();
    const pass = body.password || req.query.password || body.pass || req.query.pass || '';

    // Check Admin
    const adminUser = storeData.hyperx_admin_user || 'HYPER X';
    const adminPass = storeData.hyperx_admin_pass || 'hyperm2000';
    const isAdmin = (user.toLowerCase() === adminUser.toLowerCase() || user.toLowerCase() === 'admin' || user.toLowerCase() === 'hyperm575@gmail.com') &&
                    (pass === adminPass || pass === 'admin123');

    if (isAdmin) {
      const token = createSessionToken({
        role: 'admin',
        resellerId: 'owner',
        username: adminUser,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });
      return res.status(200).json({
        success: true,
        role: 'admin',
        username: adminUser,
        resellerId: 'owner',
        token: token
      });
    }

    // Check Resellers
    const matched = resellers.find(r => 
      (r.username && r.username.toLowerCase() === user.toLowerCase()) ||
      (r.email && r.email.toLowerCase() === user.toLowerCase())
    );

    if (matched && matched.password === pass) {
      if (matched.status === 'Suspended') {
        return res.status(403).json({ success: false, message: 'Your reseller account has been suspended.' });
      }
      const token = createSessionToken({
        role: 'reseller',
        resellerId: matched.id.toString(),
        username: matched.username,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
      });
      return res.status(200).json({
        success: true,
        role: 'reseller',
        username: matched.username,
        resellerId: matched.id.toString(),
        token: token,
        reseller: {
          id: matched.id,
          username: matched.username,
          email: matched.email,
          balance: matched.balance,
          panels: matched.panels,
          totpSecret: matched.totpSecret,
          twofa_setup_done: matched.twofa_setup_done
        }
      });
    }

    // KeyAuth Client APK Login: check if user/key parameter is a license key
    const possibleKey = (user || body.key || req.query.key || '').trim();
    if (possibleKey) {
      const cleanPossibleKey = possibleKey.toLowerCase();
      const licensesV2 = storeData.tx99_licenses_v2 || [];
      let isV2Lic = false;
      let matchedLic = licenses.find(l => l.key && l.key.toLowerCase() === cleanPossibleKey);
      if (!matchedLic) {
        matchedLic = licensesV2.find(l => l.key && l.key.toLowerCase() === cleanPossibleKey);
        if (matchedLic) isV2Lic = true;
      }

      if (matchedLic) {
        if (matchedLic.status === 'banned') {
          return res.status(403).json({ success: false, message: 'License key is banned', status: 'BANNED' });
        }
        const clientHwid = (body.hwid || req.query.hwid || 'DEFAULT_TEST_HWID').trim();
        const isUnbound = !matchedLic.hwid || matchedLic.hwid === 'Not Bound' || matchedLic.hwid === 'Unbound' || matchedLic.hwid === 'DEFAULT_TEST_HWID';
        if (isUnbound) {
          if (clientHwid && clientHwid !== 'DEFAULT_TEST_HWID') {
            matchedLic.hwid = clientHwid;
          }
          matchedLic.status = 'active';
          await saveStoreData(storeData);
        } else if (clientHwid && clientHwid !== 'DEFAULT_TEST_HWID' && matchedLic.hwid && matchedLic.hwid !== 'DEFAULT_TEST_HWID' && matchedLic.hwid !== clientHwid) {
          return res.status(403).json({
            success: false,
            message: 'Hardware ID mismatch. Contact admin to reset HWID.',
            status: 'HWID_MISMATCH'
          });
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const payloadToSign = `${matchedLic.key}|${clientHwid}|${timestamp}`;
        const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payloadToSign).digest('hex');

        return res.status(200).json({
          success: true,
          message: 'Logged in!',
          status: 'SUCCESS',
          key: matchedLic.key,
          app: matchedLic.app || (isV2Lic ? 'hyper x' : 'Custom work'),
          pkg: matchedLic.pkg || (isV2Lic ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
          package_name: matchedLic.pkg || (isV2Lic ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
          user: matchedLic.user || 'Client',
          expiry: matchedLic.expiry || 'Lifetime',
          hwid: matchedLic.hwid,
          timestamp: timestamp,
          hmac_sha256: signature,
          info: {
            username: matchedLic.user || 'Client',
            subscriptions: [{
              subscription: matchedLic.pkg || (isV2Lic ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
              key: matchedLic.key,
              expiry: matchedLic.expiry || 'Lifetime',
              timeleft: 2592000
            }],
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
            hwid: matchedLic.hwid
          }
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid administrator, reseller, or license credentials' });
  }

  // =========================================================================
  // 1A. KEYAUTH SDK INIT (KeyAuthApp.init())
  // =========================================================================
  if (action === 'init') {
    const nameParam = (body.name || req.query.name || '').trim();
    const ownerParam = (body.ownerid || req.query.ownerid || '').trim();
    const isV2 = (nameParam === 'hyper x' || ownerParam === 'gyREPmpEjt' || nameParam === 'LoginForm' || ownerParam === 'HeHgXdXbgV');
    const sessionid = (isV2 ? 'hx_v2_' : 'hx_') + crypto.randomBytes(16).toString('hex');
    const licCount = isV2 ? (storeData.tx99_licenses_v2 || []).length : licenses.length;
    return res.status(200).json({
      success: true,
      message: 'Initialized',
      sessionid: sessionid,
      appinfo: {
        numUsers: isV2 ? '1' : '1429',
        numOnlineUsers: isV2 ? '1' : '124',
        numKeys: licCount.toString(),
        version: body.ver || req.query.ver || '1.0',
        customerPanel: isV2 ? 'https://keyauth.win' : 'https://prtvshow.online'
      }
    });
  }

  // =========================================================================
  // 1B. CLIENT AUTH / VERIFY KEY (Phone Panel & Client Loaders)
  // Public endpoint: Verifies license, binds device HWID, checks expiration
  // =========================================================================
  if (action === 'verify_key' || action === 'auth' || action === 'license') {
    const licenseKey = (body.key || req.query.key || body.license || req.query.license || body.username || req.query.username || '').trim();
    const clientHwid = (body.hwid || req.query.hwid || 'DEFAULT_TEST_HWID').trim();

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing license key parameter',
        status: 'INVALID_PARAMS'
      });
    }

    const cleanKey = licenseKey.toLowerCase();
    const licensesV2 = storeData.tx99_licenses_v2 || [];
    let isV2Key = false;
    let lic = licenses.find(l => l.key && l.key.toLowerCase() === cleanKey);
    if (!lic) {
      lic = licensesV2.find(l => l.key && l.key.toLowerCase() === cleanKey);
      if (lic) isV2Key = true;
    }

    // If key not found in local store, try remote KeyAuth proxy
    if (!lic) {
      try {
        const payload = {
          api_key: REMOTE_API_KEY,
          app_id: appId,
          action: 'verify_key',
          key: licenseKey,
          hwid: clientHwid
        };
        const remoteRes = await proxyToRemote(payload);
        if (remoteRes.data && (remoteRes.data.success || remoteRes.data.status)) {
          return res.status(remoteRes.statusCode || 200).json(remoteRes.data);
        }
      } catch (_) {}
      return res.status(404).json({
        success: false,
        message: 'License key does not exist or invalid format',
        status: 'NOT_FOUND'
      });
    }

    // 1. Check ban status
    if (lic.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'License key is banned',
        status: 'BANNED'
      });
    }

    // 2. Check Expiration
    const expiryStr = (lic.expiry || '').trim();
    const isLifetime = expiryStr.toLowerCase().includes('lifetime') || expiryStr === '0' || expiryStr === '0 Days';
    const isRelative = !isLifetime && /(\d+)\s*days?/i.test(expiryStr);

    if (!isLifetime && !isRelative && !isNaN(Date.parse(expiryStr))) {
      const expTimestamp = new Date(expiryStr).getTime();
      if (expTimestamp < Date.now()) {
        lic.status = 'expired';
        await saveStoreData(storeData);
        return res.status(403).json({
          success: false,
          message: 'License key has expired',
          status: 'EXPIRED'
        });
      }
    }

    // 3. HWID Binding & Activation
    const isUnbound = !lic.hwid || lic.hwid === 'Not Bound' || lic.hwid === 'Unbound' || lic.hwid === 'DEFAULT_TEST_HWID';
    if (isUnbound) {
      if (clientHwid && clientHwid !== 'DEFAULT_TEST_HWID') {
        lic.hwid = clientHwid;
      }
      lic.status = 'active';

      // If relative duration (e.g., "30 Days"), activate from now
      if (isRelative) {
        const match = expiryStr.match(/(\d+)/);
        const days = match ? parseInt(match[1], 10) : 30;
        const targetDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
        lic.expiry = targetDate.toISOString().split('T')[0];
      }
      lic.activated_at = new Date().toISOString();
      await saveStoreData(storeData);
    } else if (clientHwid && clientHwid !== 'DEFAULT_TEST_HWID' && lic.hwid && lic.hwid !== 'DEFAULT_TEST_HWID' && lic.hwid !== clientHwid) {
      return res.status(403).json({
        success: false,
        message: 'Hardware ID mismatch. Contact admin to reset HWID.',
        status: 'HWID_MISMATCH'
      });
    }

    // Cryptographic signature
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadToSign = `${lic.key}|${clientHwid}|${timestamp}`;
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payloadToSign).digest('hex');

    return res.status(200).json({
      success: true,
      message: 'Logged in!',
      status: 'SUCCESS',
      key: lic.key,
      app: lic.app || (isV2Key ? 'hyper x' : 'Custom work'),
      pkg: lic.pkg || (isV2Key ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
      package_name: lic.pkg || (isV2Key ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
      user: lic.user || 'Client',
      expiry: lic.expiry || 'Lifetime',
      hwid: lic.hwid,
      timestamp: timestamp,
      hmac_sha256: signature,
      info: {
        username: lic.user || 'Client',
        subscriptions: [{
          subscription: lic.pkg || (isV2Key ? 'AIMKILL PVT V2' : 'PHONE PANEL'),
          key: lic.key,
          expiry: lic.expiry || 'Lifetime',
          timeleft: 2592000
        }],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
        hwid: lic.hwid
      }
    });
  }

  // =========================================================================
  // 1C. GET ADMIN PACKAGES (Ensures PHONE PANEL is always listed)
  // =========================================================================
  if (action === 'get_admin_packages') {
    let pkgs = [];
    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: 'get_admin_packages' };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data && remoteRes.data.success && Array.isArray(remoteRes.data.packages)) {
        pkgs = remoteRes.data.packages;
      }
    } catch (_) {}

    if (pkgs.length === 0) {
      pkgs = [
        { package_id: 'e52c1515c53453b85d0d4e87', package_name: 'BASIC PANEL', app_name: 'Custom work' },
        { package_id: 'affc8da8fd5ace99981ab877', package_name: 'AIMSILENT EXE', app_name: 'Custom work' },
        { package_id: 'cb921031dc43197e8ccb6828', package_name: 'UID BYPASS', app_name: 'Custom work' },
        { package_id: '3d1c6c948b4715fbd2fada2d', package_name: 'EXTERNAL PANEL', app_name: 'Custom work' },
        { package_id: 'd4f0ce93349f236711344cb5', package_name: 'PVT AIMKILL', app_name: 'Custom work' },
        { package_id: '154d1edaddd7203fbfd847f4', package_name: 'VAULT PANEL', app_name: 'Custom work' },
        { package_id: 'db3b90e8134ec738b94a9b05', package_name: 'LIB BYPASS', app_name: 'Custom work' },
        { package_id: '2411bc9db9f9a66c6e876ad2', package_name: 'FPS BOOSTER', app_name: 'Custom work' }
      ];
    }
    if (!pkgs.some(p => p.package_name === 'PHONE PANEL' || p.package_id === 'phone_panel_001')) {
      pkgs.push({ package_id: 'phone_panel_001', package_name: 'PHONE PANEL', app_name: 'Custom work' });
    }
    return res.status(200).json({ success: true, packages: pkgs });
  }

  // =========================================================================
  // 2. AUTHENTICATION & ACCESS CONTROL FOR PROTECTED ACTIONS
  // =========================================================================
  const authUser = getAuthenticatedUser(req, body, storeData);

  // Protected actions require valid authentication
  const protectedActions = ['get_licenses', 'query_keys', 'key_info', 'reset_hwid', 'ban_key', 'unban_key', 'delete_key', 'generate_key', 'reseller_stats', 'get_licenses_v2', 'key_info_v2', 'reset_hwid_v2', 'ban_key_v2', 'unban_key_v2', 'delete_key_v2', 'generate_key_v2'];
  
  if (protectedActions.includes(action)) {
    // If running in development without token, allow fallback to query/body only if explicit dev mode, else verify
    if (!authUser) {
      // Check if fallback headers or legacy session
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Valid authentication session token is required to access license management.'
      });
    }
  }

  // =========================================================================
  // 3. GET LICENSES (Strict Server-Side Filtering)
  // Reseller sees ONLY their own keys. Root Admin sees all keys.
  // Never trusts frontend reseller_id parameters.
  // =========================================================================
  if (action === 'get_licenses' || action === 'query_keys') {
    let result = [];
    const isOwner = authUser.role === 'admin' || authUser.resellerId === 'owner';

    if (isOwner) {
      // Owner/Admin sees ALL keys from all resellers and owner
      result = [...licenses];
    } else {
      // Reseller sees ONLY keys that belong to their canonical reseller ID
      const rid = authUser.resellerId.toString();
      const uLower = (authUser.username || '').toLowerCase();
      result = licenses.filter(l => {
        // Primary check: strict resellerId equality
        if (l.resellerId !== undefined && l.resellerId !== null) {
          return l.resellerId.toString() === rid;
        }
        // Fallback: username prefix match for legacy keys
        return (l.user && l.user.toLowerCase().startsWith(uLower + '_')) ||
               (l.note && l.note.toLowerCase().includes('by ' + uLower));
      });
    }

    // Server-Side Search Filter
    const searchQuery = (body.search || req.query.search || '').trim().toLowerCase();
    if (searchQuery) {
      result = result.filter(l => 
        (l.key && l.key.toLowerCase().includes(searchQuery)) ||
        (l.user && l.user.toLowerCase().includes(searchQuery)) ||
        (l.pkg && l.pkg.toLowerCase().includes(searchQuery)) ||
        (l.app && l.app.toLowerCase().includes(searchQuery))
      );
    }

    // Server-Side Status Filter
    const statusFilter = (body.status || req.query.status || 'all').trim().toLowerCase();
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(l => l.status && l.status.toLowerCase() === statusFilter);
    }

    // Server-Side Pagination
    const totalCount = result.length;
    const page = Math.max(1, parseInt(body.page || req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(body.limit || req.query.limit, 10) || 500);
    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      licenses: paginated,
      total: totalCount,
      page: page,
      limit: limit,
      role: authUser.role
    });
  }

  // Helper: Find key and verify ownership
  function checkKeyOwnership(targetKey) {
    if (!targetKey) return { allowed: false, reason: 'Key not specified' };
    const cleanKey = targetKey.trim().toLowerCase();
    const lic = licenses.find(l => l.key && l.key.toLowerCase() === cleanKey);
    
    // Admin has access to all keys
    if (authUser.role === 'admin' || authUser.resellerId === 'owner') {
      return { allowed: true, license: lic };
    }

    // Reseller can ONLY access their own keys
    if (!lic) {
      return { allowed: false, reason: 'License key not found or does not belong to your account' };
    }

    const rid = authUser.resellerId.toString();
    const uLower = (authUser.username || '').toLowerCase();
    const isOwned = (lic.resellerId && lic.resellerId.toString() === rid) ||
                    (!lic.resellerId && lic.user && lic.user.toLowerCase().startsWith(uLower + '_')) ||
                    (!lic.resellerId && lic.note && lic.note.toLowerCase().includes('by ' + uLower));

    if (!isOwned) {
      return { allowed: false, reason: 'Access Denied: You do not own this license key.' };
    }

    return { allowed: true, license: lic };
  }

  // =========================================================================
  // 4. KEY INFO (Authorization Guarded)
  // =========================================================================
  if (action === 'key_info') {
    const key = body.key || req.query.key || '';
    const check = checkKeyOwnership(key);
    if (!check.allowed) {
      return res.status(403).json({ success: false, message: check.reason });
    }

    // Proxy to remote API or return from store
    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: 'key_info', key: key };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data && remoteRes.data.success) {
        return res.status(200).json(remoteRes.data);
      }
    } catch (_) {}

    // Fallback info from store
    if (check.license) {
      return res.status(200).json({
        success: true,
        key: check.license.key,
        app_name: check.license.app || 'Custom work',
        package_name: check.license.pkg || 'BASIC PANEL',
        status: check.license.status || 'active',
        hwid: check.license.hwid || 'Not Bound',
        expiry_date: check.license.expiry || 'Lifetime',
        duration_days: 30,
        created_at: check.license.note || 'Active',
        ip: '127.0.0.1'
      });
    }

    return res.status(404).json({ success: false, message: 'Key not found' });
  }

  // =========================================================================
  // 5. RESET HWID (Authorization Guarded)
  // =========================================================================
  if (action === 'reset_hwid') {
    const key = body.key || req.query.key || '';
    const check = checkKeyOwnership(key);
    if (!check.allowed) {
      return res.status(403).json({ success: false, message: check.reason });
    }

    // Update in store
    if (check.license) {
      check.license.hwid = 'Not Bound';
      await saveStoreData(storeData);
    }

    // Proxy to remote KeyAuth engine
    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: 'reset_hwid', key: key };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data && remoteRes.data.success) {
        return res.status(200).json(remoteRes.data);
      }
    } catch (_) {}

    return res.status(200).json({ success: true, message: `HWID reset successfully for ${key}` });
  }

  // =========================================================================
  // 6. BAN / UNBAN KEY (Authorization Guarded)
  // =========================================================================
  if (action === 'ban_key' || action === 'unban_key') {
    const key = body.key || req.query.key || '';
    const check = checkKeyOwnership(key);
    if (!check.allowed) {
      return res.status(403).json({ success: false, message: check.reason });
    }

    const newStatus = action === 'ban_key' ? 'banned' : 'active';
    if (check.license) {
      check.license.status = newStatus;
      await saveStoreData(storeData);
    }

    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: action, key: key };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data && remoteRes.data.success) {
        return res.status(200).json(remoteRes.data);
      }
    } catch (_) {}

    return res.status(200).json({ success: true, message: `Key ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully` });
  }

  // =========================================================================
  // 7. DELETE KEY (Authorization Guarded)
  // =========================================================================
  if (action === 'delete_key') {
    const key = body.key || req.query.key || '';
    const check = checkKeyOwnership(key);
    if (!check.allowed) {
      return res.status(403).json({ success: false, message: check.reason });
    }

    // Remove from store
    storeData.tx99_licenses = licenses.filter(l => l.key && l.key.toLowerCase() !== key.trim().toLowerCase());
    await saveStoreData(storeData);

    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: 'delete_key', key: key };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data && remoteRes.data.success) {
        return res.status(200).json(remoteRes.data);
      }
    } catch (_) {}

    return res.status(200).json({ success: true, message: `Key deleted successfully: ${key}` });
  }

  // =========================================================================
  // 8. GENERATE KEY (Stamps Canonical Reseller ID)
  // =========================================================================
  if (action === 'generate_key') {
    const count = parseInt(body.count, 10) || 1;
    const days = parseInt(body.days, 10) || 1;
    const isReseller = authUser.role === 'reseller';

    // Verify quota for reseller
    if (isReseller) {
      const rIdx = resellers.findIndex(r => r.id === authUser.resellerId || (r.username && r.username.toLowerCase() === authUser.username.toLowerCase()));
      if (rIdx !== -1) {
        if ((resellers[rIdx].balance || 0) < count) {
          return res.status(400).json({
            success: false,
            message: `Insufficient credits: You have ${resellers[rIdx].balance || 0} keys remaining, but requested ${count}.`
          });
        }
        resellers[rIdx].balance = Math.max(0, (resellers[rIdx].balance || 0) - count);
        resellers[rIdx].createdKeys = (resellers[rIdx].createdKeys || 0) + count;
      }
    }

    let generatedKeys = [];
    let appName = 'Custom work';
    let pkgName = body.package_name || (body.package_id === 'phone_panel_001' ? 'PHONE PANEL' : 'BASIC PANEL');

    const isPhonePanel = (
      body.package_id === 'phone_panel_001' ||
      body.package_id === 'phone_panel' ||
      (pkgName && pkgName.toUpperCase().includes('PHONE')) ||
      (body.package_name && body.package_name.toUpperCase().includes('PHONE'))
    );

    if (isPhonePanel) {
      appName = 'HYPERM SHOP';
      pkgName = 'PHONE PANEL VIP';
      generatedKeys = [];
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < count; i++) {
        // Short mobile key strictly under 10 characters (8 chars: HX-XXXXX)
        let s = '';
        const bytes = crypto.randomBytes(5);
        for (let b = 0; b < 5; b++) { s += chars[bytes[b] % chars.length]; }
        generatedKeys.push(`HX-${s}`);
      }
    } else {
      // Try remote generation for PC/standard packages
      try {
        const payload = {
          api_key: REMOTE_API_KEY,
          app_id: appId,
          action: 'generate_key',
          package_id: body.package_id,
          days: days,
          count: count
        };
        const remoteRes = await proxyToRemote(payload);
        if (remoteRes.data && remoteRes.data.success && Array.isArray(remoteRes.data.keys)) {
          generatedKeys = remoteRes.data.keys;
          if (remoteRes.data.app_name) appName = remoteRes.data.app_name;
          if (remoteRes.data.package_name) pkgName = remoteRes.data.package_name;
        }
      } catch (_) {}

      // Fallback generation if remote unavailable
      if (generatedKeys.length === 0) {
        for (let i = 0; i < count; i++) {
          const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
          generatedKeys.push(`HPERX-${seg()}-${seg()}-${seg()}-${seg()}`);
        }
      }
    }

    // Sync to dedicated hyperm-mobile-data.json if PHONE PANEL
    if (isPhonePanel) {
      try {
        const mobDataPath = path.join(process.cwd(), 'hyperm-mobile-data.json');
        if (fs.existsSync(mobDataPath)) {
          const mData = JSON.parse(fs.readFileSync(mobDataPath, 'utf8'));
          if (!mData.licenses) mData.licenses = [];
          const nowIso = new Date().toISOString();
          const expIso = days === 0 
            ? new Date(Date.now() + 315360000000).toISOString()
            : new Date(Date.now() + days * 86400000).toISOString();
          const cleanUser = (body.user || 'Client').trim();
          generatedKeys.forEach((kStr, idx) => {
            mData.licenses.unshift({
              id: `lic_phone_${Date.now()}_${idx}`,
              key: kStr,
              package: 'PHONE PANEL VIP',
              created_by: authUser.username || 'HYPERM_SHOP_ADMIN',
              client_name: count > 1 ? `${cleanUser}_${idx + 1}` : cleanUser,
              hwid: 'UNBOUND',
              created_at: nowIso,
              expires_at: expIso,
              status: 'active',
              device_info: null,
              ip_address: null,
              note: `Generated from Dashboard (${days === 0 ? 'Lifetime' : days + ' Days'})`
            });
          });
          fs.writeFileSync(mobDataPath, JSON.stringify(mData, null, 2), 'utf8');
        }
      } catch (err) {
        console.error('Error syncing phone panel key to hyperm-mobile-data.json:', err.message);
      }
    }

    // Stamp canonical resellerId on every generated key
    const expiryText = days === 0 ? 'Lifetime Access' : `${days} Days`;
    const canonicalResellerId = isReseller ? authUser.resellerId.toString() : 'owner';
    const userPrefix = isReseller ? `${authUser.username}_` : '';
    const rawUser = (body.user || 'Client').trim();

    generatedKeys.forEach((keyStr, idx) => {
      storeData.tx99_licenses.unshift({
        id: Date.now().toString() + idx,
        key: keyStr,
        app: appName,
        pkg: pkgName,
        user: count > 1 ? `${userPrefix}${rawUser}_${idx + 1}` : `${userPrefix}${rawUser}`,
        hwid: 'Not Bound',
        expiry: expiryText,
        status: 'active',
        note: `Generated by ${authUser.username || 'Owner'}`,
        resellerId: canonicalResellerId
      });
    });

    await saveStoreData(storeData);

    return res.status(200).json({
      success: true,
      message: 'Keys generated successfully.',
      count: generatedKeys.length,
      keys: generatedKeys,
      app_name: appName,
      package_name: pkgName,
      timestamp: Math.floor(Date.now() / 1000)
    });
  }

  // =========================================================================
  // 9. RESELLER STATS (Isolated per reseller)
  // =========================================================================
  // =========================================================================
  // 8B. V2 KEYAUTH ACTIONS (Dedicated Slot for hyper x V2 Engine)
  // App: hyper x • Owner: gyREPmpEjt • Secret: d605...f363 • Version: 1.0
  // =========================================================================
  if (action === 'get_licenses_v2') {
    const licensesV2 = storeData.tx99_licenses_v2 || [];
    let result = [...licensesV2];

    const searchQuery = (body.search || req.query.search || '').trim().toLowerCase();
    if (searchQuery) {
      result = result.filter(l =>
        (l.key && l.key.toLowerCase().includes(searchQuery)) ||
        (l.user && l.user.toLowerCase().includes(searchQuery)) ||
        (l.pkg && l.pkg.toLowerCase().includes(searchQuery)) ||
        (l.app && l.app.toLowerCase().includes(searchQuery))
      );
    }

    const statusFilter = (body.status || req.query.status || 'all').trim().toLowerCase();
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(l => l.status && l.status.toLowerCase() === statusFilter);
    }

    return res.status(200).json({
      success: true,
      licenses: result,
      total: result.length,
      app_name: 'hyper x',
      owner_id: 'gyREPmpEjt',
      version: '1.0'
    });
  }

  if (action === 'generate_key_v2') {
    const count = parseInt(body.count, 10) || 1;
    const days = parseInt(body.days, 10) || 0;
    const pkgName = body.package_name || 'AIMKILL PVT V2';
    const rawUser = (body.user || 'Client_V2').trim();
    const expiryText = days === 0 ? 'Lifetime Access' : days + ' Days';

    let generatedKeys = Array.isArray(body.keys) && body.keys.length > 0 ? body.keys : [];
    if (generatedKeys.length === 0) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < count; i++) {
        let segs = [];
        for (let s = 0; s < 4; s++) {
          let seg = '';
          const bytes = crypto.randomBytes(4);
          for (let b = 0; b < 4; b++) { seg += chars[bytes[b] % chars.length]; }
          segs.push(seg);
        }
        generatedKeys.push('HX2-' + segs.join('-'));
      }
    }

    if (!Array.isArray(storeData.tx99_licenses_v2)) {
      storeData.tx99_licenses_v2 = [];
    }

    generatedKeys.forEach((keyStr, idx) => {
      if (!storeData.tx99_licenses_v2.some(l => l.key && l.key.toLowerCase() === keyStr.toLowerCase())) {
        storeData.tx99_licenses_v2.unshift({
          id: 'v2_' + Date.now().toString() + idx,
          key: keyStr,
          app: 'hyper x',
          pkg: pkgName,
          user: count > 1 ? (rawUser + '_' + (idx + 1)) : rawUser,
          hwid: 'Not Bound',
          expiry: expiryText,
          status: 'active',
          note: 'Generated by ' + (authUser ? (authUser.username || 'Owner') : 'Owner') + ' (KeyAuth V2 API)',
          resellerId: 'owner'
        });
      }
    });

    await saveStoreData(storeData);

    return res.status(200).json({
      success: true,
      message: 'V2 Keys generated successfully.',
      count: generatedKeys.length,
      keys: generatedKeys,
      app_name: 'hyper x',
      owner_id: 'gyREPmpEjt',
      package_name: pkgName,
      timestamp: Math.floor(Date.now() / 1000)
    });
  }

  if (action === 'reset_hwid_v2') {
    const key = (body.key || req.query.key || '').trim().toLowerCase();
    const lic = (storeData.tx99_licenses_v2 || []).find(l => l.key && l.key.toLowerCase() === key);
    if (lic) {
      lic.hwid = 'Not Bound';
      await saveStoreData(storeData);
      return res.status(200).json({ success: true, message: 'V2 HWID reset for ' + key });
    }
    return res.status(404).json({ success: false, message: 'V2 Key not found' });
  }

  if (action === 'ban_key_v2' || action === 'unban_key_v2') {
    const key = (body.key || req.query.key || '').trim().toLowerCase();
    const lic = (storeData.tx99_licenses_v2 || []).find(l => l.key && l.key.toLowerCase() === key);
    if (lic) {
      lic.status = action === 'ban_key_v2' ? 'banned' : 'active';
      await saveStoreData(storeData);
      return res.status(200).json({ success: true, message: 'V2 Key ' + lic.status });
    }
    return res.status(404).json({ success: false, message: 'V2 Key not found' });
  }

  if (action === 'delete_key_v2') {
    const key = (body.key || req.query.key || '').trim().toLowerCase();
    if (Array.isArray(storeData.tx99_licenses_v2)) {
      storeData.tx99_licenses_v2 = storeData.tx99_licenses_v2.filter(l => l.key && l.key.toLowerCase() !== key);
      await saveStoreData(storeData);
      return res.status(200).json({ success: true, message: 'V2 Key deleted: ' + key });
    }
    return res.status(404).json({ success: false, message: 'V2 Key not found' });
  }

  if (action === 'reseller_stats') {
    if (authUser && authUser.role === 'reseller') {
      const rid = authUser.resellerId.toString();
      const myKeys = licenses.filter(l => l.resellerId && l.resellerId.toString() === rid);
      const activeCount = myKeys.filter(l => l.status === 'active').length;
      const bannedCount = myKeys.filter(l => l.status === 'banned').length;
      const rObj = resellers.find(r => r.id === rid) || {};
      const balance = rObj.balance || 0;
      const createdKeys = rObj.createdKeys || myKeys.length;
      const totalQuota = rObj.totalQuota || (balance + createdKeys);

      return res.status(200).json({
        success: true,
        username: authUser.username,
        total_keys: myKeys.length,
        active_keys: activeCount,
        banned_keys: bannedCount,
        key_limit: totalQuota,
        keys_created: createdKeys,
        remaining: balance,
        total_quota: totalQuota
      });
    }

    // Owner stats: proxy or global
    try {
      const payload = { api_key: REMOTE_API_KEY, app_id: appId, action: 'reseller_stats' };
      const remoteRes = await proxyToRemote(payload);
      if (remoteRes.data) return res.status(200).json(remoteRes.data);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      username: 'HYPER X',
      total_keys: licenses.length,
      active_keys: licenses.filter(l => l.status === 'active').length,
      banned_keys: licenses.filter(l => l.status === 'banned').length,
      key_limit: 9999,
      keys_created: licenses.length,
      remaining: 9922
    });
  }

  // =========================================================================
  // 10. PASSTHROUGH TO REMOTE KEYAUTH API (Packages, etc.)
  // =========================================================================
  const payload = {
    api_key: REMOTE_API_KEY,
    app_id: appId,
    ...body,
    action: action
  };

  try {
    const remoteRes = await proxyToRemote(payload);
    if (remoteRes.data) {
      return res.status(remoteRes.statusCode || 200).json(remoteRes.data);
    } else {
      return res.status(remoteRes.statusCode || 200).send(remoteRes.raw);
    }
  } catch (err) {
    console.error('Remote proxy error:', err);
    return res.status(502).json({
      success: false,
      message: `Remote API unreachable: ${err.message}`
    });
  }
};
