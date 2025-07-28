import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

// Helper function to get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Helper function to execute a query with error handling
export const executeQuery = async <T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  const client = await getClient();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Helper function to execute a transaction
export const executeTransaction = async <T = any>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  await pool.end();
}; 