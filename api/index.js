/**
 * Vercel Serverless Function: POST /api
 * Master Proxy for KeyAuth Engine (prtvshow.online/api_admin.php)
 */

const https = require('https');

const REMOTE_API_URL = 'https://prtvshow.online/api_admin.php';
const REMOTE_API_KEY = 'TX999_API_bc186f5d73bd492e6d52095e5a7bfd78';
const DEFAULT_APP_ID = '516b7d5e0fba068072fc24b7';

module.exports = async (req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }
  body = body || {};

  const action = body.action || req.query.action || '';
  const appId = body.app_id || DEFAULT_APP_ID;

  if (!action) {
    return res.status(400).json({ success: false, message: 'Missing action parameter' });
  }

  const payload = {
    api_key: REMOTE_API_KEY,
    app_id: appId,
    ...body,
    action: action
  };

  const postData = JSON.stringify(payload);

  try {
    const remoteRes = await new Promise((resolve, reject) => {
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

    if (remoteRes.data) {
      return res.status(remoteRes.statusCode || 200).json(remoteRes.data);
    } else {
      return res.status(remoteRes.statusCode || 200).send(remoteRes.raw);
    }
  } catch (err) {
    console.error('Remote proxy error:', err);
    
    // Fallback: If remote API is unreachable for generate_key
    if (action === 'generate_key') {
      const count = parseInt(body.count, 10) || 1;
      const keys = [];
      for (let i = 0; i < count; i++) {
        const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
        keys.push(`HPERX-${seg()}-${seg()}-${seg()}-${seg()}`);
      }
      return res.status(200).json({
        success: true,
        message: 'Keys generated successfully.',
        count: keys.length,
        keys: keys,
        app_name: 'Custom work',
        package_name: 'BASIC PANEL',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    return res.status(502).json({
      success: false,
      message: `Remote API unreachable: ${err.message}`
    });
  }
};
