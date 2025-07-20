import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import fileUploadRoutes from './routes/fileUploadRoutes.js';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

const whitelist = [
  'https://quizito.vercel.app'
];

if (process.env.FRONTEND_URL) {
  whitelist.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('CORS Debug - Request origin:', origin);
    console.log('CORS Debug - Whitelist:', whitelist);
    
    if (!origin) {
        console.log('CORS Debug - No origin, allowing');
        return callback(null, true);
    }
    
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    console.log('CORS Debug - Normalized origin:', normalizedOrigin);

    const isAllowed = whitelist.some(allowedOrigin => {
        const normalizedAllowed = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;
        console.log('CORS Debug - Checking against:', normalizedAllowed);
        return normalizedAllowed === normalizedOrigin;
    });

    console.log('CORS Debug - Is allowed:', isAllowed);

    if (isAllowed) {
      callback(null, true)
    } else {
      console.log('CORS Debug - Origin not allowed, blocking');
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/quizzes', quizRoutes);
app.use('/api', fileUploadRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});


export const handler = serverless(app);