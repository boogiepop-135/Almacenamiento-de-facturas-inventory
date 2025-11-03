// Railway fallback entry point - redirects to backend
// This file allows Railway to start the app from the root directory
// Best practice: Configure Root Directory to 'backend' in Railway Settings

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendPath = join(__dirname, 'backend', 'server.js');

console.log('🚀 Starting backend from root directory...');
console.log('⚠️  Note: For better performance, configure Root Directory to "backend" in Railway Settings');

// Change to backend directory and import server
process.chdir(join(__dirname, 'backend'));

// Import the backend server
import(backendPath).catch((error) => {
  console.error('❌ Error starting server:', error);
  console.error('Make sure backend dependencies are installed: cd backend && npm install');
  process.exit(1);
});

