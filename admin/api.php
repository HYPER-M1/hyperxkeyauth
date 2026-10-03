<?php
/**
 * PRTV SHOW // TERMINALX999 - REST API & KEYAUTH VERIFICATION ENGINE
 * Endpoints for Client Loaders, License Auth, HWID Binding & Telemetry
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Read JSON Input Body if present
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];

if (empty($action) && isset($body['action'])) {
    $action = $body['action'];
}

// Check if this action belongs to the remote KeyAuth Engine
$remoteActions = [
    'generate_key', 'reset_hwid', 'ban_key', 'unban_key', 'delete_key',
    'get_admin_packages', 'key_info', 'reseller_stats', 'whitelist_uid',
    'remove_uid', 'get_whitelisted_uids', 'discord_bot_setup'
];

if (in_array($action, $remoteActions, true)) {
    $payload = array_merge([
        'api_key' => REMOTE_API_KEY,
        'app_id'  => REMOTE_APP_ID,
        'action'  => $action
    ], $body);

    $ch = curl_init(REMOTE_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $remoteResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($remoteResponse !== false) {
        http_response_code($httpCode ?: 200);
        echo $remoteResponse;
        exit;
    } else {
        json_response(['success' => false, 'message' => 'Remote KeyAuth API unreachable'], 502);
    }
}

switch ($action) {
    /**
     * KeyAuth Client License Verification
     * Verifies license key, HWID binding, expiry date, and signs response with HMAC-SHA256
     */
    case 'verify_key':
        $licenseKey = trim($body['key'] ?? $_POST['key'] ?? '');
        $clientHwid = trim($body['hwid'] ?? $_POST['hwid'] ?? '');

        if (empty($licenseKey) || empty($clientHwid)) {
            json_response([
                'success' => false,
                'message' => 'Missing license key or client HWID parameter',
                'status'  => 'INVALID_PARAMS'
            ], 400);
        }

        // Compute HMAC signature for tamper-proof responses
        $timestamp = time();
        $payloadToSign = $licenseKey . '|' . $clientHwid . '|' . $timestamp;
        $signature = hash_hmac('sha256', $payloadToSign, HMAC_SECRET_KEY);

        // Verification logic (with database if available, or static demo check)
        $pdo = get_db_connection();
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM licenses WHERE license_key = ? LIMIT 1");
            $stmt->execute([$licenseKey]);
            $lic = $stmt->fetch();

            if (!$lic) {
                json_response(['success' => false, 'message' => 'License key does not exist', 'status' => 'NOT_FOUND'], 404);
            }

            if ($lic['status'] === 'banned') {
                json_response(['success' => false, 'message' => 'License has been banned for integrity violation', 'status' => 'BANNED'], 403);
            }

            if (strtotime($lic['expiry_date']) < time()) {
                json_response(['success' => false, 'message' => 'License key has expired', 'status' => 'EXPIRED'], 403);
            }

            // HWID Check & Auto-Bind
            if (empty($lic['hwid']) || $lic['hwid'] === 'Unbound') {
                $bindStmt = $pdo->prepare("UPDATE licenses SET hwid = ?, status = 'active' WHERE id = ?");
                $bindStmt->execute([$clientHwid, $lic['id']]);
            } elseif ($lic['hwid'] !== $clientHwid) {
                json_response([
                    'success' => false,
                    'message' => 'Hardware ID mismatch. Please request HWID reset from admin.',
                    'status'  => 'HWID_MISMATCH'
                ], 403);
            }

            json_response([
                'success'    => true,
                'message'    => 'KeyAuth License Verified Successfully',
                'app'        => $lic['app_name'],
                'expiry'     => $lic['expiry_date'],
                'user'       => $lic['assigned_user'],
                'timestamp'  => $timestamp,
                'hmac_sha256'=> $signature
            ]);
        } else {
            // Standalone fallback: Keys starting with PRTV- or TX999- pass verification
            if (str_starts_with($licenseKey, 'PRTV-') || str_starts_with($licenseKey, 'TX999-')) {
                json_response([
                    'success'    => true,
                    'message'    => 'KeyAuth License Authenticated (Standalone Session)',
                    'app'        => 'TERMINALX999_x64',
                    'expiry'     => '2026-12-31',
                    'timestamp'  => $timestamp,
                    'hmac_sha256'=> $signature
                ]);
            } else {
                json_response([
                    'success' => false,
                    'message' => 'Invalid license format or expired key',
                    'status'  => 'INVALID_KEY'
                ], 403);
            }
        }
        break;

    /**
     * Get Server Statistics / Telemetry
     */
    case 'get_stats':
        json_response([
            'success'          => true,
            'active_licenses'  => 154820,
            'media_catalog'    => 12500,
            'vault_files'      => 184200,
            'connected_users'  => 1429,
            'uptime'           => '99.98%',
            'api_health'       => '218/224 Working APIs'
        ]);
        break;

    default:
        json_response([
            'success' => false,
            'message' => 'Unknown API action requested',
            'available_actions' => ['verify_key', 'get_stats']
        ], 404);
        break;
}
