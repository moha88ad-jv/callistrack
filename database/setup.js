/**
 * setup.js – Runs migration + seed directly via the pg driver.
 * Usage (from ANY directory): node database/setup.js
 */
const path = require('path');

// Resolve node_modules relative to THIS file's location (database/../backend)
const backendDir = path.join(__dirname, '..', 'backend');
const { Pool } = require(path.join(backendDir, 'node_modules', 'pg'));
require(path.join(backendDir, 'node_modules', 'dotenv')).config({
  path: path.join(backendDir, '.env')
});

const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');

    const initSQL = fs.readFileSync(path.join(__dirname, '001_init.sql'), 'utf8');
    await client.query(initSQL);
    console.log('✅ Schema applied (001_init.sql)');

    const seedSQL = fs.readFileSync(path.join(__dirname, '002_seed.sql'), 'utf8');
    await client.query(seedSQL);
    console.log('✅ Seed data inserted (002_seed.sql)');

    console.log('\n🎉 Database ready! Test accounts:');
    console.log('   test@example.com   / Test1234!  (Nutzer)');
    console.log('   admin@example.com  / Test1234!  (Admin)');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
