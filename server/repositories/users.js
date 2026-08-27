const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { serializeUser, serializeProduct } = require('../utils/serializers');

async function findConflict(email, username, executor = pool) {
    const result = await executor.query(
        `SELECT *
         FROM users
         WHERE LOWER(email) = LOWER($1)
            OR LOWER(username) = LOWER($2)
         LIMIT 1`,
        [email, username]
    );

    return serializeUser(result.rows[0]);
}

async function createUser(data, executor = pool) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const result = await executor.query(
        `INSERT INTO users (
            id, username, email, password_hash, phone, avatar, role
         )
         VALUES ($1, $2, LOWER($3), $4, $5, $6, $7)
         RETURNING *`,
        [
            randomUUID(),
            data.username,
            data.email,
            passwordHash,
            data.phone || null,
            data.avatar || '',
            data.role || 'user'
        ]
    );

    return serializeUser(result.rows[0]);
}

async function findById(id, options = {}, executor = pool) {
    const result = await executor.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
    );

    return serializeUser(result.rows[0], {
        includePassword: options.includePassword
    });
}

async function findByUsername(username, options = {}, executor = pool) {
    const result = await executor.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
        [username]
    );

    return serializeUser(result.rows[0], {
        includePassword: options.includePassword
    });
}

async function verifyPassword(user, candidatePassword) {
    return Boolean(user?.passwordHash)
        && bcrypt.compare(candidatePassword, user.passwordHash);
}

async function updateProfile(id, updates, executor = pool) {
    const fields = [];
    const values = [];

    if (updates.phone !== undefined) {
        values.push(updates.phone || null);
        fields.push(`phone = $${values.length}`);
    }

    if (updates.avatar !== undefined) {
        values.push(updates.avatar || '');
        fields.push(`avatar = $${values.length}`);
    }

    if (fields.length === 0) {
        return findById(id, {}, executor);
    }

    values.push(id);
    const result = await executor.query(
        `UPDATE users
         SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING *`,
        values
    );

    return serializeUser(result.rows[0]);
}

async function updatePassword(id, password, executor = pool) {
    const passwordHash = await bcrypt.hash(password, 10);
    await executor.query(
        `UPDATE users
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, id]
    );
}

async function getFavorites(userId, executor = pool) {
    const result = await executor.query(
        `SELECT p.*
         FROM user_favorites uf
         JOIN products p ON p.id = uf.product_id
         WHERE uf.user_id = $1
         ORDER BY uf.created_at DESC`,
        [userId]
    );

    return result.rows.map(serializeProduct);
}

async function getProfile(userId, executor = pool) {
    const [user, favorites] = await Promise.all([
        findById(userId, {}, executor),
        getFavorites(userId, executor)
    ]);

    return user ? { ...user, favorites } : null;
}

async function addFavorite(userId, productId, executor = pool) {
    const result = await executor.query(
        `INSERT INTO user_favorites (user_id, product_id)
         SELECT $1, id
         FROM products
         WHERE id = $2 AND is_active = TRUE
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING product_id`,
        [userId, productId]
    );

    return result.rowCount > 0;
}

async function removeFavorite(userId, productId, executor = pool) {
    const result = await executor.query(
        `DELETE FROM user_favorites
         WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
    );

    return result.rowCount > 0;
}

module.exports = {
    findConflict,
    createUser,
    findById,
    findByUsername,
    verifyPassword,
    updateProfile,
    updatePassword,
    getProfile,
    getFavorites,
    addFavorite,
    removeFavorite
};
