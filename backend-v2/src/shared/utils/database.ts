import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

// Helper function to get a client from the pool
export const getClient = async (): Promise<any> => {
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
  callback: (client: any) => Promise<T>
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