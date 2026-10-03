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
          <span>Applications</span>
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
            <span class="stat-keys-tag">82 / 9999</span>
          </div>

          <div class="header-pill-stat">
            <span>⚡</span>
            <span>Lib:</span>
            <span class="stat-lib-tag">● (35/24h)</span>
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
          <div class="view-header-strip">
            <div>
              <h2 class="view-heading-title">KeyAuth License Keys</h2>
              <p class="view-sub-text">Generate cryptographically verified keys, lock to device HWID, and monitor usage.</p>
            </div>
            <button class="btn-action-primary" onclick="openModal('modal-add-key')">
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
          </div>
        </section>

        <!-- VIEW 3: LOGS -->
        <section class="tab-view" id="view-logs">
          <div class="view-header-strip">
            <div>
              <h2 class="view-heading-title">Authentication &amp; Security Logs</h2>
              <p class="view-sub-text">Total 3,547 log entries captured across client sessions and API requests.</p>
            </div>
          </div>
          <div class="cyber-data-table-wrap">
            <table class="cyber-panel-table" style="font-size:12.5px;">
              <thead>
                <tr><th style="width:120px;">ACTION</th><th>DETAIL</th><th style="width:140px;">IP ADDRESS</th><th style="width:100px;">TIME</th></tr>
              </thead>
              <tbody id="full-logs-tbody"></tbody>
            </table>
          </div>
        </section>

        <!-- VIEW 4: EXE GENERATOR -->
        <section class="tab-view" id="view-exegen">
          <div class="view-header-strip">
            <div>
              <h2 class="view-heading-title">Protected Client EXE Generator</h2>
              <p class="view-sub-text">Build and compile encrypted client executables bound to your KeyAuth application.</p>
            </div>
          </div>
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
          <div class="view-header-strip">
            <div>
              <h2 class="view-heading-title">Reseller Management &amp; Distribution</h2>
              <p class="view-sub-text">Authorize reseller accounts, grant key generation quotas, and track sales.</p>
            </div>
            <button class="btn-action-primary" onclick="openModal('modal-add-reseller')">
              <span>👥</span><span>+ Add Reseller</span>
            </button>
          </div>
          <div class="cyber-data-table-wrap">
            <table class="cyber-panel-table" style="font-size:12.5px;">
              <thead>
                <tr>
                  <th>RESELLER USERNAME</th><th>EMAIL ADDRESS</th><th>KEY QUOTA BALANCE</th><th>TOTAL GENERATED</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody id="resellers-tbody"></tbody>
            </table>
          </div>
        </section>

        <!-- VIEW 6: APPLICATIONS -->
        <section class="tab-view" id="view-apps">
          <div class="view-header-strip">
            <div>
              <h2 class="view-heading-title">Application Management</h2>
              <p class="view-sub-text">Manage registered applications and cryptographic secret salts.</p>
            </div>
          </div>
          <div class="dashboard-card-box">
            <table class="cyber-panel-table">
              <thead><tr><th>APP NAME</th><th>APP SECRET</th><th>PACKAGES</th><th>TOTAL KEYS</th><th>STATUS</th></tr></thead>
              <tbody>
                <tr>
                  <td style="font-weight:700;color:#fff;">Custom work</td>
                  <td style="font-family:var(--font-mono);color:#06b6d4;">38f901ab299401cc8849b291a0f9831</td>
                  <td style="font-family:var(--font-mono);">8 Packages</td>
                  <td style="font-family:var(--font-mono);color:#f59e0b;font-weight:700;">3172</td>
                  <td><span class="badge-pill-status badge-active-green">Active</span></td>
                </tr>
              </tbody>
            </table>
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
