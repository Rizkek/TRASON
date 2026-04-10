enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    const level = process.env.LOG_LEVEL || 'info';
    this.logLevel = LogLevel[level.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private formatLog(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    if (meta) {
      return `[${timestamp}] [${level}] ${message} | ${JSON.stringify(meta)}`;
    }
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, meta?: any): void {
    if (this.logLevel === LogLevel.DEBUG) {
      console.log(this.formatLog(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if ([LogLevel.DEBUG, LogLevel.INFO].includes(this.logLevel)) {
      console.log(this.formatLog(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if ([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN].includes(this.logLevel)) {
      console.warn(this.formatLog(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, error?: any, meta?: any): void {
    console.error(this.formatLog(LogLevel.ERROR, message, { error: error?.message, ...meta }));
  }
}

export const logger = new Logger();
