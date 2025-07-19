import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { pinoHttp } from 'pino-http';
import logger from './config/logger.js';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import fileUploadRoutes from './routes/fileUploadRoutes.js';
import serverless from 'serverless-http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(pinoHttp({ 
  logger,
  customLogLevel: function (req: Request, res: Response, error?: Error) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || error) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: function (req: Request, res: Response) {
    return `${req.method} ${req.url} - ${res.statusCode}`
  },
  customErrorMessage: function (req: Request, res: Response, err: Error) {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`
  },
  // Only log essential request/response data
  serializers: {
    req: (req: Request) => ({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode
    })
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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