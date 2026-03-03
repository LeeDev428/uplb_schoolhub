<?php
// Cache-clearing utility — self-deletes after running
// Visit https://westerncollegesinc.ph/cc.php once, then it disappears.
$base = dirname(__DIR__);
chdir($base);

$results = [];
$commands = [
    'php artisan migrate --force',
    'php artisan optimize:clear',
    'php artisan route:cache',
    'php artisan config:cache',
    'php artisan view:cache',
];

foreach ($commands as $cmd) {
    exec($cmd . ' 2>&1', $out, $code);
    $results[] = ['cmd' => $cmd, 'exit' => $code, 'output' => implode("\n", $out)];
    $out = [];
}

header('Content-Type: text/plain');
foreach ($results as $r) {
    echo "$ {$r['cmd']}\n";
    echo $r['output'] . "\n";
    echo "Exit: {$r['exit']}\n\n";
}

// Self-delete
@unlink(__FILE__);
echo "Done. Script removed.\n";
