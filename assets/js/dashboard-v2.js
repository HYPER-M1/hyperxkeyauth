/**
 * HYPERM SHOP // LICENSE KEYS V2 ENGINE & CONTROLLER
 * Dedicated KeyAuth License V2 Configuration & Slot Integration
 * 
 * Separate KeyAuth Configuration for V2 Panel (AIMKILL PVT V2 / STREAMER X):
 * - Application Name: Hyperm575's Application
 * - Owner ID: gyREPmpEjt
 * - App Secret: d605b8eadacea9d15bfe187428efacb531d00a94db656f9017182e9e47def363
 * - Version: 1.0
 * - API URL: https://keyauth.win/api/1.3/
 */

(function () {
  'use strict';

  // Dedicated KeyAuth V2 Configuration
  const KEYAUTH_V2_CONFIG = {
    appName: "Hyperm575's Application",
    ownerId: "gyREPmpEjt",
    secret: "d605b8eadacea9d15bfe187428efacb531d00a94db656f9017182e9e47def363",
    version: "1.0",
    apiUrl: "https://keyauth.win/api/1.3/",
    supportedPackages: ["AIMKILL PVT V2", "STREAMER X"]
  };

  // Seed default V2 licenses fallback
  const SEED_LICENSES_V2 = [
    {
      id: 'v2_1792900000001',
      key: 'HX2-AIMK-9921-A7B8-44CD',
      app: KEYAUTH_V2_CONFIG.appName,
      pkg: 'AIMKILL PVT V2',
      user: 'Root_Owner_V2',
      hwid: 'Not Bound',
      expiry: 'Lifetime Access',
      status: 'active',
      note: 'KeyAuth V2 Official Engine - Initial Master Key',
      resellerId: 'owner'
    },
    {
      id: 'v2_1792900000002',
      key: 'HX2-STRM-3312-C899-22FA',
      app: KEYAUTH_V2_CONFIG.appName,
      pkg: 'STREAMER X',
      user: 'Streamer_Pro',
      hwid: 'Not Bound',
      expiry: '30 Days',
      status: 'active',
      note: 'Generated via V2 API slot',
      resellerId: 'owner'
    }
  ];

  // Helper: Merge incoming server licenses with local state cleanly without losing keys
  function mergeV2Licenses(serverList) {
    if (!Array.isArray(serverList)) return;
    if (!window.state) window.state = {};
    if (!Array.isArray(window.state.licenses_v2)) window.state.licenses_v2 = [];

    const map = new Map();
    // 1. Add server keys as source of truth
    serverList.forEach(lic => {
      if (lic && lic.key) map.set(lic.key.toLowerCase(), lic);
    });

    // 2. Keep any locally generated keys that might still be syncing
    window.state.licenses_v2.forEach(lic => {
      if (lic && lic.key && !map.has(lic.key.toLowerCase())) {
        map.set(lic.key.toLowerCase(), lic);
      }
    });

    window.state.licenses_v2 = Array.from(map.values());
    try {
      localStorage.setItem('tx99_licenses_v2', JSON.stringify(window.state.licenses_v2));
    } catch (_) {}
  }

  // Live Cloud Synchronization: Fetch authoritative V2 keys from backend & cloud
  async function syncLicensesV2FromServer() {
    let serverLicenses = null;

    // 1. Try authenticated backend API
    try {
      if (typeof window.callApi === 'function') {
        const res = await window.callApi('get_licenses_v2', {});
        if (res && res.success && Array.isArray(res.licenses) && res.licenses.length > 0) {
          serverLicenses = res.licenses;
        }
      }
    } catch (_) {}

    // 2. Direct fallback to /api/data GitHub persistence
    if (!serverLicenses || serverLicenses.length === 0) {
      try {
        const resp = await fetch('/api/data', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.tx99_licenses_v2) && data.tx99_licenses_v2.length > 0) {
            serverLicenses = data.tx99_licenses_v2;
          }
        }
      } catch (_) {}
    }

    if (Array.isArray(serverLicenses) && serverLicenses.length > 0) {
      mergeV2Licenses(serverLicenses);
      renderLicensesV2Table();
    }
  }

  // Push V2 state to cloud storage for cross-device & cross-logout persistence
  function syncV2ToCloud() {
    try {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx99_licenses_v2: window.state ? (window.state.licenses_v2 || []) : []
        })
      }).catch(function () {});
    } catch (_) {}
  }

  // Initialize or bind V2 state into global state
  function initV2State() {
    if (!window.state) return;

    let stored = [];
    try {
      const raw = localStorage.getItem('tx99_licenses_v2');
      if (raw) stored = JSON.parse(raw);
    } catch (_) {}

    window.state.licenses_v2 = (Array.isArray(stored) && stored.length > 0) ? stored : SEED_LICENSES_V2;
    window.state.activeFilterV2 = 'all';
    window.state.searchQueryV2 = '';

    // Wrap save method to persist V2 licenses
    const origSave = window.state.save ? window.state.save.bind(window.state) : null;
    window.state.save = function () {
      try {
        localStorage.setItem('tx99_licenses_v2', JSON.stringify(this.licenses_v2 || []));
      } catch (_) {}
      if (origSave) origSave();
    };

    // Immediately trigger server sync
    syncLicensesV2FromServer();
  }

  // Hook into switchTab
  function hookSwitchTab() {
    const origSwitchTab = window.switchTab;
    window.switchTab = function (tabId) {
      if (tabId === 'licenses-v2') {
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav-link').forEach(n => n.classList.remove('active'));

        const view = document.getElementById('view-licenses-v2');
        const nav = document.getElementById('nav-licenses-v2');

        if (view) view.classList.add('active');
        if (nav) nav.classList.add('active');

        const titleEl = document.getElementById('page-title-display');
        if (titleEl) titleEl.textContent = 'License Keys v2';

        renderLicensesV2Table();
        syncLicensesV2FromServer(); // Auto-refresh table with latest server status

        if (typeof window.closeMobileSidebar === 'function') {
          window.closeMobileSidebar();
        }
        return;
      }

      if (typeof origSwitchTab === 'function') {
        origSwitchTab(tabId);
      }
    };
  }

  // Render V2 licenses table (Desktop & Mobile)
  window.renderLicensesV2Table = function () {
    const tbody = document.getElementById('licenses-v2-tbody');
    const mobileList = document.getElementById('licenses-v2-mobile-list');
    if (!tbody && !mobileList) return;

    if (!window.state || !Array.isArray(window.state.licenses_v2)) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-dim);">No V2 license keys found.</td></tr>`;
      return;
    }

    let list = [...window.state.licenses_v2];

    if (window.state.activeFilterV2 && window.state.activeFilterV2 !== 'all') {
      list = list.filter(l => l.status === window.state.activeFilterV2);
    }

    if (window.state.searchQueryV2) {
      const q = window.state.searchQueryV2.toLowerCase();
      list = list.filter(l =>
        (l.key && l.key.toLowerCase().includes(q)) ||
        (l.user && l.user.toLowerCase().includes(q)) ||
        (l.pkg && l.pkg.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-dim);">No V2 license keys found matching criteria.</td></tr>`;
      if (mobileList) mobileList.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-dim);font-size:12px;background:#0c101b;border:1px solid #1a2235;border-radius:10px;">No V2 license keys found matching criteria.</div>`;
      return;
    }

    // 1. Desktop Table
    if (tbody) {
      tbody.innerHTML = list.map(lic => {
        let statusBadge = '<span class="badge-pill-status badge-auth-success">Active</span>';
        if (lic.status === 'expired') statusBadge = '<span class="badge-pill-status" style="background:rgba(249,115,22,0.15);color:#f97316;border:1px solid #ea580c;">Expired</span>';
        if (lic.status === 'banned') statusBadge = '<span class="badge-pill-status badge-auth-fail">Banned</span>';

        const isBanned = lic.status === 'banned';
        const actionButtons = `
          <div style="display:flex;gap:6px;align-items:center;justify-content:center;white-space:nowrap;">
            <button type="button" onclick="inspectKeyV2Live('${lic.key}')" class="btn-row-action" title="Inspect Key Info">🔍</button>
            <button type="button" onclick="resetHwidV2Live('${lic.key}')" class="btn-row-action" title="Reset HWID">🔄</button>
            <button type="button" onclick="toggleBanV2Live('${lic.key}', '${lic.status}')" class="btn-row-action" style="${isBanned ? 'color:#10b981;border-color:rgba(16,185,129,0.35);' : 'color:#f59e0b;border-color:rgba(245,158,11,0.35);'}" title="${isBanned ? 'Unban Key' : 'Ban Key'}">${isBanned ? '🔓' : '🚫'}</button>
            <button type="button" onclick="deleteKeyV2Live('${lic.key}')" class="btn-row-action" style="color:#ef4444;border-color:rgba(239,68,68,0.35);" title="Delete Key">🗑️</button>
          </div>
        `;

        return `
          <tr>
            <td class="col-license-key" style="font-family:var(--font-mono);font-weight:700;color:#fff;white-space:nowrap;">
              <span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
                <span style="color:#10b981;">🛡️</span>
                <span style="letter-spacing:0.02em;">${lic.key}</span>
                <button onclick="copyText('${lic.key}')" class="btn-copy-inline" title="Copy Key">📋</button>
              </span>
            </td>
            <td style="white-space:nowrap;">
              <span style="font-family:var(--font-mono);color:#34d399;display:block;font-weight:600;">${lic.pkg || 'AIMKILL PVT V2'}</span>
              <span style="font-size:10.5px;color:var(--text-dim);">${lic.app || KEYAUTH_V2_CONFIG.appName}</span>
            </td>
            <td class="col-user col-mobile-hide" style="color:#cbd5e1;font-weight:600;white-space:nowrap;">${lic.user || 'Client_V2'}</td>
            <td class="col-hwid col-mobile-hide" style="font-family:var(--font-mono);font-size:11px;white-space:nowrap;color:${lic.hwid === 'Unbound' || lic.hwid === 'Not Bound' ? '#f59e0b' : '#8e95aa'};">${lic.hwid || 'Not Bound'}</td>
            <td style="font-family:var(--font-mono);font-size:11px;color:#e2e8f0;white-space:nowrap;">${lic.expiry || 'Lifetime Access'}</td>
            <td style="white-space:nowrap;">${statusBadge}</td>
            <td style="white-space:nowrap;text-align:center;">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    }

    // 2. Mobile Cards
    if (mobileList) {
      mobileList.innerHTML = list.map(lic => {
        const isBanned = lic.status === 'banned';
        let statusBadge = `
          <span class="mobile-lic-status-badge status-active">
            <span class="status-dot dot-green"></span>
            <span>Active</span>
          </span>
        `;
        if (lic.status === 'expired') {
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

        return `
          <div class="mobile-lic-card">
            <div class="mobile-lic-header">
              <span class="mobile-lic-pkg">${lic.pkg || 'AIMKILL PVT V2'}</span>
              ${statusBadge}
            </div>
            <div class="mobile-lic-key-row">
              <span class="mobile-lic-key-val">${lic.key}</span>
              <button class="mobile-lic-copy-btn" onclick="copyText('${lic.key}')" title="Copy Key">📋</button>
            </div>
            <div class="mobile-lic-meta-grid">
              <div class="mobile-lic-meta-item">
                <span class="meta-label">User</span>
                <span class="meta-val">${lic.user || 'Client_V2'}</span>
              </div>
              <div class="mobile-lic-meta-item">
                <span class="meta-label">HWID</span>
                <span class="meta-val ${lic.hwid === 'Not Bound' || lic.hwid === 'Unbound' ? 'val-unbound' : 'val-bound'}">${lic.hwid || 'Not Bound'}</span>
              </div>
              <div class="mobile-lic-meta-item">
                <span class="meta-label">Duration</span>
                <span class="meta-val">${lic.expiry || 'Lifetime Access'}</span>
              </div>
              <div class="mobile-lic-meta-item">
                <span class="meta-label">App</span>
                <span class="meta-val">${lic.app || KEYAUTH_V2_CONFIG.appName}</span>
              </div>
            </div>
            <div class="mobile-lic-actions">
              <button class="mobile-btn-action" onclick="inspectKeyV2Live('${lic.key}')" title="Inspect">🔍 Inspect</button>
              <button class="mobile-btn-action" onclick="resetHwidV2Live('${lic.key}')" title="Reset HWID">🔄 HWID</button>
              <button class="mobile-btn-action ${isBanned ? 'btn-unban' : 'btn-ban'}" onclick="toggleBanV2Live('${lic.key}', '${lic.status}')" title="${isBanned ? 'Unban' : 'Ban'}">${isBanned ? '🔓 Unban' : '🚫 Ban'}</button>
              <button class="mobile-btn-action btn-del" onclick="deleteKeyV2Live('${lic.key}')" title="Delete">🗑️ Delete</button>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  // Filter Handler for V2
  window.setFilterV2 = function (filter, btn) {
    if (!window.state) return;
    window.state.activeFilterV2 = filter;
    document.querySelectorAll('.v2-filter-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = 'rgba(255,255,255,0.08)';
      b.style.background = '#0d1322';
      b.style.color = 'var(--text-dim)';
    });
    if (btn) {
      btn.classList.add('active');
      btn.style.borderColor = 'var(--accent-cyan)';
      btn.style.background = 'rgba(6,182,212,0.12)';
      btn.style.color = '#fff';
    }
    renderLicensesV2Table();
  };

  // Search Handler for V2
  window.handleSearchV2 = function (val) {
    if (!window.state) return;
    window.state.searchQueryV2 = (val || '').trim();
    renderLicensesV2Table();
  };

  // Key generation for V2
  window.submitGenerateKeysV2 = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const pkgSelect = document.getElementById('gen-v2-package-select');
    const user = (document.getElementById('gen-v2-user-input')?.value || 'Client_V2').trim();
    const days = parseInt(document.getElementById('gen-v2-days-select')?.value, 10) || 0;
    const count = Math.min(50, Math.max(1, parseInt(document.getElementById('gen-v2-count-input')?.value, 10) || 1));
    const pkgName = pkgSelect ? pkgSelect.options[pkgSelect.selectedIndex]?.text : 'AIMKILL PVT V2';
    const btn = document.getElementById('btn-submit-generate-v2');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Generating V2 Keys...';
    }

    const generatedKeys = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < count; i++) {
      const seg = () => {
        let s = '';
        for (let j = 0; j < 4; j++) {
          s += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return s;
      };
      generatedKeys.push(`HX2-${seg()}-${seg()}-${seg()}-${seg()}`);
    }

    const expiryText = days === 0 ? 'Lifetime Access' : `${days} Days`;
    if (!window.state) window.state = {};
    if (!Array.isArray(window.state.licenses_v2)) window.state.licenses_v2 = [];

    generatedKeys.forEach((keyStr, idx) => {
      window.state.licenses_v2.unshift({
        id: 'v2_' + Date.now().toString() + idx,
        key: keyStr,
        app: KEYAUTH_V2_CONFIG.appName,
        pkg: pkgName,
        user: count > 1 ? `${user}_${idx + 1}` : user,
        hwid: 'Not Bound',
        days: days,
        expiry: expiryText,
        status: 'active',
        created_at: new Date().toISOString(),
        activated_at: null,
        expires_at: null,
        note: `Generated via KeyAuth V2 API (${new Date().toLocaleDateString()})`,
        resellerId: 'owner'
      });
    });

    if (typeof window.state.save === 'function') {
      window.state.save();
    }

    if (typeof window.closeModal === 'function') {
      window.closeModal('modal-add-key-v2');
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Generate V2 Keys Now ⚡';
    }

    // Show generated keys modal
    window.lastGeneratedKeys = generatedKeys;
    const listEl = document.getElementById('generated-keys-list');
    if (listEl) {
      listEl.innerHTML = generatedKeys.map(k => `<div class="key-pill-display" onclick="copyText('${k}')">${k} 📋</div>`).join('');
    }
    const modalGenTitle = document.getElementById('generated-keys-title');
    if (modalGenTitle) modalGenTitle.textContent = `🔑 ${count} V2 Key(s) Generated Successfully`;
    if (typeof window.openModal === 'function') {
      window.openModal('modal-generated-keys');
    }

    renderLicensesV2Table();

    if (window.state && typeof window.state.addLog === 'function') {
      window.state.addLog('GENERATE_KEYS_V2', `Generated ${count} key(s) for package "${pkgName}" (KeyAuth V2 API)`);
    }

    if (typeof window.showToast === 'function') {
      window.showToast('KeyAuth V2 Generated', `${count} V2 License Key(s) generated successfully for ${pkgName}`, '✅');
    }

    // Permanent cloud persistence
    syncV2ToCloud();

    // Background sync to backend API endpoint
    try {
      if (typeof window.callApi === 'function') {
        window.callApi('generate_key_v2', {
          package_name: pkgName,
          user: user,
          days: days,
          count: count,
          keys: generatedKeys
        }).catch(function () {});
      }
    } catch (_) {}
  };

  // Quick remote tools for V2
  window.runQuickKeyActionV2 = function (action) {
    const input = document.getElementById('quick-key-input-v2');
    const key = (input ? input.value : '').trim();

    if (!key) {
      if (typeof window.showToast === 'function') {
        window.showToast('Key Required', 'Please enter a valid V2 License Key first.', '⚠️');
      }
      return;
    }

    if (action === 'inspect') {
      inspectKeyV2Live(key);
    } else if (action === 'reset_hwid') {
      resetHwidV2Live(key);
    } else if (action === 'ban') {
      toggleBanV2Live(key, 'active');
    } else if (action === 'unban') {
      toggleBanV2Live(key, 'banned');
    } else if (action === 'delete') {
      deleteKeyV2Live(key);
    }
  };

  // Inspect Key Details for V2
  window.inspectKeyV2Live = function (key) {
    if (!window.state || !Array.isArray(window.state.licenses_v2)) return;
    const lic = window.state.licenses_v2.find(l => l.key.toLowerCase() === key.toLowerCase());
    if (!lic) {
      if (typeof window.showToast === 'function') {
        window.showToast('Key Not Found', `No V2 license found matching "${key}".`, '⚠️');
      }
      return;
    }

    const modalBody = document.getElementById('lic-details-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-size:12px;">
          <div style="grid-column:span 2;background:#090d16;padding:12px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;margin-bottom:4px;">KEYAUTH V2 LICENSE KEY</span>
            <span style="font-family:var(--font-mono);font-size:14px;color:#10b981;font-weight:700;">${lic.key}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">APPLICATION</span>
            <span style="color:#fff;font-weight:600;">${lic.app || KEYAUTH_V2_CONFIG.appName}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">OWNER ID</span>
            <span style="color:#38bdf8;font-weight:700;">${KEYAUTH_V2_CONFIG.ownerId}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">PACKAGE</span>
            <span style="color:#34d399;font-weight:700;">${lic.pkg}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">STATUS</span>
            <span style="color:${lic.status === 'active' ? '#10b981' : (lic.status === 'banned' ? '#ef4444' : '#f59e0b')};font-weight:700;text-transform:uppercase;">${lic.status}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">ASSIGNED USER</span>
            <span style="color:#fff;">${lic.user || 'None'}</span>
          </div>
          <div style="background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">EXPIRATION</span>
            <span style="color:#fff;">${lic.expiry}</span>
          </div>
          <div style="grid-column:span 2;background:#090d16;padding:10px;border-radius:6px;border:1px solid #1a2235;">
            <span style="color:#64748b;display:block;font-size:10px;">HWID BINDING</span>
            <span style="color:${lic.hwid === 'Not Bound' ? '#f59e0b' : '#38bdf8'};">${lic.hwid}</span>
          </div>
        </div>
      `;
    }
    if (typeof window.openModal === 'function') {
      window.openModal('modal-lic-details');
    }
  };

  // Reset HWID for V2
  window.resetHwidV2Live = function (key) {
    if (!window.state || !Array.isArray(window.state.licenses_v2)) return;
    const lic = window.state.licenses_v2.find(l => l.key.toLowerCase() === key.toLowerCase());
    if (lic) {
      lic.hwid = 'Not Bound';
      window.state.save();
      renderLicensesV2Table();
      syncV2ToCloud();

      if (typeof window.showToast === 'function') {
        window.showToast('HWID Reset', `Hardware ID reset successfully for V2 key "${key}".`, '✅');
      }
      if (window.state && typeof window.state.addLog === 'function') {
        window.state.addLog('RESET_HWID_V2', `Reset HWID for key ${key}`);
      }
      try {
        if (typeof window.callApi === 'function') window.callApi('reset_hwid_v2', { key: key });
      } catch (_) {}
    }
  };

  // Toggle Ban for V2
  window.toggleBanV2Live = function (key, currentStatus) {
    if (!window.state || !Array.isArray(window.state.licenses_v2)) return;
    const lic = window.state.licenses_v2.find(l => l.key.toLowerCase() === key.toLowerCase());
    if (lic) {
      const newStatus = (currentStatus === 'banned') ? 'active' : 'banned';
      lic.status = newStatus;
      window.state.save();
      renderLicensesV2Table();
      syncV2ToCloud();

      if (typeof window.showToast === 'function') {
        window.showToast(newStatus === 'banned' ? 'Key Banned' : 'Key Unbanned', `V2 Key "${key}" is now ${newStatus}.`, newStatus === 'banned' ? '🚫' : '✅');
      }
      if (window.state && typeof window.state.addLog === 'function') {
        window.state.addLog('TOGGLE_BAN_V2', `${newStatus === 'banned' ? 'Banned' : 'Unbanned'} key ${key}`);
      }
      try {
        if (typeof window.callApi === 'function') window.callApi(newStatus === 'banned' ? 'ban_key_v2' : 'unban_key_v2', { key: key });
      } catch (_) {}
    }
  };

  // Delete V2 Key
  window.deleteKeyV2Live = function (key) {
    if (!confirm(`Are you sure you want to permanently delete V2 License Key:\n${key}?`)) return;
    if (!window.state || !Array.isArray(window.state.licenses_v2)) return;
    window.state.licenses_v2 = window.state.licenses_v2.filter(l => l.key.toLowerCase() !== key.toLowerCase());
    window.state.save();
    renderLicensesV2Table();
    syncV2ToCloud();

    if (typeof window.showToast === 'function') {
      window.showToast('Key Deleted', `V2 Key "${key}" permanently deleted.`, '🗑️');
    }
    if (window.state && typeof window.state.addLog === 'function') {
      window.state.addLog('DELETE_KEY_V2', `Deleted V2 key ${key}`);
    }
    try {
      if (typeof window.callApi === 'function') window.callApi('delete_key_v2', { key: key });
    } catch (_) {}
  };

  // Initialize once DOM is ready or dashboard.js has executed
  function initOnReady() {
    initV2State();
    hookSwitchTab();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnReady);
  } else {
    initOnReady();
  }
})();
