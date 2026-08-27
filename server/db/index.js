const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL
    || 'postgresql://postgres:postgres@localhost:5432/goodenough';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    max: Number(process.env.PGPOOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', error => {
    console.error('PostgreSQL pool error:', error.message);
});

async function query(text, params) {
    return pool.query(text, params);
}

async function withTransaction(callback) {
    const client = await pool.connect();

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
}

async function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
}

async function checkDatabase() {
    const result = await pool.query(
        'SELECT current_database() AS database, NOW() AS server_time'
    );
    return result.rows[0];
}

async function closeDatabase() {
    await pool.end();
}

function getDatabaseSummary() {
    try {
        const url = new URL(DATABASE_URL);
        return `${url.hostname}:${url.port || '5432'}/${url.pathname.replace(/^\//, '')}`;
    } catch {
        return 'configured PostgreSQL database';
    }
}

module.exports = {
    pool,
    query,
    withTransaction,
    initializeDatabase,
    checkDatabase,
    closeDatabase,
    getDatabaseSummary
};
