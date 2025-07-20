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

const allowedOrigins = [process.env.FRONTEND_URL, 'https://quizito.vercel.app'];

// Middleware

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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