# PRTV SHOW // TERMINALX999 - Enterprise Admin Dashboard & KeyAuth Portal

A next-generation, high-performance **Cyber Dark Glassmorphic Admin Dashboard & KeyAuth Software Licensing Portal**, built to match and expand upon the platform seen at `prtvshow.online/admin/dashboard.php`.

---

## 🌟 Key Features

1. **Cyberpunk Dark Glassmorphism UI**:
   - Modern design tokens (`#ef4444` Crimson Red, `#00f0ff` Cyan, `#f97316` Amber, `#050508` Space Void).
   - Real-time animated counters, glowing status badges, and ambient mesh gradients.
   - Built-in futuristic synthesizer audio feedback (via native Web Audio API).

2. **KeyAuth Software Protection & License Manager**:
   - Create custom-prefixed license keys (`PRTV-XXXX-XXXX-XXXX`).
   - Validity periods: 1 Day Trial, 7 Days Weekly, 30 Days Monthly, Lifetime VIP.
   - Single & Bulk Key Generation with 1-click clipboard copy.
   - Hardware HWID Binding & 1-click HWID Reset.
   - Ban, unban, delete, and real-time status filtering (Active, HWID Locked, Expired, Banned).
   - Export license tables to **CSV** or **JSON**.

3. **PRTV Cinema 4K Hub Manager**:
   - Manage catalog of 4K Movies (Bollywood, Hollywood Dubbed, South Blockbusters) and 100+ Live TV Channels.
   - Add/edit direct HLS/M3U8/MP4 streams, poster artwork, and quality badges.

4. **Cloud File Vault (500MB+ CDN)**:
   - High-speed direct link hosting with download statistics.
   - Instant dynamic **QR Code Generator** for mobile downloads.

5. **Free Fire Custom Esports Scrims Hub**:
   - Schedule 4v4 Clash Squad and 48-Player Full Map Battle Royale tournament slots.
   - Auto-unlock Room ID & Password 10 minutes before match time.

6. **Telecom Suite & 200+ Working APIs Monitor**:
   - Real-time API uptime health checker (218/224 active endpoints).
   - Interactive Phone Number Carrier & Telecom Circle lookup tool.

7. **Security & Live Telemetry Engine**:
   - Real-time HTML5 Canvas network traffic chart with smooth Bézier curve animations.
   - Live simulated incoming HMAC-SHA256 authentication stream in an integrated terminal widget.
   - Hardware load meters (CPU, ECC RAM, NVMe CDN storage, Database IOPS).

---

## 🚀 How to Run / Test

### 1. Instant Browser Run (No Server Needed!)
Because this project includes a reactive client-side architecture with LocalStorage persistence:
- Navigate to: `C:\Users\manis\.gemini\antigravity\scratch\prtvshow-admin\`
- Double click **`index.html`** or **`dashboard.html`** to launch the full interactive dashboard in Google Chrome, Microsoft Edge, or Firefox.
- Or open **`login.html`** to test the root authentication screen.

### 2. PHP Server / Web Hosting Deployment
To deploy on cPanel, Apache, Nginx, or XAMPP:
1. Upload the files to your server's `public_html` or web directory.
2. (Optional) Import `admin/database.sql` into your MySQL database using phpMyAdmin.
3. Configure your database details in `admin/config.php` (if using MySQL).
4. Access `http://your-domain.com/admin/login.php` or `http://your-domain.com/admin/dashboard.php`.

---

## 🔐 Default Admin Credentials

- **Admin Identifier / Email**: `admin@prtvshow.online`
- **Master Passcode**: `admin123`
- **Role**: `ROOT OWNER / ADMIN`

---

## 📁 Project Structure

```text
prtvshow-admin/
├── index.html               # Main landing / standalone dashboard entry point
├── dashboard.html           # Full interactive standalone dashboard
├── login.html               # Standalone root login portal
├── assets/
│   ├── css/
│   │   └── dashboard.css    # Cyber glassmorphic theme stylesheet
│   └── js/
│       └── dashboard.js     # State manager, canvas chart, Web Audio, modals
├── admin/
│   ├── login.php            # Server-side PHP authentication portal
│   ├── dashboard.php        # Server-side PHP dashboard with session guard
│   ├── config.php           # Database, HMAC secret, & session config
│   ├── api.php              # RESTful KeyAuth verification & stats endpoint
│   ├── logout.php           # Session logout handler
│   └── database.sql         # Complete MySQL schema & seed data
└── README.md                # Project documentation
```
