// Simple logging utility to replace console.logs
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS = {
  debug: '#8b8b8b',
  info: '#3b82f6',
  warn: '#f59e0b',
  error: '#ef4444'
};

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, component: string, message: string, ...args: any[]) {
    if (!this.isDevelopment && level === 'debug') return;

    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const color = LOG_COLORS[level];
    const prefix = `[${timestamp}] [${component}]`;

    switch (level) {
      case 'debug':
        console.log(`%c${prefix} ${message}`, `color: ${color}`, ...args);
        break;
      case 'info':
        console.info(`%c${prefix} ${message}`, `color: ${color}`, ...args);
        break;
      case 'warn':
        console.warn(`%c${prefix} ${message}`, `color: ${color}`, ...args);
        break;
      case 'error':
        console.error(`%c${prefix} ${message}`, `color: ${color}`, ...args);
        break;
    }
  }

  debug(component: string, message: string, ...args: any[]) {
    this.log('debug', component, message, ...args);
  }

  info(component: string, message: string, ...args: any[]) {
    this.log('info', component, message, ...args);
  }

  warn(component: string, message: string, ...args: any[]) {
    this.log('warn', component, message, ...args);
  }

  error(component: string, message: string, ...args: any[]) {
    this.log('error', component, message, ...args);
  }
}

export const logger = new Logger();

// Convenience exports for common components
export const stockfishLogger = {
  debug: (msg: string, ...args: any[]) => logger.debug('Stockfish', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Stockfish', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('Stockfish', msg, ...args),
  error: (msg: string, ...args: any[]) => logger.error('Stockfish', msg, ...args),
};

export const gameLogger = {
  debug: (msg: string, ...args: any[]) => logger.debug('Game', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Game', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('Game', msg, ...args),
  error: (msg: string, ...args: any[]) => logger.error('Game', msg, ...args),
};

export const puzzleLogger = {
  debug: (msg: string, ...args: any[]) => logger.debug('Puzzle', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Puzzle', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('Puzzle', msg, ...args),
  error: (msg: string, ...args: any[]) => logger.error('Puzzle', msg, ...args),
};

export const openingLogger = {
  debug: (msg: string, ...args: any[]) => logger.debug('Opening', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Opening', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('Opening', msg, ...args),
  error: (msg: string, ...args: any[]) => logger.error('Opening', msg, ...args),
};
