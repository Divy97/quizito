/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Pool } from 'pg';
import { lookup } from 'dns';

// --- START: DNS and Environment Variable Diagnostics ---

console.log('--- Lambda Environment Diagnostics ---');
console.log(`Node.js Version: ${process.version}`);
console.log(`Region: ${process.env.AWS_REGION}`);
console.log(`Stage: ${process.env.STAGE}`);
console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL!;

const testDNSResolution = async () => {
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Skipping DNS test.');
    return;
  }
  return new Promise((resolve) => {
    try {
      const url = new URL(connectionString);
      console.log(`🔍 [IPv4] Testing DNS resolution for: ${url.hostname}`);
      
      lookup(url.hostname, { family: 4 }, (err, address, family) => {
        if (err) {
          console.error('❌ [IPv4] DNS resolution failed:', err);
          resolve(false);
        } else {
          console.log(`✅ [IPv4] DNS resolution successful: ${address} (Family: ${family})`);
          resolve(true);
        }
      });
    } catch (error) {
      console.error('❌ DNS resolution test setup failed:', error);
      resolve(false);
    }
  });
};

// Run DNS test when the module is loaded
testDNSResolution();

console.log('--- End Diagnostics ---');

// --- END: Diagnostics ---


// Supabase pooler requires specific settings
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, 
  min: 0, 
  idleTimeoutMillis: 10000, 
  connectionTimeoutMillis: 10000,
  application_name: 'quizito-backend',
});

pool.on('error', (err) => {
  console.error('Supabase Pool Error:', err);
});

pool.on('connect', () => {
  console.log('✅ Supabase Pool Connected');
});

export default pool; 