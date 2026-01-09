import fs from 'fs';
import path from 'path';
import { LogLevel, LogEntry } from '../types';

class Logger {
  private logsDir: string;

  constructor() {
    this.logsDir = path.join(__dirname, '..', '..', 'logs');
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  private writeToFile(filename: string, message: string): void {
    const logFile = path.join(this.logsDir, filename);
    fs.appendFileSync(logFile, message + '\n');
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data);
    
    // Console output with colors
    const colors: Record<LogLevel, string> = {
      INFO: '\x1b[36m',    // Cyan
      SUCCESS: '\x1b[32m', // Green
      WARNING: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[90m'    // Gray
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[level]}[${level}] ${message}${reset}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // Write to file
    const dateStr = new Date().toISOString().split('T')[0];
    this.writeToFile(`app-${dateStr}.log`, formattedMessage);
  }

  public info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  public success(message: string, data?: any): void {
    this.log('SUCCESS', message, data);
  }

  public warning(message: string, data?: any): void {
    this.log('WARNING', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  public debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }
}

export default new Logger();
