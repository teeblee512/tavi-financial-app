import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 TAVI Financial Platform API Server Online`);
  console.log(`Brand: TAVI (Move. Manage. Grow.)`);
  console.log(`Port: ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Base: http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`API Docs: http://localhost:${config.port}/api/docs`);
  console.log(`Health Check: http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
