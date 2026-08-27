const { verifyToken } = require('../utils/jwt');
const users = require('../repositories/users');

async function loadUserFromToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice('Bearer '.length);
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
        return null;
    }

    return users.findById(decoded.userId);
}

const auth = async (req, res, next) => {
    try {
        const user = await loadUserFromToken(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token无效或已过期，请重新登录'
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: '账户已被禁用'
            });
        }

        req.user = user;
        req.userId = user._id;
        return next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: '认证失败'
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const user = await loadUserFromToken(req);
        if (user?.isActive) {
            req.user = user;
            req.userId = user._id;
        }
        return next();
    } catch {
        return next();
    }
};

const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '请先登录'
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '权限不足，需要管理员权限'
        });
    }

    return next();
};

module.exports = {
    auth,
    optionalAuth,
    admin
};
