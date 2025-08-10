import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting build process...');

// Use direct node execution of vite
const vitePath = resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const buildProcess = spawn('node', [vitePath, 'build'], {
  stdio: 'inherit',
  cwd: __dirname
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`Build failed with code ${code}`);
    process.exit(1);
  }
});

buildProcess.on('error', (err) => {
  console.error('Build process error:', err);
  process.exit(1);
});