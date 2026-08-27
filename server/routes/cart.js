const express = require('express');
const cart = require('../repositories/cart');
const products = require('../repositories/products');
const { auth } = require('../middleware/auth');

const router = express.Router();

const COUPONS = {
    VIP20: { discount: 0.8, description: 'VIP会员8折优惠' },
    SUMMER30: { discount: 0.7, description: '盛夏焕新7折优惠' },
    NEWUSER: { discount: 0.9, description: '新用户9折优惠' }
};

const response = (res, success, data = null, message = '') => {
    res.json({ success, message, data });
};

router.get('/', auth, async (req, res) => {
    try {
        const result = await cart.getCart(req.userId);
        return response(res, true, {
            items: result.items,
            totalItems: result.totalItems,
            totalPrice: result.totalPrice
        }, '获取成功');
    } catch (error) {
        console.error('Get cart error:', error);
        return response(res, false, null, '获取购物车失败');
    }
});

router.post('/items', auth, async (req, res) => {
    try {
        const quantity = Number.parseInt(req.body.quantity ?? 1, 10);
        if (!Number.isInteger(quantity) || quantity < 1) {
            return response(res, false, null, '数量必须为正整数');
        }

        const product = await products.getById(req.body.productId);
        if (!product) {
            return response(res, false, null, '商品不存在或已下架');
        }

        const currentCart = await cart.getCart(req.userId);
        const existingItem = currentCart.items.find(
            item => item.product._id === product._id
        );
        const nextQuantity = quantity + (existingItem?.quantity || 0);

        if (product.stock < nextQuantity) {
            return response(
                res,
                false,
                null,
                `库存不足，当前库存：${product.stock}`
            );
        }

        await cart.addItem(req.userId, product._id, quantity);
        return response(res, true, null, '添加成功');
    } catch (error) {
        console.error('Add to cart error:', error);
        return response(res, false, null, '添加购物车失败');
    }
});

router.put('/items/:id', auth, async (req, res) => {
    try {
        const quantity = Number.parseInt(req.body.quantity, 10);
        if (!Number.isInteger(quantity) || quantity < 1) {
            return response(res, false, null, '数量不能小于1');
        }

        const product = await products.getById(req.params.id, {
            includeInactive: true
        });
        if (!product) {
            return response(res, false, null, '商品不存在');
        }
        if (product.stock < quantity) {
            return response(
                res,
                false,
                null,
                `库存不足，当前库存：${product.stock}`
            );
        }

        const updated = await cart.updateQuantity(
            req.userId,
            product._id,
            quantity
        );
        if (!updated) {
            return response(res, false, null, '商品不在购物车中');
        }

        return response(res, true, null, '更新成功');
    } catch (error) {
        console.error('Update cart item error:', error);
        return response(res, false, null, '更新购物车失败');
    }
});

router.delete('/items/:id', auth, async (req, res) => {
    try {
        await cart.removeItem(req.userId, req.params.id);
        return response(res, true, null, '删除成功');
    } catch (error) {
        console.error('Delete cart item error:', error);
        return response(res, false, null, '删除失败');
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await cart.clearCart(req.userId);
        return response(res, true, null, '购物车已清空');
    } catch (error) {
        console.error('Clear cart error:', error);
        return response(res, false, null, '清空购物车失败');
    }
});

router.put('/toggle/:id', auth, async (req, res) => {
    try {
        const updated = await cart.toggleItem(req.userId, req.params.id);
        if (!updated) {
            return response(res, false, null, '商品不在购物车中');
        }
        return response(res, true, null, '操作成功');
    } catch (error) {
        console.error('Toggle cart item error:', error);
        return response(res, false, null, '操作失败');
    }
});

router.put('/toggle-all', auth, async (req, res) => {
    try {
        await cart.toggleAll(req.userId, req.body.selected);
        return response(res, true, null, '操作成功');
    } catch (error) {
        console.error('Toggle all cart items error:', error);
        return response(res, false, null, '操作失败');
    }
});

router.post('/validate-coupon', auth, async (req, res) => {
    try {
        const code = String(req.body.code || '').trim().toUpperCase();
        const coupon = COUPONS[code];
        if (!coupon) {
            return response(res, false, null, '优惠券不存在');
        }
        return response(res, true, coupon, '优惠券有效');
    } catch (error) {
        console.error('Validate coupon error:', error);
        return response(res, false, null, '验证失败');
    }
});

module.exports = router;
