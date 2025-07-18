import pino from 'pino';
const { default: pinoLogger } = pino;

const logger = pinoLogger({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

export default logger; 