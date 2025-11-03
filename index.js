// Railway fallback entry point - redirects to backend
// This file allows Railway to start the app from the root directory
// Best practice: Configure Root Directory to 'backend' in Railway Settings

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendPath = join(__dirname, 'backend', 'server.js');

console.log('🚀 Starting backend from root directory...');
console.log('⚠️  Note: For better performance, configure Root Directory to "backend" in Railway Settings');

const server = spawn('node', [backendPath], {
  cwd: join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

