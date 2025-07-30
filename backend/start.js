const { spawn } = require('child_process');
const path = require('path');

console.log('Starting CustomWallApp Backend Server...');

// Start the server
const server = spawn('node', ['Server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
}); 