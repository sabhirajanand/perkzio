import type { Server } from 'http';
import type { Logger } from './config/logger.js';

export interface ShutdownDeps {
  server: Server;
  logger: Logger;
  closeDatabase: () => Promise<void>;
  closeRedis: () => Promise<void>;
}

export function registerShutdownHandlers(deps: ShutdownDeps): void {
  const shutdown = async (signal: string) => {
    deps.logger.info({ signal }, 'shutdown_start');
    await new Promise<void>((resolve) => {
      deps.server.close(() => resolve());
    });
    await deps.closeDatabase();
    await deps.closeRedis();
    deps.logger.info('shutdown_complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}
