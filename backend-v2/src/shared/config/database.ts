import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse connection string to extract components
console.log(process.env.DATABASE_URL);
const connectionString = process.env.DATABASE_URL!;
const url = new URL(connectionString);

const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: parseInt(url.port),
  database: url.pathname.slice(1), // Remove leading slash
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  application_name: 'quizito-backend',
  // Add connection parameters to avoid SCRAM issues
  options: '-c search_path=public -c timezone=utc'
});

export default pool; 