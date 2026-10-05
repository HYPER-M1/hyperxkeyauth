<?php
require_once __DIR__ . '/config.php';
check_admin_auth();

$admin_user = $_SESSION['prtv_admin_user'] ?? 'HYPER X';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard // TERMINALX999 – Enterprise Control</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>

  <div class="app-container">
    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon-gift">🎁</div>
        <div class="brand-title-wrap">
          <div class="brand-title-row">
            <span class="brand-name">TERMINALX999</span>
            <span class="brand-live-dot"></span>
          </div>
          <div class="brand-version-badge">
            <span>v1.0.0</span>
            <span class="badge-pro">PRO</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-menu">
        <span class="menu-category-label">MAIN</span>

        <button class="sidebar-nav-link active" id="nav-dashboard" onclick="switchTab('dashboard')">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </button>

        <button class="sidebar-nav-link" id="nav-apps" onclick="switchTab('apps')">
          <span class="nav-icon">📦</span>
          <span id="nav-apps-text">Packages</span>
        </button>

        <button class="sidebar-nav-link" id="nav-licenses" onclick="switchTab('licenses')">
          <span class="nav-icon">🔑</span>
          <span>License Keys</span>
          <span class="nav-count-badge">3172</span>
        </button>

        <button class="sidebar-nav-link" id="nav-bypass" onclick="alert('Emulator Bypass Module Active')">
          <span class="nav-icon">🎮</span>
          <span>Emulator Bypass</span>
        </button>

        <button class="sidebar-nav-link" id="nav-logs" onclick="switchTab('logs')">
          <span class="nav-icon">📋</span>
          <span>Logs</span>
        </button>

        <button class="sidebar-nav-link" id="nav-sdks" onclick="alert('SDK Libraries: C++, C#, Python')">
          <span class="nav-icon">💻</span>
          <span>SDKs</span>
        </button>

        <button class="sidebar-nav-link" id="nav-api" onclick="alert('REST API Endpoints Active')">
          <span class="nav-icon">⚡</span>
          <span>API Access</span>
        </button>

        <button class="sidebar-nav-link" id="nav-discord" onclick="alert('Discord Webhook Connected')">
          <span class="nav-icon">👾</span>
          <span>Discord Bot</span>
        </button>

        <button class="sidebar-nav-link" id="nav-exegen" onclick="switchTab('exegen')">
          <span class="nav-icon">⚡</span>
          <span>EXE Generator</span>
        </button>

        <button class="sidebar-nav-link" id="nav-resellers" onclick="switchTab('resellers')">
          <span class="nav-icon">👥</span>
          <span>Resellers</span>
        </button>
      </nav>

      <div class="sidebar-profile">
        <div class="profile-left">
          <div class="profile-avatar"><?= strtoupper(substr($admin_user, 0, 1)) ?></div>
          <div class="profile-text">
            <span class="profile-name"><?= htmlspecialchars($admin_user) ?></span>
            <span class="profile-sub">Admin</span>
          </div>
        </div>
        <button class="btn-profile-logout" onclick="window.location.href='logout.php'" title="Sign Out">
          ⏻
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="main-wrapper">
      <header class="top-navbar">
        <div class="navbar-left">
          <button class="mobile-nav-toggle" onclick="toggleMobileSidebar()">☰</button>
          <span class="page-breadcrumb-title" id="page-title-display">Dashboard</span>
        </div>

        <div class="navbar-right">
          <div class="header-pill-stat">
            <span>🔑</span>
            <span>Keys:</span>
            <span class="stat-keys-tag" id="header-keys-stat">82 / 9999</span>
          </div>

          <button class="header-icon-btn" title="Notifications">🔔</button>

          <button class="header-pill-admin" onclick="switchTab('resellers')">
            <span>🛡️</span>
            <span>Admin</span>
          </button>
        </div>
      </header>

      <main class="content-area">
        <!-- VIEW 1: DASHBOARD -->
        <section class="tab-view active" id="view-dashboard">
          <div class="stats-cards-strip-7">
            <div class="stat-card-item accent-blue" onclick="switchTab('apps')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:var(--accent-blue);">📦</div>
              <div class="stat-info-col">
                <span class="stat-number-val">1</span>
                <span class="stat-title-label">APPLICATIONS</span>
              </div>
            </div>

            <div class="stat-card-item accent-purple">
              <div class="stat-icon-box" style="color:var(--accent-purple);">📋</div>
              <div class="stat-info-col">
                <span class="stat-number-val">8</span>
                <span class="stat-title-label">PACKAGES</span>
              </div>
            </div>

            <div class="stat-card-item accent-yellow" onclick="switchTab('licenses')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:var(--accent-yellow);">🔑</div>
              <div class="stat-info-col">
                <span class="stat-number-val">3172</span>
                <span class="stat-title-label">TOTAL KEYS</span>
              </div>
            </div>

            <div class="stat-card-item accent-green" onclick="switchTab('licenses')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:var(--accent-green);">✅</div>
              <div class="stat-info-col">
                <span class="stat-number-val">3116</span>
                <span class="stat-title-label">ACTIVE KEYS</span>
              </div>
            </div>

            <div class="stat-card-item accent-red" onclick="switchTab('licenses')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:var(--accent-red);">🚫</div>
              <div class="stat-info-col">
                <span class="stat-number-val">39</span>
                <span class="stat-title-label">BANNED KEYS</span>
              </div>
            </div>

            <div class="stat-card-item accent-cyan" onclick="switchTab('logs')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:var(--accent-cyan);">📡</div>
              <div class="stat-info-col">
                <span class="stat-number-val">790</span>
                <span class="stat-title-label">AUTH SUCCESS TODAY</span>
              </div>
            </div>

            <div class="stat-card-item accent-crimson" onclick="switchTab('logs')" style="cursor:pointer;">
              <div class="stat-icon-box" style="color:#f43f5e;">❌</div>
              <div class="stat-info-col">
                <span class="stat-number-val">330</span>
                <span class="stat-title-label">AUTH FAILED TODAY</span>
              </div>
            </div>
          </div>

          <div class="two-col-grid">
            <div class="dashboard-card-box">
              <div class="card-title-bar">
                <span class="card-title-text"><span>📊</span><span>Keys per Application</span></span>
              </div>
              <div class="bar-stat-row" style="margin-top:20px;">
                <span class="bar-stat-label">Custom work</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-blue" style="width: 100%;"></div></div>
                <span class="bar-stat-number">3172</span>
              </div>
            </div>

            <div class="dashboard-card-box">
              <div class="card-title-bar">
                <span class="card-title-text"><span>📈</span><span>Auth Results Today</span></span>
              </div>
              <div class="bar-stat-row">
                <span class="bar-stat-label">Success</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-green" style="width: 70.5%;"></div></div>
                <span class="bar-stat-number">790</span>
              </div>
              <div class="bar-stat-row">
                <span class="bar-stat-label">Failed</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-red" style="width: 29.5%;"></div></div>
                <span class="bar-stat-number">330</span>
              </div>
              <div class="sub-section-heading">KEY STATUS</div>
              <div class="bar-stat-row">
                <span class="bar-stat-label">Active</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-green" style="width: 98%;"></div></div>
                <span class="bar-stat-number">3116</span>
              </div>
              <div class="bar-stat-row">
                <span class="bar-stat-label">Banned</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-red" style="width: 1.2%;"></div></div>
                <span class="bar-stat-number">39</span>
              </div>
              <div class="bar-stat-row">
                <span class="bar-stat-label">Expired</span>
                <div class="bar-stat-track"><div class="bar-stat-fill fill-orange" style="width: 6.2%;"></div></div>
                <span class="bar-stat-number">198</span>
              </div>
            </div>
          </div>

          <div class="two-col-grid">
            <div class="dashboard-card-box">
              <div class="card-title-bar">
                <span class="card-title-text"><span>📋</span><span>Recent Activity</span></span>
                <a href="javascript:void(0)" onclick="switchTab('logs')" class="card-action-link">View All →</a>
              </div>
              <table class="cyber-panel-table">
                <thead>
                  <tr>
                    <th style="width:110px;">ACTION</th>
                    <th>DETAIL</th>
                    <th style="width:80px;text-align:right;">TIME</th>
                  </tr>
                </thead>
                <tbody id="dashboard-activity-tbody"></tbody>
              </table>
              <button class="btn-card-footer" onclick="switchTab('logs')">
                📋 View All 3547 Logs
              </button>
            </div>

            <div class="dashboard-card-box">
              <div class="card-title-bar">
                <span class="card-title-text"><span>📦</span><span>Your Applications</span></span>
                <a href="javascript:void(0)" onclick="switchTab('apps')" class="card-action-link">Manage →</a>
              </div>
              <table class="cyber-panel-table">
                <thead>
                  <tr><th>APP NAME</th><th>PKGS</th><th>KEYS</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight:700;color:#fff;">Custom work</td>
                    <td style="font-family:var(--font-mono);">8</td>
                    <td style="font-family:var(--font-mono);font-weight:700;">3172</td>
                    <td><span class="badge-pill-status badge-active-green">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- VIEW 2: LICENSES -->
        <section class="tab-view" id="view-licenses">
          <div class="view-header-strip lic-view-header">
            <div class="lic-header-intro">
              <h2 class="view-heading-title" id="view-licenses-title">KeyAuth License Keys Management</h2>
              <p class="view-sub-text" id="view-licenses-sub">Generate cryptographically verified keys, lock to device HWID, and control access remotely via API.</p>
            </div>
            <button class="btn-action-primary btn-gen-key-red" onclick="openModal('modal-add-key')">
              <span>⚡</span><span>+ Generate New Key</span>
            </button>
          </div>
          <div class="search-filter-bar">
            <input type="text" class="input-search-cyber" placeholder="Search by key or username..." oninput="handleSearch(this.value)">
            <div class="filter-buttons-row">
              <button class="btn-filter-pill active" onclick="setFilter('all', this)">All (3,172)</button>
              <button class="btn-filter-pill" onclick="setFilter('active', this)">Active (3,116)</button>
              <button class="btn-filter-pill" onclick="setFilter('expired', this)">Expired (198)</button>
              <button class="btn-filter-pill" onclick="setFilter('banned', this)">Banned (39)</button>
            </div>
          </div>
          <div class="cyber-data-table-wrap">
            <table class="cyber-panel-table" style="font-size:12.5px;">
              <thead>
                <tr>
                  <th>LICENSE KEY</th><th>APPLICATION</th><th>ASSIGNED USER</th><th>HWID BINDING</th><th>EXPIRATION</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody id="licenses-tbody"></tbody>
            </table>
            <div class="mobile-license-cards-wrap" id="licenses-mobile-list"></div>
          </div>
        </section>

        <!-- VIEW 3: LOGS -->
        <section class="tab-view" id="view-logs">
          <div class="view-header-strip logs-view-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
            <div class="logs-header-intro">
              <h2 class="view-heading-title" id="view-logs-title" style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;">Authentication &amp; Security Logs</h2>
              <p class="view-sub-text" id="view-logs-sub" style="font-size:11.5px;color:#64748b;margin:0;">Captured authentication attempts and API proxy transactions.</p>
            </div>
            <button class="btn-action-primary btn-export-logs-red" onclick="exportLogsToCsv()" style="background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.5);color:#fff;font-weight:700;font-size:12px;padding:7px 14px;border-radius:7px;display:flex;align-items:center;gap:6px;cursor:pointer;">
              <span>📩</span>
              <span>Export Logs</span>
            </button>
          </div>

          <div class="cyber-data-table-wrap logs-desktop-table-wrap">
            <table class="cyber-panel-table" style="font-size:12.5px;">
              <thead>
                <tr><th style="width:120px;">ACTION</th><th>DETAIL</th><th style="width:140px;">IP ADDRESS</th><th style="width:100px;">TIME</th></tr>
              </thead>
              <tbody id="full-logs-tbody"></tbody>
            </table>
          </div>

          <!-- Mobile Logs Cards View for Phone -->
          <div class="mobile-logs-cards-wrap" id="logs-mobile-list">
            <!-- Dynamically populated by JS -->
          </div>
        </section>

        <!-- VIEW 4: EXE GENERATOR -->
        <section class="tab-view" id="view-exegen">
          <div class="builder-grid">
            <div class="dashboard-card-box">
              <div class="card-title-bar"><span class="card-title-text">🛠️ Executable Build Configuration</span></div>
              <div class="form-group-item">
                <label class="form-label-title">Target Application</label>
                <input type="text" id="exe-app-name" class="form-input-box" value="Custom work" readonly style="color:#38bdf8;">
              </div>
              <div class="form-group-item">
                <label class="form-label-title">Client Version Tag</label>
                <input type="text" id="exe-version-tag" class="form-input-box" value="v1.0.0">
              </div>
              <div class="form-group-item">
                <label class="form-label-title">Binary Output Filename</label>
                <input type="text" id="exe-output-name" class="form-input-box" value="TERMINALX999_Client_x64.exe">
              </div>
              <button type="button" class="btn-action-primary" id="btn-compile-exe" style="width:100%;justify-content:center;padding:12px;font-size:13px;" onclick="runExeCompiler()">
                <span>⚡</span><span>Compile &amp; Download Protected .EXE</span>
              </button>
            </div>
            <div class="dashboard-card-box">
              <div class="card-title-bar"><span class="card-title-text">🖥️ Compiler Output Console</span></div>
              <div class="console-terminal-box" id="compiler-console">
                <div>[STANDBY] Compiler engine initialized. Select configuration and click build.</div>
              </div>
            </div>
          </div>
        </section>

        <!-- VIEW 5: RESELLERS -->
        <section class="tab-view" id="view-resellers">
          <!-- Reseller View Header -->
          <div class="view-header-strip reseller-view-header" style="margin-bottom:14px;">
            <div class="reseller-header-intro">
              <h2 class="view-heading-title" id="view-resellers-title" style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;">Reseller Management &amp; Distribution</h2>
              <p class="view-sub-text" id="view-resellers-sub" style="font-size:11.5px;color:#64748b;margin:0;">Authorize reseller accounts, grant key generation quotas, and assign panel access permissions.</p>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;flex-shrink:0;">
              <button class="btn-action-secondary" onclick="openModal('modal-transfer-credit')" style="color:#f59e0b;border-color:rgba(245,158,11,0.4);"><span>💸</span><span>Transfer Credits</span></button>
              <button class="btn-action-primary" onclick="openModal('modal-add-reseller')"><span>👥</span><span>+ Add Reseller</span></button>
            </div>
          </div>
          <!-- Stats -->
          <div class="stats-cards-strip-7" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 20px;">
            <div class="stat-card-item accent-red"><div class="stat-icon-box" style="color:#ef4444;">👥</div><div class="stat-info-col"><span class="stat-number-val" id="reseller-stat-total">0</span><span class="stat-title-label">TOTAL RESELLERS</span></div></div>
            <div class="stat-card-item accent-green"><div class="stat-icon-box" style="color:#10b981;">✅</div><div class="stat-info-col"><span class="stat-number-val" id="reseller-stat-active">0</span><span class="stat-title-label">ACTIVE ACCOUNTS</span></div></div>
            <div class="stat-card-item accent-yellow"><div class="stat-icon-box" style="color:#f59e0b;">💳</div><div class="stat-info-col"><span class="stat-number-val" id="reseller-stat-credits">0</span><span class="stat-title-label">TOTAL CREDITS IN CIRCULA</span></div></div>
            <div class="stat-card-item accent-red"><div class="stat-icon-box" style="color:#ef4444;">🔑</div><div class="stat-info-col"><span class="stat-number-val" id="reseller-stat-keys">0</span><span class="stat-title-label">TOTAL KEYS CREATED</span></div></div>
          </div>
          <!-- Desktop Table -->
          <div class="cyber-data-table-wrap reseller-desktop-table-wrap">
            <table class="cyber-panel-table" style="font-size:12.5px;">
              <thead><tr><th>RESELLER</th><th>LOGIN PASSWORD</th><th>KEY QUOTA BALANCE</th><th>TOTAL GENERATED</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody id="resellers-tbody"></tbody>
            </table>
          </div>
          <!-- Mobile Card List -->
          <div class="mobile-resellers-cards-wrap" id="resellers-mobile-list"></div>
        </section>

        <!-- VIEW 6: APPLICATIONS -->
        <section class="tab-view" id="view-apps">
          <div class="view-header-strip apps-view-header" style="margin-bottom:14px;">
            <div class="apps-header-intro">
              <h2 class="view-heading-title" id="view-apps-title" style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;">Application &amp; Packages Registry</h2>
              <p class="view-sub-text" id="view-apps-sub" style="font-size:11.5px;color:#64748b;margin:0;">
                Directly linked to App ID: <span style="color:#00f0ff;font-family:var(--font-mono);font-weight:700;" id="view-apps-appid">9f087d585fbd666572fc24b7</span> <span style="color:var(--text-dim);">(Custom work)</span>
              </p>
            </div>
          </div>

          <div class="cyber-data-table-wrap apps-desktop-table-wrap">
            <table class="cyber-panel-table">
              <thead>
                <tr>
                  <th style="width:60px;">#</th>
                  <th>PANEL / PACKAGE NAME</th>
                  <th class="col-pkg-id col-mobile-hide">PACKAGE ID</th>
                  <th>TARGET APP</th>
                  <th style="width:120px;">STATUS</th>
                </tr>
              </thead>
              <tbody id="packages-tbody">
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#1</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">BASIC PANEL</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">e52c1515c53453b85d0d4e87</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#2</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">AIMSILENT EXE</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">affc8da8fd5ace99981ab877</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#3</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">UID BYPASS</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">cb921031dc43197e8ccb6828</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#4</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">EXTERNAL PANEL</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">3d1c6c948b4715fbd2fada2d</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#5</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">PVT AIMKILL</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">d4f0ce93349f236711344cb5</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#6</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">VAULT PANEL</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">154d1edaddd7203fbfd847f4</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#7</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">LIB BYPASS</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">db3b90e8134ec738b94a9b05</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700;color:#ef4444;">#8</td>
                  <td style="font-weight:700;color:#fff;font-size:13px;">FPS BOOSTER</td>
                  <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">2411bc9db9f9a66c6e876ad2</td>
                  <td style="color:#ef4444;font-weight:600;">Custom work</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View for Phone -->
          <div class="mobile-apps-cards-wrap" id="apps-mobile-list">
            <div class="mobile-app-card" onclick="openGenModalForPackage('e52c1515c53453b85d0d4e87')">
              <div class="mobile-app-num-badge">#1</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">BASIC PANEL</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">e52c1515c53453b85d0d4e87</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('affc8da8fd5ace99981ab877')">
              <div class="mobile-app-num-badge">#2</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">AIMSILENT EXE</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">affc8da8fd5ace99981ab877</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('cb921031dc43197e8ccb6828')">
              <div class="mobile-app-num-badge">#3</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">UID BYPASS</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">cb921031dc43197e8ccb6828</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('3d1c6c948b4715fbd2fada2d')">
              <div class="mobile-app-num-badge">#4</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">EXTERNAL PANEL</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">3d1c6c948b4715fbd2fada2d</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('d4f0ce93349f236711344cb5')">
              <div class="mobile-app-num-badge">#5</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">PVT AIMKILL</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">d4f0ce93349f236711344cb5</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('154d1edaddd7203fbfd847f4')">
              <div class="mobile-app-num-badge">#6</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">VAULT PANEL</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">154d1edaddd7203fbfd847f4</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('db3b90e8134ec738b94a9b05')">
              <div class="mobile-app-num-badge">#7</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">LIB BYPASS</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">db3b90e8134ec738b94a9b05</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>

            <div class="mobile-app-card" onclick="openGenModalForPackage('2411bc9db9f9a66c6e876ad2')">
              <div class="mobile-app-num-badge">#8</div>
              <div class="mobile-app-main">
                <div class="mobile-app-name">FPS BOOSTER</div>
                <div class="mobile-app-meta-row">
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Package ID</span>
                    <span class="mobile-app-col-val val-pkg-id">2411bc9db9f9a66c6e876ad2</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Target App</span>
                    <span class="mobile-app-col-val val-target-app">Custom work</span>
                  </div>
                  <div class="mobile-app-col">
                    <span class="mobile-app-col-lbl">Status</span>
                    <div class="mobile-app-col-val">
                      <span class="badge-app-status-active"><span class="status-dot">●</span> Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-app-arrow">›</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <!-- MODALS -->
  <div class="modal-layer" id="modal-add-key">
    <div class="modal-box-card">
      <div class="modal-header-strip">
        <span class="modal-title-text">🔑 Generate KeyAuth License Keys</span>
        <button onclick="closeModal('modal-add-key')" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✕</button>
      </div>
      <form onsubmit="submitGenerateKeys(event)">
        <div class="modal-body-content">
          <div class="form-group-item">
            <label class="form-label-title">Key Prefix</label>
            <input type="text" id="gen-prefix" class="form-input-box" value="TX99" required>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Target Application</label>
            <select id="gen-app" class="form-input-box">
              <option value="Custom work" selected>Custom work</option>
              <option value="TERMINALX999_x64">TERMINALX999_x64</option>
            </select>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Assigned User</label>
            <input type="text" id="gen-user" class="form-input-box" placeholder="e.g. VIP_Gamer" required>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Validity Duration</label>
            <select id="gen-duration" class="form-input-box">
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d" selected>30 Days (1 Month)</option>
              <option value="life">Lifetime Access</option>
            </select>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Number of Keys to Generate</label>
            <input type="number" id="gen-count" class="form-input-box" min="1" max="50" value="1">
          </div>
        </div>
        <div class="modal-footer-strip">
          <button type="button" class="btn-action-secondary" onclick="closeModal('modal-add-key')">Cancel</button>
          <button type="submit" class="btn-action-primary">Generate Keys Now ⚡</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-layer" id="modal-add-reseller">
    <div class="modal-box-card">
      <div class="modal-header-strip">
        <span class="modal-title-text">👥 Create Reseller Sub-Account</span>
        <button onclick="closeModal('modal-add-reseller')" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✕</button>
      </div>
      <form onsubmit="submitAddReseller(event)">
        <div class="modal-body-content">
          <div class="form-group-item">
            <label class="form-label-title">Reseller Username</label>
            <input type="text" id="reseller-name" class="form-input-box" placeholder="e.g. DeltaSales" required>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Reseller Email Address</label>
            <input type="email" id="reseller-email" class="form-input-box" placeholder="sales@delta.com" required>
          </div>
          <div class="form-group-item">
            <label class="form-label-title">Initial Key Creation Quota</label>
            <input type="number" id="reseller-quota" class="form-input-box" value="100" min="1">
          </div>
        </div>
        <div class="modal-footer-strip">
          <button type="button" class="btn-action-secondary" onclick="closeModal('modal-add-reseller')">Cancel</button>
          <button type="submit" class="btn-action-primary">Create Reseller Account</button>
        </div>
      </form>
    </div>
  </div>

  <script src="../assets/js/dashboard.js"></script>
</body>
</html>
