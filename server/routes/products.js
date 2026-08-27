const express = require('express');
const { body, validationResult } = require('express-validator');
const products = require('../repositories/products');
const { auth, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const CATEGORIES = [
    'clothing',
    'accessories',
    'digital',
    'home',
    'stationery',
    'bags'
];

const response = (res, success, data = null, message = '') => {
    res.json({ success, message, data });
};

router.get('/', optionalAuth, async (req, res) => {
    try {
        const result = await products.listProducts(req.query);
        return response(res, true, result, '获取成功');
    } catch (error) {
        console.error('Get products error:', error);
        return response(res, false, null, '获取商品列表失败');
    }
});

router.get('/featured', async (req, res) => {
    try {
        const featured = await products.getFeatured(req.query.limit);
        return response(res, true, featured, '获取成功');
    } catch (error) {
        console.error('Get featured products error:', error);
        return response(res, false, null, '获取推荐商品失败');
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;
        if (!q?.trim()) {
            return response(res, false, null, '请输入搜索关键词');
        }

        const result = await products.searchProducts(q.trim(), limit);
        return response(res, true, result, '搜索成功');
    } catch (error) {
        console.error('Search products error:', error);
        return response(res, false, null, '搜索失败');
    }
});

router.get('/admin/all', [auth, admin], async (req, res) => {
    try {
        const result = await products.listProducts(
            {
                ...req.query,
                sort: '-createdAt',
                limit: req.query.limit || 50
            },
            { includeInactive: true }
        );
        return response(res, true, result, '获取成功');
    } catch (error) {
        console.error('Admin get all products error:', error);
        return response(res, false, null, '获取商品列表失败');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await products.getById(req.params.id);
        if (!product) {
            return response(res, false, null, '商品不存在');
        }
        return response(res, true, product, '获取成功');
    } catch (error) {
        console.error('Get product detail error:', error);
        return response(res, false, null, '获取商品详情失败');
    }
});

router.post('/', [auth, admin], [
    body('name').trim().notEmpty().withMessage('商品名称不能为空'),
    body('series').trim().notEmpty().withMessage('系列名称不能为空'),
    body('category').isIn(CATEGORIES).withMessage('商品分类无效'),
    body('price').isFloat({ min: 0 }).withMessage('价格必须为非负数'),
    body('originalPrice')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('原价必须为非负数'),
    body('stock').isInt({ min: 0 }).withMessage('库存必须为非负整数'),
    body('images').isArray({ min: 1 }).withMessage('至少需要一张商品图片')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const product = await products.createProduct({
            name: req.body.name,
            series: req.body.series,
            category: req.body.category,
            price: req.body.price,
            originalPrice: req.body.originalPrice,
            description: req.body.description,
            images: req.body.images,
            stock: req.body.stock,
            tags: req.body.tags || [],
            specs: req.body.specs || {},
            isFeatured: req.body.isFeatured || false
        });

        return response(res, true, product, '商品添加成功');
    } catch (error) {
        console.error('Create product error:', error);
        return response(res, false, null, '添加商品失败');
    }
});

router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const allowedUpdates = [
            'name',
            'series',
            'category',
            'price',
            'originalPrice',
            'description',
            'images',
            'stock',
            'tags',
            'specs',
            'isActive',
            'isFeatured'
        ];
        const updates = {};

        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.category && !CATEGORIES.includes(updates.category)) {
            return response(res, false, null, '商品分类无效');
        }

        const product = await products.updateProduct(req.params.id, updates);
        if (!product) {
            return response(res, false, null, '商品不存在');
        }

        return response(res, true, product, '商品更新成功');
    } catch (error) {
        console.error('Update product error:', error);
        return response(res, false, null, '更新商品失败');
    }
});

router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const product = await products.softDelete(req.params.id);
        if (!product) {
            return response(res, false, null, '商品不存在');
        }
        return response(res, true, null, '商品已删除');
    } catch (error) {
        console.error('Delete product error:', error);
        return response(res, false, null, '删除商品失败');
    }
});

module.exports = router;
