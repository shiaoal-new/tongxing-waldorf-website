const { spawn, execSync } = require('child_process');
const http = require('http');

// Config
const PORTS_TO_KILL = [3000, 5001, 5002, 5003, 4000, 4040, 8080, 9099, 9150]; // Common Next.js, Firebase, Ngrok ports

// Colors
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};

function log(prefix, msg, color = colors.reset) {
    console.log(`${color}[${prefix}] ${msg}${colors.reset}`);
}

// 1. Kill existing processes
function killPorts() {
    log('System', '🧹 Cleaning up ports...', colors.yellow);
    try {
        const ports = PORTS_TO_KILL.join(' ');
        // Find PIDs using lsof
        const pids = execSync(`lsof -t -i:${PORTS_TO_KILL.join(' -i:')} || true`).toString().trim();

        if (pids) {
            const pidList = pids.split('\n').join(' ');
            log('System', `Killing PIDs: ${pidList}`, colors.red);
            execSync(`kill -9 ${pidList}`);
        } else {
            log('System', 'No active processes found on target ports.', colors.green);
        }
    } catch (e) {
        // Ignore errors if no processes found
    }
}

// 2. Start a process
function startProcess(name, command, args, cwd = '.', color = colors.reset) {
    log('System', `🚀 Starting ${name}...`, color);
    const proc = spawn(command, args, { cwd, shell: true, stdio: 'pipe' });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line) console.log(`${color}[${name}] ${line}${colors.reset}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (!line) return;

            // Basic heuristic to detect warnings
            const isWarning = line.includes('Warning') || line.includes('warning');

            if (isWarning) {
                console.log(`${colors.yellow}[${name}:WARN] ${line}${colors.reset}`);
            } else {
                console.error(`${colors.red}[${name}:ERR] ${line}${colors.reset}`);
            }
        });
    });

    return proc;
}

// 3. Wait for Ngrok to be ready
function waitForNgrok() {
    return new Promise((resolve) => {
        log('System', '⏳ Waiting for Ngrok to initialize...', colors.cyan);
        const interval = setInterval(() => {
            http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
                if (res.statusCode === 200) {
                    clearInterval(interval);
                    log('System', '✅ Ngrok is ready!', colors.green);
                    resolve();
                }
            }).on('error', () => {
                // connection refused, retry
            });
        }, 1000);
    });
}

async function main() {
    // A. Cleanup
    killPorts();

    // B. Start Long-running processes
    // 1. Frontend
    startProcess('Frontend', 'npm', ['run', 'dev', '--prefix', 'frontend'], '.', colors.blue);

    // 2. Functions (Emulator)
    const functionsProc = startProcess('Firebase', 'npm', ['run', 'serve', '--prefix', 'functions'], '.', colors.yellow);

    // 3. Ngrok
    const ngrokProc = startProcess('Ngrok', 'ngrok', ['http', '5001'], '.', colors.cyan);

    // C. Wait for Ngrok & Update Webhook
    await waitForNgrok();

    // 4. Update Webhook
    log('System', '🔄 Updating LINE Webhook...', colors.green);
    // Since we are running from root, updating webhook script path relative to root
    // functions/scripts/update_webhook.ts requires to be run essentially inside functions context for ts-node loading usually
    // but using --prefix functions handles the npm context.
    startProcess('Webhook', 'npm', ['run', 'update-webhook', '--prefix', 'functions'], '.', colors.green);

}

main().catch(err => console.error(err));
