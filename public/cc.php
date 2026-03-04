<?php
header('Content-Type: text/plain');
$base = dirname(__DIR__);
chdir($base);

// Show last 150 lines of Laravel log
$logFile = $base . '/storage/logs/laravel.log';
echo "=== LAST 150 LINES OF LARAVEL LOG ===\n";
if (file_exists($logFile)) {
    $lines = file($logFile);
    echo implode('', array_slice($lines, -150));
} else {
    echo "Log file not found at: $logFile\n";
    // Show storage directory contents
    $out = []; exec('ls -la ' . escapeshellarg($base . '/storage/logs/') . ' 2>&1', $out);
    echo implode("\n", $out) . "\n";
}

echo "\n\n=== PHP VERSION ===\n";
echo PHP_VERSION . "\n";

echo "\n\n=== RUNNING COMMANDS ===\n";
$commands = [
    'php artisan migrate --force',
    'php artisan optimize:clear',
    'php artisan config:cache',
    'php artisan route:cache',
    'php artisan view:cache',
];
foreach ($commands as $cmd) {
    $out = [];
    exec($cmd . ' 2>&1', $out, $code);
    echo "$ $cmd [exit:$code]\n" . implode("\n", $out) . "\n\n";
    $out = [];
}
echo "Done.\n";
