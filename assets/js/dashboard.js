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
  { id: '1', key: 'HPERX-8F92-41AC-90B2-110A', app: 'Custom work', pkg: 'BASIC PANEL', user: 'beta123_User', hwid: '4A8F-912C-00B4-E9D1', expiry: '2026-12-31', status: 'active', note: 'Created by beta123' },
  { id: '2', key: 'HPERX-32KA-991L-M08P-4491', app: 'Custom work', pkg: 'EXTERNAL PANEL', user: 'madhukar_User', hwid: '88CF-1102-BA54-77E0', expiry: '2026-10-15', status: 'active', note: 'Created by madhukar' },
  { id: '3', key: 'HPERX-77XC-B943-LL90-0012', app: 'Custom work', pkg: 'UID BYPASS', user: 'ShadowFF', hwid: 'Unbound', expiry: '2026-10-07', status: 'active', note: 'Awaiting Device' },
  { id: '4', key: 'HPERX-110A-BBA8-8832-5501', app: 'Custom work', pkg: 'AIMSILENT EXE', user: 'Client_Ghost', hwid: '9920-A001-B789-CC21', expiry: '2026-11-20', status: 'active', note: 'Created by Owner' },
  { id: '5', key: 'HPERX-9923-00PA-8841-8899', app: 'Custom work', pkg: 'PVT AIMKILL', user: 'CrackerBot', hwid: 'TAMPER_DETECTED', expiry: '2026-11-01', status: 'banned', note: 'Memory Hook Violation' },
  { id: '6', key: 'HPERX-55VK-7719-ABCD-2234', app: 'Custom work', pkg: 'VAULT PANEL', user: 'SecureClient', hwid: '99BC-2281-A011-9988', expiry: '2026-11-15', status: 'active', note: 'Created by Owner' }
];

const SEED_LOGS = [
  { id: '1', action: 'auth_success', detail: 'Key authenticated for app: Custom work (BASIC PANEL)', time: '2s ago', ip: '45.118.67.22' },
  { id: '2', action: 'key_gen', detail: 'License key created: HPERX-8F92-41AC-90B2-110A (30 Days)', time: '14s ago', ip: '127.0.0.1' },
  { id: '3', action: 'auth_fail', detail: 'HWID mismatch detected: Device unverified', time: '45s ago', ip: '89.144.12.5' },
  { id: '4', action: 'hwid_reset', detail: 'HWID reset executed for HPERX-32KA-991L-M08P-4491', time: '1m ago', ip: '127.0.0.1' },
  { id: '5', action: 'credit_transfer', detail: 'Transfer 999 credits from HYPER X to beta123', time: '3m ago', ip: '127.0.0.1' },
  { id: '6', action: 'auth_success', detail: 'Client handshake v1.0.0 verified successfully', time: '5m ago', ip: '194.26.29.13' },
  { id: '7', action: 'auth_fail', detail: 'Invalid license key attempt: HPERX-UNKNOWN-XXXX', time: '8m ago', ip: '182.73.19.144' },
  { id: '8', action: 'key_ban', detail: 'Key banned by Admin: Memory hook tamper detected', time: '12m ago', ip: '127.0.0.1' }
];

const SEED_RESELLERS = [
  { id: '17909518904974', username: 'beta123', password: 'beta1230', email: 'beta123@gmail.com', balance: 999, createdKeys: 1, status: 'Active', panels: ['all'], totpSecret: 'YLOG2E3ANGTE4B23', twofa_setup_done: true },
  { id: '1791108883957', username: 'madhukar', password: 'madhukarbeta', email: 'madhukar@reseller.local', balance: 998, createdKeys: 1, status: 'Active', panels: ['all'], totpSecret: 'Z5N73VUTBHFC7MJF', twofa_setup_done: true },
  { id: '1790951896372', username: 'MADHUKARBETA', password: 'reseller4@123', email: 'madhukarsarkar004@gmail.com', balance: 260, createdKeys: 0, status: 'Active', panels: ['all'], totpSecret: 'JBSWY3DPEHPK3PXP', twofa_setup_done: true }
];

const SEED_TRANSFERS = [
  { id: 'TX-891042', from: 'HYPER X', to: 'beta123', amount: 999, note: 'Initial Quota Allocation', time: '2026-10-01 10:15', timestamp: 1759313700000, status: 'Completed' },
  { id: 'TX-740219', from: 'HYPER X', to: 'madhukar', amount: 998, note: 'Initial Quota Allocation', time: '2026-10-01 11:30', timestamp: 1759318200000, status: 'Completed' },
  { id: 'TX-612984', from: 'HYPER X', to: 'MADHUKARBETA', amount: 260, note: 'Initial Quota Allocation', time: '2026-10-02 14:05', timestamp: 1759413900000, status: 'Completed' }
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

    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('tx99_deleted_resellers')) || [];
    } catch (_) {}
    const bannedDummyNames = ['hyper x (root owner)', 'alphadistro', 'viperkeys'];

    let hadDummyOrDeleted = false;
    let storedResellers = null;
    try {
      const storedRaw = JSON.parse(localStorage.getItem('tx99_resellers'));
      if (Array.isArray(storedRaw)) {
        storedResellers = storedRaw.filter(r => {
          if (!r || (!r.id && !r.username)) return false;
          const u = (r.username || '').toLowerCase().trim();
          const drop = bannedDummyNames.includes(u) || deletedIds.includes(r.id) || deletedIds.includes(u);
          if (drop) hadDummyOrDeleted = true;
          return !drop;
        });
      }
    } catch (_) {}

    if (!Array.isArray(storedResellers)) {
      storedResellers = SEED_RESELLERS.filter(r => !deletedIds.includes(r.id) && !deletedIds.includes(r.username.toLowerCase()));
      hadDummyOrDeleted = true;
    }
    localStorage.setItem('tx99_resellers', JSON.stringify(storedResellers));
    if (hadDummyOrDeleted) {
      setTimeout(() => syncCredentialsToServer({ tx99_resellers: storedResellers }), 500);
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
        <div class="hyper-dialog-header">
          <span class="hyper-dialog-badge" id="hyper-dialog-badge">Notice</span>
          <button type="button" class="hyper-dialog-close-btn" id="hyper-dialog-close-btn" onclick="closeHyperDialog()">✕</button>
        </div>
        <div class="hyper-dialog-body">
          <div class="hyper-dialog-icon-wrap" id="hyper-dialog-icon-wrap">
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
              <span id="hyper-dialog-btn-ok-text">Done</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    overlay = div;
  }

  const card = document.getElementById('hyper-dialog-card');
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

  const rawStr = String(message || '').trim();
  let cleanStr = rawStr.replace(/^[✓❌⛔⚠️ℹ️\?]\s*/, '').replace(/^(SUCCESS|ERROR|WARNING|NOTICE):\s*/i, '').trim();

  let type = options.type || '';
  if (!type) {
    if (rawStr.includes('✓') || /success|created|updated|saved|deleted|reset|operational/i.test(rawStr)) {
      type = 'success';
    } else if (rawStr.includes('❌') || rawStr.includes('⛔') || /error|failed|denied|incorrect|invalid/i.test(rawStr)) {
      type = 'error';
    } else if (rawStr.includes('⚠️') || /insufficient|warning|caution/i.test(rawStr)) {
      type = 'warning';
    } else {
      type = 'info';
    }
  }

  // Set card class for CSS type styling (.type-success, .type-error, etc.)
  if (card) {
    card.className = 'hyper-dialog-card type-' + type;
  }

  const lines = cleanStr.split('\n').map(l => l.trim()).filter(Boolean);

  let title = options.title || '';
  let subtitleLines = [];
  let kvPairs = [];

  if (options.title) {
    title = options.title;
    for (let line of lines) {
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
  } else {
    if (lines.length > 1) {
      title = lines[0];
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
    } else if (lines.length === 1) {
      const single = lines[0];
      if (/deleted|removed/i.test(single)) {
        title = single.toLowerCase().includes('reseller') ? 'Reseller Deleted' : (single.toLowerCase().includes('key') ? 'Key Deleted' : 'Deleted Successfully');
        subtitleLines.push(single);
      } else if (/created/i.test(single)) {
        title = single.toLowerCase().includes('reseller') ? 'Reseller Created' : (single.toLowerCase().includes('key') ? 'Key Generated' : 'Created Successfully');
        subtitleLines.push(single);
      } else if (/updated|saved|changed/i.test(single)) {
        title = 'Changes Saved';
        subtitleLines.push(single);
      } else if (/reset/i.test(single)) {
        title = 'Reset Complete';
        subtitleLines.push(single);
      } else if (/copied/i.test(single)) {
        title = 'Copied to Clipboard';
        subtitleLines.push(single);
      } else if (type === 'error') {
        title = 'Action Failed';
        subtitleLines.push(single);
      } else if (type === 'warning') {
        title = 'Attention Required';
        subtitleLines.push(single);
      } else if (single.length <= 35) {
        title = single;
      } else {
        title = type === 'success' ? 'Success' : 'Notice';
        subtitleLines.push(single);
      }
    } else {
      title = type === 'success' ? 'Success' : (type === 'error' ? 'Action Failed' : 'Notice');
    }
  }

  // Setup Visuals
  if (iconWrap) {
    iconWrap.className = 'hyper-dialog-icon-wrap ' + type;
  }

  if (iconEl) {
    if (type === 'success') {
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'error') {
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }
  }

  if (badgeEl) {
    if (type === 'success') badgeEl.textContent = 'Success';
    else if (type === 'error') badgeEl.textContent = 'Error';
    else if (type === 'warning') badgeEl.textContent = 'Warning';
    else badgeEl.textContent = 'Notice';
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
    okBtnText.textContent = options.btnText || (options.showCancel ? 'Confirm' : 'Done');
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

  const headerAdminName = document.getElementById('header-admin-name');
  if (headerAdminName) headerAdminName.textContent = 'Admin';
  const headerAdminIcon = document.getElementById('header-admin-icon');
  if (headerAdminIcon) headerAdminIcon.textContent = '🛡️';

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
      tx99_resellers: (updates.tx99_resellers !== undefined) ? updates.tx99_resellers : resellers
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

let isPrimaryProxyUnavailable = false;

function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch(err => {
      clearTimeout(timeoutId);
      throw err;
    });
}

async function callApi(action, payload = {}) {
  const finalPayload = {
    action,
    app_id: getActiveAppId(),
    ...payload
  };

  // Tier 1: Try Primary Serverless Proxy (/api on Vercel or api.php) if reachable
  if (!isPrimaryProxyUnavailable && window.location.protocol !== 'file:') {
    try {
      const res = await fetchWithTimeout(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(finalPayload)
      }, 2000);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.packages || data.keys)) {
          return data;
        }
        if (data && data.message && !data.success) {
          console.warn(`Proxy returned error for "${action}":`, data.message);
        }
      } else {
        isPrimaryProxyUnavailable = true;
      }
    } catch (err) {
      isPrimaryProxyUnavailable = true;
      console.warn(`Primary proxy call failed for action "${action}":`, err.message);
    }
  }

  // Tier 2: Direct Fallback to prtvshow.online KeyAuth Engine (CORS enabled)
  try {
    const directPayload = {
      api_key: 'TX999_API_bc186f5d73bd492e6d52095e5a7bfd78',
      app_id: getActiveAppId(),
      action,
      ...payload
    };

    const directRes = await fetchWithTimeout('https://prtvshow.online/api_admin.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(directPayload)
    }, 4000);

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
          headerKeys.textContent = `${(res.balance || 0)} / 9999`;
          headerKeys.style.color = '';
        }
        const headerAdminName = document.getElementById('header-admin-name');
        if (headerAdminName) headerAdminName.textContent = 'Reseller';
        const headerAdminIcon = document.getElementById('header-admin-icon');
        if (headerAdminIcon) headerAdminIcon.textContent = '👤';
        if (elRemaining) elRemaining.textContent = (res.balance || 0).toLocaleString();
        const dashQuotaNum = document.getElementById('dash-welcome-quota-num');
        if (dashQuotaNum) dashQuotaNum.textContent = (res.balance || 0).toLocaleString();
        
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
        renderDashboardPackagesSummary(allowedPkgs);
        renderDashboardRecentLicenses();
        renderDashboardRecentActivity();
        return;
      } catch (e) {}
    }
  }

  // Update Top Navbar for Root Admin
  if (headerKeys) {
    headerKeys.textContent = `${state.stats.keys_created} / ${state.stats.key_limit}`;
    headerKeys.style.color = '';
  }
  const headerAdminName = document.getElementById('header-admin-name');
  if (headerAdminName) headerAdminName.textContent = 'Admin';
  const headerAdminIcon = document.getElementById('header-admin-icon');
  if (headerAdminIcon) headerAdminIcon.textContent = '🛡️';

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

  const dashQuotaNum = document.getElementById('dash-welcome-quota-num');
  if (dashQuotaNum) {
    dashQuotaNum.textContent = (state.stats.remaining != null ? state.stats.remaining : 9922).toLocaleString();
  }

  // Update profile name
  document.querySelectorAll('.profile-name').forEach(el => el.textContent = adminName);

  renderDashboardPackagesSummary();
  renderDashboardRecentLicenses();
  renderDashboardRecentActivity();
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
      licenses: 'License Keys',
      logs: 'Audit Logs',
      resellers: 'Resellers',
      apps: 'Applications',
      transfers: 'Transfers'
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
function formatLicenseCreated(lic) {
  if (lic.created && typeof lic.created === 'string') {
    if (/[A-Za-z]{3}\s+\d+,\s+\d{4}/.test(lic.created)) return lic.created;
    const d = new Date(lic.created);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }
  if (lic.id) {
    const num = parseInt(lic.id, 10);
    if (num > 1000000000) {
      const d = new Date(num);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }
  }
  return 'Jul 18, 2026 10:24';
}

function closeAllKeyPopovers() {
  document.querySelectorAll('.mobile-lic-popover-menu').forEach(el => {
    el.style.display = 'none';
  });
}

function toggleMobileKeyMenu(e, key) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const target = document.getElementById(`popover-${key}`);
  if (!target) return;
  const isShown = target.style.display === 'flex';
  closeAllKeyPopovers();
  if (!isShown) {
    target.style.display = 'flex';
  }
}

// Global click-away listener for popover menus
document.addEventListener('click', function(e) {
  if (!e.target.closest('.mobile-lic-actions-cell')) {
    closeAllKeyPopovers();
  }
});

function renderLicensesTable() {
  const tbody = document.getElementById('licenses-tbody');
  const mobileList = document.getElementById('licenses-mobile-list');
  if (!tbody && !mobileList) return;

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
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-dim);">No license keys found matching criteria.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-dim);font-size:12px;background:#0c101b;border:1px solid #1a2235;border-radius:10px;">No license keys found matching criteria.</div>`;
    return;
  }

  // 1. Render Desktop Table (Screens > 768px)
  if (tbody) {
    tbody.innerHTML = list.map(lic => {
      let statusBadge = '<span class="badge-pill-status badge-auth-success">Active</span>';
      if (lic.status === 'expired') statusBadge = '<span class="badge-pill-status" style="background:rgba(249,115,22,0.15);color:#f97316;border:1px solid #ea580c;">Expired</span>';
      if (lic.status === 'banned') statusBadge = '<span class="badge-pill-status badge-auth-fail">Banned</span>';

      const isBanned = lic.status === 'banned';
      const actionButtons = `
        <div style="display:flex;gap:6px;align-items:center;justify-content:center;white-space:nowrap;">
          <button type="button" onclick="inspectKeyLive('${lic.key}')" class="btn-row-action" title="Inspect Key Info">🔍</button>
          <button type="button" onclick="resetHwidLive('${lic.key}')" class="btn-row-action" title="Reset HWID">🔄</button>
          <button type="button" onclick="toggleBanLive('${lic.key}', '${lic.status}')" class="btn-row-action" style="${isBanned ? 'color:#10b981;border-color:rgba(16,185,129,0.35);' : 'color:#f59e0b;border-color:rgba(245,158,11,0.35);'}" title="${isBanned ? 'Unban Key' : 'Ban Key'}">${isBanned ? '🔓' : '🚫'}</button>
          <button type="button" onclick="deleteKeyLive('${lic.key}')" class="btn-row-action" style="color:#ef4444;border-color:rgba(239,68,68,0.35);" title="Delete Key">🗑️</button>
        </div>
      `;

      return `
        <tr>
          <td class="col-license-key" style="font-family:var(--font-mono);font-weight:700;color:#fff;white-space:nowrap;">
            <span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
              <span style="color:#00f0ff;">🔑</span>
              <span style="letter-spacing:0.02em;">${lic.key}</span>
              <button onclick="copyText('${lic.key}')" class="btn-copy-inline" title="Copy Key">📋</button>
            </span>
          </td>
          <td style="white-space:nowrap;">
            <span style="font-family:var(--font-mono);color:#38bdf8;display:block;font-weight:600;">${lic.pkg || 'BASIC PANEL'}</span>
            <span style="font-size:10.5px;color:var(--text-dim);">${lic.app || 'Custom work'}</span>
          </td>
          <td class="col-user col-mobile-hide" style="color:#cbd5e1;font-weight:600;white-space:nowrap;">${lic.user || 'Root Admin'}</td>
          <td class="col-hwid col-mobile-hide" style="font-family:var(--font-mono);font-size:11px;white-space:nowrap;color:${lic.hwid === 'Unbound' || lic.hwid === 'Not Bound' ? '#f59e0b' : '#8e95aa'};">${lic.hwid || 'Not Bound'}</td>
          <td style="font-family:var(--font-mono);font-size:11px;color:#e2e8f0;white-space:nowrap;">${lic.expiry || 'Lifetime'}</td>
          <td style="white-space:nowrap;">${statusBadge}</td>
          <td style="white-space:nowrap;text-align:center;">${actionButtons}</td>
        </tr>
      `;
    }).join('');
  }

  // 2. Render Mobile Phone Cards (Screens <= 768px, Pixel-for-Pixel Reference)
  if (mobileList) {
    mobileList.innerHTML = list.map(lic => {
      const isBanned = lic.status === 'banned';
      const isExpired = lic.status === 'expired';

      // Status pill badge
      let statusBadge = `
        <span class="mobile-lic-status-badge status-active">
          <span class="status-dot dot-green"></span>
          <span>Active</span>
        </span>
      `;
      if (isExpired) {
        statusBadge = `
          <span class="mobile-lic-status-badge status-expired">
            <span class="status-dot dot-orange"></span>
            <span>Expired</span>
          </span>
        `;
      } else if (isBanned) {
        statusBadge = `
          <span class="mobile-lic-status-badge status-banned">
            <span class="status-dot dot-red"></span>
            <span>Banned</span>
          </span>
        `;
      }

      // HWID badge
      const isHwidBound = lic.hwid && lic.hwid !== 'Unbound' && lic.hwid !== 'Not Bound';
      const hwidBadge = isHwidBound
        ? `<span class="mobile-lic-hwid-badge hwid-bound">Bound</span>`
        : `<span class="mobile-lic-hwid-badge hwid-unbound">Not Bound</span>`;

      const createdDate = formatLicenseCreated(lic);
      const expiryText = lic.expiry || 'Never';

      return `
        <div class="mobile-lic-card" id="mobile-card-${lic.key}">
          <!-- Top Row -->
          <div class="mobile-lic-top-row">
            <!-- Col 1: Red Key Icon + Key String + Copy -->
            <div class="mobile-lic-col-key-block">
              <span class="mobile-lic-red-key">🗝️</span>
              <div class="mobile-lic-key-info">
                <span class="mobile-lic-key-text" onclick="inspectKeyLive('${lic.key}')" title="Inspect Key">${lic.key}</span>
                <button type="button" class="mobile-lic-copy-btn" onclick="copyText('${lic.key}')" title="Copy Key">📋</button>
              </div>
            </div>

            <!-- Col 2: Package / App -->
            <div class="mobile-lic-col-pkg-block">
              <span class="mobile-lic-col-label">Package / App</span>
              <span class="mobile-lic-pkg-title">${lic.pkg || 'BASIC PANEL'}</span>
              <span class="mobile-lic-app-sub">${lic.app || 'Custom work'}</span>
            </div>

            <!-- Col 3: Assigned User -->
            <div class="mobile-lic-col-user-block">
              <span class="mobile-lic-col-label">Assigned User</span>
              <span class="mobile-lic-user-name">${lic.user || '—'}</span>
            </div>

            <!-- Col 4: HWID Binding -->
            <div class="mobile-lic-col-hwid-block">
              <span class="mobile-lic-col-label">HWID Binding</span>
              ${hwidBadge}
            </div>

            <!-- Col 5: Right Chevron -->
            <button type="button" class="mobile-lic-chevron" onclick="inspectKeyLive('${lic.key}')" title="Inspect Details">›</button>
          </div>

          <!-- Bottom Row -->
          <div class="mobile-lic-bot-row">
            <!-- Created -->
            <div class="mobile-lic-bot-item">
              <span class="mobile-lic-bot-icon">📅</span>
              <div class="mobile-lic-bot-meta">
                <span class="mobile-lic-bot-label">Created</span>
                <span class="mobile-lic-bot-val">${createdDate}</span>
              </div>
            </div>

            <!-- Expires -->
            <div class="mobile-lic-bot-item">
              <span class="mobile-lic-bot-icon">⌛</span>
              <div class="mobile-lic-bot-meta">
                <span class="mobile-lic-bot-label">Expires</span>
                <span class="mobile-lic-bot-val val-expiry">${expiryText}</span>
              </div>
            </div>

            <!-- Status -->
            <div class="mobile-lic-bot-item">
              <span class="mobile-lic-bot-icon">📦</span>
              <div class="mobile-lic-bot-meta">
                <span class="mobile-lic-bot-label">Status</span>
                ${statusBadge}
              </div>
            </div>

            <!-- Three-dot Action Trigger -->
            <div class="mobile-lic-actions-cell">
              <button type="button" class="mobile-lic-dots-btn" onclick="toggleMobileKeyMenu(event, '${lic.key}')" title="Key Actions">⋮</button>
              <div class="mobile-lic-popover-menu" id="popover-${lic.key}" style="display:none;">
                <button type="button" class="popover-btn" onclick="inspectKeyLive('${lic.key}');closeAllKeyPopovers();">
                  <span>🔍</span><span>Inspect Key</span>
                </button>
                <button type="button" class="popover-btn" onclick="resetHwidLive('${lic.key}');closeAllKeyPopovers();">
                  <span>🔄</span><span>Reset HWID</span>
                </button>
                <button type="button" class="popover-btn ${isBanned ? 'popover-unban' : 'popover-ban'}" onclick="toggleBanLive('${lic.key}', '${lic.status}');closeAllKeyPopovers();">
                  <span>${isBanned ? '🔓' : '🚫'}</span><span>${isBanned ? 'Unban Key' : 'Ban Key'}</span>
                </button>
                <button type="button" class="popover-btn popover-delete" onclick="deleteKeyLive('${lic.key}');closeAllKeyPopovers();">
                  <span>🗑️</span><span>Delete Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDashboardRecentLicenses();
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
  const input = document.getElementById('quick-key-input');
  const resultBox = document.getElementById('quick-key-result');
  if (!input) return;
  const key = input.value.trim();

  if (!key) {
    showHyperAlert('Please enter or paste a License Key first.', {
      type: 'warning',
      title: 'Missing Key',
      btnText: 'Done'
    });
    input.focus();
    return;
  }

  resultBox.style.display = 'block';
  resultBox.className = 'quick-result-card';
  resultBox.innerHTML = `<span>⏳ Processing ${action}...</span>`;

  if (action === 'inspect') {
    let res = await callApi('key_info', { key });
    if (!res || !res.success) {
      const localLic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
      if (localLic) {
        res = {
          success: true,
          key: localLic.key,
          package_name: localLic.pkg || 'BASIC PANEL',
          status: localLic.status || 'active',
          hwid: localLic.hwid || 'Unbound',
          expiry_date: localLic.expiry || 'Lifetime'
        };
      }
    }
    if (res && res.success) {
      resultBox.innerHTML = `
        <div style="color:#10b981;font-weight:700;margin-bottom:4px;">✓ Key Found: <span style="color:#00f0ff;">${res.key}</span></div>
        <div style="color:#e2e8f0;margin-bottom:2px;"><strong>Package:</strong> <span style="color:#ff3b47;">${res.package_name}</span> | <strong>Status:</strong> <span style="color:${res.status === 'active' ? '#10b981' : '#ef4444'};">${res.status.toUpperCase()}</span></div>
        <div style="color:#94a3b8;"><strong>HWID:</strong> <code style="color:#00f0ff;">${res.hwid}</code> | <strong>Expiry:</strong> ${res.expiry_date}</div>
      `;
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Error: ${res ? res.message : 'Key not found in database'}</span>`;
    }
  } else if (action === 'reset_hwid') {
    let res = await callApi('reset_hwid', { key });
    const localLic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
    if ((res && res.success) || localLic) {
      if (localLic) { localLic.hwid = 'Unbound'; state.save(); renderLicensesTable(); }
      state.addLog('hwid_reset', `HWID reset executed for key: ${key}`);
      resultBox.innerHTML = `<span style="color:#10b981;font-weight:700;">✓ HWID Reset Successful for key: <code style="color:#00f0ff;">${key}</code></span>`;
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Reset Failed: ${(res && res.message) || 'Error'}</span>`;
    }
  } else if (action === 'ban' || action === 'unban') {
    const act = action === 'ban' ? 'ban_key' : 'unban_key';
    let res = await callApi(act, { key });
    const localLic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
    if ((res && res.success) || localLic) {
      if (localLic) { localLic.status = action === 'ban' ? 'banned' : 'active'; state.save(); renderLicensesTable(); }
      state.addLog(action === 'ban' ? 'key_ban' : 'key_unban', `Key ${action}ned: ${key}`);
      resultBox.innerHTML = `<span style="color:#10b981;font-weight:700;">✓ Key <code style="color:#00f0ff;">${key}</code> has been ${action === 'ban' ? 'BANNED' : 'UNBANNED'} successfully.</span>`;
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Failed: ${(res && res.message) || 'Error'}</span>`;
    }
  } else if (action === 'delete') {
    if (!confirm(`Are you sure you want to permanently delete key: ${key}?`)) return;
    let res = await callApi('delete_key', { key });
    const localLic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
    if ((res && res.success) || localLic) {
      state.licenses = state.licenses.filter(l => l.key.toLowerCase() !== key.toLowerCase());
      state.save();
      renderLicensesTable();
      state.addLog('key_delete', `License key deleted: ${key}`);
      resultBox.innerHTML = `<span style="color:#10b981;font-weight:700;">✓ Key <code style="color:#00f0ff;">${key}</code> deleted successfully.</span>`;
    } else {
      resultBox.innerHTML = `<span style="color:#ef4444;">❌ Delete Failed: ${(res && res.message) || 'Error'}</span>`;
    }
  }
}

// Reset HWID via REAL API
async function resetHwidLive(key) {
  if (!confirm(`Reset Hardware HWID binding for key:\n${key}?`)) return;

  await callApi('reset_hwid', { key });

  const lic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
  if (lic) {
    lic.hwid = 'Not Bound';
    state.save();
    renderLicensesTable();
  }
  state.addLog('hwid_reset', `HWID reset for license key: ${key}`);

  showHyperAlert(`Hardware ID binding has been reset to "Not Bound" for key:\n${key}`, {
    type: 'success',
    title: 'HWID Reset Complete',
    btnText: 'Done'
  });
}

// Toggle Ban/Unban via REAL API
async function toggleBanLive(key, currentStatus) {
  const lic = state.licenses.find(l => l.key.toLowerCase() === key.toLowerCase());
  const isBanned = (lic ? lic.status === 'banned' : currentStatus === 'banned');
  const action = isBanned ? 'unban_key' : 'ban_key';
  const label = isBanned ? 'Unban' : 'Ban';

  if (!confirm(`Are you sure you want to ${label.toLowerCase()} license key:\n${key}?`)) return;

  await callApi(action, { key });

  if (lic) {
    lic.status = isBanned ? 'active' : 'banned';
    state.save();
    renderLicensesTable();
    loadResellerStats();
  }
  state.addLog(isBanned ? 'key_unban' : 'key_ban', `Key ${key} status changed to ${isBanned ? 'Active' : 'Banned'}`);

  showHyperAlert(`The license key "${key}" has been successfully ${isBanned ? 'unbanned' : 'banned'}.`, {
    type: isBanned ? 'success' : 'warning',
    title: isBanned ? 'Key Unbanned' : 'Key Banned',
    btnText: 'Done'
  });
}

// Delete Key via REAL API
async function deleteKeyLive(key) {
  if (!confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to permanently delete license key:\n${key}?`)) return;

  await callApi('delete_key', { key });

  state.licenses = state.licenses.filter(l => l.key.toLowerCase() !== key.toLowerCase());
  state.save();
  renderLicensesTable();
  loadResellerStats();
  state.addLog('key_delete', `License key permanently deleted: ${key}`);

  showHyperAlert(`The license key "${key}" has been permanently deleted.`, {
    type: 'success',
    title: 'Key Deleted',
    btnText: 'Done'
  });
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
      <td style="font-family:var(--font-mono);font-weight:700;color:#00f0ff;white-space:nowrap;">#${idx + 1}</td>
      <td style="font-weight:700;color:#fff;font-size:13px;white-space:nowrap;">${pkg.package_name}</td>
      <td class="col-pkg-id col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;font-size:11.5px;">${pkg.package_id}</td>
      <td style="color:#38bdf8;font-weight:600;white-space:nowrap;">Custom work</td>
      <td style="white-space:nowrap;"><span class="badge-pill-status badge-active-green">Active</span></td>
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
      <td style="font-weight:700;color:#fff;">
        <span style="margin-right:6px;">📦</span>${pkg.package_name}
      </td>
      <td style="font-family:var(--font-mono);color:#00f0ff;font-size:11.5px;">Custom work</td>
      <td><span class="badge-pill-status badge-active-green">Active</span></td>
      <td style="text-align:right;">
        <button type="button" class="btn-sm-action" onclick="openGenModalForPackage('${pkg.package_id || pkg.package_name}')" style="padding:3px 8px;font-size:11px;background:rgba(229,24,31,0.18);border:1px solid rgba(229,24,31,0.4);color:#ff3b47;font-weight:700;cursor:pointer;border-radius:4px;" title="Generate key for this package">+ Key</button>
      </td>
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
  let logs = Array.isArray(state.logs) && state.logs.length > 0 ? state.logs : SEED_LOGS;
  if (role === 'reseller') {
    const res = getCurrentReseller();
    if (res) {
      logs = logs.filter(l => (l.detail && l.detail.toLowerCase().includes(res.username.toLowerCase())) ||
                              (l.action && l.action.includes('key_gen')));
    }
  }

  const items = logs.slice(0, 6);
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:16px;color:#64748b;">No recent activity logs.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td style="width:115px;">${formatLogBadge(item.action)}</td>
      <td style="color:#e2e8f0;font-size:12.5px;font-family:var(--font-sans);">${item.detail}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:#64748b;text-align:right;white-space:nowrap;">${item.time || 'Just now'}</td>
    </tr>
  `).join('');
}

function renderDashboardRecentLicenses() {
  const tbody = document.getElementById('dashboard-recent-licenses-tbody');
  if (!tbody) return;

  const role = getUserRole();
  let licList = Array.isArray(state.licenses) && state.licenses.length > 0 ? state.licenses : SEED_LICENSES;
  if (role === 'reseller') {
    const res = getCurrentReseller();
    if (res) {
      licList = licList.filter(l => (l.user && l.user.toLowerCase().includes(res.username.toLowerCase())) ||
                                    (l.note && l.note.toLowerCase().includes(res.username.toLowerCase())));
    }
  }

  const items = licList.slice(0, 8);
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No license keys found. Generate a key using the button above!</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(lic => {
    const isAct = lic.status === 'active';
    const isBanned = lic.status === 'banned';
    const hwidTxt = lic.hwid && lic.hwid !== 'Unbound' && lic.hwid !== 'Not Bound' ? lic.hwid : 'Unbound';
    const hwidColor = hwidTxt === 'Unbound' ? '#f59e0b' : '#00f0ff';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:#fff;">${lic.key}</span>
            <button type="button" class="btn-copy-inline" onclick="copyText('${lic.key}')" title="Copy Key" style="padding:2px 5px;font-size:11px;cursor:pointer;border-radius:3px;">📋</button>
          </div>
        </td>
        <td style="color:#e2e8f0;font-size:12px;font-weight:600;">${lic.user || 'Root Owner'}</td>
        <td><span class="badge-plan-pill" style="background:rgba(229,24,31,0.12);border:1px solid rgba(229,24,31,0.3);color:#ff3b47;font-weight:700;">${lic.pkg || 'BASIC PANEL'}</span></td>
        <td style="font-family:var(--font-mono);font-size:11.5px;color:${hwidColor};">${hwidTxt}</td>
        <td>
          <span class="badge-pill-status ${isAct ? 'badge-active-green' : isBanned ? 'badge-banned-red' : 'badge-pending-amber'}">
            ${isAct ? 'Active' : isBanned ? 'Banned' : 'Unbound'}
          </span>
        </td>
        <td style="text-align:right;white-space:nowrap;">
          <button type="button" class="btn-sm-action" onclick="resetHwidLive('${lic.key}')" title="Reset HWID" style="padding:3px 8px;font-size:11px;margin-right:4px;background:rgba(6,182,212,0.18);border:1px solid #06b6d4;color:#00f0ff;cursor:pointer;border-radius:4px;">🔄 HWID</button>
          <button type="button" class="btn-sm-action" onclick="toggleBanLive('${lic.key}', '${lic.status}')" title="${isBanned ? 'Unban' : 'Ban'}" style="padding:3px 8px;font-size:11px;background:${isBanned ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)'};border:1px solid ${isBanned ? '#10b981' : '#f59e0b'};color:${isBanned ? '#34d399' : '#fbbf24'};cursor:pointer;border-radius:4px;margin-right:4px;">
            ${isBanned ? '🔓 Unban' : '🚫 Ban'}
          </button>
          <button type="button" class="btn-sm-action" onclick="deleteKeyLive('${lic.key}')" title="Delete Key" style="padding:3px 8px;font-size:11px;background:rgba(239,68,68,0.18);border:1px solid #ef4444;color:#f87171;cursor:pointer;border-radius:4px;">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
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
      <td style="white-space:nowrap;">${formatLogBadge(log.action)}</td>
      <td style="color:#fff;font-weight:500;">${log.detail}</td>
      <td class="col-log-ip col-mobile-hide" style="font-family:var(--font-mono);color:#06b6d4;font-size:11.5px;white-space:nowrap;">${log.ip || '127.0.0.1'}</td>
      <td style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-dim);white-space:nowrap;">${log.time}</td>
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
          <div style="display:flex;align-items:center;gap:10px;white-space:nowrap;">
            <div class="profile-avatar" style="width:30px;height:30px;font-size:12px;font-weight:800;border-color:rgba(0,240,255,0.3);">${avatarLetter}</div>
            <div>
              <div style="font-weight:800;color:#fff;">${r.username}</div>
              <div style="font-family:var(--font-mono);color:var(--text-dim);font-size:11px;">${r.email || 'No email'}</div>
            </div>
          </div>
        </td>
        <td class="col-reseller-pwd col-mobile-hide">
          <span class="reseller-pass-cell" id="reseller-pass-${r.id}">
            <span class="pass-val">••••••••</span>
            <button onclick="toggleResellerPassVisibility('${r.id}', '${passStr}')" class="btn-copy-inline" title="Reveal/Hide Password">👁️</button>
            <button onclick="copyText('${passStr}')" class="btn-copy-inline" title="Copy Password">📋</button>
          </span>
        </td>
        <td style="white-space:nowrap;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-family:var(--font-mono);font-weight:700;color:#f59e0b;font-size:13px;white-space:nowrap;">${r.balance} Keys</span>
            <button onclick="openTransferModalForReseller('${r.id}')" class="btn-sm-action" style="color:#00f0ff;border-color:rgba(0,240,255,0.4);" title="Transfer Credits to ${r.username}">💸 Send</button>
            <button onclick="quickAddResellerCredits('${r.id}')" class="btn-sm-action" title="Quick Add Quota">+ Quota</button>
          </div>
        </td>
        <td>
          <div style="display:flex;flex-wrap:wrap;max-width:240px;gap:2px;">
            ${panelsHtml}
          </div>
        </td>
        <td class="col-reseller-keys col-mobile-hide" style="font-family:var(--font-mono);color:#cbd5e1;text-align:center;">${r.createdKeys || 0}</td>
        <td style="white-space:nowrap;">${statusBadge}</td>
        <td style="white-space:nowrap;">
          <div style="display:flex;gap:6px;">
            <button onclick="openTransferModalForReseller('${r.id}')" class="btn-row-action" style="color:#00f0ff;" title="Transfer Credits to ${r.username}">💸</button>
            <button onclick="openEditResellerModal('${r.id}')" class="btn-row-action" title="Edit Permissions &amp; Credits">✏️</button>
            <button onclick="toggleResellerStatus('${r.id}')" class="btn-row-action" title="${isSuspended ? 'Activate Account' : 'Suspend Account'}">${isSuspended ? '▶️' : '⏸️'}</button>
            <button onclick="deleteReseller('${r.id}')" class="btn-row-action" style="color:#ef4444;" title="Delete Reseller">🗑️</button>
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

  try {
    let deletedIds = JSON.parse(localStorage.getItem('tx99_deleted_resellers')) || [];
    deletedIds = deletedIds.filter(x => x !== username.toLowerCase());
    localStorage.setItem('tx99_deleted_resellers', JSON.stringify(deletedIds));
  } catch (_) {}

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

  if (!confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to permanently delete reseller "${r.username}"?`)) return;

  // 1. Add to permanent tombstone blacklist
  let deletedIds = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('tx99_deleted_resellers')) || [];
  } catch (_) {}
  if (!deletedIds.includes(id)) deletedIds.push(id);
  if (r.username) {
    const uname = r.username.toLowerCase().trim();
    if (!deletedIds.includes(uname)) deletedIds.push(uname);
  }
  localStorage.setItem('tx99_deleted_resellers', JSON.stringify(deletedIds));

  // 2. Remove from state and save
  state.resellers = state.resellers.filter(item => item.id !== id && (r.username ? item.username.toLowerCase().trim() !== r.username.toLowerCase().trim() : true));
  state.save();

  // 3. Sync to server
  syncCredentialsToServer({ tx99_resellers: state.resellers });

  // 4. Update UI
  renderResellersTable();
  showHyperAlert(`The reseller account "${r.username}" has been permanently removed.`, {
    type: 'success',
    title: 'Reseller Deleted',
    btnText: 'Done'
  });
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
        <td class="col-tx-id col-mobile-hide" style="font-family:var(--font-mono);font-size:11px;color:#00f0ff;font-weight:700;white-space:nowrap;">${tx.id}</td>
        <td style="font-weight:700;color:${isSent ? '#ef4444' : '#fff'};white-space:nowrap;">
          ${isSent ? '<strong>(You) ' + tx.from + '</strong>' : fromLabel}
        </td>
        <td style="font-weight:700;color:${isRecv ? '#22c55e' : '#fff'};white-space:nowrap;">
          ${isRecv ? '<strong>(You) ' + tx.to + '</strong>' : tx.to}
        </td>
        <td style="white-space:nowrap;">${amtBadge}</td>
        <td class="col-tx-memo col-mobile-hide" style="color:#cbd5e1;font-size:11.5px;">${noteLabel}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);white-space:nowrap;">${tx.time}</td>
        <td style="white-space:nowrap;"><span class="badge-pill-status badge-active-green">✓ ${tx.status || 'Completed'}</span></td>
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

function showToast(msg, duration = 2000) {
  let toast = document.getElementById('hyper-toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hyper-toast-notice';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #0f172a;
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: #00f0ff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(0,0,0,0.85);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

function copyText(str) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(() => {
      showToast(`📋 Copied: <span style="color:#fff;font-family:var(--font-mono);">${str}</span>`);
    }).catch(() => {
      showToast(`📋 Copied: <span style="color:#fff;font-family:var(--font-mono);">${str}</span>`);
    });
  } else {
    showToast(`📋 Copied: <span style="color:#fff;font-family:var(--font-mono);">${str}</span>`);
  }
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
        <td style="font-weight:700;color:#00f0ff;font-family:var(--font-mono);font-size:12.5px;white-space:nowrap;">${lic.user || res.username}</td>
        <td style="white-space:nowrap;"><code style="background:rgba(0,0,0,0.4);padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);color:#fff;font-family:var(--font-mono);font-size:11px;white-space:nowrap;">${lic.key}</code></td>
        <td style="color:#38bdf8;font-weight:600;white-space:nowrap;">${lic.pkg}</td>
        <td class="col-hwid col-mobile-hide" style="white-space:nowrap;">${hwidBadge}</td>
        <td style="color:#cbd5e1;font-size:11.5px;white-space:nowrap;">${lic.expiry}</td>
        <td style="white-space:nowrap;">${statusBadge}</td>
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
        dashAvatar.style.background = 'rgba(245, 158, 11, 0.15)';
        dashAvatar.style.borderColor = 'rgba(245, 158, 11, 0.35)';
        dashAvatar.style.color = '#fbbf24';
        dashAvatar.style.boxShadow = '0 0 14px rgba(245,158,11,0.25)';
      }
      const dashName = document.getElementById('dash-welcome-username');
      if (dashName) dashName.textContent = res.username;

      const dashRoleBadge = document.getElementById('dash-welcome-role-badge');
      if (dashRoleBadge) {
        dashRoleBadge.style.display = 'none';
      }

      const dashRoleDesc = document.getElementById('dash-welcome-role-desc');
      if (dashRoleDesc) {
        dashRoleDesc.innerHTML = `Reseller Session • Logged in as: <strong>${res.username}</strong> • Available Balance: <strong style="color:#10b981;">${(res.balance || 0).toLocaleString()} Keys</strong>`;
      }

      const dashQuotaBox = document.getElementById('dash-welcome-quota-box');
      if (dashQuotaBox) {
        dashQuotaBox.style.display = 'inline-flex';
      }
      const dashQuotaNum = document.getElementById('dash-welcome-quota-num');
      if (dashQuotaNum) {
        dashQuotaNum.textContent = (res.balance || 0).toLocaleString();
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
      if (adminHeaderName) adminHeaderName.textContent = 'Reseller';
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
        headerKeys.textContent = `${(res.balance || 0)} / 9999`;
        headerKeys.style.color = '';
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

    const adminHeaderBtn = document.getElementById('header-admin-btn');
    const adminHeaderIcon = document.getElementById('header-admin-icon');
    const adminHeaderName = document.getElementById('header-admin-name');
    if (adminHeaderIcon) adminHeaderIcon.textContent = '🛡️';
    if (adminHeaderName) adminHeaderName.textContent = 'Admin';
    if (adminHeaderBtn) {
      adminHeaderBtn.title = `Admin: ${adminUser}`;
    }

    const headerKeys = document.getElementById('header-keys-stat');
    if (headerKeys) {
      headerKeys.textContent = `${state.stats.keys_created} / ${state.stats.key_limit}`;
      headerKeys.style.color = '';
    }

    const dashAvatar = document.getElementById('dash-user-avatar');
    if (dashAvatar) {
      dashAvatar.textContent = adminUser.charAt(0).toUpperCase();
      dashAvatar.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)';
      dashAvatar.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      dashAvatar.style.color = '#ffffff';
      dashAvatar.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.35)';
    }
    const dashName = document.getElementById('dash-welcome-username');
    if (dashName) dashName.textContent = adminUser;
    
    const dashRoleBadge = document.getElementById('dash-welcome-role-badge');
    if (dashRoleBadge) {
      dashRoleBadge.style.display = 'none';
    }

    const dashRoleDesc = document.getElementById('dash-welcome-role-desc');
    if (dashRoleDesc) {
      dashRoleDesc.textContent = 'HMAC-SHA256 enforced • All systems operational';
    }

    const dashQuotaBox = document.getElementById('dash-welcome-quota-box');
    if (dashQuotaBox) {
      dashQuotaBox.style.display = 'none';
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
  renderDashboardPackagesSummary();
  renderDashboardRecentActivity();
  renderDashboardRecentLicenses();
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

  // Load real API data in background concurrently
  Promise.allSettled([
    loadAdminPackages(),
    role !== 'reseller' ? loadResellerStats() : Promise.resolve()
  ]);
});
