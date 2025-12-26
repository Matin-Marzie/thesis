import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'thesis_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected database error:', err);
  process.exit(-1);
});

// Function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default pool;
