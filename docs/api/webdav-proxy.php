<?php
// Meow WebDAV & Remote Cloud Storage CORS Proxy
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PROPFIND, OPTIONS, MKCOL, COPY, MOVE");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Expose-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$targetUrl = '';
if (isset($_SERVER['HTTP_X_TARGET_URL'])) {
    $targetUrl = $_SERVER['HTTP_X_TARGET_URL'];
} elseif (isset($_GET['url'])) {
    $targetUrl = $_GET['url'];
}

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing X-Target-Url header or url parameter"]);
    exit();
}

$targetMethod = $_SERVER['REQUEST_METHOD'];
if (isset($_SERVER['HTTP_X_TARGET_METHOD'])) {
    $targetMethod = $_SERVER['HTTP_X_TARGET_METHOD'];
} elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $targetMethod = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
} elseif (isset($_GET['method'])) {
    $targetMethod = $_GET['method'];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $targetMethod);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 25);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Forward essential headers
$forwardHeaders = [
    'User-Agent: Library-Companion-MD/3.8',
    'Accept: */*'
];

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $forwardHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}
if (isset($_SERVER['HTTP_DEPTH'])) {
    $forwardHeaders[] = 'Depth: ' . $_SERVER['HTTP_DEPTH'];
}
if (isset($_SERVER['CONTENT_TYPE'])) {
    $forwardHeaders[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

// Forward request body for PUT/POST/PROPFIND
$input = file_get_contents('php://input');
if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Proxy cURL Error: " . $curlError]);
    exit();
}

http_response_code($httpCode ?: 200);
if ($contentType) {
    header("Content-Type: " . $contentType);
}
echo $response;
