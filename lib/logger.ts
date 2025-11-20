import fs from 'fs';
import path from 'path';

interface LogContext {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  action?: string;
  user?: string;
  error?: any;
  metadata?: Record<string, any>;
}

/**
 * Log an error with context
 * @param message - The error message
 * @param context - Additional context
 */
export function logError(
  message: string,
  context?: {
    action?: string;
    user?: string;
    error?: any;
    metadata?: Record<string, any>;
  }
): void {
  const logEntry: LogContext = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    ...context,
  };

  // Log to console in all environments
  console.error('[ERROR]', JSON.stringify(logEntry, null, 2));

  // Write to file in production
  if (process.env.NODE_ENV === 'production') {
    writeLogToFile(logEntry);
  }
}

/**
 * Log a warning with context
 * @param message - The warning message
 * @param context - Additional context
 */
export function logWarning(
  message: string,
  context?: {
    action?: string;
    user?: string;
    metadata?: Record<string, any>;
  }
): void {
  const logEntry: LogContext = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    ...context,
  };

  console.warn('[WARN]', JSON.stringify(logEntry, null, 2));

  if (process.env.NODE_ENV === 'production') {
    writeLogToFile(logEntry);
  }
}

/**
 * Log an info message with context
 * @param message - The info message
 * @param context - Additional context
 */
export function logInfo(
  message: string,
  context?: {
    action?: string;
    user?: string;
    metadata?: Record<string, any>;
  }
): void {
  const logEntry: LogContext = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    ...context,
  };

  console.log('[INFO]', JSON.stringify(logEntry, null, 2));

  if (process.env.NODE_ENV === 'production') {
    writeLogToFile(logEntry);
  }
}

/**
 * Write log entry to file
 * @param logEntry - The log entry to write
 */
function writeLogToFile(logEntry: LogContext): void {
  try {
    const logsDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file name based on date
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${date}.log`);

    // Append log entry
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    // If logging fails, at least log to console
    console.error('Failed to write log to file:', error);
  }
}

/**
 * Format error for logging
 * @param error - The error to format
 * @returns Formatted error object
 */
export function formatError(error: any): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}
