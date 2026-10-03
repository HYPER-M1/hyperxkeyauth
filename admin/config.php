<?php
/**
 * PRTV SHOW // TERMINALX999 - ENTERPRISE CORE CONFIGURATION
 * Master Settings, Database Connection, Cryptographic Salt & Auth Guards
 */

// Error reporting settings
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Start secure session if not already active
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

// Global System Constants
define('APP_NAME', 'HYPER X // KEYAUTH PORTAL');
define('APP_VERSION', 'v2.6.4');
define('HMAC_SECRET_KEY', '7f99a801e82b7c02b92138a011cd48f9'); // Change this in production

// Remote KeyAuth Engine Credentials
define('REMOTE_API_URL', 'https://prtvshow.online/api_admin.php');
define('REMOTE_API_KEY', 'TX999_API_bc186f5d73bd492e6d52095e5a7bfd78');
define('REMOTE_APP_ID', '9f087d585fbd666572fc24b7');

// Default Root Admin Credentials (BCrypt Hashed)
define('ADMIN_EMAIL', 'admin@prtvshow.online');
// Default password is: admin123
define('ADMIN_PASSWORD_HASH', '$2y$10$w095H8kZf4y9m5tQ.z5eEeN5bM0gq7L3A2X3o5lM6u9P7s2e5o1G6');

// Database Configuration (MySQL / MariaDB)
define('DB_HOST', 'localhost');
define('DB_NAME', 'prtv_terminal_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get PDO Database Connection
 * Falls back safely if MySQL is not configured yet
 */
function get_db_connection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // In demo/standalone mode without MySQL server running, return null
            $pdo = null;
        }
    }
    return $pdo;
}

/**
 * Authentication Guard - Ensures root admin session is active
 */
function check_admin_auth() {
    if (!isset($_SESSION['prtv_admin_logged']) || $_SESSION['prtv_admin_logged'] !== true) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Generate CSRF Token
 */
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF Token
 */
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Output JSON Response
 */
function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
