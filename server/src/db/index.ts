import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

// Test database connection
pool.connect()
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  }); 