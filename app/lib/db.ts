import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'in_discussion', 'completed', 'rejected')),
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
    await client.query(
      "ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS change_requests_status_check"
    );
    await client.query(
      "ALTER TABLE change_requests ADD CONSTRAINT change_requests_status_check CHECK (status IN ('open', 'in_progress', 'in_discussion', 'completed', 'rejected'))"
    );
    await client.query(`
      ALTER TABLE change_requests
      ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::timestamptz,
      ALTER COLUMN created_at SET DEFAULT NOW(),
      ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at::timestamptz,
      ALTER COLUMN updated_at SET DEFAULT NOW()
    `);
  } finally {
    client.release();
  }
}

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export default pool;
