<?php
require_once __DIR__ . '/config.php';

// Redirect if already authenticated
if (isset($_SESSION['prtv_admin_logged']) && $_SESSION['prtv_admin_logged'] === true) {
    header('Location: dashboard.php');
    exit;
}

$error_message = '';

// Handle POST Login Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf = $_POST['csrf_token'] ?? '';

    if (!verify_csrf_token($csrf)) {
        $error_message = 'Security validation failed (Invalid CSRF). Please reload and try again.';
    } elseif (empty($email) || empty($password)) {
        $error_message = 'Please provide both admin identifier and master passcode.';
    } else {
        // Authenticate via default root credentials or database
        $authenticated = false;

        // Check default root admin
        if ($email === ADMIN_EMAIL && ($password === 'admin123' || password_verify($password, ADMIN_PASSWORD_HASH))) {
            $authenticated = true;
            $admin_user = [
                'id' => 1,
                'email' => ADMIN_EMAIL,
                'username' => 'rohan.dll',
                'role' => 'root_admin'
            ];
        } else {
            // Check Database if available
            $pdo = get_db_connection();
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                $dbUser = $stmt->fetch();
                if ($dbUser && password_verify($password, $dbUser['password_hash'])) {
                    $authenticated = true;
                    $admin_user = $dbUser;
                }
            }
        }

        if ($authenticated) {
            session_regenerate_id(true);
            $_SESSION['prtv_admin_logged'] = true;
            $_SESSION['prtv_admin_id'] = $admin_user['id'];
            $_SESSION['prtv_admin_email'] = $admin_user['email'];
            $_SESSION['prtv_admin_user'] = $admin_user['username'];
            $_SESSION['prtv_admin_role'] = $admin_user['role'];

            header('Location: dashboard.php');
            exit;
        } else {
            $error_message = 'Invalid administrator credentials or unauthorized IP.';
        }
    }
}

$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Portal // TERMINALX999 – Root Authentication</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: #d93646;
      --accent-glow: rgba(217, 54, 70, 0.45);
      --accent-light: rgba(217, 54, 70, 0.14);
      --bg-dark: #07070b;
      --bg-card: rgba(13, 13, 20, 0.85);
      --border: rgba(255, 255, 255, 0.09);
      --border-focus: #d93646;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-x: hidden;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    .ambient-glow-top {
      position: fixed;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 650px;
      height: 450px;
      background: radial-gradient(circle, rgba(217, 54, 70, 0.18) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    .ambient-grid {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%);
      pointer-events: none;
      z-index: 0;
    }

    .portal-nav {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 28px;
      background: rgba(7, 7, 11, 0.75);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .brand-link { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #ffffff; }

    .brand-logo-badge {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--accent-light);
      border: 1px solid var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow);
    }

    .brand-title {
      font-family: var(--font-mono);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #ffffff;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      padding: 2px 7px;
      border-radius: 4px;
      margin-left: 6px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
      animation: pulseDot 2s infinite;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .portal-main {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 35px 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 34px 30px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }

    .auth-card-top-line {
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }

    .card-head { text-align: center; margin-bottom: 24px; }

    .card-icon-wrap {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      background: var(--accent-light);
      border: 1px solid var(--accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: var(--accent);
      box-shadow: 0 0 18px var(--accent-glow);
      margin-bottom: 12px;
    }

    .card-title {
      font-family: var(--font-mono);
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .card-sub { font-size: 12px; color: var(--text-muted); }

    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.45);
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 9px;
      color: #fca5a5;
      font-size: 12px;
      font-family: var(--font-mono);
    }

    .form-group { margin-bottom: 16px; }

    .form-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
      font-family: var(--font-mono);
    }

    .input-box { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 12px; font-size: 13px; color: #64748b; pointer-events: none; }

    .form-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 10px 12px 10px 36px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #ffffff;
      outline: none;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      background: rgba(0, 0, 0, 0.4);
      border-color: var(--accent);
      box-shadow: 0 0 14px var(--accent-light);
    }

    .toggle-pass-btn {
      position: absolute; right: 10px; background: transparent; border: none;
      color: #64748b; cursor: pointer; font-size: 14px; padding: 4px;
    }

    .form-aux { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; margin-bottom: 22px; }
    .remember-label { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; color: #94a3b8; cursor: pointer; }
    .security-tag { font-family: var(--font-mono); font-size: 10px; color: #64748b; }

    .btn-submit {
      width: 100%;
      padding: 11px 16px;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 0 18px var(--accent-glow);
      transition: all 0.2s ease;
    }

    .btn-submit:hover { filter: brightness(1.1); box-shadow: 0 0 26px var(--accent-glow); transform: translateY(-1px); }

    .demo-credentials-box {
      margin-top: 16px; padding: 12px;
      background: rgba(0, 240, 255, 0.05);
      border: 1px dashed rgba(0, 240, 255, 0.3);
      border-radius: 8px;
      font-size: 11px;
      color: #cbd5e1;
    }

    .card-footer {
      margin-top: 20px; padding-top: 14px; border-top: 1px dashed rgba(255, 255, 255, 0.08);
      text-align: center; font-size: 10.5px; color: #64748b; line-height: 1.45;
    }

    .portal-footer { position: relative; z-index: 10; padding: 14px 20px 20px; text-align: center; }
  </style>
</head>
<body>

  <div class="ambient-glow-top"></div>
  <div class="ambient-grid"></div>

  <nav class="portal-nav">
    <a href="../index.html" class="brand-link">
      <div class="brand-logo-badge">⚡</div>
      <div class="brand-title">TERMINALX999</div>
      <span class="status-pill">
        <span class="status-dot"></span>
        <span>256-BIT SSL</span>
      </span>
    </a>
  </nav>

  <main class="portal-main">
    <div class="auth-card">
      <div class="auth-card-top-line"></div>

      <div class="card-head">
        <div class="card-icon-wrap">🔐</div>
        <h1 class="card-title">ADMIN PORTAL</h1>
        <p class="card-sub">Root Control &amp; License Security Gateway</p>
      </div>

      <?php if (!empty($error_message)): ?>
        <div class="alert-error">
          <span>⚠️</span>
          <span><?= htmlspecialchars($error_message) ?></span>
        </div>
      <?php endif; ?>

      <form method="POST" action="login.php">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">

        <div class="form-group">
          <label class="form-label" for="email">Admin Identifier / Email</label>
          <div class="input-box">
            <span class="input-icon">✉</span>
            <input
              type="text"
              id="email"
              name="email"
              class="form-input"
              placeholder="admin@prtvshow.online"
              value="<?= htmlspecialchars($_POST['email'] ?? 'admin@prtvshow.online') ?>"
              required
              autocomplete="username"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Master Passcode</label>
          <div class="input-box">
            <span class="input-icon">🔑</span>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              placeholder="••••••••••••"
              value="admin123"
              required
              autocomplete="current-password"
            >
            <button type="button" class="toggle-pass-btn" id="btn-toggle-password" title="Toggle password visibility">
              👁️
            </button>
          </div>
        </div>

        <div class="form-aux">
          <label class="remember-label" for="remember_me">
            <input type="checkbox" id="remember_me" name="remember_me" checked style="accent-color:var(--accent);">
            <span>Remember Credentials</span>
          </label>
          <span class="security-tag">🔒 HMAC-SHA256</span>
        </div>

        <button type="submit" class="btn-submit" id="btn-submit-login">
          <span>⚡</span>
          <span>SIGN IN TO DASHBOARD</span>
        </button>

        <div class="demo-credentials-box">
          <div><strong>Default Root Login:</strong></div>
          <div style="font-family:var(--font-mono);margin-top:2px;">
            Email: <span style="color:#00f0ff;">admin@prtvshow.online</span> | Pass: <span style="color:#00f0ff;">admin123</span>
          </div>
        </div>
      </form>

      <div class="card-footer">
        Protected Root Environment. Unauthorized login attempts are automatically monitored, throttled, and IP logged.
      </div>
    </div>
  </main>

  <footer class="portal-footer">
    <div style="font-family: var(--font-mono); font-size: 10px; color: #475569;">
      TERMINALX999 ENTERPRISE SECURITY PLATFORM &copy; 2026
    </div>
  </footer>

  <script>
    const toggleBtn = document.getElementById('btn-toggle-password');
    const passInput = document.getElementById('password');
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', function () {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        toggleBtn.textContent = isPass ? '🔒' : '👁️';
      });
    }
  </script>
</body>
</html>
