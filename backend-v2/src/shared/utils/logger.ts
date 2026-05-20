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

type LogData = Record<string, unknown> | Error | unknown;
type LogFn = {
  (message: string, data?: LogData): void;
  (data: LogData, message: string): void;
};

const normalizeLogData = (data?: LogData): Record<string, unknown> => {
  if (!data) {
    return {};
  }

  if (data instanceof Error) {
    return { error: data.message, stack: data.stack };
  }

  if (typeof data === 'object') {
    return data as Record<string, unknown>;
  }

  return { value: data };
};

const createLogFn = (
  log: (data: Record<string, unknown>, message: string) => void
): LogFn => {
  return ((first: string | LogData, second?: string | LogData) => {
    if (typeof first === 'string') {
      log(normalizeLogData(second), first);
      return;
    }

    log(normalizeLogData(first), typeof second === 'string' ? second : '');
  }) as LogFn;
};

// Function-specific logger
export const createFunctionLogger = (functionName: string) => {
  const child = logger.child({ function: functionName });

  return {
    fatal: createLogFn((data, message) => child.fatal(data, message)),
    error: createLogFn((data, message) => child.error(data, message)),
    warn: createLogFn((data, message) => child.warn(data, message)),
    info: createLogFn((data, message) => child.info(data, message)),
    debug: createLogFn((data, message) => child.debug(data, message)),
    trace: createLogFn((data, message) => child.trace(data, message)),
  };
};

export default logger; 
