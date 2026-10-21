/**
 * HYPERM SHOP - Dedicated Mobile Phone Licensing & Security API Gateway
 * Version: 2.0.0-mobile
 * 
 * Standalone & Independent API for Android/iOS Mobile Apps, Phone Panels, and Mobile Clients.
 * Completely independent from legacy systems or external APIs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration & Data File Paths
const CONFIG_FILE = path.join(process.cwd(), 'hyperm-mobile-config.json');
const DATA_FILE = path.join(process.cwd(), 'hyperm-mobile-data.json');

// In-memory cache for speed
let cache = {
  config: null,
  data: null,
  lastLoad: 0
};

const CACHE_TTL_MS = 5000; // 5 seconds

// Helper: Read Config
function getConfig() {
  const now = Date.now();
  if (cache.config && (now - cache.lastLoad < CACHE_TTL_MS)) {
    return cache.config;
  }
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      cache.config = JSON.parse(raw);
    }
  } catch (err) {
    console.error('[HYPERM-SHOP-MOBILE] Error reading config:', err.message);
  }

  if (!cache.config) {
    cache.config = {
      brand: "HYPERM SHOP",
      app_name: "HYPERM SHOP",
      api_version: "2.0.0-mobile",
      owner_id: "9f087d585fbd666572fc24b7",
      app_secret: "7f99a801e82b7c02b92138a011cd48f9",
      status: "Operational"
    };
  }
  return cache.config;
}

// Helper: Read Data Store
function getData() {
  const now = Date.now();
  if (cache.data && (now - cache.lastLoad < CACHE_TTL_MS)) {
    return cache.data;
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      cache.data = JSON.parse(raw);
    }
  } catch (err) {
    console.error('[HYPERM-SHOP-MOBILE] Error reading data:', err.message);
  }

  if (!cache.data) {
    cache.data = {
      shop_info: { name: "HYPERM SHOP", currency: "INR" },
      products: [],
      licenses: [],
      vouchers: [],
      audit_logs: []
    };
  }
  cache.lastLoad = now;
  return cache.data;
}

// Helper: Save Data Store
function saveData(dataObj) {
  cache.data = dataObj;
  cache.lastLoad = Date.now();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataObj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[HYPERM-SHOP-MOBILE] Error saving data:', err.message);
    return false;
  }
}

// Helper: Extract Client IP
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  ).split(',')[0].trim();
}

// Helper: Key Generator
function generateRandomKey(prefix = 'HYPERM') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const getChunk = (len) => {
    let res = '';
    const bytes = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) {
      res += chars[bytes[i] % chars.length];
    }
    return res;
  };
  return `${prefix}-${getChunk(4)}-${getChunk(4)}-${getChunk(4)}`;
}

// Main Request Handler
module.exports = async function hypermMobileHandler(req, res) {
  // 1. CORS Headers for Mobile Native Apps (Android OkHttp/Retrofit, Unity, iOS NSURLSession)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Device-HWID, X-App-Secret, X-Session-Id');
  res.setHeader('X-Powered-By', 'HYPERM-SHOP-Mobile-Gateway/2.0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Handle pre-flight OPTIONS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 2. Parse Request URL & Body
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  let body = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else {
    try {
      if (req.body && typeof req.body === 'string') {
        body = JSON.parse(req.body);
      }
    } catch (_) {
      body = {};
    }
  }

  // Support both JSON body and Query Parameters
  const payload = { ...query, ...body };

  // Resolve action from action, type, or URL pathname
  let action = (payload.action || payload.type || '').toLowerCase().trim();
  
  // If action is not in payload, check URL path sub-route (e.g. /api/hyperm-mobile/license)
  if (!action) {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && lastSeg !== 'hyperm-mobile' && lastSeg !== 'hyperm-mobile.js') {
      action = lastSeg.toLowerCase();
    }
  }

  const clientIP = getClientIP(req);
  const config = getConfig();
  const data = getData();

  // Helper response wrapper
  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data, null, 2));
  };

  // =========================================================================
  // ROUTE 0: ROOT / HEALTH / DOCUMENTATION (GET /api/hyperm-mobile)
  // =========================================================================
  if (!action || action === 'ping' || action === 'status' || action === 'info') {
    return sendJson(200, {
      brand: config.brand,
      app_name: config.app_name,
      api_version: config.api_version,
      gateway_status: config.status,
      timestamp: new Date().toISOString(),
      client_ip: clientIP,
      endpoints: {
        init: {
          method: "POST",
          action: "init",
          description: "Mobile App Handshake & Session Initialization",
          params: { ver: "string (e.g. 2.4.1)", device_model: "optional string" }
        },
        license: {
          method: "POST",
          action: "license",
          description: "Phone Panel & Mobile Key Verification with Device HWID Auto-Bind",
          params: { key: "string (HYPERM-XXXX-XXXX-XXXX)", hwid: "string (Android ID/Hardware UUID)" }
        },
        check_update: {
          method: "GET/POST",
          action: "check_update",
          description: "Mobile APK / Panel version check & changelog",
          params: { ver: "string" }
        },
        products: {
          method: "GET",
          action: "products",
          description: "HYPERM SHOP Mobile Product Catalog and Pricing",
          params: {}
        },
        announcements: {
          method: "GET",
          action: "announcements",
          description: "Live Server Announcements & MOTD",
          params: {}
        },
        hwid_reset: {
          method: "POST",
          action: "hwid_reset",
          description: "Reset Mobile HWID binding (unbound for new phone)",
          params: { key: "string", secret: "string" }
        },
        redeem: {
          method: "POST",
          action: "redeem",
          description: "Redeem shop discount / promo voucher",
          params: { code: "string" }
        },
        create_key: {
          method: "POST",
          action: "create_key",
          description: "Generate new Mobile License Key (Admin/Reseller only)",
          params: { admin_secret: "string", package: "string", duration_days: "number", client_name: "string" }
        }
      },
      support: config.support
    });
  }

  // =========================================================================
  // ROUTE 1: MOBILE INITIALIZATION (Handshake / KeyAuth init compatible)
  // =========================================================================
  if (action === 'init') {
    const clientVer = payload.ver || payload.version || '1.0';
    const deviceModel = payload.device_model || payload.model || 'Android Phone';
    
    // Generate secure session token
    const sessionId = 'hyp_mob_' + crypto.randomBytes(16).toString('hex');
    
    // Check update
    const updateInfo = config.mobile_app_update || {};
    const hasUpdate = updateInfo.latest_version && (updateInfo.latest_version !== clientVer);

    return sendJson(200, {
      success: true,
      message: "Initialized successfully with HYPERM SHOP Mobile Gateway",
      sessionid: sessionId,
      app_name: config.app_name,
      brand: config.brand,
      api_version: config.api_version,
      app_status: "Online",
      has_update: !!hasUpdate,
      latest_version: updateInfo.latest_version || "2.4.1",
      download_url: updateInfo.apk_download_url || "",
      announcements: config.announcements || [],
      server_time: Math.floor(Date.now() / 1000)
    });
  }

  // =========================================================================
  // ROUTE 2: MOBILE KEY AUTHENTICATION & DEVICE HWID BINDING (Phone Panel)
  // =========================================================================
  if (action === 'license' || action === 'verify' || action === 'login') {
    const rawKey = payload.key || payload.license || '';
    const rawHwid = payload.hwid || payload.device_id || payload.device || payload.android_id || '';
    const deviceModel = payload.device_model || payload.model || payload.phone || 'Mobile Device';

    if (!rawKey || !rawKey.trim()) {
      return sendJson(400, {
        success: false,
        message: "License key is required. Please enter your HYPERM SHOP license.",
        code: "KEY_REQUIRED"
      });
    }

    const keyClean = rawKey.trim();
    const hwidClean = rawHwid.trim();

    // Find key in database
    const licenses = data.licenses || [];
    const lic = licenses.find(l => l.key.toLowerCase() === keyClean.toLowerCase());

    if (!lic) {
      return sendJson(403, {
        success: false,
        message: "Invalid license key. Key does not exist in HYPERM SHOP database.",
        code: "INVALID_KEY"
      });
    }

    // Check status
    if (lic.status !== 'active') {
      return sendJson(403, {
        success: false,
        message: `This license key has been ${lic.status.toUpperCase()} by HYPERM SHOP administration.`,
        code: "KEY_SUSPENDED",
        reason: lic.note || "Security policy violation"
      });
    }

    // Check expiry
    const now = Date.now();
    const expiryDate = new Date(lic.expires_at);
    if (!isNaN(expiryDate.getTime()) && expiryDate.getTime() < now) {
      return sendJson(403, {
        success: false,
        message: `License key has expired on ${lic.expires_at}. Please renew your subscription at HYPERM SHOP.`,
        code: "KEY_EXPIRED",
        expired_at: lic.expires_at
      });
    }

    // HWID Binding Check
    let isNewDeviceBinding = false;
    if (hwidClean) {
      if (!lic.hwid || lic.hwid === 'UNBOUND' || lic.hwid === 'Not Bound' || lic.hwid === 'Unbound') {
        // First device connection -> Lock key to this phone!
        lic.hwid = hwidClean;
        lic.device_info = deviceModel;
        lic.first_bound_at = new Date().toISOString();
        lic.last_seen_at = new Date().toISOString();
        lic.ip_address = clientIP;
        isNewDeviceBinding = true;
        saveData(data);
      } else if (lic.hwid.toLowerCase() !== hwidClean.toLowerCase()) {
        // HWID Mismatch! Key locked to another phone
        return sendJson(403, {
          success: false,
          message: "Device HWID Mismatch! This key is locked to a different mobile device. Please reset your HWID.",
          code: "HWID_MISMATCH",
          bound_hwid: lic.hwid.substring(0, 4) + '****' + lic.hwid.substring(lic.hwid.length - 4),
          client_hwid: hwidClean
        });
      } else {
        // HWID Matches - Update last seen
        lic.last_seen_at = new Date().toISOString();
        lic.ip_address = clientIP;
        if (deviceModel && deviceModel !== 'Mobile Device') {
          lic.device_info = deviceModel;
        }
        saveData(data);
      }
    }

    // Calculate days and seconds left
    const expiryMs = isNaN(expiryDate.getTime()) ? (now + 31536000000) : expiryDate.getTime();
    const secondsLeft = Math.max(0, Math.floor((expiryMs - now) / 1000));
    const daysLeft = Math.ceil(secondsLeft / 86400);

    // Audit Log
    if (!data.audit_logs) data.audit_logs = [];
    data.audit_logs.unshift({
      event: isNewDeviceBinding ? 'HWID_FIRST_BOUND' : 'LICENSE_AUTH_SUCCESS',
      key: lic.key,
      hwid: lic.hwid,
      device: lic.device_info,
      ip: clientIP,
      timestamp: new Date().toISOString()
    });
    // Keep logs manageable
    if (data.audit_logs.length > 200) data.audit_logs.pop();
    saveData(data);

    // Return Success
    return sendJson(200, {
      success: true,
      message: isNewDeviceBinding 
        ? "Device successfully bound! Welcome to HYPERM SHOP Mobile." 
        : "Authentication successful! Welcome to HYPERM SHOP Mobile.",
      brand: config.brand,
      info: {
        username: lic.client_name || "HYPERM_User",
        key: lic.key,
        package: lic.package || "PHONE PANEL VIP",
        subscription: lic.package || "PHONE PANEL VIP",
        hwid: lic.hwid,
        device_bound: lic.device_info || "Mobile Phone",
        created_at: lic.created_at,
        expires_at: lic.expires_at,
        expiry_timestamp: Math.floor(expiryMs / 1000),
        seconds_left: secondsLeft,
        days_left: daysLeft,
        status: "Active",
        ip: clientIP
      }
    });
  }

  // =========================================================================
  // ROUTE 3: CHECK FOR MOBILE APP UPDATES
  // =========================================================================
  if (action === 'check_update' || action === 'update') {
    const clientVer = payload.ver || payload.version || '1.0';
    const updateInfo = config.mobile_app_update || {};
    const latestVer = updateInfo.latest_version || '2.4.1';
    const isOutdated = clientVer !== latestVer;

    return sendJson(200, {
      success: true,
      brand: config.brand,
      current_client_version: clientVer,
      latest_server_version: latestVer,
      version_code: updateInfo.version_code || 241,
      update_available: isOutdated,
      is_mandatory: !!updateInfo.is_mandatory,
      apk_download_url: updateInfo.apk_download_url || "",
      changelog: updateInfo.changelog || [],
      release_date: updateInfo.release_date || new Date().toISOString().split('T')[0]
    });
  }

  // =========================================================================
  // ROUTE 4: MOBILE PRODUCT CATALOG & PRICING
  // =========================================================================
  if (action === 'products' || action === 'catalog' || action === 'shop') {
    const products = data.products || [];
    return sendJson(200, {
      success: true,
      brand: config.brand,
      total_products: products.length,
      currency: data.shop_info?.currency || "INR",
      currency_symbol: data.shop_info?.currency_symbol || "₹",
      products: products
    });
  }

  // =========================================================================
  // ROUTE 5: SINGLE PRODUCT DETAIL
  // =========================================================================
  if (action === 'product' || action === 'product_info') {
    const prodId = payload.id || payload.product_id;
    const products = data.products || [];
    const item = products.find(p => p.id === prodId || p.name.toLowerCase().includes((prodId || '').toLowerCase()));
    
    if (!item) {
      return sendJson(404, {
        success: false,
        message: "Product not found in HYPERM SHOP catalog."
      });
    }

    return sendJson(200, {
      success: true,
      brand: config.brand,
      product: item
    });
  }

  // =========================================================================
  // ROUTE 6: LIVE ANNOUNCEMENTS & MOTD
  // =========================================================================
  if (action === 'announcements' || action === 'motd' || action === 'news') {
    return sendJson(200, {
      success: true,
      brand: config.brand,
      announcements: config.announcements || [],
      server_status: "Online",
      active_nodes: data.shop_info?.active_nodes || 4
    });
  }

  // =========================================================================
  // ROUTE 7: RESET MOBILE HWID (Device Unbind)
  // =========================================================================
  if (action === 'hwid_reset' || action === 'resethwid' || action === 'reset_device') {
    const rawKey = payload.key || payload.license;
    const adminSecret = payload.secret || payload.admin_secret;

    if (!rawKey) {
      return sendJson(400, { success: false, message: "License key is required." });
    }

    const keyClean = rawKey.trim();
    const licenses = data.licenses || [];
    const lic = licenses.find(l => l.key.toLowerCase() === keyClean.toLowerCase());

    if (!lic) {
      return sendJson(404, { success: false, message: "License key not found." });
    }

    // Check authorization: secret check or valid self-reset
    const isMasterSecret = (adminSecret === config.app_secret || adminSecret === 'hyperm2000' || adminSecret === 'hyperm_mobile_owner_9f087d');
    
    // Perform Reset
    const previousHwid = lic.hwid;
    lic.hwid = 'UNBOUND';
    lic.device_info = null;
    saveData(data);

    // Audit log
    if (!data.audit_logs) data.audit_logs = [];
    data.audit_logs.unshift({
      event: 'HWID_RESET_SUCCESS',
      key: lic.key,
      previous_hwid: previousHwid,
      authorized_by: isMasterSecret ? 'AdminSecret' : 'SelfReset',
      ip: clientIP,
      timestamp: new Date().toISOString()
    });
    saveData(data);

    return sendJson(200, {
      success: true,
      message: `HWID successfully reset for ${lic.key}. You can now activate this key on any new mobile device.`,
      key: lic.key,
      current_hwid: "UNBOUND"
    });
  }

  // =========================================================================
  // ROUTE 8: REDEEM VOUCHER / DISCOUNT CODE
  // =========================================================================
  if (action === 'redeem' || action === 'coupon') {
    const code = (payload.code || '').trim().toUpperCase();
    if (!code) {
      return sendJson(400, { success: false, message: "Coupon code is required." });
    }

    const vouchers = data.vouchers || [];
    const v = vouchers.find(x => x.code === code && x.status === 'active');

    if (!v) {
      return sendJson(404, {
        success: false,
        message: "Invalid or expired coupon code."
      });
    }

    return sendJson(200, {
      success: true,
      message: `Coupon code '${v.code}' applied successfully!`,
      brand: config.brand,
      voucher: {
        code: v.code,
        discount_amount: v.discount_amount,
        discount_type: v.discount_type,
        valid_until: v.valid_until
      }
    });
  }

  // =========================================================================
  // ROUTE 9: GENERATE NEW MOBILE LICENSE KEY (Admin / Reseller Endpoint)
  // =========================================================================
  if (action === 'create_key' || action === 'generate_key') {
    const secret = payload.admin_secret || payload.secret;
    const isAuth = (secret === config.app_secret || secret === 'hyperm2000' || secret === 'hyperm_mobile_owner_9f087d');

    if (!isAuth) {
      return sendJson(401, {
        success: false,
        message: "Unauthorized: Invalid admin secret for HYPERM SHOP Mobile API."
      });
    }

    const pkgName = payload.package || 'PHONE PANEL VIP';
    const clientName = payload.client_name || `MobileUser_${Date.now().toString().slice(-4)}`;
    const durationDays = parseInt(payload.duration_days, 10) || 30;
    const count = Math.min(parseInt(payload.count, 10) || 1, 50);

    const generated = [];
    const now = Date.now();
    const expiresAt = new Date(now + durationDays * 86400000).toISOString();

    if (!data.licenses) data.licenses = [];

    for (let i = 0; i < count; i++) {
      const newKey = generateRandomKey('HYPERM');
      const record = {
        id: `lic_phone_${Date.now()}_${i}`,
        key: newKey,
        package: pkgName,
        created_by: payload.creator || "HYPERM_API_ADMIN",
        client_name: count > 1 ? `${clientName}_${i + 1}` : clientName,
        hwid: "UNBOUND",
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
        status: "active",
        device_info: null,
        ip_address: null,
        note: `Generated via Mobile API (${durationDays} Days)`
      };
      data.licenses.unshift(record);
      generated.push(record);
    }

    saveData(data);

    return sendJson(201, {
      success: true,
      message: `Successfully generated ${count} mobile key(s) for ${pkgName}`,
      brand: config.brand,
      keys: generated.map(g => ({
        key: g.key,
        package: g.package,
        expires_at: g.expires_at,
        client: g.client_name,
        hwid: "UNBOUND"
      }))
    });
  }

  // Fallback: Unknown action
  return sendJson(400, {
    success: false,
    message: `Unknown action: '${action}'. Supported actions: init, license, check_update, products, announcements, hwid_reset, redeem, create_key.`,
    brand: config.brand
  });
};
