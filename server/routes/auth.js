const express = require('express');
const { body, validationResult } = require('express-validator');
const { withTransaction } = require('../db');
const users = require('../repositories/users');
const cart = require('../repositories/cart');
const { generateToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');

const router = express.Router();

const response = (res, success, data = null, message = '') => {
    res.json({ success, message, data });
};

router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('用户名长度3-20个字符'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('请输入有效的邮箱'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('密码至少6个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const { username, email, password } = req.body;
        const existingUser = await users.findConflict(email, username);

        if (existingUser) {
            const field = existingUser.email === email ? '邮箱' : '用户名';
            return response(res, false, null, `${field}已被注册`);
        }

        const user = await withTransaction(async client => {
            const createdUser = await users.createUser(
                { username, email, password },
                client
            );
            await cart.ensureCart(createdUser._id, client);
            return createdUser;
        });
        const token = generateToken({ userId: user._id });

        return response(res, true, { token, user }, '注册成功');
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === '23505') {
            return response(res, false, null, '用户名或邮箱已被注册');
        }
        return response(res, false, null, '注册失败，请稍后重试');
    }
});

router.post('/login', [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const user = await users.findByUsername(req.body.username, {
            includePassword: true
        });
        const passwordMatches = await users.verifyPassword(
            user,
            req.body.password
        );

        if (!user || !passwordMatches) {
            return response(res, false, null, '用户名或密码错误');
        }
        if (!user.isActive) {
            return response(res, false, null, '账户已被禁用');
        }

        const { passwordHash, ...safeUser } = user;
        const token = generateToken({ userId: user._id });
        return response(res, true, {
            token,
            user: safeUser
        }, '登录成功');
    } catch (error) {
        console.error('Login error:', error);
        return response(res, false, null, '登录失败，请稍后重试');
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await users.getProfile(req.userId);
        return response(res, true, user, '获取成功');
    } catch (error) {
        console.error('Get profile error:', error);
        return response(res, false, null, '获取用户信息失败');
    }
});

router.put('/profile', auth, [
    body('phone')
        .optional()
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('手机号格式不正确'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('头像URL格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const updates = {};
        for (const field of ['phone', 'avatar']) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await users.updateProfile(req.userId, updates);
        return response(res, true, user, '更新成功');
    } catch (error) {
        console.error('Update profile error:', error);
        return response(res, false, null, '更新失败');
    }
});

router.put('/password', auth, [
    body('oldPassword').notEmpty().withMessage('请输入原密码'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('新密码至少6个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const user = await users.findById(req.userId, {
            includePassword: true
        });
        const passwordMatches = await users.verifyPassword(
            user,
            req.body.oldPassword
        );

        if (!passwordMatches) {
            return response(res, false, null, '原密码错误');
        }

        await users.updatePassword(req.userId, req.body.newPassword);
        return response(res, true, null, '密码修改成功');
    } catch (error) {
        console.error('Change password error:', error);
        return response(res, false, null, '修改密码失败');
    }
});

router.get('/favorites', auth, async (req, res) => {
    try {
        const favorites = await users.getFavorites(req.userId);
        return response(res, true, favorites, '获取成功');
    } catch (error) {
        console.error('Get favorites error:', error);
        return response(res, false, null, '获取收藏列表失败');
    }
});

router.post('/favorites/:id', auth, async (req, res) => {
    try {
        const added = await users.addFavorite(req.userId, req.params.id);
        if (!added) {
            return response(res, false, null, '商品不存在、已下架或已收藏');
        }
        return response(res, true, null, '添加收藏成功');
    } catch (error) {
        console.error('Add favorite error:', error);
        return response(res, false, null, '添加收藏失败');
    }
});

router.delete('/favorites/:id', auth, async (req, res) => {
    try {
        await users.removeFavorite(req.userId, req.params.id);
        return response(res, true, null, '取消收藏成功');
    } catch (error) {
        console.error('Remove favorite error:', error);
        return response(res, false, null, '取消收藏失败');
    }
});

module.exports = router;
