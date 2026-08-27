// ============================================
// JWT工具函数
// ============================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'goodenough_secret_key_2024_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成JWT Token
 * @param {Object} payload - Token载荷（用户信息）
 * @returns {string} JWT Token
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}

/**
 * 验证JWT Token
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的用户信息，验证失败返回null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * 解码Token（不验证）
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的用户信息
 */
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
