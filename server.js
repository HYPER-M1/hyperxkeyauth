const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DOWNLOADS_DIR = path.join(PUBLIC_DIR, 'downloads');

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8',
  '.zip': 'application/zip',
  '.exe': 'application/vnd.microsoft.portable-executable'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // 0. REST API HANDLER (/api)
  if (pathname === '/api' || pathname === '/api/') {
    const apiHandler = require('./api/index.js');
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      try {
        req.body = JSON.parse(bodyData);
      } catch (_) {
        req.body = {};
      }
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      if (!res.status) {
        res.status = function(code) {
          res.statusCode = code;
          return res;
        };
      }
      if (!res.json) {
        res.json = function(data) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
          return res;
        };
      }
      if (!res.send) {
        res.send = function(data) {
          res.end(data);
          return res;
        };
      }
      apiHandler(req, res);
    });
    return;
  }

  // 1. GET BUILD METADATA
  if (pathname === '/api/build-meta') {
    const metaFile = path.join(DOWNLOADS_DIR, 'build_meta.json');
    if (fs.existsSync(metaFile)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      fs.createReadStream(metaFile).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        masterFileName: 'Master_Core_KERNEL_CSHARP_v1.0.0.zip',
        masterSize: '1.98 MB',
        exeFileName: 'KERNEL-CSHARP.exe',
        exeSize: '155 KB',
        lastUpdated: '11 Oct, 19:25',
        resellerSync: 'Automatic Push',
        hmacStatus: 'HMAC Protected Master Active'
      }));
    }
    return;
  }

  // DISMISS UPDATE NOTIFICATION
  if (pathname === '/api/dismiss-update') {
    const metaFile = path.join(DOWNLOADS_DIR, 'build_meta.json');
    if (fs.existsSync(metaFile)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
        meta.hasNewUpdate = false;
        fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
      } catch (_) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Notification removed' }));
    return;
  }

  // 2. POST UPLOAD (ADMIN CORE UPLOAD)
  if (pathname === '/api/upload' && req.method === 'POST') {
    const rawFilename = parsedUrl.searchParams.get('filename') || 'Master_Core_KERNEL_CSHARP_v1.0.0.zip';
    const cleanFilename = path.basename(rawFilename).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const isZip = cleanFilename.toLowerCase().endsWith('.zip');
    
    // Save as exact uploaded filename
    const exactUploadedPath = path.join(DOWNLOADS_DIR, cleanFilename);
    const standardTargetPath = isZip
      ? path.join(DOWNLOADS_DIR, 'Master_Core_KERNEL_CSHARP_v1.0.0.zip')
      : path.join(DOWNLOADS_DIR, 'HYPER_X_Client.exe');

    const fileStream = fs.createWriteStream(exactUploadedPath);
    const hash = crypto.createHash('sha256');
    let totalBytes = 0;

    req.on('data', chunk => {
      totalBytes += chunk.length;
      hash.update(chunk);
      fileStream.write(chunk);
    });

    req.on('end', () => {
      fileStream.end();
      const sha256 = hash.digest('hex');
      const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';
      const sizeKB = (totalBytes / 1024).toFixed(0) + ' KB';
      const displaySize = totalBytes > 1024 * 1024 ? sizeMB : sizeKB;
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + 
                      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      // Keep standard targets synchronized
      try {
        fs.copyFileSync(exactUploadedPath, standardTargetPath);
        if (isZip) {
          fs.copyFileSync(exactUploadedPath, path.join(DOWNLOADS_DIR, 'HYPER_X_Branded_Client.zip'));
        }
      } catch (_) {}

      const updateId = Date.now();
      const meta = {
        latestUploadedFile: cleanFilename,
        masterFileName: isZip ? cleanFilename : 'Master_Core_KERNEL_CSHARP_v1.0.0.zip',
        masterSize: isZip ? displaySize : '1.98 MB',
        exeFileName: !isZip ? cleanFilename : 'KERNEL-CSHARP.exe',
        exeSize: !isZip ? displaySize : '155 KB',
        uploadedSize: displaySize,
        lastUpdated: dateStr,
        resellerSync: 'Automatic Push',
        hmacStatus: 'HMAC Protected Master Active',
        sha256: sha256.substring(0, 16) + '...',
        updateId: updateId,
        hasNewUpdate: true,
        updateTitle: `⚡ NEW BUILD DEPLOYED: ${cleanFilename}`,
        updateDesc: `Admin has uploaded and deployed ${cleanFilename} (${displaySize}) at ${dateStr}. Please download the latest update.`
      };

      const metaFile = path.join(DOWNLOADS_DIR, 'build_meta.json');
      fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Upload successfully deployed to Resellers', meta }));
    });

    req.on('error', err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // 3. API DOWNLOAD ENDPOINT
  if (pathname === '/api/download') {
    const brand = parsedUrl.searchParams.get('brand') || 'HYPER_X';
    const cleanBrand = brand.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const type = (parsedUrl.searchParams.get('type') || 'exe').toLowerCase();
    const target = parsedUrl.searchParams.get('target') || 'client';

    let filePath;
    let downloadName;

    // Load build_meta if available
    let buildMeta = null;
    const metaFile = path.join(DOWNLOADS_DIR, 'build_meta.json');
    if (fs.existsSync(metaFile)) {
      try { buildMeta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch (_) {}
    }

    if (target === 'update') {
      // 100% serve the EXACT file uploaded by Admin
      if (buildMeta && buildMeta.latestUploadedFile && fs.existsSync(path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile))) {
        filePath = path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile);
        downloadName = buildMeta.latestUploadedFile;
      } else if (buildMeta && buildMeta.masterFileName && fs.existsSync(path.join(DOWNLOADS_DIR, buildMeta.masterFileName))) {
        filePath = path.join(DOWNLOADS_DIR, buildMeta.masterFileName);
        downloadName = buildMeta.masterFileName;
      } else {
        filePath = path.join(DOWNLOADS_DIR, 'Master_Core_KERNEL_CSHARP_v1.0.0.zip');
        downloadName = 'Master_Core_KERNEL_CSHARP_v1.0.0.zip';
      }
    } else if (target === 'master') {
      if (buildMeta && buildMeta.latestUploadedFile && buildMeta.latestUploadedFile.endsWith('.zip') && fs.existsSync(path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile))) {
        filePath = path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile);
        downloadName = buildMeta.latestUploadedFile;
      } else {
        filePath = path.join(DOWNLOADS_DIR, 'Master_Core_KERNEL_CSHARP_v1.0.0.zip');
        downloadName = 'Master_Core_KERNEL_CSHARP_v1.0.0.zip';
      }
    } else if (type === 'zip') {
      filePath = path.join(DOWNLOADS_DIR, 'HYPER_X_Branded_Client.zip');
      downloadName = `${cleanBrand}_Client_Package.zip`;
    } else {
      if (buildMeta && buildMeta.latestUploadedFile && buildMeta.latestUploadedFile.endsWith('.exe') && fs.existsSync(path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile))) {
        filePath = path.join(DOWNLOADS_DIR, buildMeta.latestUploadedFile);
        downloadName = `${cleanBrand}_${buildMeta.latestUploadedFile}`;
      } else {
        filePath = path.join(DOWNLOADS_DIR, 'HYPER_X_Client.exe');
        downloadName = `${cleanBrand}_Client_x64.exe`;
      }
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Download source file not found: ${downloadName}`);
      return;
    }

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': type === 'zip' ? 'application/zip' : 'application/vnd.microsoft.portable-executable',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    return;
  }

  // 4. DIRECT /downloads/ ROUTE
  if (pathname.startsWith('/downloads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(DOWNLOADS_DIR, filename);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      return;
    }
  }

  // 5. STATIC FILES
  if (pathname === '/') {
    pathname = '/login.html';
  }

  // Prevent directory traversal
  let safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // If path doesn't have an extension and file exists with .html, append .html
  if (!path.extname(safePath) && !fs.existsSync(safePath) && fs.existsSync(safePath + '.html')) {
    safePath = safePath + '.html';
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(safePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        safePath = indexFile;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Directory Index Not Found');
        return;
      }
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = { 'Content-Type': contentType };
    if (ext === '.exe' || ext === '.zip') {
      headers['Content-Disposition'] = `attachment; filename="${path.basename(safePath)}"`;
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`🚀 HYPER X Portal Server is running!`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`🔑 Login Page:  http://localhost:${PORT}/login.html`);
  console.log(`📊 Dashboard:   http://localhost:${PORT}/dashboard.html`);
  console.log(`📥 Downloads:   http://localhost:${PORT}/api/download`);
  console.log(`📤 Uploads:     http://localhost:${PORT}/api/upload`);
  console.log(`================================================`);
});
