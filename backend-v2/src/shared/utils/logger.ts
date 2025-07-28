import { pino } from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Log levels
export const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Helper functions for structured logging
export const logInfo = (message: string, data?: any) => {
  logger.info(data || {}, message);
};

export const logError = (message: string, error?: any) => {
  logger.error(error || {}, message);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(data || {}, message);
};

export const logDebug = (message: string, data?: any) => {
  logger.debug(data || {}, message);
};

// Function-specific logger
export const createFunctionLogger = (functionName: string) => {
  return logger.child({ function: functionName });
};

export default logger; 