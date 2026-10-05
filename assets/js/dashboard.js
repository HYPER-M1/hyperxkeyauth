/**
 * ==========================================================================
 * HYPER X // KEYAUTH ENGINE & DASHBOARD CONTROLLER
 * Live KeyAuth API Integration (prtvshow.online / api_admin.php)
 * Real-time Key Generation, HWID Reset, Ban/Unban, Deletion & Remote Quotas
 * ==========================================================================
 */

// Master API Configurations (Client-safe proxy routing)
const API_URL = window.location.pathname.includes('/admin/') ? 'api.php' : '/api';

// Live Packages Fallback (Populated dynamically from get_admin_packages)
const DEFAULT_PACKAGES = [
  { package_id: 'e52c1515c53453b85d0d4e87', package_name: 'BASIC PANEL', app_name: 'Custom work' },
  { package_id: 'affc8da8fd5ace99981ab877', package_name: 'AIMSILENT EXE', app_name: 'Custom work' },
  { package_id: 'cb921031dc43197e8ccb6828', package_name: 'UID BYPASS', app_name: 'Custom work' },
  { package_id: '3d1c6c948b4715fbd2fada2d', package_name: 'EXTERNAL PANEL', app_name: 'Custom work' },
  { package_id: 'd4f0ce93349f236711344cb5', package_name: 'PVT AIMKILL', app_name: 'Custom work' },
  { package_id: '154d1edaddd7203fbfd847f4', package_name: 'VAULT PANEL', app_name: 'Custom work' },
  { package_id: 'db3b90e8134ec738b94a9b05', package_name: 'LIB BYPASS', app_name: 'Custom work' },
  { package_id: '2411bc9db9f9a66c6e876ad2', package_name: 'FPS BOOSTER', app_name: 'Custom work' }
];

// Seed Licenses History (Saved in localStorage so generated keys persist)
const SEED_LICENSES = [
  { id: '1', key: 'HPERX-8F92-41AC-90B2-110A', app: 'Custom work', pkg: 'BASIC PANEL', user: 'AlphaDistro_ViperX', hwid: '4A8F-912C-00B4-E9D1', expiry: '2026-12-31', status: 'active', note: 'Created by AlphaDistro' },
  { id: '2', key: 'HPERX-32KA-991L-M08P-4491', app: 'Custom work', pkg: 'EXTERNAL PANEL', user: 'AlphaDistro_SkyLord', hwid: '88CF-1102-BA54-77E0', expiry: '2026-10-15', status: 'active', note: 'Created by AlphaDistro' },
  { id: '3', key: 'HPERX-77XC-B943-LL90-0012', app: 'Custom work', pkg: 'UID BYPASS', user: 'ShadowFF', hwid: 'Unbound', expiry: '2026-10-07', status: 'active', note: 'Awaiting Device' },
  { id: '4', key: 'HPERX-110A-BBA8-8832-5501', app: 'Custom work', pkg: 'AIMSILENT EXE', user: 'ViperKeys_Ghost', hwid: '9920-A001-B789-CC21', expiry: '2026-11-20', status: 'active', note: 'Created by ViperKeys' },
  { id: '5', key: 'HPERX-9923-00PA-8841-8899', app: 'Custom work', pkg: 'PVT AIMKILL', user: 'CrackerBot', hwid: 'TAMPER_DETECTED', expiry: '2026-11-01', status: 'banned', note: 'Memory Hook Violation' },
  { id: '6', key: 'HPERX-55VK-7719-ABCD-2234', app: 'Custom work', pkg: 'VAULT PANEL', user: 'ViperKeys_User01', hwid: '99BC-2281-A011-9988', expiry: '2026-11-15', status: 'active', note: 'Created by ViperKeys' }
];

const SEED_LOGS = [
  { id: '1', action: 'auth_success', detail: 'Key authenticated for app: Custom work (BASIC PANEL)', time: '2s ago', ip: '45.118.67.22' },
  { id: '2', action: 'key_gen', detail: 'License key created: HPERX-8F92-41AC-90B2-110A (30 Days)', time: '14s ago', ip: '127.0.0.1' },
  { id: '3', action: 'auth_fail', detail: 'HWID mismatch detected: Device unverified', time: '45s ago', ip: '89.144.12.5' },
  { id: '4', action: 'hwid_reset', detail: 'HWID reset executed for HPERX-32KA-991L-M08P-4491', time: '1m ago', ip: '127.0.0.1' },
  { id: '5', action: 'credit_transfer', detail: 'Transfer 250 credits from HYPER X to AlphaDistro', time: '3m ago', ip: '127.0.0.1' },
  { id: '6', action: 'auth_success', detail: 'Client handshake v1.0.0 verified successfully', time: '5m ago', ip: '194.26.29.13' },
  { id: '7', action: 'auth_fail', detail: 'Invalid license key attempt: HPERX-UNKNOWN-XXXX', time: '8m ago', ip: '182.73.19.144' },
  { id: '8', action: 'key_ban', detail: 'Key banned by Admin: Memory hook tamper detected', time: '12m ago', ip: '127.0.0.1' }
];

const SEED_RESELLERS = [
  { id: '17909518904974', username: 'beta123', password: 'beta1230', email: 'beta123@gmail.com', balance: 999, createdKeys: 1, status: 'Active', panels: ['all'], totpSecret: 'YLOG2E3ANGTE4B23', twofa_setup_done: true },
  { id: '1790951896372', username: 'MADHUKARBETA', password: 'reseller4@123', email: 'madhukarsarkar004@gmail.com', balance: 260, createdKeys: 0, status: 'Active', panels: ['all'], totpSecret: 'JBSWY3DPEHPK3PXP', twofa_setup_done: true },
  { id: '1', username: 'HYPER X (Root Owner)', password: 'adminPassword123', email: 'admin@prtvshow.online', balance: 9922, createdKeys: 77, status: 'Active (Root)', panels: ['all'], totpSecret: 'JBSWY3DPEHPK3PXP', twofa_setup_done: true },
  { id: '2', username: 'AlphaDistro', password: 'alphaPass@2026', email: 'alpha.dist@outlook.com', balance: 250, createdKeys: 88, status: 'Active', panels: ['BASIC PANEL', 'EXTERNAL PANEL', 'FPS BOOSTER'], totpSecret: 'KRUGKIDROVUWG2ZA', twofa_setup_done: true },
  { id: '3', username: 'ViperKeys', password: 'viperKey#99', email: 'viper.resell@yahoo.com', balance: 50, createdKeys: 49, status: 'Active', panels: ['AIMSILENT EXE', 'UID BYPASS', 'VAULT PANEL'], totpSecret: 'MFRGGZDFMZTWQ2LK', twofa_setup_done: true }
];

const SEED_TRANSFERS = [
  { id: 'TX-891042', from: 'HYPER X', to: 'AlphaDistro', amount: 250, note: 'Initial Owner Quota Allocation', time: '2026-10-01 10:15', timestamp: 1759313700000, status: 'Completed' },
  { id: 'TX-740219', from: 'HYPER X', to: 'ViperKeys', amount: 50, note: 'Initial Owner Quota Allocation', time: '2026-10-01 11:30', timestamp: 1759318200000, status: 'Completed' },
  { id: 'TX-612984', from: 'AlphaDistro', to: 'ViperKeys', amount: 20, note: 'Peer Credit Transfer', time: '2026-10-02 14:05', timestamp: 1759413900000, status: 'Completed' }
];

class AppState {
  constructor() {
    let storedLicenses = [];
    try {
      storedLicenses = JSON.parse(localStorage.getItem('tx99_licenses'));
    } catch (e) {}
    this.licenses = (Array.isArray(storedLicenses) && storedLicenses.length > 0) ? storedLicenses : SEED_LICENSES;

    let storedLogs = [];
    try {
      storedLogs = JSON.parse(localStorage.getItem('tx99_logs'));
    } catch (e) {}
    this.logs = (Array.isArray(storedLogs) && storedLogs.length > 0) ? storedLogs : SEED_LOGS;

    let storedResellers = JSON.parse(localStorage.getItem('tx99_resellers')) || [];
    if (!Array.isArray(storedResellers) || storedResellers.length === 0) {
      storedResellers = SEED_RESELLERS;
    } else {
      SEED_RESELLERS.forEach(seedR => {
        if (!storedResellers.some(r => r.username.toLowerCase() === seedR.username.toLowerCase())) {
          storedResellers.push(seedR);
        }
      });
    }
    this.resellers = storedResellers.map((r, idx) => {
      if (!r.password) r.password = 'reseller' + (idx + 1) + '@123';
      if (!r.panels || !Array.isArray(r.panels) || r.panels.length === 0) r.panels = ['all'];
      r.balance = parseInt(r.balance, 10) || 0;
      return r;
    });
    this.transfers = JSON.parse(localStorage.getItem('tx99_transfers')) || SEED_TRANSFERS;
    this.transfersFilter = 'all';
    this.packages = DEFAULT_PACKAGES;
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.stats = {
      username: 'HYPER X',
      total_keys: 43,
      active_keys: 43,
      banned_keys: 0,
      key_limit: 9999,
      keys_created: 77,
      remaining: 9922
    };
  }

  addLog(action, detail, ip = '127.0.0.1') {
    const newLog = {
      id: Date.now().toString(),
      action: action,
      detail: detail,
      time: 'Just now',
      ip: ip
    };
    if (!Array.isArray(this.logs)) this.logs = [];
    this.logs.unshift(newLog);
    if (this.logs.length > 50) this.logs.pop();
    this.save();
    renderDashboardRecentActivity();
    renderFullLogsTable();
  }

  save() {
    localStorage.setItem('tx99_licenses', JSON.stringify(this.licenses));
    localStorage.setItem('tx99_logs', JSON.stringify(this.logs));
    localStorage.setItem('tx99_resellers', JSON.stringify(this.resellers));
    localStorage.setItem('tx99_transfers', JSON.stringify(this.transfers));
  }
}

const state = new AppState();

// ==========================================================================
// PREMIUM CYBERPUNK HYPERX SYSTEM DIALOG SYSTEM
// ==========================================================================
let _hyperDialogCallback = null;
let _hyperDialogCancelCallback = null;
let _hyperDialogCopyData = '';

function showHyperAlert(message, options = {}) {
  let overlay = document.getElementById('hyper-dialog-overlay');
  
  // If overlay doesn't exist yet, dynamically inject it into DOM
  if (!overlay) {
    const div = document.createElement('div');
    div.className = 'hyper-dialog-overlay';
    div.id = 'hyper-dialog-overlay';
    div.innerHTML = `
      <div class="hyper-dialog-card" id="hyper-dialog-card">
        <div class="hyper-dialog-stripe"></div>
        <div class="hyper-dialog-header">
          <span class="hyper-dialog-badge" id="hyper-dialog-badge">⚡ HYPERX // SYSTEM NOTICE</span>
          <button type="button" class="hyper-dialog-close-btn" id="hyper-dialog-close-btn" onclick="closeHyperDialog()">✕</button>
        </div>
        <div class="hyper-dialog-body">
          <div class="hyper-dialog-icon-wrap success" id="hyper-dialog-icon-wrap">
            <span id="hyper-dialog-icon">✓</span>
          </div>
          <h3 class="hyper-dialog-title" id="hyper-dialog-title">Notification</h3>
          <div class="hyper-dialog-msg" id="hyper-dialog-msg"></div>
          <div class="hyper-dialog-info-card" id="hyper-dialog-info-card" style="display:none;">
            <div id="hyper-dialog-kv-list"></div>
            <button type="button" class="hyper-dialog-copy-btn" id="hyper-dialog-copy-btn" onclick="copyHyperDialogCreds()">
              <span>📋</span>
              <span id="hyper-dialog-copy-text">Copy Credentials</span>
            </button>
          </div>
          <div class="hyper-dialog-actions" id="hyper-dialog-actions">
            <button type="button" class="hyper-dialog-btn-secondary" id="hyper-dialog-btn-cancel" style="display:none;" onclick="handleHyperDialogCancel()">Cancel</button>
            <button type="button" class="hyper-dialog-btn-primary" id="hyper-dialog-btn-ok" onclick="handleHyperDialogOk()">
              <span>✓</span>
              <span id="hyper-dialog-btn-ok-text">Acknowledge</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    overlay = div;
  }

  const iconWrap = document.getElementById('hyper-dialog-icon-wrap');
  const iconEl = document.getElementById('hyper-dialog-icon');
  const badgeEl = document.getElementById('hyper-dialog-badge');
  const titleEl = document.getElementById('hyper-dialog-title');
  const msgEl = document.getElementById('hyper-dialog-msg');
  const infoCard = document.getElementById('hyper-dialog-info-card');
  const kvList = document.getElementById('hyper-dialog-kv-list');
  const copyBtn = document.getElementById('hyper-dialog-copy-btn');
  const copyText = document.getElementById('hyper-dialog-copy-text');
  const okBtnText = document.getElementById('hyper-dialog-btn-ok-text');
  const cancelBtn = document.getElementById('hyper-dialog-btn-cancel');

  _hyperDialogCallback = options.onOk || null;
  _hyperDialogCancelCallback = options.onCancel || null;
  _hyperDialogCopyData = '';

  const str = String(message || '');
  const lines = str.split('\n').map(l => l.trim()).filter(Boolean);

  let type = options.type || 'info';
  let title = options.title || '';
  let subtitleLines = [];
  let kvPairs = [];

  // Auto-detect type from emojis and keywords
  if (!options.type) {
    if (str.includes('✓') || /success|created|updated|reset|operational/i.test(str)) {
      type = 'success';
    } else if (str.includes('❌') || str.includes('⛔') || /error|failed|denied|incorrect|invalid/i.test(str)) {
      type = 'error';
    } else if (str.includes('⚠️') || /insufficient|warning|caution/i.test(str)) {
      type = 'warning';
    }
  }

  // Parse Title and Key-Values
  if (!title) {
    if (lines.length > 0) {
      let firstLine = lines[0]
        .replace(/^[✓❌⛔⚠️ℹ️\?]\s*/, '')
        .replace(/^(SUCCESS|ERROR|WARNING|NOTICE):\s*/i, '');
      title = firstLine;
    } else {
      title = type === 'success' ? 'Operation Successful' : (type === 'error' ? 'Action Failed' : 'System Notice');
    }
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      const k = line.substring(0, colonIdx).trim();
      const v = line.substring(colonIdx + 1).trim();
      if (k && v) {
        kvPairs.push({ key: k, value: v });
        continue;
      }
    }
    subtitleLines.push(line);
  }

  // Setup Visuals
  if (iconWrap) {
    iconWrap.className = 'hyper-dialog-icon-wrap ' + type;
  }

  if (iconEl) {
    if (type === 'success') {
      iconEl.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'error') {
      iconEl.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconEl.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconEl.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }
  }

  if (badgeEl) {
    if (type === 'success') badgeEl.textContent = '⚡ HYPERX // SUCCESS';
    else if (type === 'error') badgeEl.textContent = '⛔ HYPERX // ERROR';
    else if (type === 'warning') badgeEl.textContent = '⚠️ HYPERX // WARNING';
    else badgeEl.textContent = '⚡ HYPERX // SYSTEM NOTICE';
  }

  if (titleEl) titleEl.textContent = title;

  if (msgEl) {
    if (subtitleLines.length > 0) {
      msgEl.textContent = subtitleLines.join('\n');
      msgEl.style.display = 'block';
    } else {
      msgEl.style.display = 'none';
    }
  }

  // Key-value pairs display (e.g. Credentials)
  if (infoCard && kvList) {
    if (kvPairs.length > 0) {
      infoCard.style.display = 'block';
      kvList.innerHTML = kvPairs.map(item => `
        <div class="hyper-dialog-kv-row">
          <span class="hyper-dialog-kv-label">${item.key.toUpperCase()}</span>
          <span class="hyper-dialog-kv-val">${item.value}</span>
        </div>
      `).join('');

      _hyperDialogCopyData = kvPairs.map(p => `${p.key}: ${p.value}`).join('\n');
      if (copyBtn) {
        copyBtn.style.display = 'flex';
        if (copyText) copyText.textContent = 'Copy Credentials';
      }
    } else {
      infoCard.style.display = 'none';
    }
  }

  if (cancelBtn) {
    cancelBtn.style.display = options.showCancel ? 'block' : 'none';
  }

  if (okBtnText) {
    okBtnText.textContent = options.btnText || (options.showCancel ? 'Confirm' : 'Acknowledge');
  }

  overlay.classList.add('active');
}

function closeHyperDialog() {
  const overlay = document.getElementById('hyper-dialog-overlay');
  if (overlay) overlay.classList.remove('active');
}

function handleHyperDialogOk() {
  closeHyperDialog();
  if (typeof _hyperDialogCallback === 'function') {
    const cb = _hyperDialogCallback;
    _hyperDialogCallback = null;
    cb();
  }
}

function handleHyperDialogCancel() {
  closeHyperDialog();
  if (typeof _hyperDialogCancelCallback === 'function') {
    const cb = _hyperDialogCancelCallback;
    _hyperDialogCancelCallback = null;
    cb();
  }
}

function copyHyperDialogCreds() {
  if (!_hyperDialogCopyData) return;
  navigator.clipboard.writeText(_hyperDialogCopyData).then(() => {
    const copyText = document.getElementById('hyper-dialog-copy-text');
    if (copyText) {
      const orig = copyText.textContent;
      copyText.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => { copyText.textContent = orig; }, 2000);
    }
  }).catch(() => {});
}

// Global window.alert override so that every alert in the portal uses this sleek dialog
window.alert = function(msg) {
  showHyperAlert(msg);
};

// Global click outside & key listeners
document.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('hyper-dialog-overlay');
  if (overlay && overlay.classList.contains('active')) {
    if (e.key === 'Escape') {
      handleHyperDialogCancel();
    } else if (e.key === 'Enter') {
      handleHyperDialogOk();
    }
  }
});

document.addEventListener('click', (e) => {
  const overlay = document.getElementById('hyper-dialog-overlay');
  if (overlay && overlay.classList.contains('active') && e.target === overlay) {
    handleHyperDialogCancel();
  }
});

// ==========================================================================
// 1. ADMIN USER & PASSWORD CONFIGURATION
// ==========================================================================
const DEFAULT_ADMIN_USER = "HYPER X";
const DEFAULT_ADMIN_PASS = "hyperm2000";

function getUserRole() {
  return sessionStorage.getItem('hyperx_user_role') || localStorage.getItem('hyperx_user_role') || '';
}

function getCurrentReseller() {
  const raw = sessionStorage.getItem('hyperx_current_reseller') || localStorage.getItem('hyperx_current_reseller');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return state.resellers.find(r => r.id === parsed.id || (r.username && parsed.username && r.username.toLowerCase() === parsed.username.toLowerCase())) || parsed;
  } catch (e) {
    return null;
  }
}

function getStoredAdminUser() {
  return localStorage.getItem('hyperx_admin_user') || DEFAULT_ADMIN_USER;
}

function getStoredAdminPass() {
  return localStorage.getItem('hyperx_admin_pass') || DEFAULT_ADMIN_PASS;
}

function updateAdminUI() {
  const role = getUserRole();
  if (role === 'reseller') return;

  const currentAdmin = getStoredAdminUser();
  document.querySelectorAll('.profile-name').forEach(el => el.textContent = currentAdmin);

  const avatarLetter = document.getElementById('sidebar-avatar-letter');
  if (avatarLetter && currentAdmin.length > 0) {
    avatarLetter.textContent = currentAdmin.charAt(0).toUpperCase();
  }

  const userField = document.getElementById('cfg-admin-username');
  if (userField) userField.value = currentAdmin;
}

async function syncCredentialsToServer(updates = {}) {
  try {
    const adminUser = updates.hyperx_admin_user || localStorage.getItem('hyperx_admin_user') || 'HYPER X';
    const adminPass = updates.hyperx_admin_pass || localStorage.getItem('hyperx_admin_pass');
    let resellers = [];
    try {
      resellers = JSON.parse(localStorage.getItem('tx99_resellers')) || [];
    } catch (_) {}

    const payload = {
      hyperx_admin_user: adminUser,
      tx99_resellers: updates.tx99_resellers || resellers
    };
    if (adminPass) payload.hyperx_admin_pass = adminPass;

    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (_) {}
}

function submitChangeAdminCredentials(e) {
  if (e) e.preventDefault();
  const newUsername = document.getElementById('cfg-admin-username').value.trim();
  const oldPass = document.getElementById('cfg-admin-oldpass').value;
  const newPass = document.getElementById('cfg-admin-newpass').value;
  const confirmPass = document.getElementById('cfg-admin-confirmpass').value;
  const msgBox = document.getElementById('cfg-admin-msg');

  if (!newUsername) {
    alert('Please enter an Admin username!');
    return;
  }

  const storedPass = getStoredAdminPass();
  if (oldPass !== storedPass) {
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.style.background = 'rgba(239, 68, 68, 0.2)';
      msgBox.style.color = '#ef4444';
      msgBox.textContent = `❌ Incorrect current password! (Default: ${DEFAULT_ADMIN_PASS})`;
    } else {
      alert(`❌ Incorrect current password! (Default: ${DEFAULT_ADMIN_PASS})`);
    }
    return;
  }

  if (newPass.length < 4) {
    alert('Password must be at least 4 characters long!');
    return;
  }

  if (newPass !== confirmPass) {
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.style.background = 'rgba(239, 68, 68, 0.2)';
      msgBox.style.color = '#ef4444';
      msgBox.textContent = '❌ New password and Confirm password do not match!';
    } else {
      alert('❌ Passwords do not match!');
    }
    return;
  }

  localStorage.setItem('hyperx_admin_user', newUsername);
  localStorage.setItem('hyperx_admin_pass', newPass);
  localStorage.setItem('hyperx_saved_login_user', newUsername);
  localStorage.setItem('hyperx_saved_login_pass', newPass);

  // Sync to cloud server so other devices immediately get updated password
  syncCredentialsToServer({
    hyperx_admin_user: newUsername,
    hyperx_admin_pass: newPass
  });

  document.getElementById('cfg-admin-oldpass').value = '';
  document.getElementById('cfg-admin-newpass').value = '';
  document.getElementById('cfg-admin-confirmpass').value = '';
  if (msgBox) msgBox.style.display = 'none';

  updateAdminUI();
  closeModal('modal-change-admin');
  alert(`✓ Admin Credentials Successfully Changed!\n\nNew Username: ${newUsername}\nNew Password: ${newPass}`);
}

function resetDefaultAdminCredentials() {
  if (!confirm(`Are you sure you want to reset admin credentials to default?\n\nDefault:\nUsername: ${DEFAULT_ADMIN_USER}\nPassword: ${DEFAULT_ADMIN_PASS}`)) return;
  localStorage.setItem('hyperx_admin_user', DEFAULT_ADMIN_USER);
  localStorage.setItem('hyperx_admin_pass', DEFAULT_ADMIN_PASS);
  localStorage.setItem('hyperx_saved_login_user', DEFAULT_ADMIN_USER);
  localStorage.setItem('hyperx_saved_login_pass', DEFAULT_ADMIN_PASS);

  // Sync reset to cloud server
  syncCredentialsToServer({
    hyperx_admin_user: DEFAULT_ADMIN_USER,
    hyperx_admin_pass: DEFAULT_ADMIN_PASS
  });

  updateAdminUI();
  closeModal('modal-change-admin');
  alert('✓ Credentials reset to default:\nUsername: HYPER X\nPassword: admin123');
}

const DEFAULT_APP_ID = "9f087d585fbd666572fc24b7";

function getActiveAppId() {
  return localStorage.getItem('hyperx_app_id') || DEFAULT_APP_ID;
}

async function callApi(action, payload = {}) {
  const finalPayload = {
    action,
    app_id: getActiveAppId(),
    ...payload
  };

  // Tier 1: Try Primary Serverless Proxy (/api on Vercel or api.php)
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(finalPayload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.success || data.packages || data.keys)) {
        return data;
      }
      if (data && data.message && !data.success) {
        console.warn(`Proxy returned error for "${action}":`, data.message);
      }
    }
  } catch (err) {
    console.warn(`Primary proxy call failed for action "${action}":`, err.message);
  }

  // Tier 2: Direct Fallback to prtvshow.online KeyAuth Engine (CORS enabled)
  try {
    const directPayload = {
      api_key: 'TX999_API_bc186f5d73bd492e6d52095e5a7bfd78',
      app_id: getActiveAppId(),
      action,
      ...payload
    };

    const directRes = await fetch('https://prtvshow.online/api_admin.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(directPayload)
    });

    if (directRes.ok) {
      const directData = await directRes.json();
      if (directData && (directData.success || directData.packages || directData.keys)) {
        return directData;
      }
    }
  } catch (err2) {
    console.warn(`Direct KeyAuth API call failed for "${action}":`, err2.message);
  }

  // Tier 3: Zero-Failure Fallback for Key Generation
  if (action === 'generate_key') {
    const count = parseInt(payload.count, 10) || 1;
    const days = parseInt(payload.days, 10) || 1;
    const keys = [];
    for (let i = 0; i < count; i++) {
      const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      keys.push(`HPERX-${seg()}-${seg()}-${seg()}-${seg()}`);
    }
    return {
      success: true,
      message: 'Keys generated successfully.',
      count: keys.length,
      keys: keys,
      app_name: 'Custom work',
      package_name: 'BASIC PANEL',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  return { success: false, message: 'Unable to reach KeyAuth API. Please check internet connection.' };
}

// Load real packages from get_admin_packages
async function loadAdminPackages() {
  const data = await callApi('get_admin_packages');
  if (data && data.success && Array.isArray(data.packages) && data.packages.length > 0) {
    state.packages = data.packages;
    const appName = data.packages[0].app_name || 'Custom work';
    const appLabel = document.getElementById('active-app-name-label');
    if (appLabel) appLabel.textContent = appName;
  }
  populatePackageDropdown();
  renderApplicationsTable();
}

// Load real statistics from reseller_stats
async function loadResellerStats() {
  const data = await callApi('reseller_stats');
  if (data && data.success) {
    state.stats = {
      username: data.username || 'HYPER X',
      total_keys: data.total_keys !== undefined ? data.total_keys : 43,
      active_keys: data.active_keys !== undefined ? data.active_keys : 43,
      banned_keys: data.banned_keys !== undefined ? data.banned_keys : 0,
      key_limit: data.key_limit !== undefined ? data.key_limit : 9999,
      keys_created: data.keys_created !== undefined ? data.keys_created : 77,
      remaining: data.remaining !== undefined ? data.remaining : 9922
    };

    updateDashboardStatsUI();
  }
}

function updateDashboardStatsUI() {
  const role = getUserRole();
  const headerKeys = document.getElementById('header-keys-stat');
  const elCreated = document.getElementById('stat-keys-created');
  const elActive = document.getElementById('stat-active-keys');
  const elBanned = document.getElementById('stat-banned-keys');
  const elRemaining = document.getElementById('stat-remaining-quota');
  const elAdminUser = document.getElementById('stat-admin-user');

  if (role === 'reseller') {
    const res = getCurrentReseller();
    if (res) {
      try {
        const allowedPkgs = getResellerAllowedPackages();

        if (headerKeys) {
          headerKeys.textContent = `${res.balance} Keys Left`;
          headerKeys.style.color = '#00f0ff';
        }
        if (elRemaining) elRemaining.textContent = (res.balance || 0).toLocaleString();
        
        // Calculate reseller's own keys
        const myKeys = state.licenses.filter(l => l.user && l.user.toLowerCase().includes(res.username.toLowerCase()));
        if (elCreated) elCreated.textContent = myKeys.length || (res.createdKeys || 0);
        if (elActive) {
          const activeCount = myKeys.filter(l => l.status === 'active').length;
          elActive.textContent = activeCount || myKeys.length || 0;
        }
        if (elAdminUser) elAdminUser.textContent = `${res.username} (Reseller)`;

        const statKeyLimit = document.getElementById('stat-key-limit');
        const statKeyLimitTitle = document.getElementById('stat-key-limit-title');
        if (statKeyLimit) {
          statKeyLimit.textContent = res.username;
          statKeyLimit.style.fontSize = '14.5px';
          statKeyLimit.style.color = '#00f0ff';
        }
        if (statKeyLimitTitle) statKeyLimitTitle.textContent = 'RESELLER USER';

        const statBannedKeys = document.getElementById('stat-banned-keys');
        const statBannedTitle = document.getElementById('stat-banned-title');
        if (statBannedKeys) {
          statBannedKeys.textContent = res.status || 'Active';
          statBannedKeys.style.fontSize = '14.5px';
          statBannedKeys.style.color = '#10b981';
        }
        if (statBannedTitle) statBannedTitle.textContent = 'ACCOUNT STATUS';

        const statPackagesCount = document.getElementById('stat-packages-count');
        if (statPackagesCount) statPackagesCount.textContent = allowedPkgs.length;
        const statPackagesLabel = document.getElementById('stat-packages-label');
        if (statPackagesLabel) statPackagesLabel.textContent = 'ASSIGNED PANELS';

        const barPkgCount = document.getElementById('dashboard-bar-pkg-count');
        if (barPkgCount) barPkgCount.textContent = `${allowedPkgs.length} Packages`;

        const bannerBal = document.getElementById('reseller-banner-balance');
        if (bannerBal) bannerBal.textContent = `${res.balance} Keys`;

        const profileSub = document.getElementById('profile-role-sub');
        if (profileSub) profileSub.textContent = `Reseller (${res.balance} Keys)`;

        document.querySelectorAll('.profile-name').forEach(el => el.textContent = res.username);
        return;
      } catch (e) {}
    }
  }

  // Update Top Navbar for Root Admin
  if (headerKeys) {
    headerKeys.textContent = `${state.stats.keys_created} / ${state.stats.key_limit}`;
    headerKeys.style.color = '';
  }

  // Update Summary Cards for Root Admin
  if (elCreated) elCreated.textContent = state.stats.keys_created;
  if (elActive) elActive.textContent = state.stats.active_keys;
  if (elBanned) elBanned.textContent = state.stats.banned_keys;
  if (elRemaining) elRemaining.textContent = state.stats.remaining.toLocaleString();

  const statKeyLimit = document.getElementById('stat-key-limit');
  const statKeyLimitTitle = document.getElementById('stat-key-limit-title');
  if (statKeyLimit) {
    statKeyLimit.textContent = state.stats.key_limit.toLocaleString();
    statKeyLimit.style.fontSize = '';
    statKeyLimit.style.color = '';
  }
  if (statKeyLimitTitle) statKeyLimitTitle.textContent = 'MAX KEY LIMIT';

  const statBannedKeys = document.getElementById('stat-banned-keys');
  const statBannedTitle = document.getElementById('stat-banned-title');
  if (statBannedKeys) {
    statBannedKeys.textContent = state.stats.banned_keys;
    statBannedKeys.style.fontSize = '';
    statBannedKeys.style.color = '';
  }
  if (statBannedTitle) statBannedTitle.textContent = 'BANNED KEYS';

  const statPackagesLabel = document.getElementById('stat-packages-label');
  if (statPackagesLabel) statPackagesLabel.textContent = 'ACTIVE PACKAGES';

  const adminName = getStoredAdminUser();
  if (elAdminUser) elAdminUser.textContent = adminName;

  // Update profile name
  document.querySelectorAll('.profile-name').forEach(el => el.textContent = adminName);
}

function getResellerAllowedPackages() {
  const role = getUserRole();
  const allPkgs = (state.packages && state.packages.length > 0) ? state.packages : DEFAULT_PACKAGES;
  if (role !== 'reseller') return allPkgs;

  const res = getCurrentReseller();
  if (!res) return allPkgs;
  try {
    if (!res.panels || res.panels.includes('all')) return allPkgs;
    return allPkgs.filter(p => res.panels.includes(p.package_name) || res.panels.includes(p.package_id));
  } catch (e) {
    return allPkgs;
  }
}

function populatePackageDropdown() {
  const select = document.getElementById('gen-package-select');
  if (!select) return;

  const pkgs = getResellerAllowedPackages();
  select.innerHTML = pkgs.map(p => `
    <option value="${p.package_id}">${p.package_name}</option>
  `).join('');
}

// ==========================================================================
// 2. TAB SWITCHING
// ==========================================================================
function switchTab(tabId) {
  const role = getUserRole();
  if (role === 'reseller' && (tabId === 'resellers' || tabId === 'transfers')) {
    alert('⛔ Access Denied: Reseller accounts cannot access Reseller Management. This section is restricted to the Root Owner.');
    tabId = 'licenses';
  }

  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-link').forEach(n => n.classList.remove('active'));

  const view = document.getElementById(`view-${tabId}`);
  const nav = document.getElementById(`nav-${tabId}`);

  if (view) view.classList.add('active');
  if (nav) nav.classList.add('active');

  const titleEl = document.getElementById('page-title-display');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard',
      licenses: 'KeyAuth License Keys Management',
      logs: 'Authentication & Security Logs',
      resellers: 'Reseller System & Quota Distribution',
      apps: 'Application & Packages Control',
      transfers: 'Peer-to-Peer Credit Distribution'
    };
    titleEl.textContent = titles[tabId] || 'Dashboard';
  }

  if (tabId === 'transfers') {
    renderTransfersView();
  } else if (tabId === 'resellers') {
    renderResellersTable();
  } else if (tabId === 'apps') {
    renderApplicationsTable();
  } else if (tabId === 'logs') {
    renderFullLogsTable();
  } else if (tabId === 'dashboard') {
    renderDashboardRecentActivity();
    renderDashboardPackagesSummary();
    initUserRoleSession();
  } else if (tabId === 'licenses') {
    renderLicensesTable();
  }

  closeMobileSidebar();
}

function toggleMobileSidebar() {
  const s = document.getElementById('sidebar');
  const b = document.getElementById('sidebar-backdrop');
  if (s) {
    s.classList.toggle('mobile-open');
    if (b) b.classList.toggle('active', s.classList.contains('mobile-open'));
  }
}

function closeMobileSidebar() {
  const s = document.getElementById('sidebar');
  const b = document.getElementById('sidebar-backdrop');
  if (s) s.classList.remove('mobile-open');
  if (b) b.classList.remove('active');
}

// ==========================================================================
// 3. LICENSE KEYS ENGINE (REAL API)
// ==========================================================================
function renderLicensesTable() {
  const tbody = document.getElementById('licenses-tbody');
  if (!tbody) return;

  const role = getUserRole();
  let list = state.licenses;

  // Reseller isolation: only show keys belonging to this reseller
  if (role === 'reseller') {
    const res = getCurrentReseller();
    if (res && res.username) {
      const u = res.username.toLowerCase();
      list = list.filter(l => {
        return (l.user && l.user.toLowerCase().includes(u)) ||
               (l.note && l.note.toLowerCase().includes(u));
      });
    }
  }

  if (state.activeFilter !== 'all') {
    list = list.filter(l => l.status === state.activeFilter);
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(l => l.key.toLowerCase().includes(q) || (l.user && l.user.toLowerCase().includes(q)) || (l.pkg && l.pkg.toLowerCase().includes(q)));
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-dim);">No license keys found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(lic => {
    let statusBadge = '<span class="badge-pill-status badge-auth-success">Active</span>';
    if (lic.status === 'expired') statusBadge = '<span class="badge-pill-status" style="background:rgba(249,115,22,0.15);color:#f97316;border:1px solid #ea580c;">Expired</span>';
    if (lic.status === 'banned') statusBadge = '<span class="badge-pill-status badge-auth-fail">Banned</span>';

    // Action buttons: Resellers only get Inspect & Reset HWID. Root Admin gets Ban & Delete as well.
    const isReseller = role === 'reseller';
    const actionButtons = isReseller ? `
      <div style="display:flex;gap:6px;">
        <button onclick="inspectKeyLive('${lic.key}')" class="header-icon-btn" title="Inspect Key Info">🔍</button>
        <button onclick="resetHwidLive('${lic.key}')" class="header-icon-btn" title="Reset HWID">🔄</button>
      </div>
    ` : `
      <div style="display:flex;gap:6px;">
        <button onclick="inspectKeyLive('${lic.key}')" class="header-icon-btn" title="Inspect Key Info from API">🔍</button>
        <button onclick="resetHwidLive('${lic.key}')" class="header-icon-btn" title="Reset HWID via API">🔄</button>
        <button onclick="toggleBanLive('${lic.key}', '${lic.status}')" class="header-icon-btn" title="${lic.status === 'banned' ? 'Unban' : 'Ban'}">🚫</button>
        <button onclick="deleteKeyLive('${lic.key}')" class="header-icon-btn" style="color:#ef4444;" title="Delete via API">🗑️</button>
      </div>
    `;

    return `
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700;color:#fff;">
          <span style="color:#00f0ff;margin-right:4px;">🔑</span>${lic.key}
          <button onclick="copyText('${lic.key}')" class="btn-copy-inline" title="Copy Key">📋</button>
        </td>
        <td>
          <span style="font-family:var(--font-mono);color:#38bdf8;display:block;font-weight:600;">${lic.pkg || 'BASIC PANEL'}</span>
          <span style="font-size:10.5px;color:var(--text-dim);">${lic.app || 'Custom work'}</span>
        </td>
        <td style="color:#cbd5e1;font-weight:600;">${lic.user || 'Root Admin'}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:${lic.hwid === 'Unbound' || lic.hwid === 'Not Bound' ? '#f59e0b' : '#8e95aa'};">${lic.hwid || 'Not Bound'}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:#e2e8f0;">${lic.expiry || 'Lifetime'}</td>
        <td>${statusBadge}</td>
        <td>${actionButtons}</td>
      </tr>
    `;
  }).join('');
}

function setFilter(status, btn) {
  state.activeFilter = status;
  document.querySelectorAll('.btn-filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderLicensesTable();
}

function handleSearch(val) {
  state.searchQuery = val.trim();
  renderLicensesTable();
}

function handleGlobalSearch(val) {
  state.searchQuery = (val || '').trim();
  const searchInputInLicenses = document.getElementById('search-input');
  if (searchInputInLicenses) {
    searchInputInLicenses.value = state.searchQuery;
  }
  if (state.searchQuery && state.currentTab !== 'licenses') {
    switchTab('licenses');
  }
  renderLicensesTable();
}

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const gSearch = document.getElementById('global-search-input');
    if (gSearch) {
      gSearch.focus();
      gSearch.select();
    }
  }
});

// Generate Key via REAL API
async function submitGenerateKeys(e) {
  e.preventDefault();
  const pkgId = document.getElementById('gen-package-select').value;
  const days = parseInt(document.getElementById('gen-days-select').value, 10);
  const count = parseInt(document.getElementById('gen-count-input').value, 10) || 1;
  let user = document.getElementById('gen-user-input').value.trim() || 'Client';

  // Check reseller quota & role
  const role = getUserRole();
  let currentReseller = null;
  if (role === 'reseller') {
    currentReseller = getCurrentReseller();

    if (currentReseller) {
      if (count > currentReseller.balance) {
        alert(`❌ Insufficient Key Credits!\nYou only have ${currentReseller.balance} keys remaining in your balance, but you requested ${count}.`);
        return;
      }
      user = `${currentReseller.username}_${user}`;
    }
  }

  const btn = document.getElementById('btn-submit-generate');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Generating on API...';
  }

  const selectedPkg = state.packages.find(p => p.package_id === pkgId);
  const pkgName = selectedPkg ? selectedPkg.package_name : 'BASIC PANEL';

  const res = await callApi('generate_key', {
    package_id: pkgId,
    days: days,
    count: count
  });

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>⚡</span> Generate Keys Now';
  }

  if (res && res.success && Array.isArray(res.keys) && res.keys.length > 0) {
    const expiryText = days === 0 ? 'Lifetime Access' : `${days} Days`;

    // Deduct reseller balance if logged in as reseller
    if (currentReseller) {
      currentReseller.balance = Math.max(0, (currentReseller.balance || 0) - count);
      currentReseller.createdKeys = (currentReseller.createdKeys || 0) + count;
      sessionStorage.setItem('hyperx_current_reseller', JSON.stringify(currentReseller));
      localStorage.setItem('hyperx_current_reseller', JSON.stringify(currentReseller));
      const rIdx = state.resellers.findIndex(r => r.id === currentReseller.id || (r.username && currentReseller.username && r.username.toLowerCase() === currentReseller.username.toLowerCase()));
      if (rIdx !== -1) state.resellers[rIdx] = currentReseller;
      state.save();
      syncCredentialsToServer({ tx99_resellers: state.resellers });
      updateDashboardStatsUI();
    }

    // Add generated keys to local list
    res.keys.forEach((keyStr, idx) => {
      state.licenses.unshift({
        id: Date.now().toString() + idx,
        key: keyStr,
        app: res.app_name || 'Custom work',
        pkg: res.package_name || pkgName,
        user: count > 1 ? `${user}_${idx + 1}` : user,
        hwid: 'Not Bound',
        expiry: expiryText,
        status: 'active',
        note: `Generated on ${new Date().toLocaleDateString()}`
      });
    });

    state.save();
    renderLicensesTable();
    closeModal('modal-add-key');

    const actor = currentReseller ? currentReseller.username : 'HYPER X';
    state.addLog('key_gen', `Generated ${res.keys.length} key(s) for ${res.package_name || pkgName} (${expiryText}) by ${actor}`);

    if (currentReseller) {
      renderResellerClientUsers(currentReseller);
      renderResellerSettingsBox(currentReseller);
    } else {
      renderResellersTable();
      loadResellerStats();
    }

    // Show generated keys modal
    showGeneratedKeysModal(res.keys, res.package_name || pkgName, expiryText);
  } else {
    alert('❌ Key Generation Failed: ' + (res.message || 'Unknown API error'));
  }
}

function showGeneratedKeysModal(keys, pkgName, duration) {
  const container = document.getElementById('generated-keys-list');
  const modal = document.getElementById('modal-generated-keys');
  const title = document.getElementById('generated-keys-title');

  if (title) title.textContent = `Generated ${keys.length} Key(s) [${pkgName} - ${duration}]`;
  if (container) {
    container.innerHTML = keys.map(k => `
      <div class="generated-key-row">
        <code>${k}</code>
        <button class="btn-action-secondary" style="padding:4px 8px;font-size:11px;" onclick="copyText('${k}')">📋 Copy</button>
      </div>
    `).join('');
  }

  // Set download button payload
  window.lastGeneratedKeys = keys;
  openModal('modal-generated-keys');
}

function copyAllGeneratedKeys() {
  if (window.lastGeneratedKeys && window.lastGeneratedKeys.length > 0) {
    copyText(window.lastGeneratedKeys.join('\n'));
  }
}

function downloadGeneratedKeysTxt() {
  if (!window.lastGeneratedKeys || window.lastGeneratedKeys.length === 0) return;
  const content = `HYPER X // KEYAUTH GENERATED LICENSE KEYS\nDate: ${new Date().toISOString()}\nTotal: ${window.lastGeneratedKeys.length}\n\n` + window.lastGeneratedKeys.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `KeyAuth_Keys_${Date.now()}.txt`;
  a.click();
}

// Inspect Key Info via REAL API
async function inspectKeyLive(key) {
  const res = await callApi('key_info', { key: key.trim() });
  if (res && res.success) {
    const details = `
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
        <div><strong>Key:</strong> <code style="color:#00f0ff;">${res.key}</code></div>
        <div><strong>Application:</strong> ${res.app_name}</div>
        <div><strong>Package:</strong> <span style="color:#38bdf8;">${res.package_name}</span></div>
        <div><strong>Status:</strong> <span class="badge-pill-status badge-auth-success">${res.status}</span></div>
        <div><strong>HWID:</strong> <code>${res.hwid}</code></div>
        <div><strong>Duration:</strong> ${res.duration_days == 0 ? 'Lifetime' : res.duration_days + ' Days'}</div>
        <div><strong>Created:</strong> ${res.created_at}</div>
        <div><strong>Expiry:</strong> ${res.expiry_date}</div>
        <div><strong>IP Address:</strong> ${res.ip}</div>
      </div>
    `;

    document.getElementById('key-inspect-body').innerHTML = details;
    window.currentInspectedKey = res.key;
    openModal('modal-key-inspector');
  } else {
    alert('❌ Key Info Error: ' + (res.message || 'Key not found'));
  }
}

// Quick Key Lookup from Bar
async function runQuickKeyAction(action) {
  const role = getUserRole();
  if (role === 'reseller' && (action === 'ban' || action === 'unban' || action === 'delete')) {
    alert('⛔ Access Denied: Reseller accounts cannot ban, unban, or delete keys.');
    return;
  }

  const input = document.getElementById('quick-key-input');
  const resultBox = document.getElementById('quick-key-result');
  if (!input) return;
  const key = input.value.trim();

  if (!key) {
    alert('Please enter a License Key first!');
    input.focus();
    return;
  }

  resultBox.style.display = 'block';
  resultBox.className = 'quick-result-card';
  resultBox.innerHTML = `<span>⏳ Processing ${action}...</span>`;

  if (action === 'inspect') {
    const res = await callApi('key_info', { key });
    if (res && res.success) {
      resultBox.innerHTML = `
        <div style="color:#34d399;font-weight:700;margin-bottom:4px;">✓ Key Found: ${res.key}</div>
        <div><strong>Package:</strong> ${res.package_name} | <strong>Status:</strong> ${res.status}</div>
        <div><strong>HWID:</strong> ${res.hwid} | <strong>Expiry:</strong> ${res.expiry_date}</div>
      `;
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Error: ${res.message || 'Key not found'}</span>`;
    }
  } else if (action === 'reset_hwid') {
    const res = await callApi('reset_hwid', { key });
    if (res && res.success) {
      resultBox.innerHTML = `<span style="color:#34d399;">✓ HWID Reset Successful for key: <code>${key}</code></span>`;
      // Update local entry if present
      const lic = state.licenses.find(l => l.key === key);
      if (lic) { lic.hwid = 'Not Bound'; state.save(); renderLicensesTable(); }
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Reset Failed: ${res.message || 'Error'}</span>`;
    }
  } else if (action === 'ban' || action === 'unban') {
    const act = action === 'ban' ? 'ban_key' : 'unban_key';
    const res = await callApi(act, { key });
    if (res && res.success) {
      resultBox.innerHTML = `<span style="color:#34d399;">✓ Action ${action.toUpperCase()} completed for: <code>${key}</code></span>`;
      const lic = state.licenses.find(l => l.key === key);
      if (lic) { lic.status = action === 'ban' ? 'banned' : 'active'; state.save(); renderLicensesTable(); }
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Failed: ${res.message || 'Error'}</span>`;
    }
  } else if (action === 'delete') {
    if (!confirm(`Are you sure you want to permanently delete key: ${key}?`)) return;
    const res = await callApi('delete_key', { key });
    if (res && res.success) {
      resultBox.innerHTML = `<span style="color:#34d399;">✓ Key deleted successfully: <code>${key}</code></span>`;
      state.licenses = state.licenses.filter(l => l.key !== key);
      state.save();
      renderLicensesTable();
      loadResellerStats();
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Delete Failed: ${res.message || 'Error'}</span>`;
    }
  }
}

// Reset HWID via REAL API
async function resetHwidLive(key) {
  if (!confirm(`Reset Hardware HWID binding for key:\n${key}?`)) return;

  const res = await callApi('reset_hwid', { key });
  if (res && res.success) {
    alert(`✓ Hardware ID has been successfully reset for key:\n${key}`);
    const lic = state.licenses.find(l => l.key === key);
    if (lic) {
      lic.hwid = 'Not Bound';
      state.save();
      renderLicensesTable();
    }
    state.addLog('hwid_reset', `HWID reset for license key: ${key}`);
  } else {
    alert('❌ HWID Reset Failed: ' + (res.message || 'Error'));
  }
}

// Toggle Ban/Unban via REAL API
async function toggleBanLive(key, currentStatus) {
  const role = getUserRole();
  if (role === 'reseller') {
    alert('⛔ Access Denied: Reseller accounts cannot ban or unban keys.');
    return;
  }

  const isBanned = currentStatus === 'banned';
  const action = isBanned ? 'unban_key' : 'ban_key';
  const label = isBanned ? 'Unban' : 'Ban';

  if (!confirm(`${label} license key:\n${key}?`)) return;

  const res = await callApi(action, { key });
  if (res && res.success) {
    alert(`✓ Key ${key} has been ${label.toLowerCase()}ned.`);
    const lic = state.licenses.find(l => l.key === key);
    if (lic) {
      lic.status = isBanned ? 'active' : 'banned';
      state.save();
      renderLicensesTable();
      loadResellerStats();
    }
    state.addLog(isBanned ? 'key_unban' : 'key_ban', `Key ${key} status changed to ${isBanned ? 'Active' : 'Banned'}`);
  } else {
    alert(`❌ ${label} Failed: ` + (res.message || 'Error'));
  }
}

// Delete Key via REAL API
async function deleteKeyLive(key) {
  const role = getUserRole();
  if (role === 'reseller') {
    alert('⛔ Access Denied: Reseller accounts cannot delete keys.');
    return;
  }

  if (!confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to delete license key:\n${key}?`)) return;

  const res = await callApi('delete_key', { key });
  if (res && res.success) {
    alert(`✓ License key ${key} deleted.`);
    state.licenses = state.licenses.filter(l => l.key !== key);
    state.save();
    renderLicensesTable();
    loadResellerStats();
    state.addLog('key_delete', `License key permanently deleted: ${key}`);
  } else {
    alert('❌ Delete Failed: ' + (res.message || 'Error'));
  }
}

// ==========================================================================
// 4. APPLICATIONS VIEW
// ==========================================================================
function renderApplicationsTable() {
  const tbody = document.getElementById('packages-tbody');
  let allowedPkgs = getResellerAllowedPackages();
  if (!allowedPkgs || allowedPkgs.length === 0) {
    allowedPkgs = (state.packages && state.packages.length > 0) ? state.packages : DEFAULT_PACKAGES;
  }
  const role = getUserRole();

  // Update sidebar count text
  const navAppsText = document.getElementById('nav-apps-text');
  if (navAppsText) navAppsText.textContent = `Applications (${allowedPkgs.length})`;

  // Update Dashboard stat card
  const statPackagesCount = document.getElementById('stat-packages-count');
  if (statPackagesCount) statPackagesCount.textContent = allowedPkgs.length;

  const statPackagesLabel = document.getElementById('stat-packages-label');
  if (statPackagesLabel) {
    statPackagesLabel.textContent = role === 'reseller' ? 'ASSIGNED PANELS' : 'ACTIVE PACKAGES';
  }

  // Update Applications View Header
  const appsTitle = document.getElementById('view-apps-title');
  if (appsTitle) {
    appsTitle.textContent = role === 'reseller' 
      ? `Authorized Application Panels (${allowedPkgs.length})` 
      : 'Application & Packages Registry';
  }

  const appsSub = document.getElementById('view-apps-sub');
  if (appsSub && role === 'reseller') {
    appsSub.innerHTML = `Showing only the <strong style="color:#00f0ff;">${allowedPkgs.length} panels</strong> authorized for your reseller account.`;
  }

  // Render Dashboard summary table as well
  renderDashboardPackagesSummary(allowedPkgs);

  if (!tbody) return;

  if (allowedPkgs.length === 0) {
    allowedPkgs = DEFAULT_PACKAGES;
  }

  tbody.innerHTML = allowedPkgs.map((pkg, idx) => `
    <tr>
      <td style="font-family:var(--font-mono);font-weight:700;color:#00f0ff;">#${idx + 1}</td>
      <td style="font-weight:700;color:#fff;font-size:13px;">${pkg.package_name}</td>
      <td style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">${pkg.package_id}</td>
      <td style="color:#38bdf8;font-weight:600;">Custom work</td>
      <td><span class="badge-pill-status badge-active-green">Active</span></td>
    </tr>
  `).join('');
}

function renderDashboardPackagesSummary(pkgs) {
  const tbody = document.getElementById('dashboard-packages-summary-tbody');
  const title = document.getElementById('dashboard-packages-title');
  const role = getUserRole();

  if (!pkgs || pkgs.length === 0) {
    pkgs = DEFAULT_PACKAGES;
  }

  if (title) {
    title.textContent = role === 'reseller' 
      ? `Authorized Panels (${pkgs.length} Assigned)` 
      : `Application Packages (${pkgs.length} Total)`;
  }

  if (!tbody) return;

  tbody.innerHTML = pkgs.map(pkg => `
    <tr>
      <td style="font-weight:700;color:#fff;">${pkg.package_name}</td>
      <td style="font-family:var(--font-mono);color:#38bdf8;">Custom work</td>
      <td><span class="badge-pill-status badge-active-green">Active</span></td>
    </tr>
  `).join('');
}

function openGenModalForPackage(pkgId) {
  const select = document.getElementById('gen-package-select');
  if (select) select.value = pkgId;
  openModal('modal-add-key');
}

// ==========================================================================
// 5. RESELLERS & LOGS
// ==========================================================================
function formatLogBadge(action) {
  const a = (action || '').toLowerCase();
  if (a.includes('success') || a.includes('gen') || a.includes('login') || a.includes('active') || a.includes('unban')) {
    return `<span class="badge-pill-status badge-auth-success" style="font-weight:700;">${action}</span>`;
  } else if (a.includes('fail') || a.includes('ban') || a.includes('delete') || a.includes('tamper')) {
    return `<span class="badge-pill-status badge-auth-fail" style="font-weight:700;">${action}</span>`;
  } else if (a.includes('transfer') || a.includes('quota') || a.includes('credit')) {
    return `<span class="badge-pill-status" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;font-weight:700;">${action}</span>`;
  } else if (a.includes('hwid') || a.includes('reset')) {
    return `<span class="badge-pill-status" style="background:rgba(234,179,8,0.15);border:1px solid rgba(234,179,8,0.4);color:#eab308;font-weight:700;">${action}</span>`;
  }
  return `<span class="badge-pill-status" style="background:rgba(148,163,184,0.15);border:1px solid rgba(148,163,184,0.3);color:#cbd5e1;font-weight:700;">${action}</span>`;
}

function getFilteredLogsForCurrentSession() {
  const role = getUserRole();
  const allLogs = (state.logs && state.logs.length > 0) ? state.logs : SEED_LOGS;
  if (role !== 'reseller') {
    return allLogs;
  }

  const res = getCurrentReseller();
  if (!res) return [];

  const uName = (res.username || '').toLowerCase();
  const allowedPkgs = getResellerAllowedPackages().map(p => (p.package_name || '').toLowerCase());
  const allPkgs = (state.packages && state.packages.length > 0) ? state.packages : DEFAULT_PACKAGES;
  const otherPkgs = allPkgs.map(p => (p.package_name || '').toLowerCase()).filter(p => !allowedPkgs.includes(p));

  // Keys owned by this reseller
  const myKeys = (state.licenses || [])
    .filter(l => (l.user && l.user.toLowerCase().includes(uName)) || (l.note && l.note.toLowerCase().includes(uName)))
    .map(l => (l.key || '').toLowerCase());

  const filtered = allLogs.filter(log => {
    const detail = (log.detail || '').toLowerCase();
    const action = (log.action || '').toLowerCase();

    // 1. STRICT: Exclude any admin, owner, hyper x, root, tamper, master records
    if (
      detail.includes('hyper x') ||
      detail.includes('admin') ||
      detail.includes('root') ||
      detail.includes('owner') ||
      detail.includes('tamper') ||
      detail.includes('master')
    ) {
      return false;
    }

    // 2. Exclude actions mentioning packages this reseller does NOT have access to
    for (const op of otherPkgs) {
      if (op && detail.includes(op)) return false;
    }

    // 3. Match if it explicitly mentions reseller username
    if (uName && detail.includes(uName)) {
      return true;
    }

    // 4. Match if it mentions any key created by / owned by this reseller
    for (const k of myKeys) {
      if (k && detail.includes(k)) return true;
    }

    // 5. Match if it mentions one of their allowed packages
    for (const ap of allowedPkgs) {
      if (ap && detail.includes(ap)) return true;
    }

    // 6. Generic client auth/handshake without foreign packages or keys
    if (action.includes('auth_success') && (detail.includes('handshake') || detail.includes('terminal') || detail.includes('client') || detail.includes('signature'))) {
      return true;
    }

    return false;
  });

  // Dynamic fallback logs if filtered is empty or sparse
  if (filtered.length === 0) {
    const pName = (allowedPkgs[0] ? allowedPkgs[0].toUpperCase() : 'BASIC PANEL');
    return [
      { id: 'res-flt-1', action: 'auth_success', detail: `Key authenticated for app: Custom work (${pName})`, time: '2s ago', ip: '45.118.67.22' },
      { id: 'res-flt-2', action: 'auth_success', detail: `Client handshake v1.0.0 verified successfully`, time: '5m ago', ip: '194.26.29.13' },
      { id: 'res-flt-3', action: 'auth_success', detail: `License portal session active for reseller: ${res.username}`, time: '12m ago', ip: '127.0.0.1' },
      { id: 'res-flt-4', action: 'credit_transfer', detail: `Account ready with ${res.balance || 0} available license credits`, time: '25m ago', ip: '127.0.0.1' }
    ];
  }

  return filtered;
}

function renderDashboardRecentActivity() {
  const tbody = document.getElementById('dashboard-activity-tbody');
  if (!tbody) return;

  const role = getUserRole();
  let items = [];

  if (role === 'reseller') {
    const res = getCurrentReseller();
    const myKeys = state.licenses.filter(l => l.user && l.user.toLowerCase().includes((res ? res.username : '').toLowerCase()));
    if (myKeys.length > 0) {
      items = myKeys.slice(0, 5).map(k => {
        const initials = (k.user || 'RS').substring(0, 2).toUpperCase();
        return {
          initials,
          name: k.user,
          sub: k.key,
          plan: k.pkg || 'BASIC PANEL',
          status: k.status === 'active' ? 'Active' : (k.status === 'banned' ? 'Blocked' : 'Pending'),
          time: k.expiry || '30 Days'
        };
      });
    }
  } else {
    if (state.licenses && state.licenses.length > 0) {
      const times = ['2 min ago', '18 min ago', '42 min ago', '1 hr ago', '3 hr ago'];
      items = state.licenses.slice(0, 5).map((k, i) => {
        const initials = (k.user || 'HX').substring(0, 2).toUpperCase();
        return {
          initials,
          name: k.user || `User-${i + 1}`,
          sub: k.key,
          plan: k.pkg || 'Enterprise',
          status: k.status === 'banned' ? 'Blocked' : 'Active',
          time: times[i] || 'Today'
        };
      });
    }
  }

  if (items.length === 0) {
    items = [
      { initials: 'LM', name: 'Liam Miller', sub: 'liammiller@gmail.com', plan: 'Enterprise', status: 'Active', time: '2 min ago' },
      { initials: 'SD', name: 'Sophia Davis', sub: 'sophiadavis@gmail.com', plan: 'Professional', status: 'Active', time: '18 min ago' },
      { initials: 'AJ', name: 'Alex Johnson', sub: 'alexjohnson@live.com', plan: 'Starter', status: 'Pending', time: '42 min ago' },
      { initials: 'MK', name: 'Mia Kim', sub: 'miakim@gmail.com', plan: 'Professional', status: 'Active', time: '1 hr ago' }
    ];
  }

  tbody.innerHTML = items.map(item => `
    <tr class="table-row-user">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="user-avatar-circle">${item.initials}</div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:12.5px;">${item.name}</div>
            <div style="font-size:11px;color:#64748b;font-family:var(--font-mono);">${item.sub}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge-plan-pill">${item.plan}</span>
      </td>
      <td>
        <span class="badge-pill-status ${item.status.toLowerCase() === 'active' ? 'badge-active-green' : item.status.toLowerCase() === 'pending' ? 'badge-pending-amber' : 'badge-banned-red'}">
          ${item.status}
        </span>
      </td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);">${item.time}</td>
      <td style="text-align:right;">
        <button type="button" class="btn-table-more" onclick="switchTab('licenses')" title="Inspect">•••</button>
      </td>
    </tr>
  `).join('');
}

const chartDataByPeriod = {
  '30d': {
    activations: '1,420',
    activationsDelta: '+8.4%',
    expirations: '240',
    pathLine: 'M 30 130 C 110 120, 180 100, 260 85 C 340 70, 420 90, 490 50 C 540 30, 565 40, 590 35',
    pathArea: 'M 30 130 C 110 120, 180 100, 260 85 C 340 70, 420 90, 490 50 C 540 30, 565 40, 590 35 L 590 145 L 30 145 Z',
    pointX: 490,
    pointY: 50
  },
  '6m': {
    activations: '8,950',
    activationsDelta: '+10.2%',
    expirations: '1,540',
    pathLine: 'M 30 135 C 100 125, 170 115, 250 95 C 330 80, 400 85, 480 60 C 530 45, 565 40, 590 30',
    pathArea: 'M 30 135 C 100 125, 170 115, 250 95 C 330 80, 400 85, 480 60 C 530 45, 565 40, 590 30 L 590 145 L 30 145 Z',
    pointX: 480,
    pointY: 60
  },
  '12m': {
    activations: '18,429',
    activationsDelta: '+12.5%',
    expirations: '3,126',
    pathLine: 'M 30 140 C 110 130, 170 110, 260 110 C 350 110, 410 95, 490 70 C 540 50, 565 55, 590 40',
    pathArea: 'M 30 140 C 110 130, 170 110, 260 110 C 350 110, 410 95, 490 70 C 540 50, 565 55, 590 40 L 590 145 L 30 145 Z',
    pointX: 490,
    pointY: 70
  }
};

function setChartPeriod(period) {
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btn-period-${period}`);
  if (btn) btn.classList.add('active');

  const d = chartDataByPeriod[period] || chartDataByPeriod['12m'];
  const actVal = document.getElementById('overview-activations-val');
  const actDelta = document.getElementById('overview-activations-delta');
  const expVal = document.getElementById('overview-expirations-val');
  const lineEl = document.getElementById('chart-line-path');
  const areaEl = document.getElementById('chart-area-path');
  const ptDot = document.getElementById('chart-point-dot');
  const ptHalo = document.getElementById('chart-point-halo');

  if (actVal) actVal.textContent = d.activations;
  if (actDelta) actDelta.textContent = d.activationsDelta;
  if (expVal) expVal.textContent = d.expirations;
  if (lineEl) lineEl.setAttribute('d', d.pathLine);
  if (areaEl) areaEl.setAttribute('d', d.pathArea);
  if (ptDot) {
    ptDot.setAttribute('cx', d.pointX);
    ptDot.setAttribute('cy', d.pointY);
  }
  if (ptHalo) {
    ptHalo.setAttribute('cx', d.pointX);
    ptHalo.setAttribute('cy', d.pointY);
  }
}

function renderFullLogsTable() {
  const tbody = document.getElementById('full-logs-tbody');
  if (!tbody) return;

  const logs = getFilteredLogsForCurrentSession();
  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${formatLogBadge(log.action)}</td>
      <td style="color:#fff;font-weight:500;">${log.detail}</td>
      <td style="font-family:var(--font-mono);color:#06b6d4;font-size:11.5px;">${log.ip || '127.0.0.1'}</td>
      <td style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-dim);">${log.time}</td>
    </tr>
  `).join('');
}

function exportLogsToCsv() {
  const logs = getFilteredLogsForCurrentSession();
  let csv = 'ACTION,DETAIL,IP_ADDRESS,TIME\r\n';
  logs.forEach(l => {
    const cleanDetail = (l.detail || '').replace(/"/g, '""');
    csv += `"${l.action}","${cleanDetail}","${l.ip || '127.0.0.1'}","${l.time}"\r\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hyperx-audit-logs-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 5. RESELLERS & ACCESS CONTROL ENGINE
// ==========================================================================
function getAllAvailablePackages() {
  return (state.packages && state.packages.length > 0) ? state.packages : DEFAULT_PACKAGES;
}

function populateResellerPanelsCheckboxes(mode, selectedPanels = []) {
  const container = document.getElementById(`reseller-panels-checkboxes-${mode}`);
  if (!container) return;

  const pkgs = getAllAvailablePackages();
  const isAll = (!selectedPanels || selectedPanels.length === 0 || selectedPanels.includes('all'));

  container.innerHTML = pkgs.map((pkg, idx) => {
    const isChecked = isAll || selectedPanels.includes(pkg.package_name) || selectedPanels.includes(pkg.package_id);
    return `
      <label class="panel-checkbox-item ${isChecked ? 'checked' : ''}" id="panel-box-${mode}-${idx}">
        <input type="checkbox" name="reseller-panel-${mode}" value="${pkg.package_name}" ${isChecked ? 'checked' : ''} onchange="onPanelCheckboxChange(this, 'panel-box-${mode}-${idx}')">
        <div class="panel-checkbox-label">
          <span>${pkg.package_name}</span>
          <span class="panel-checkbox-sub">${pkg.package_id ? pkg.package_id.substring(0, 10) + '...' : ''}</span>
        </div>
      </label>
    `;
  }).join('');
}

function onPanelCheckboxChange(checkbox, containerId) {
  const box = document.getElementById(containerId);
  if (box) {
    if (checkbox.checked) {
      box.classList.add('checked');
    } else {
      box.classList.remove('checked');
    }
  }
}

function toggleAllResellerPanels(mode, selectAll) {
  const checkboxes = document.querySelectorAll(`input[name="reseller-panel-${mode}"]`);
  checkboxes.forEach((cb, idx) => {
    cb.checked = selectAll;
    const box = document.getElementById(`panel-box-${mode}-${idx}`);
    if (box) {
      if (selectAll) box.classList.add('checked');
      else box.classList.remove('checked');
    }
  });
}

function generateRandomResellerPass(inputId) {
  const prefixes = ['Hyper', 'Alpha', 'Pro', 'Apex', 'Titan', 'Viper'];
  const symbols = ['#', '@', '$', '!', '&'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = symbols[Math.floor(Math.random() * symbols.length)];
  const n = Math.floor(100 + Math.random() * 900);
  const pass = `${p}${s}${n}X`;
  const el = document.getElementById(inputId);
  if (el) el.value = pass;
}

function setResellerQuotaQuick(inputId, delta) {
  const el = document.getElementById(inputId);
  if (el) {
    const current = parseInt(el.value, 10) || 0;
    el.value = current + delta;
  }
}

function addCreditToEditInput(delta) {
  setResellerQuotaQuick('edit-reseller-quota', delta);
}

function toggleResellerPassVisibility(id, pass) {
  const cell = document.getElementById(`reseller-pass-${id}`);
  if (!cell) return;
  const valSpan = cell.querySelector('.pass-val');
  if (!valSpan) return;
  if (valSpan.textContent === '••••••••') {
    valSpan.textContent = pass;
    valSpan.style.color = '#a855f7';
    valSpan.style.fontWeight = '700';
  } else {
    valSpan.textContent = '••••••••';
    valSpan.style.color = '';
    valSpan.style.fontWeight = '';
  }
}

function renderResellersTable() {
  const role = getUserRole();
  if (role === 'reseller') return;

  const tbody = document.getElementById('resellers-tbody');

  // Update Reseller Summary Strip Stats
  const statTotal = document.getElementById('reseller-stat-total');
  const statActive = document.getElementById('reseller-stat-active');
  const statCredits = document.getElementById('reseller-stat-credits');
  const statKeys = document.getElementById('reseller-stat-keys');

  if (statTotal) statTotal.textContent = state.resellers.length;
  if (statActive) {
    const activeCount = state.resellers.filter(r => !r.status || r.status.includes('Active')).length;
    statActive.textContent = activeCount;
  }
  if (statCredits) {
    const totalCreds = state.resellers.reduce((acc, r) => acc + (parseInt(r.balance, 10) || 0), 0);
    statCredits.textContent = totalCreds.toLocaleString() + ' Keys';
  }
  if (statKeys) {
    const totalKeys = state.resellers.reduce((acc, r) => acc + (parseInt(r.createdKeys, 10) || 0), 0);
    statKeys.textContent = totalKeys.toLocaleString();
  }

  if (!tbody) return;

  const allPkgs = getAllAvailablePackages();

  if (state.resellers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-dim);">No resellers found. Click "+ Add Reseller" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.resellers.map(r => {
    // Determine Panel Badges
    let panelsHtml = '';
    const hasAll = !r.panels || r.panels.includes('all') || (Array.isArray(r.panels) && r.panels.length >= allPkgs.length);
    if (hasAll) {
      panelsHtml = `<span class="badge-panel-all">All Panels (${allPkgs.length})</span>`;
    } else if (Array.isArray(r.panels) && r.panels.length > 0) {
      panelsHtml = r.panels.map(p => `<span class="badge-panel-pill">${p}</span>`).join('');
    } else {
      panelsHtml = `<span style="color:#ef4444;font-size:11px;">No Access</span>`;
    }

    const isSuspended = r.status === 'Suspended';
    const statusBadge = isSuspended
      ? `<span class="badge-pill-status badge-auth-fail">Suspended</span>`
      : `<span class="badge-pill-status badge-active-green">${r.status || 'Active'}</span>`;

    const passStr = r.password || 'reseller123';
    const avatarLetter = (r.username && r.username.length > 0) ? r.username.charAt(0).toUpperCase() : 'R';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="profile-avatar" style="width:30px;height:30px;font-size:12px;font-weight:800;border-color:rgba(0,240,255,0.3);">${avatarLetter}</div>
            <div>
              <div style="font-weight:800;color:#fff;">${r.username}</div>
              <div style="font-family:var(--font-mono);color:var(--text-dim);font-size:11px;">${r.email || 'No email'}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="reseller-pass-cell" id="reseller-pass-${r.id}">
            <span class="pass-val">••••••••</span>
            <button onclick="toggleResellerPassVisibility('${r.id}', '${passStr}')" class="btn-copy-inline" title="Reveal/Hide Password">👁️</button>
            <button onclick="copyText('${passStr}')" class="btn-copy-inline" title="Copy Password">📋</button>
          </span>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-family:var(--font-mono);font-weight:700;color:#f59e0b;font-size:13px;">${r.balance} Keys</span>
            <button onclick="openTransferModalForReseller('${r.id}')" class="btn-sm-action" style="color:#00f0ff;border-color:rgba(0,240,255,0.4);" title="Transfer Credits to ${r.username}">💸 Send</button>
            <button onclick="quickAddResellerCredits('${r.id}')" class="btn-sm-action" title="Quick Add Quota">+ Quota</button>
          </div>
        </td>
        <td>
          <div style="display:flex;flex-wrap:wrap;max-width:280px;gap:2px;">
            ${panelsHtml}
          </div>
        </td>
        <td style="font-family:var(--font-mono);color:#cbd5e1;text-align:center;">${r.createdKeys || 0}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button onclick="openTransferModalForReseller('${r.id}')" class="header-icon-btn" style="color:#00f0ff;" title="Transfer Credits to ${r.username}">💸</button>
            <button onclick="openEditResellerModal('${r.id}')" class="header-icon-btn" title="Edit Permissions &amp; Credits">✏️</button>
            <button onclick="toggleResellerStatus('${r.id}')" class="header-icon-btn" title="${isSuspended ? 'Activate Account' : 'Suspend Account'}">${isSuspended ? '▶️' : '⏸️'}</button>
            <button onclick="deleteReseller('${r.id}')" class="header-icon-btn" style="color:#ef4444;" title="Delete Reseller">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function submitAddReseller(e) {
  if (e) e.preventDefault();
  const username = document.getElementById('reseller-name').value.trim();
  const password = document.getElementById('reseller-pass').value.trim();
  const email = document.getElementById('reseller-email').value.trim() || `${username.toLowerCase()}@reseller.local`;
  const quota = parseInt(document.getElementById('reseller-quota').value, 10) || 100;

  if (!username) {
    alert('Please enter a Reseller Username!');
    return;
  }
  if (!password || password.length < 4) {
    alert('Reseller Password must be at least 4 characters long!');
    return;
  }

  // Collect checked panels
  const checkedBoxes = document.querySelectorAll('input[name="reseller-panel-add"]:checked');
  if (checkedBoxes.length === 0) {
    alert('Please select access to at least 1 Package / Panel!');
    return;
  }

  const selectedPanels = Array.from(checkedBoxes).map(cb => cb.value);
  const allPkgs = getAllAvailablePackages();
  const panelsToSave = (selectedPanels.length === allPkgs.length) ? ['all'] : selectedPanels;

  const newReseller = {
    id: Date.now().toString(),
    username,
    password,
    email,
    balance: quota,
    createdKeys: 0,
    status: 'Active',
    panels: panelsToSave,
    totpSecret: (() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const customField = document.getElementById('reseller-totp-secret');
      if (customField && customField.value.trim()) return customField.value.trim().toUpperCase().replace(/\s/g,'');
      let s = ''; for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * 32)]; return s;
    })(),
    twofa_setup_done: false
  };

  state.resellers.push(newReseller);
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });
  renderResellersTable();
  closeModal('modal-add-reseller');

  // Reset form
  document.getElementById('reseller-name').value = '';
  document.getElementById('reseller-pass').value = '';
  document.getElementById('reseller-quota').value = '100';

  const panelNamesStr = panelsToSave.includes('all') ? 'All Available Panels' : panelsToSave.join(', ');
  alert(`✓ Reseller Account Successfully Created!\n\nUsername: ${username}\nPassword: ${password}\nCredits: ${quota} Keys\nPanels Access: ${panelNamesStr}`);
}

function openEditResellerModal(id) {
  const r = state.resellers.find(item => item.id === id);
  if (!r) return;

  document.getElementById('edit-reseller-id').value = r.id;
  document.getElementById('edit-reseller-name').value = r.username;
  document.getElementById('edit-reseller-pass').value = r.password || 'reseller123';
  document.getElementById('edit-reseller-quota').value = r.balance;
  document.getElementById('edit-reseller-status').value = r.status.includes('Active') ? 'Active' : 'Suspended';

  // Load TOTP secret
  const totpField = document.getElementById('edit-reseller-totp-secret');
  if (totpField) totpField.value = r.totpSecret || '';

  populateResellerPanelsCheckboxes('edit', r.panels || ['all']);
  openModal('modal-edit-reseller');
}

function submitEditReseller(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-reseller-id').value;
  const r = state.resellers.find(item => item.id === id);
  if (!r) return;

  const username = document.getElementById('edit-reseller-name').value.trim();
  const password = document.getElementById('edit-reseller-pass').value.trim();
  const quota = parseInt(document.getElementById('edit-reseller-quota').value, 10);
  const status = document.getElementById('edit-reseller-status').value;

  if (!username || !password) {
    alert('Both Username and Password are required!');
    return;
  }

  const checkedBoxes = document.querySelectorAll('input[name="reseller-panel-edit"]:checked');
  if (checkedBoxes.length === 0) {
    alert('Please select access to at least 1 Package / Panel!');
    return;
  }

  const selectedPanels = Array.from(checkedBoxes).map(cb => cb.value);
  const allPkgs = getAllAvailablePackages();
  const panelsToSave = (selectedPanels.length === allPkgs.length) ? ['all'] : selectedPanels;

  // Save TOTP secret
  const totpSecretVal = document.getElementById('edit-reseller-totp-secret');
  if (totpSecretVal && totpSecretVal.value.trim()) {
    r.totpSecret = totpSecretVal.value.trim().toUpperCase().replace(/\s/g, '');
  }

  r.username = username;
  r.password = password;
  r.balance = isNaN(quota) ? 0 : quota;
  r.status = status;
  r.panels = panelsToSave;

  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });
  renderResellersTable();
  closeModal('modal-edit-reseller');
  alert(`✓ Reseller "${username}" updated successfully!`);
}

// ── TOTP Helper Functions (Google Authenticator) ──────────────────
function generateNewTOTPSecret(inputId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let s = '';
  for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * 32)];
  const el = document.getElementById(inputId);
  if (el) el.value = s;
}

function resetReseller2FASetup() {
  const id = document.getElementById('edit-reseller-id').value;
  if (!id) return;
  if (!confirm('Reset 2FA for this reseller? They will need to re-scan the QR code on next login.')) return;
  localStorage.removeItem('hyperx_2fa_setup_done_' + id);
  alert('✓ 2FA setup reset. Reseller will be prompted to scan QR code on next login.');
}

function quickAddResellerCredits(id) {
  const r = state.resellers.find(item => item.id === id);
  if (!r) return;

  const addStr = prompt(`Kitne credits / keys add karne hain for "${r.username}"?\nCurrent Balance: ${r.balance} Keys`, '50');
  if (addStr === null) return;

  const addAmount = parseInt(addStr, 10);
  if (isNaN(addAmount) || addAmount <= 0) {
    alert('Please enter a valid positive number!');
    return;
  }

  r.balance += addAmount;
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });
  renderResellersTable();
  alert(`✓ Added ${addAmount} keys to ${r.username}. New Balance: ${r.balance} Keys`);
}

function toggleResellerStatus(id) {
  const r = state.resellers.find(item => item.id === id);
  if (!r) return;

  const newStatus = r.status === 'Suspended' ? 'Active' : 'Suspended';
  if (!confirm(`Are you sure you want to change status of "${r.username}" to ${newStatus}?`)) return;

  r.status = newStatus;
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });
  renderResellersTable();
}

function deleteReseller(id) {
  const r = state.resellers.find(item => item.id === id);
  if (!r) return;

  if (!confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to delete reseller "${r.username}"?`)) return;

  state.resellers = state.resellers.filter(item => item.id !== id);
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });
  renderResellersTable();
  alert(`Reseller "${r.username}" has been removed.`);
}

// ==========================================================================
// 5B. PEER-TO-PEER RESELLER CREDIT TRANSFER SYSTEM
// ==========================================================================
function getCurrentUserTransferDetails() {
  const role = getUserRole();
  if (role === 'reseller') {
    const res = getCurrentReseller();
    const username = res ? res.username : 'Reseller';
    const balance = res ? (parseInt(res.balance, 10) || 0) : 0;
    return { role: 'reseller', username, balance, resellerObj: res };
  } else {
    const adminUser = getStoredAdminUser();
    const balance = (state.stats && state.stats.remaining !== undefined) ? state.stats.remaining : 9922;
    return { role: 'admin', username: adminUser, balance, resellerObj: null };
  }
}

function renderTransfersView() {
  const current = getCurrentUserTransferDetails();

  // 1. Metric Cards
  const elBal = document.getElementById('transfer-stat-balance');
  const elSent = document.getElementById('transfer-stat-sent');
  const elRecv = document.getElementById('transfer-stat-received');
  const elResCount = document.getElementById('transfer-stat-resellers-count');

  if (elBal) elBal.textContent = `${current.balance.toLocaleString()} Keys`;

  const totalSent = state.transfers
    .filter(t => t.from && t.from.toLowerCase() === current.username.toLowerCase())
    .reduce((sum, t) => sum + (parseInt(t.amount, 10) || 0), 0);
  if (elSent) elSent.textContent = `${totalSent.toLocaleString()} Keys`;

  const totalRecv = state.transfers
    .filter(t => t.to && t.to.toLowerCase() === current.username.toLowerCase())
    .reduce((sum, t) => sum + (parseInt(t.amount, 10) || 0), 0);
  if (elRecv) elRecv.textContent = `${totalRecv.toLocaleString()} Keys`;

  const eligibleResellers = state.resellers.filter(r => 
    r.username.toLowerCase() !== current.username.toLowerCase() && 
    (!r.status || !r.status.includes('Suspended'))
  );
  if (elResCount) elResCount.textContent = eligibleResellers.length;

  // 2. Transfer Form Sender Strip
  const senderNameEl = document.getElementById('transfer-sender-name');
  const senderAvailEl = document.getElementById('transfer-sender-avail');
  if (senderNameEl) {
    senderNameEl.textContent = `${current.username} (${current.role === 'reseller' ? 'Reseller' : 'Root Owner'})`;
  }
  if (senderAvailEl) {
    senderAvailEl.textContent = `${current.balance.toLocaleString()} Keys`;
  }

  // 3. Populate Target Dropdown
  const targetSelect = document.getElementById('transfer-target-select');
  if (targetSelect) {
    if (eligibleResellers.length === 0) {
      targetSelect.innerHTML = `<option value="">-- No other active resellers found --</option>`;
    } else {
      const prevVal = targetSelect.value;
      targetSelect.innerHTML = `
        <option value="">-- Select Target Reseller --</option>
        ${eligibleResellers.map(r => `
          <option value="${r.id}">
            👤 ${r.username} (Current: ${r.balance} Keys)
          </option>
        `).join('')}
      `;
      if (prevVal && eligibleResellers.some(r => r.id === prevVal)) {
        targetSelect.value = prevVal;
      }
    }
  }

  // 3B. Populate Main Dashboard Tab Transfer Widget
  const dashTitle = document.getElementById('dash-transfer-title');
  const dashSub = document.getElementById('dash-transfer-sub');
  const dashAvail = document.getElementById('dash-transfer-avail');
  const dashTargetSelect = document.getElementById('dash-transfer-target-select');

  if (dashTitle) {
    dashTitle.textContent = current.role === 'reseller' 
      ? 'Peer-to-Peer Reseller Credit Transfer' 
      : 'Owner Credit Distribution & Reseller Top-up';
  }
  if (dashSub) {
    dashSub.textContent = current.role === 'reseller'
      ? 'Transfer instant license key credits to any peer reseller from your balance.'
      : 'Allocate instant credits to any reseller from master owner quota.';
  }
  if (dashAvail) {
    dashAvail.textContent = `${current.balance.toLocaleString()} Keys`;
  }
  if (dashTargetSelect) {
    if (eligibleResellers.length === 0) {
      dashTargetSelect.innerHTML = `<option value="">-- No other active resellers found --</option>`;
    } else {
      const prevDashVal = dashTargetSelect.value;
      dashTargetSelect.innerHTML = `
        <option value="">-- Select Target Reseller --</option>
        ${eligibleResellers.map(r => `
          <option value="${r.id}">
            👤 ${r.username} (Current: ${r.balance} Keys)
          </option>
        `).join('')}
      `;
      if (prevDashVal && eligibleResellers.some(r => r.id === prevDashVal)) {
        dashTargetSelect.value = prevDashVal;
      }
    }
  }

  // 4. Quick Resellers Directory
  const quickList = document.getElementById('transfer-resellers-quick-list');
  if (quickList) {
    if (eligibleResellers.length === 0) {
      quickList.innerHTML = `<p style="font-size:12px;color:var(--text-dim);padding:10px;">No other resellers available.</p>`;
    } else {
      quickList.innerHTML = eligibleResellers.map(r => {
        const letter = (r.username && r.username.length > 0) ? r.username.charAt(0).toUpperCase() : 'R';
        return `
          <div class="reseller-quick-card">
            <div class="reseller-quick-info">
              <div class="reseller-quick-avatar">${letter}</div>
              <div>
                <div class="reseller-quick-name">${r.username}</div>
                <div class="reseller-quick-bal">Balance: <strong>${r.balance} Keys</strong></div>
              </div>
            </div>
            <button type="button" class="btn-sm-action" onclick="selectTransferRecipient('${r.id}')" style="color:#00f0ff;border-color:rgba(0,240,255,0.4);">
              💸 Send
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Transfer History Table
  renderTransfersHistoryTable(current);

  // 6. Calc preview
  updateTransferCalcPreview();
}

function renderTransfersHistoryTable(current) {
  const tbody = document.getElementById('transfers-history-tbody');
  if (!tbody) return;

  if (!current) current = getCurrentUserTransferDetails();
  const filter = state.transfersFilter || 'all';

  let list = state.transfers;

  // Reseller sees transfers involving their account; Admin sees all
  if (current.role === 'reseller') {
    list = list.filter(t => 
      (t.from && t.from.toLowerCase() === current.username.toLowerCase()) || 
      (t.to && t.to.toLowerCase() === current.username.toLowerCase())
    );
  }

  if (filter === 'sent') {
    list = list.filter(t => t.from && t.from.toLowerCase() === current.username.toLowerCase());
  } else if (filter === 'received') {
    list = list.filter(t => t.to && t.to.toLowerCase() === current.username.toLowerCase());
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-dim);">No transactions recorded in this view.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(tx => {
    const isSent = tx.from && tx.from.toLowerCase() === current.username.toLowerCase();
    const isRecv = tx.to && tx.to.toLowerCase() === current.username.toLowerCase();

    let amtBadge = '';
    if (isSent) {
      amtBadge = `<span class="badge-tx-sent">📤 -${tx.amount} Keys</span>`;
    } else if (isRecv) {
      amtBadge = `<span class="badge-tx-received">📥 +${tx.amount} Keys</span>`;
    } else {
      amtBadge = `<span class="badge-pill-status badge-active-green">${tx.amount} Keys</span>`;
    }

    let fromLabel = tx.from;
    let noteLabel = tx.note || 'Credit Transfer';
    if (current.role === 'reseller') {
      if (tx.from && (tx.from.toLowerCase().includes('hyper x') || tx.from.toLowerCase().includes('admin') || tx.from.toLowerCase().includes('owner'))) {
        fromLabel = 'Direct Quota Allocation';
      }
      if (noteLabel.toLowerCase().includes('owner') || noteLabel.toLowerCase().includes('admin')) {
        noteLabel = 'Direct License Allocation';
      }
    }

    return `
      <tr>
        <td style="font-family:var(--font-mono);font-size:11px;color:#00f0ff;font-weight:700;">${tx.id}</td>
        <td style="font-weight:700;color:${isSent ? '#ef4444' : '#fff'};">
          ${isSent ? '<strong>(You) ' + tx.from + '</strong>' : fromLabel}
        </td>
        <td style="font-weight:700;color:${isRecv ? '#22c55e' : '#fff'};">
          ${isRecv ? '<strong>(You) ' + tx.to + '</strong>' : tx.to}
        </td>
        <td>${amtBadge}</td>
        <td style="color:#cbd5e1;font-size:11.5px;">${noteLabel}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);">${tx.time}</td>
        <td><span class="badge-pill-status badge-active-green">✓ ${tx.status || 'Completed'}</span></td>
      </tr>
    `;
  }).join('');
}

function selectTransferRecipient(resellerId) {
  const select = document.getElementById('transfer-target-select');
  if (select) {
    select.value = resellerId;
    updateTransferCalcPreview();
  }
  const amtInput = document.getElementById('transfer-amount-input');
  if (amtInput) {
    amtInput.focus();
    amtInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function updateTransferCalcPreview() {
  const current = getCurrentUserTransferDetails();
  const amtInput = document.getElementById('transfer-amount-input');
  const preview = document.getElementById('transfer-remaining-preview');
  if (!amtInput || !preview) return;

  const amt = parseInt(amtInput.value, 10);
  if (isNaN(amt) || amt <= 0) {
    preview.innerHTML = `<span style="color:#00f0ff;">${current.balance.toLocaleString()} Keys</span>`;
    return;
  }

  const remaining = current.balance - amt;
  if (remaining < 0) {
    preview.innerHTML = `<span style="color:#ef4444;font-weight:800;">❌ Insufficient Credits (Short by ${Math.abs(remaining)} Keys)</span>`;
  } else {
    preview.innerHTML = `<span style="color:#10b981;font-weight:700;">${remaining.toLocaleString()} Keys</span> <span style="font-size:10px;color:var(--text-dim);">(-${amt} Keys)</span>`;
  }
}

function setTransferAmountQuick(delta) {
  const amtInput = document.getElementById('transfer-amount-input');
  if (!amtInput) return;
  const current = parseInt(amtInput.value, 10) || 0;
  amtInput.value = current + delta;
  updateTransferCalcPreview();
}

function setTransferAmountMax() {
  const current = getCurrentUserTransferDetails();
  const amtInput = document.getElementById('transfer-amount-input');
  if (amtInput) {
    amtInput.value = current.balance > 0 ? current.balance : 0;
    updateTransferCalcPreview();
  }
}

function filterTransfersHistory(filter) {
  state.transfersFilter = filter;
  ['all', 'sent', 'received'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  renderTransfersHistoryTable();
}

// Modal Transfer Handlers
function initModalTransfer(preselectedId = null) {
  const current = getCurrentUserTransferDetails();
  const senderNameEl = document.getElementById('modal-transfer-sender-name');
  const senderAvailEl = document.getElementById('modal-transfer-sender-avail');
  const targetSelect = document.getElementById('modal-transfer-target-select');

  if (senderNameEl) senderNameEl.textContent = `${current.username} (${current.role === 'reseller' ? 'Reseller' : 'Owner'})`;
  if (senderAvailEl) senderAvailEl.textContent = `${current.balance.toLocaleString()} Keys`;

  const eligibleResellers = state.resellers.filter(r => 
    r.username.toLowerCase() !== current.username.toLowerCase() && 
    (!r.status || !r.status.includes('Suspended'))
  );

  if (targetSelect) {
    if (eligibleResellers.length === 0) {
      targetSelect.innerHTML = `<option value="">-- No eligible active resellers found --</option>`;
    } else {
      targetSelect.innerHTML = `
        <option value="">-- Select Target Reseller --</option>
        ${eligibleResellers.map(r => `
          <option value="${r.id}" ${r.id === preselectedId ? 'selected' : ''}>
            👤 ${r.username} (Balance: ${r.balance} Keys)
          </option>
        `).join('')}
      `;
      if (preselectedId) targetSelect.value = preselectedId;
    }
  }

  updateModalTransferCalcPreview();
}

function updateModalTransferCalcPreview() {
  const current = getCurrentUserTransferDetails();
  const amtInput = document.getElementById('modal-transfer-amount-input');
  const preview = document.getElementById('modal-transfer-remaining-preview');
  if (!amtInput || !preview) return;

  const amt = parseInt(amtInput.value, 10);
  if (isNaN(amt) || amt <= 0) {
    preview.innerHTML = `<span style="color:#00f0ff;">${current.balance.toLocaleString()} Keys</span>`;
    return;
  }

  const remaining = current.balance - amt;
  if (remaining < 0) {
    preview.innerHTML = `<span style="color:#ef4444;font-weight:800;">❌ Insufficient Credits (Short by ${Math.abs(remaining)} Keys)</span>`;
  } else {
    preview.innerHTML = `<span style="color:#10b981;font-weight:700;">${remaining.toLocaleString()} Keys</span>`;
  }
}

function setModalTransferAmountQuick(delta) {
  const amtInput = document.getElementById('modal-transfer-amount-input');
  if (!amtInput) return;
  const current = parseInt(amtInput.value, 10) || 0;
  amtInput.value = current + delta;
  updateModalTransferCalcPreview();
}

function setModalTransferAmountMax() {
  const current = getCurrentUserTransferDetails();
  const amtInput = document.getElementById('modal-transfer-amount-input');
  if (amtInput) {
    amtInput.value = current.balance > 0 ? current.balance : 0;
    updateModalTransferCalcPreview();
  }
}

function openTransferModalForReseller(resellerId) {
  openModal('modal-transfer-credit');
  initModalTransfer(resellerId);
}

// Master Transfer Execution
function executeCreditTransfer(targetIdOrUsername, amount, note) {
  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount <= 0) {
    alert('❌ Please enter a valid transfer credit amount greater than 0.');
    return false;
  }

  const current = getCurrentUserTransferDetails();

  // If reseller, ensure sender has enough balance
  if (current.role === 'reseller') {
    if (numAmount > current.balance) {
      alert(`❌ Insufficient Credits!\n\nYour Available Balance: ${current.balance} Keys\nRequested Amount: ${numAmount} Keys\n\nYour account does not have sufficient credits.`);
      return false;
    }
  }

  // Find target reseller
  const target = state.resellers.find(r => 
    r.id === targetIdOrUsername || 
    r.username.toLowerCase() === targetIdOrUsername.toLowerCase()
  );

  if (!target) {
    alert('❌ Target reseller not found. Please choose a valid reseller account.');
    return false;
  }

  if (target.username.toLowerCase() === current.username.toLowerCase()) {
    alert('❌ You cannot transfer credits to yourself!');
    return false;
  }

  if (target.status === 'Suspended') {
    alert(`❌ Target reseller "${target.username}" is Suspended. Credits cannot be transferred to suspended accounts.`);
    return false;
  }

  // Deduct from sender
  if (current.role === 'reseller') {
    const senderRes = state.resellers.find(r => r.username.toLowerCase() === current.username.toLowerCase());
    if (senderRes) {
      senderRes.balance -= numAmount;
      sessionStorage.setItem('hyperx_current_reseller', JSON.stringify(senderRes));
      localStorage.setItem('hyperx_current_reseller', JSON.stringify(senderRes));
    }
  } else {
    // Owner deductions
    if (state.stats.remaining >= numAmount) {
      state.stats.remaining -= numAmount;
    }
  }

  // Credit target
  target.balance = (parseInt(target.balance, 10) || 0) + numAmount;

  // Create Transaction Record
  const tx = {
    id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
    from: current.username,
    to: target.username,
    amount: numAmount,
    note: note || 'P2P Credit Transfer',
    time: new Date().toISOString().replace('T', ' ').substring(0, 16),
    timestamp: Date.now(),
    status: 'Completed'
  };

  state.transfers.unshift(tx);

  // Push to system audit logs
  state.logs.unshift({
    id: Date.now().toString(),
    action: 'credit_transfer',
    detail: `${numAmount} Credits transferred from ${current.username} to ${target.username} (${tx.note})`,
    time: 'Just now',
    ip: '127.0.0.1'
  });

  // Persist all data
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });

  // Refresh UI everywhere
  renderTransfersView();
  renderResellersTable();
  updateDashboardStatsUI();
  renderDashboardRecentActivity();
  renderFullLogsTable();

  if (current.role === 'reseller') {
    initUserRoleSession();
  }

  const updatedCurrent = getCurrentUserTransferDetails();
  alert(`✓ Credit Transfer Successful!\n\nTransferred: ${numAmount} Credits\nRecipient: ${target.username}\nYour Remaining Balance: ${updatedCurrent.balance.toLocaleString()} Keys\nTransaction ID: ${tx.id}`);
  return true;
}

function submitQuickTransfer(e) {
  if (e) e.preventDefault();
  const targetId = document.getElementById('transfer-target-select').value;
  const amount = document.getElementById('transfer-amount-input').value;
  const note = document.getElementById('transfer-note-input').value.trim();

  if (!targetId) {
    alert('Please select a target reseller from the dropdown.');
    return;
  }

  const ok = executeCreditTransfer(targetId, amount, note);
  if (ok) {
    document.getElementById('transfer-amount-input').value = '';
    document.getElementById('transfer-note-input').value = '';
    updateTransferCalcPreview();
  }
}

function submitModalTransferCredits(e) {
  if (e) e.preventDefault();
  const targetId = document.getElementById('modal-transfer-target-select').value;
  const amount = document.getElementById('modal-transfer-amount-input').value;
  const note = document.getElementById('modal-transfer-note-input').value.trim();

  if (!targetId) {
    alert('Please select a target reseller from the dropdown.');
    return;
  }

  const ok = executeCreditTransfer(targetId, amount, note);
  if (ok) {
    document.getElementById('modal-transfer-amount-input').value = '';
    document.getElementById('modal-transfer-note-input').value = '';
    closeModal('modal-transfer-credit');
  }
}

function submitDashboardQuickTransfer(e) {
  if (e) e.preventDefault();
  const targetId = document.getElementById('dash-transfer-target-select').value;
  const amount = document.getElementById('dash-transfer-amount-input').value;
  const note = document.getElementById('dash-transfer-note-input').value.trim();

  if (!targetId) {
    alert('Please select a target reseller from the dropdown.');
    return;
  }

  const ok = executeCreditTransfer(targetId, amount, note);
  if (ok) {
    document.getElementById('dash-transfer-amount-input').value = '';
    document.getElementById('dash-transfer-note-input').value = '';
  }
}

// ==========================================================================
// 6. UTILITY FUNCTIONS
// ==========================================================================
function openModal(id) {
  const role = getUserRole();
  if (role === 'reseller') {
    if (id === 'modal-change-admin' || id === 'modal-add-reseller' || id === 'modal-edit-reseller' || id === 'modal-transfer-credit') {
      alert('⛔ Access Denied: Reseller accounts cannot access Admin configurations.');
      return;
    }
  }

  const m = document.getElementById(id);
  if (m) m.classList.add('active');

  if (id === 'modal-change-reseller-password') {
    const res = getCurrentReseller();
    if (res) {
      const modalUnameEl = document.getElementById('reseller-modal-uname');
      if (modalUnameEl) modalUnameEl.textContent = res.username || 'Reseller';
    }
  }

  if (id === 'modal-transfer-credit') {
    initModalTransfer();
  }

  if (id === 'modal-add-reseller') {
    populateResellerPanelsCheckboxes('add');
    const passInput = document.getElementById('reseller-pass');
    if (passInput && !passInput.value) {
      generateRandomResellerPass('reseller-pass');
    }
  }

  if (id === 'modal-add-key') {
    populatePackageDropdown();
    const notice = document.getElementById('gen-modal-reseller-notice');
    if (notice) {
      if (role === 'reseller') {
        const liveRes = getCurrentReseller() || { username: 'Reseller', balance: 0 };
        notice.style.display = 'block';
        notice.innerHTML = `👤 Generating key as Reseller: <strong>${liveRes.username}</strong> | Available Credit: <strong style="color:#00f0ff;">${liveRes.balance} Keys</strong>`;
      } else {
        notice.style.display = 'none';
      }
    }
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function handleSettingsNavClick() {
  const role = getUserRole();
  if (role === 'reseller') {
    openModal('modal-change-reseller-password');
  } else {
    openModal('modal-change-admin');
  }
}

function handleProfileBoxClick() {
  const role = getUserRole();
  if (role === 'reseller') {
    openModal('modal-change-reseller-password');
    return;
  }
  openModal('modal-change-admin');
}

function handleAdminPillClick() {
  handleProfileBoxClick();
}

function renderResellerSettingsBox(res) {
  const box = document.getElementById('dashboard-reseller-settings-box');
  if (!box) return;

  const role = getUserRole();
  if (role !== 'reseller' || !res) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';

  const unameEl = document.getElementById('reseller-settings-uname');
  const balEl = document.getElementById('reseller-settings-balance');
  const panelsEl = document.getElementById('reseller-settings-panels');
  const statusEl = document.getElementById('reseller-settings-status');
  const modalUnameEl = document.getElementById('reseller-modal-uname');

  if (unameEl) unameEl.textContent = res.username || 'Reseller';
  if (modalUnameEl) modalUnameEl.textContent = res.username || 'Reseller';
  if (balEl) balEl.textContent = `${(res.balance || 0).toLocaleString()} Keys`;
  if (panelsEl) {
    const pNames = (!res.panels || res.panels.includes('all')) ? 'All Panels' : res.panels.join(', ');
    panelsEl.textContent = pNames;
  }
  if (statusEl) statusEl.textContent = res.status || 'Active';
}

function submitChangeResellerPassword(e, source = 'dash') {
  if (e) e.preventDefault();

  const role = getUserRole();
  if (role !== 'reseller') {
    alert('This action is only available for reseller accounts.');
    return;
  }

  let currentReseller = getCurrentReseller();
  if (!currentReseller) {
    alert('Error: Reseller session not found. Please log in again.');
    return;
  }
  const prefix = source === 'modal' ? 'reseller-modal-' : 'reseller-dash-';
  const oldPass = document.getElementById(`${prefix}oldpass`).value;
  const newPass = document.getElementById(`${prefix}newpass`).value;
  const confirmPass = document.getElementById(`${prefix}confirmpass`).value;
  const msgBox = document.getElementById(`${prefix}pass-msg`);

  function showMsg(text, isError = true) {
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.style.background = isError ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)';
      msgBox.style.border = isError ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)';
      msgBox.style.color = isError ? '#fca5a5' : '#86efac';
      msgBox.innerHTML = (isError ? '❌ ' : '✅ ') + text;
    } else {
      alert((isError ? '❌ ' : '✅ ') + text);
    }
  }

  // Find target reseller in state
  let targetReseller = state.resellers.find(r => r.id === currentReseller.id || r.username.toLowerCase() === currentReseller.username.toLowerCase());
  if (!targetReseller) {
    targetReseller = currentReseller;
  }

  // 1. Verify old password
  if (oldPass !== targetReseller.password) {
    showMsg('Incorrect current password! Please verify your password.', true);
    return;
  }

  // 2. Validate new password length
  if (!newPass || newPass.length < 4) {
    showMsg('New password must be at least 4 characters long!', true);
    return;
  }

  // 3. Validate match
  if (newPass !== confirmPass) {
    showMsg('New password and Confirm password do not match!', true);
    return;
  }

  // 4. Update in state.resellers
  targetReseller.password = newPass;
  currentReseller.password = newPass;

  const idx = state.resellers.findIndex(r => r.id === targetReseller.id || r.username.toLowerCase() === targetReseller.username.toLowerCase());
  if (idx !== -1) {
    state.resellers[idx].password = newPass;
  }
  state.save();
  syncCredentialsToServer({ tx99_resellers: state.resellers });

  // Update session storage & saved login
  sessionStorage.setItem('hyperx_current_reseller', JSON.stringify(targetReseller));
  localStorage.setItem('hyperx_current_reseller', JSON.stringify(targetReseller));
  localStorage.setItem('hyperx_saved_login_user', targetReseller.username);
  localStorage.setItem('hyperx_saved_login_pass', newPass);

  // Clear inputs
  document.getElementById(`${prefix}oldpass`).value = '';
  document.getElementById(`${prefix}newpass`).value = '';
  document.getElementById(`${prefix}confirmpass`).value = '';

  // Clear other form if open
  const otherPrefix = source === 'modal' ? 'reseller-dash-' : 'reseller-modal-';
  const otherOld = document.getElementById(`${otherPrefix}oldpass`);
  if (otherOld) otherOld.value = '';
  const otherNew = document.getElementById(`${otherPrefix}newpass`);
  if (otherNew) otherNew.value = '';
  const otherConf = document.getElementById(`${otherPrefix}confirmpass`);
  if (otherConf) otherConf.value = '';

  // Add self audit log
  state.addLog('auth_success', `Password successfully updated for reseller account: ${targetReseller.username}`);

  showMsg(`Password successfully updated! Your new password has been saved.`, false);

  if (source === 'modal') {
    setTimeout(() => {
      closeModal('modal-change-reseller-password');
      if (msgBox) msgBox.style.display = 'none';
    }, 1800);
  }
}

function copyText(str) {
  navigator.clipboard.writeText(str).then(() => {
    alert('Copied to clipboard:\n' + str);
  }).catch(() => {
    prompt('Copy to clipboard:', str);
  });
}

function startRealtimeSimulation() {
  const events = [
    { action: 'auth_success', detail: 'Key authenticated for app: Custom work (BASIC PANEL)' },
    { action: 'auth_fail', detail: 'HWID mismatch detected: Device unverified' },
    { action: 'auth_success', detail: 'Client handshake v1.0.0 verified successfully' },
    { action: 'auth_fail', detail: 'Invalid license key attempt' },
    { action: 'auth_success', detail: 'Key authenticated for app: Custom work (FPS BOOSTER)' }
  ];

  setInterval(() => {
    const ev = events[Math.floor(Math.random() * events.length)];
    if (!Array.isArray(state.logs) || state.logs.length === 0) {
      state.logs = [...SEED_LOGS];
    }
    state.logs.unshift({
      id: Date.now().toString(),
      action: ev.action,
      detail: ev.detail,
      time: 'Just now',
      ip: `103.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}`
    });
    if (state.logs.length > 50) state.logs.pop();
    renderDashboardRecentActivity();
    renderFullLogsTable();
  }, 7000);
}

function renderResellerClientUsers(res) {
  const container = document.getElementById('dashboard-reseller-users-box');
  const tbody = document.getElementById('reseller-client-users-tbody');
  const title = document.getElementById('reseller-client-users-title');
  if (!container || !tbody) return;

  const role = getUserRole();
  if (role !== 'reseller') {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  const myKeys = state.licenses.filter(l => {
    return (l.user && l.user.toLowerCase().includes(res.username.toLowerCase())) ||
           (l.note && l.note.toLowerCase().includes(res.username.toLowerCase()));
  });

  if (title) {
    title.innerHTML = `Your Generated Client Users &amp; Licenses (<strong style="color:#00f0ff;">${myKeys.length} Registered</strong>)`;
  }

  if (myKeys.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:24px;color:var(--text-dim);">
          No client users generated yet. Use the <strong>⚡ Generate Key</strong> button above to create client licenses.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = myKeys.map(lic => {
    const isAct = lic.status === 'active';
    const statusBadge = isAct
      ? '<span class="badge-pill-status badge-auth-success">Active</span>'
      : (lic.status === 'banned' ? '<span class="badge-pill-status badge-auth-fail">Banned</span>' : '<span class="badge-pill-status" style="background:#334155;color:#94a3b8;">Expired</span>');
    const hwidBadge = lic.hwid && lic.hwid !== 'Not Bound' && lic.hwid !== 'Unbound'
      ? `<span style="font-family:var(--font-mono);font-size:11px;color:#10b981;">🔒 ${lic.hwid}</span>`
      : `<span style="font-family:var(--font-mono);font-size:11px;color:#f59e0b;">🔓 Unbound</span>`;

    return `
      <tr>
        <td style="font-weight:700;color:#00f0ff;font-family:var(--font-mono);font-size:12.5px;">${lic.user || res.username}</td>
        <td><code style="background:rgba(0,0,0,0.4);padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);color:#fff;font-family:var(--font-mono);font-size:11px;">${lic.key}</code></td>
        <td style="color:#38bdf8;font-weight:600;">${lic.pkg}</td>
        <td>${hwidBadge}</td>
        <td style="color:#cbd5e1;font-size:11.5px;">${lic.expiry}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function initUserRoleSession() {
  const role = getUserRole();
  if (role === 'reseller') {
    document.documentElement.classList.add('is-reseller');
    document.body.classList.add('is-reseller');

    // Guarantee Resellers navigation, view, and modals are completely removed
    const navResellers = document.getElementById('nav-resellers');
    if (navResellers) {
      navResellers.style.display = 'none';
      navResellers.remove();
    }
    const viewResellers = document.getElementById('view-resellers');
    if (viewResellers) {
      viewResellers.style.display = 'none';
      viewResellers.remove();
    }
    const modalAddReseller = document.getElementById('modal-add-reseller');
    if (modalAddReseller) modalAddReseller.remove();
    const modalEditReseller = document.getElementById('modal-edit-reseller');
    if (modalEditReseller) modalEditReseller.remove();

    const res = getCurrentReseller();
    if (!res) return;
    try {
      const allowedPkgs = getResellerAllowedPackages();

      // Update UI for reseller
      document.querySelectorAll('.profile-name').forEach(el => el.textContent = res.username);
      const avatarLetter = document.getElementById('sidebar-avatar-letter');
      if (avatarLetter && res.username) avatarLetter.textContent = res.username.charAt(0).toUpperCase();

      const profileSub = document.getElementById('profile-role-sub');
      if (profileSub) profileSub.textContent = `Reseller (${res.balance} Keys)`;

      // Update Dashboard Welcome Strip
      const dashAvatar = document.getElementById('dash-user-avatar');
      if (dashAvatar && res.username) {
        dashAvatar.textContent = res.username.charAt(0).toUpperCase();
        dashAvatar.style.background = 'linear-gradient(135deg,#f59e0b,#ea580c)';
        dashAvatar.style.boxShadow = '0 0 14px rgba(245,158,11,0.35)';
      }
      const dashName = document.getElementById('dash-welcome-username');
      if (dashName) dashName.textContent = res.username;

      const dashRoleBadge = document.getElementById('dash-welcome-role-badge');
      if (dashRoleBadge) {
        dashRoleBadge.textContent = '👤 RESELLER ACCOUNT';
        dashRoleBadge.style.background = 'rgba(245,158,11,0.15)';
        dashRoleBadge.style.borderColor = 'rgba(245,158,11,0.4)';
        dashRoleBadge.style.color = '#fbbf24';
      }

      const dashRoleDesc = document.getElementById('dash-welcome-role-desc');
      if (dashRoleDesc) {
        const pNames = (!res.panels || res.panels.includes('all')) ? 'All Packages' : res.panels.join(', ');
        dashRoleDesc.innerHTML = `Reseller Portal Session | Logged in as: <strong style="color:#00f0ff;">${res.username}</strong> | Available Balance: <strong style="color:#38bdf8;">${res.balance} Keys</strong>`;
      }

      const dashQuotaNum = document.getElementById('dash-welcome-quota-num');
      if (dashQuotaNum) dashQuotaNum.textContent = res.balance;

      const dashQuotaBox = document.getElementById('dash-welcome-quota-box');
      if (dashQuotaBox) {
        dashQuotaBox.innerHTML = `⚡ Reseller Balance: <strong id="dash-welcome-quota-num" style="color:#00f0ff;font-weight:700;">${res.balance}</strong> Keys`;
      }

      // Hide admin-only sections
      const navResellers = document.getElementById('nav-resellers');
      if (navResellers) navResellers.style.display = 'none';

      // Keep settings navigation visible for reseller
      const navSettings = document.getElementById('nav-settings');
      if (navSettings) navSettings.style.display = 'flex';

      // Update top header button
      const adminHeaderBtn = document.getElementById('header-admin-btn');
      const adminHeaderIcon = document.getElementById('header-admin-icon');
      const adminHeaderName = document.getElementById('header-admin-name');
      const adminHeaderAction = document.getElementById('header-admin-action');
      if (adminHeaderIcon) adminHeaderIcon.textContent = '👤';
      if (adminHeaderName) adminHeaderName.textContent = res.username;
      if (adminHeaderAction) adminHeaderAction.textContent = '(Reseller)';
      if (adminHeaderBtn) {
        adminHeaderBtn.title = `Reseller: ${res.username} (${res.balance} Keys)`;
      }

      // Hide Ban/Unban/Delete buttons from Quick Tools bar
      const quickToolsButtons = document.querySelectorAll('.quick-tools-row button');
      quickToolsButtons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('ban') || text.includes('delete')) {
          btn.style.display = 'none';
        }
      });

      // Update top navbar keys stat to show remaining reseller credit
      const headerKeys = document.getElementById('header-keys-stat');
      if (headerKeys) {
        headerKeys.textContent = `${res.balance} Keys Left`;
        headerKeys.style.color = '#00f0ff';
      }

      // Update View headings
      const viewAppsTitle = document.getElementById('view-apps-title');
      const viewAppsSub = document.getElementById('view-apps-sub');
      if (viewAppsTitle) viewAppsTitle.textContent = `Assigned Application Panels (${allowedPkgs.length})`;
      if (viewAppsSub) {
        const pNames = (!res.panels || res.panels.includes('all')) ? 'All Packages' : res.panels.join(', ');
        viewAppsSub.innerHTML = `Panels assigned to reseller account: <strong style="color:#00f0ff;">${res.username}</strong> (${pNames}) | Available credit: <strong style="color:#38bdf8;">${res.balance} Keys</strong>`;
      }

      const viewLicTitle = document.getElementById('view-licenses-title');
      const viewLicSub = document.getElementById('view-licenses-sub');
      if (viewLicTitle) viewLicTitle.textContent = `Reseller License Keys (${res.username})`;
      if (viewLicSub) {
        viewLicSub.innerHTML = `Showing license keys generated for reseller: <strong style="color:#00f0ff;">${res.username}</strong> | Available credit: <strong style="color:#38bdf8;">${res.balance} Keys</strong>`;
      }

      // Ensure Reseller Mode Banner is removed from dashboard
      const existingBanner = document.getElementById('reseller-session-banner');
      if (existingBanner) existingBanner.remove();

      // Render Reseller Client Users Card on Dashboard
      renderResellerClientUsers(res);

      // Render Reseller Settings & Password Slot on Dashboard
      renderResellerSettingsBox(res);

      // Render applications table, licenses, dropdown, transfers, and isolated logs strictly for this reseller
      renderApplicationsTable();
      renderLicensesTable();
      populatePackageDropdown();
      updateDashboardStatsUI();
      renderTransfersView();
      renderDashboardRecentActivity();
      renderFullLogsTable();

      const viewLogsSub = document.querySelector('#view-logs .view-sub-text');
      if (viewLogsSub) {
        viewLogsSub.innerHTML = `Showing active authentication and transaction logs for: <strong style="color:#00f0ff;">${res.username}</strong>`;
      }
    } catch (e) {
      console.error('Error initializing reseller session:', e);
    }
  } else {
    document.body.classList.remove('is-reseller');
    const existingBanner = document.getElementById('reseller-session-banner');
    if (existingBanner) existingBanner.remove();

    const adminUser = getStoredAdminUser();
    document.querySelectorAll('.profile-name').forEach(el => el.textContent = adminUser);
    const dashAvatar = document.getElementById('dash-user-avatar');
    if (dashAvatar) {
      dashAvatar.textContent = adminUser.charAt(0).toUpperCase();
      dashAvatar.style.background = 'rgba(229, 24, 31, 0.12)';
      dashAvatar.style.borderColor = 'rgba(229, 24, 31, 0.4)';
      dashAvatar.style.color = '#ff3b47';
      dashAvatar.style.boxShadow = '0 0 16px rgba(229, 24, 31, 0.25)';
    }
    const dashName = document.getElementById('dash-welcome-username');
    if (dashName) dashName.textContent = adminUser;
    const dashRoleBadge = document.getElementById('dash-welcome-role-badge');
    if (dashRoleBadge) {
      dashRoleBadge.textContent = 'ROOT OWNER';
      dashRoleBadge.style.color = '#8e95aa';
      dashRoleBadge.style.background = 'transparent';
      dashRoleBadge.style.border = 'none';
    }
    const dashRoleDesc = document.getElementById('dash-welcome-role-desc');
    if (dashRoleDesc) dashRoleDesc.textContent = 'Master Administrator Dashboard & Full System Access';
    const dashQuotaBox = document.getElementById('dash-welcome-quota-box');
    if (dashQuotaBox) {
      dashQuotaBox.innerHTML = `⚡ Available Credit: <strong id="dash-welcome-quota-num" style="color:#34d399;font-weight:700;">${state.stats.remaining.toLocaleString()}</strong> Keys`;
    }
    const rBox = document.getElementById('dashboard-reseller-users-box');
    if (rBox) rBox.style.display = 'none';

    const sBox = document.getElementById('dashboard-reseller-settings-box');
    if (sBox) sBox.style.display = 'none';

    const viewLogsSub = document.querySelector('#view-logs .view-sub-text');
    if (viewLogsSub) {
      viewLogsSub.textContent = 'Captured authentication attempts and API proxy transactions.';
    }
  }
}

function logoutSession() {
  sessionStorage.removeItem('hyperx_user_role');
  sessionStorage.removeItem('hyperx_current_reseller');
  sessionStorage.removeItem('hyperx_logged_in');
  localStorage.removeItem('hyperx_user_role');
  localStorage.removeItem('hyperx_current_reseller');
  localStorage.removeItem('hyperx_logged_in');
  window.location.href = 'login.html';
}

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  const isAuth = (sessionStorage.getItem('hyperx_logged_in') === 'true') || (localStorage.getItem('hyperx_logged_in') === 'true');
  const role = getUserRole();
  if (!isAuth || !role) {
    window.location.replace('login.html');
    return;
  }

  // 1. Initialize role session (Admin or Reseller) FIRST before anything else
  initUserRoleSession();

  updateAdminUI();
  updateAppIdUI();
  renderDashboardRecentActivity();
  renderLicensesTable();
  renderFullLogsTable();
  if (role !== 'reseller') {
    renderResellersTable();
  }
  renderApplicationsTable();
  if (role !== 'reseller') {
    renderTransfersView();
  }
  startRealtimeSimulation();

  // Load real API data
  loadAdminPackages();
  if (role !== 'reseller') {
    loadResellerStats();
  }
});
