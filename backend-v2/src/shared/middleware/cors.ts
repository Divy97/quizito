import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const whitelist = [
      'https://quizito.vercel.app', // staging
      'http://localhost:3000', // local development
    ];
    
    // Add FRONTEND_URL from .env
    if (process.env.FRONTEND_URL) {
      whitelist.push(process.env.FRONTEND_URL);
    }
    
    if (!origin) {
      return callback(null, true);
    }
    
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const isAllowed = whitelist.some(allowedOrigin => {
      const normalizedAllowed = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;
      return normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

export const corsMiddleware = cors(corsOptions); 