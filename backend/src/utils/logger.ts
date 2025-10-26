import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

class Logger {
  logger: any;

  constructor() {
    this.logger = pino(
      isProd
        ? { name: 'Aurora-jewels', level: process.env.LOG_LEVEL || 'info' }
        : {
            name: 'Aurora-jewels',
            level: process.env.LOG_LEVEL || 'debug',
            transport: {
              target: 'pino-pretty',
              options: { ignore: 'pid,hostname,name', colorize: true },
            },
          }
    );
  }

  info(...args: any[]) {
    (this.logger.info as any)(...args);
  }

  error(...args: any[]) {
    (this.logger.error as any)(...args);
  }

  warn(...args: any[]) {
    (this.logger.warn as any)(...args);
  }
}

export const logger = new Logger();
