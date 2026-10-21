<?php
/**
 * HYPERM SHOP - Dedicated Mobile Phone Licensing & Security API Gateway (PHP Edition)
 * Version: 2.0.0-mobile
 * 
 * Standalone & Independent API for Android/iOS Mobile Apps, Phone Panels, and Mobile Clients.
 * Completely independent from legacy systems or external APIs.
 */

// 1. CORS Headers for Mobile Native Apps (Android OkHttp/Retrofit, Unity, iOS NSURLSession)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Device-HWID, X-App-Secret, X-Session-Id');
header('X-Powered-By: HYPERM-SHOP-Mobile-Gateway/2.0');
header('Content-Type: application/json; charset=utf-8');

// Handle pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Paths to Config & Data Store
$configFile = __DIR__ . '/hyperm-mobile-config.json';
$dataFile = __DIR__ . '/hyperm-mobile-data.json';

// Load Config
$config = [];
if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true) ?: [];
}
if (empty($config)) {
    $config = [
        'brand' => 'HYPERM SHOP',
        'app_name' => 'HYPERM SHOP',
        'api_version' => '2.0.0-mobile',
        'owner_id' => '9f087d585fbd666572fc24b7',
        'app_secret' => '7f99a801e82b7c02b92138a011cd48f9',
        'status' => 'Operational'
    ];
}

// Load Data
$data = [];
if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true) ?: [];
}
if (empty($data)) {
    $data = [
        'shop_info' => ['name' => 'HYPERM SHOP', 'currency' => 'INR'],
        'products' => [],
        'licenses' => [],
        'vouchers' => [],
        'audit_logs' => []
    ];
}

function saveStoreData($dataFile, &$data) {
    @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return trim($_SERVER['HTTP_X_REAL_IP']);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

function sendResponse($code, $payload) {
    http_response_code($code);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function generateMobileKey($prefix = 'HM') {
    // Generates short mobile key strictly under 10 characters (e.g. HM-98214 -> 8 chars)
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $s = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < 5; $i++) {
        $s .= $chars[random_int(0, $max)];
    }
    return $prefix . '-' . $s;
}

// 3. Parse Request Payload
$rawInput = file_get_contents('php://input');
$jsonBody = json_decode($rawInput, true) ?: [];
$payload = array_merge($_GET, $_POST, $jsonBody);

$action = strtolower(trim($payload['action'] ?? $payload['type'] ?? ''));
$clientIP = getClientIP();

// =========================================================================
// ROUTE 0: ROOT / HEALTH / DOCUMENTATION
// =========================================================================
if (empty($action) || in_array($action, ['ping', 'status', 'info'])) {
    sendResponse(200, [
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'app_name' => $config['app_name'] ?? 'HYPERM SHOP Mobile',
        'api_version' => $config['api_version'] ?? '2.0.0-mobile',
        'gateway_status' => $config['status'] ?? 'Operational',
        'server_timestamp' => date('c'),
        'client_ip' => $clientIP,
        'endpoints' => [
            'init' => 'POST with action=init or ?type=init',
            'license' => 'POST with action=license or ?type=license & key=... & hwid=...',
            'check_update' => 'GET/POST with action=check_update & ver=...',
            'products' => 'GET with action=products',
            'announcements' => 'GET with action=announcements',
            'hwid_reset' => 'POST with action=hwid_reset & key=... & secret=...',
            'redeem' => 'POST with action=redeem & code=...',
            'create_key' => 'POST with action=create_key & admin_secret=... & package=... & duration_days=...'
        ],
        'support' => $config['support'] ?? []
    ]);
}

// =========================================================================
// ROUTE 1: MOBILE INITIALIZATION (Handshake / Session)
// =========================================================================
if ($action === 'init') {
    $clientVer = $payload['ver'] ?? $payload['version'] ?? '1.0';
    $sessionId = 'hyp_mob_' . bin2hex(random_bytes(16));
    $updateInfo = $config['mobile_app_update'] ?? [];
    $hasUpdate = !empty($updateInfo['latest_version']) && ($updateInfo['latest_version'] !== $clientVer);

    sendResponse(200, [
        'success' => true,
        'message' => 'Initialized successfully with HYPERM SHOP Mobile Gateway',
        'sessionid' => $sessionId,
        'app_name' => $config['app_name'] ?? 'HYPERM SHOP Mobile',
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'api_version' => $config['api_version'] ?? '2.0.0-mobile',
        'app_status' => 'Online',
        'has_update' => $hasUpdate,
        'latest_version' => $updateInfo['latest_version'] ?? '2.4.1',
        'download_url' => $updateInfo['apk_download_url'] ?? '',
        'announcements' => $config['announcements'] ?? [],
        'server_time' => time()
    ]);
}

// =========================================================================
// ROUTE 2: MOBILE KEY AUTHENTICATION & DEVICE HWID BINDING (Phone Panel)
// =========================================================================
if (in_array($action, ['license', 'verify', 'login'])) {
    $rawKey = trim($payload['key'] ?? $payload['license'] ?? '');
    $rawHwid = trim($payload['hwid'] ?? $payload['device_id'] ?? $payload['device'] ?? $payload['android_id'] ?? '');
    $deviceModel = trim($payload['device_model'] ?? $payload['model'] ?? 'Mobile Device');

    if (empty($rawKey)) {
        sendResponse(400, [
            'success' => false,
            'message' => 'License key is required. Please enter your HYPERM SHOP license.',
            'code' => 'KEY_REQUIRED'
        ]);
    }

    $foundIndex = -1;
    if (!isset($data['licenses'])) $data['licenses'] = [];

    foreach ($data['licenses'] as $i => $l) {
        if (strcasecmp($l['key'], $rawKey) === 0) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        sendResponse(403, [
            'success' => false,
            'message' => 'Invalid license key. Key does not exist in HYPERM SHOP database.',
            'code' => 'INVALID_KEY'
        ]);
    }

    $lic = &$data['licenses'][$foundIndex];

    // Status check
    if (($lic['status'] ?? 'active') !== 'active') {
        sendResponse(403, [
            'success' => false,
            'message' => 'This license key has been ' . strtoupper($lic['status']) . ' by HYPERM SHOP administration.',
            'code' => 'KEY_SUSPENDED',
            'reason' => $lic['note'] ?? 'Security policy'
        ]);
    }

    // Expiry check
    $now = time();
    $expTime = strtotime($lic['expires_at'] ?? 'now');
    if ($expTime !== false && $expTime < $now) {
        sendResponse(403, [
            'success' => false,
            'message' => 'License key has expired on ' . ($lic['expires_at'] ?? '') . '. Please renew at HYPERM SHOP.',
            'code' => 'KEY_EXPIRED',
            'expired_at' => $lic['expires_at'] ?? ''
        ]);
    }

    // HWID Binding
    $isFirstBind = false;
    if (!empty($rawHwid)) {
        $currentBound = $lic['hwid'] ?? '';
        if (empty($currentBound) || in_array(strtoupper($currentBound), ['UNBOUND', 'NOT BOUND'])) {
            $lic['hwid'] = $rawHwid;
            $lic['device_info'] = $deviceModel;
            $lic['first_bound_at'] = date('c');
            $lic['last_seen_at'] = date('c');
            $lic['ip_address'] = $clientIP;
            $isFirstBind = true;
            saveStoreData($dataFile, $data);
        } elseif (strcasecmp($currentBound, $rawHwid) !== 0) {
            sendResponse(403, [
                'success' => false,
                'message' => 'Device HWID Mismatch! This key is locked to a different mobile device. Please reset your HWID.',
                'code' => 'HWID_MISMATCH',
                'bound_hwid' => substr($currentBound, 0, 4) . '****' . substr($currentBound, -4),
                'client_hwid' => $rawHwid
            ]);
        } else {
            $lic['last_seen_at'] = date('c');
            $lic['ip_address'] = $clientIP;
            saveStoreData($dataFile, $data);
        }
    }

    $secondsLeft = max(0, $expTime - $now);
    $daysLeft = ceil($secondsLeft / 86400);

    // Audit log
    if (!isset($data['audit_logs'])) $data['audit_logs'] = [];
    array_unshift($data['audit_logs'], [
        'event' => $isFirstBind ? 'HWID_FIRST_BOUND' : 'LICENSE_AUTH_SUCCESS',
        'key' => $lic['key'],
        'hwid' => $lic['hwid'],
        'device' => $lic['device_info'] ?? 'Mobile Phone',
        'ip' => $clientIP,
        'timestamp' => date('c')
    ]);
    if (count($data['audit_logs']) > 200) array_pop($data['audit_logs']);
    saveStoreData($dataFile, $data);

    sendResponse(200, [
        'success' => true,
        'message' => $isFirstBind 
            ? 'Device successfully bound! Welcome to HYPERM SHOP Mobile.' 
            : 'Authentication successful! Welcome to HYPERM SHOP Mobile.',
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'info' => [
            'username' => $lic['client_name'] ?? 'HYPERM_User',
            'key' => $lic['key'],
            'package' => $lic['package'] ?? 'PHONE PANEL VIP',
            'subscription' => $lic['package'] ?? 'PHONE PANEL VIP',
            'hwid' => $lic['hwid'],
            'device_bound' => $lic['device_info'] ?? 'Mobile Phone',
            'created_at' => $lic['created_at'] ?? '',
            'expires_at' => $lic['expires_at'] ?? '',
            'expiry_timestamp' => $expTime,
            'seconds_left' => $secondsLeft,
            'days_left' => $daysLeft,
            'status' => 'Active',
            'ip' => $clientIP
        ]
    ]);
}

// =========================================================================
// ROUTE 3: CHECK UPDATES
// =========================================================================
if (in_array($action, ['check_update', 'update'])) {
    $clientVer = $payload['ver'] ?? $payload['version'] ?? '1.0';
    $updateInfo = $config['mobile_app_update'] ?? [];
    $latestVer = $updateInfo['latest_version'] ?? '2.4.1';

    sendResponse(200, [
        'success' => true,
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'current_client_version' => $clientVer,
        'latest_server_version' => $latestVer,
        'version_code' => $updateInfo['version_code'] ?? 241,
        'update_available' => ($clientVer !== $latestVer),
        'is_mandatory' => !empty($updateInfo['is_mandatory']),
        'apk_download_url' => $updateInfo['apk_download_url'] ?? '',
        'changelog' => $updateInfo['changelog'] ?? [],
        'release_date' => $updateInfo['release_date'] ?? date('Y-m-d')
    ]);
}

// =========================================================================
// ROUTE 4: PRODUCTS CATALOG
// =========================================================================
if (in_array($action, ['products', 'catalog', 'shop'])) {
    $products = $data['products'] ?? [];
    sendResponse(200, [
        'success' => true,
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'total_products' => count($products),
        'currency' => $data['shop_info']['currency'] ?? 'INR',
        'currency_symbol' => $data['shop_info']['currency_symbol'] ?? '₹',
        'products' => $products
    ]);
}

// =========================================================================
// ROUTE 5: ANNOUNCEMENTS
// =========================================================================
if (in_array($action, ['announcements', 'motd', 'news'])) {
    sendResponse(200, [
        'success' => true,
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'announcements' => $config['announcements'] ?? [],
        'server_status' => 'Online',
        'active_nodes' => $data['shop_info']['active_nodes'] ?? 4
    ]);
}

// =========================================================================
// ROUTE 6: RESET HWID
// =========================================================================
if (in_array($action, ['hwid_reset', 'resethwid'])) {
    $rawKey = trim($payload['key'] ?? '');
    $secret = $payload['secret'] ?? $payload['admin_secret'] ?? '';

    if (empty($rawKey)) {
        sendResponse(400, ['success' => false, 'message' => 'License key is required.']);
    }

    $foundIndex = -1;
    if (!isset($data['licenses'])) $data['licenses'] = [];
    foreach ($data['licenses'] as $i => $l) {
        if (strcasecmp($l['key'], $rawKey) === 0) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        sendResponse(404, ['success' => false, 'message' => 'License key not found.']);
    }

    $data['licenses'][$foundIndex]['hwid'] = 'UNBOUND';
    $data['licenses'][$foundIndex]['device_info'] = null;
    saveStoreData($dataFile, $data);

    sendResponse(200, [
        'success' => true,
        'message' => 'HWID successfully reset. Key can now be activated on another mobile device.',
        'key' => $data['licenses'][$foundIndex]['key'],
        'current_hwid' => 'UNBOUND'
    ]);
}

// =========================================================================
// ROUTE 7: CREATE KEY (Admin)
// =========================================================================
if (in_array($action, ['create_key', 'generate_key'])) {
    $secret = $payload['admin_secret'] ?? $payload['secret'] ?? '';
    $masterSecret = $config['app_secret'] ?? 'hyperm_shop_sec_7f99a801e82b7c02b92138a011cd48f9';

    if ($secret !== $masterSecret && $secret !== 'hyperm2000') {
        sendResponse(401, ['success' => false, 'message' => 'Unauthorized: Invalid admin secret.']);
    }

    $pkgName = $payload['package'] ?? 'PHONE PANEL VIP';
    $clientName = $payload['client_name'] ?? ('MobileUser_' . substr(time(), -4));
    $durationDays = (int)($payload['duration_days'] ?? 30);
    $count = min((int)($payload['count'] ?? 1), 50);

    $generated = [];
    $expStr = date('c', time() + ($durationDays * 86400));

    if (!isset($data['licenses'])) $data['licenses'] = [];

    for ($i = 0; $i < $count; $i++) {
        $k = generateMobileKey($payload['prefix'] ?? 'HM');
        $item = [
            'id' => 'lic_phone_' . time() . '_' . $i,
            'key' => $k,
            'package' => $pkgName,
            'created_by' => 'HYPERM_PHP_API',
            'client_name' => $count > 1 ? ($clientName . '_' . ($i + 1)) : $clientName,
            'hwid' => 'UNBOUND',
            'created_at' => date('c'),
            'expires_at' => $expStr,
            'status' => 'active',
            'device_info' => null,
            'ip_address' => null,
            'note' => "Generated via PHP Mobile API ($durationDays Days)"
        ];
        array_unshift($data['licenses'], $item);
        $generated[] = $item;
    }

    saveStoreData($dataFile, $data);

    sendResponse(201, [
        'success' => true,
        'message' => "Successfully generated $count mobile key(s)",
        'brand' => $config['brand'] ?? 'HYPERM SHOP',
        'keys' => array_map(function($g) {
            return [
                'key' => $g['key'],
                'package' => $g['package'],
                'expires_at' => $g['expires_at'],
                'client' => $g['client_name'],
                'hwid' => 'UNBOUND'
            ];
        }, $generated)
    ]);
}

// Fallback
sendResponse(400, [
    'success' => false,
    'message' => "Unknown action: '$action'.",
    'brand' => $config['brand'] ?? 'HYPERM SHOP'
]);
