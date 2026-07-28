import app from './app.js';
import config from './app/config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(config.port, () => {
      console.log(`🚀 Server listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 ${signal} signal received. Closing HTTP server and database connection...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

startServer();
