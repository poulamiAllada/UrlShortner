import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000
});

pool.connect()
  .then(() => console.log("DB pool initialized"))
  .catch(err => console.error("DB connection error", err));

const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("DB Query Error:", err.message);
    throw err;
  }
}

export {query};
