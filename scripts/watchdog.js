const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  NEXT_PORT: 3000,
  PB_PORT: 8090,
  CHECK_INTERVAL: 60000, // 1 minute
  MEMORY_LIMIT_MB: 2048, // 2GB
  EXTERNAL_HEALTH_CHECK_URL: process.env.HEALTH_CHECK_URL || '', // 외부 감시 서비스 URL
  LOG_FILE: path.join(__dirname, '..', 'maintenance.log'),
  BACKUP_DIR: path.join(__dirname, '..', 'backups'),
  PB_EXE: path.join(__dirname, '..', 'backend', 'backend', 'pocketbase.exe'),
  PB_DATA: path.join(__dirname, '..', 'backend', 'backend', 'pb_data')
};

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(CONFIG.LOG_FILE, line);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    }).on('error', () => resolve(false));
    req.end();
  });
}

function isProcessRunning(name) {
  return new Promise((resolve) => {
    exec(`tasklist /fi "imagename eq ${name}"`, (err, stdout) => {
      resolve(stdout.toLowerCase().includes(name.toLowerCase()));
    });
  });
}

function getProcessMemory(name) {
  return new Promise((resolve) => {
    exec(`tasklist /fi "imagename eq ${name}" /fo csv /nh`, (err, stdout) => {
      if (err || !stdout.includes(name)) return resolve(0);
      try {
        const parts = stdout.split(',');
        const memStr = parts[4].replace(/[" K]/g, '').replace(/,/g, '');
        resolve(parseInt(memStr) / 1024); // Return in MB
      } catch (e) { resolve(0); }
    });
  });
}

async function pingExternal() {
  if (!CONFIG.EXTERNAL_HEALTH_CHECK_URL) return;
  try {
    http.get(CONFIG.EXTERNAL_HEALTH_CHECK_URL, (res) => {
      log('External Heartbeat sent successfully.');
    }).on('error', (e) => {
      log(`External Heartbeat Failed: ${e.message}`);
    });
  } catch (e) {
    log(`External Heartbeat Error: ${e.message}`);
  }
}

async function maintain() {
  log('--- Starting Reliability Check ---');

  // 1. Check PocketBase
  const pbRunning = await isProcessRunning('pocketbase.exe');
  if (!pbRunning) {
    log('CRITICAL: PocketBase is DOWN. Restarting...');
    const pb = spawn(CONFIG.PB_EXE, ['serve', '--http', `0.0.0.0:${CONFIG.PB_PORT}`], {
      cwd: path.dirname(CONFIG.PB_EXE),
      detached: true,
      stdio: 'ignore'
    });
    pb.unref();
  } else {
    log('OK: PocketBase is running.');
  }

  // 2. Check Next.js (Port & Memory)
  const nextUp = await checkPort(CONFIG.NEXT_PORT);
  const nextMem = await getProcessMemory('node.exe');
  
  if (!nextUp || nextMem > CONFIG.MEMORY_LIMIT_MB) {
    if (nextMem > CONFIG.MEMORY_LIMIT_MB) log(`WARNING: Memory Limit Exceeded (${nextMem.toFixed(0)}MB). Restarting Next.js...`);
    else log('CRITICAL: Next.js is DOWN. Restarting...');
    
    // Kill old node processes first
    exec('taskkill /f /im node.exe /fi "WINDOWTITLE ne Suprema AI 24/7 Watchdog"');
    
    const next = spawn('cmd.exe', ['/c', 'npm run start'], {
      cwd: path.join(__dirname, '..'),
      detached: true,
      stdio: 'ignore'
    });
    next.unref();
  } else {
    log(`OK: Next.js is healthy (Mem: ${nextMem.toFixed(0)}MB).`);
  }

  // 3. Daily Backup (at 3 AM)
  const now = new Date();
  if (now.getHours() === 3 && now.getMinutes() < 2) {
    log('Starting Daily Backup...');
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) fs.mkdirSync(CONFIG.BACKUP_DIR);
    const backupPath = path.join(CONFIG.BACKUP_DIR, `pb_data_backup_${now.toISOString().split('T')[0]}`);
    exec(`xcopy "${CONFIG.PB_DATA}" "${backupPath}" /E /I /Y`, (err) => {
      if (err) log(`Backup Failed: ${err}`);
      else log(`Backup Success: ${backupPath}`);
    });
  }

  // 4. External Heartbeat
  await pingExternal();
}

log('Suprema Reliability Watchdog Started.');
setInterval(maintain, CONFIG.CHECK_INTERVAL);
maintain();
