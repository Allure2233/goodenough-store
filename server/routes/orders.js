const express = require('express');
const { body, validationResult } = require('express-validator');
const orders = require('../repositories/orders');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();
const ORDER_STATUSES = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
];

const response = (res, success, data = null, message = '') => {
    res.json({ success, message, data });
};

function calculateDiscount(code, amount) {
    const coupons = {
        VIP20: 0.8,
        SUMMER30: 0.7,
        NEWUSER: 0.9
    };
    const normalizedCode = String(code || '').trim().toUpperCase();
    const discount = coupons[normalizedCode];
    return discount ? amount * (1 - discount) : 0;
}

router.get('/', auth, async (req, res) => {
    try {
        const result = await orders.listUserOrders(req.userId, req.query);
        return response(res, true, result, '获取成功');
    } catch (error) {
        console.error('Get orders error:', error);
        return response(res, false, null, '获取订单列表失败');
    }
});

router.get('/admin/all', [auth, admin], async (req, res) => {
    try {
        const result = await orders.listAllOrders(req.query);
        return response(res, true, result, '获取成功');
    } catch (error) {
        console.error('Admin get orders error:', error);
        return response(res, false, null, '获取订单列表失败');
    }
});

router.get('/stats/overview', [auth, admin], async (req, res) => {
    try {
        const stats = await orders.getStats();
        return response(res, true, stats, '获取成功');
    } catch (error) {
        console.error('Get order stats error:', error);
        return response(res, false, null, '获取统计数据失败');
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const order = await orders.getOrderById(req.params.id, req.userId);
        if (!order) {
            return response(res, false, null, '订单不存在');
        }
        return response(res, true, order, '获取成功');
    } catch (error) {
        console.error('Get order detail error:', error);
        return response(res, false, null, '获取订单详情失败');
    }
});

router.post('/', auth, [
    body('shippingAddress.name')
        .trim()
        .notEmpty()
        .withMessage('收货人姓名不能为空'),
    body('shippingAddress.phone')
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('手机号格式不正确'),
    body('shippingAddress.address')
        .trim()
        .notEmpty()
        .withMessage('收货地址不能为空'),
    body('paymentMethod')
        .optional()
        .isIn(['alipay', 'wechat', 'card', 'cod'])
        .withMessage('支付方式无效')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, false, errors.array(), errors.array()[0].msg);
        }

        const order = await orders.createOrder({
            userId: req.userId,
            shippingAddress: req.body.shippingAddress,
            couponCode: String(req.body.couponCode || '').trim().toUpperCase(),
            paymentMethod: req.body.paymentMethod || 'cod',
            calculateDiscount
        });

        return response(res, true, order, '订单创建成功');
    } catch (error) {
        console.error('Create order error:', error);
        if ([
            'EMPTY_CART',
            'PRODUCT_INACTIVE',
            'INSUFFICIENT_STOCK'
        ].includes(error.code)) {
            return response(res, false, null, error.message);
        }
        return response(res, false, null, '创建订单失败');
    }
});

router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const cancelled = await orders.cancelOrder(
            req.params.id,
            req.userId
        );
        if (!cancelled) {
            return response(res, false, null, '订单不存在');
        }
        return response(res, true, null, '订单已取消');
    } catch (error) {
        console.error('Cancel order error:', error);
        if (error.code === 'INVALID_ORDER_STATUS') {
            return response(res, false, null, error.message);
        }
        return response(res, false, null, '取消订单失败');
    }
});

router.put('/:id/confirm', auth, async (req, res) => {
    try {
        const result = await orders.confirmDelivery(
            req.params.id,
            req.userId
        );
        if (result === 'not_found') {
            return response(res, false, null, '订单不存在');
        }
        if (result === 'invalid_status') {
            return response(res, false, null, '该订单无法确认收货');
        }
        return response(res, true, null, '确认收货成功');
    } catch (error) {
        console.error('Confirm delivery error:', error);
        return response(res, false, null, '操作失败');
    }
});

router.put('/:id/status', [auth, admin], async (req, res) => {
    try {
        if (!ORDER_STATUSES.includes(req.body.status)) {
            return response(res, false, null, '无效的订单状态');
        }

        const order = await orders.updateStatus(
            req.params.id,
            req.body.status
        );
        if (!order) {
            return response(res, false, null, '订单不存在');
        }
        return response(res, true, order, '状态更新成功');
    } catch (error) {
        console.error('Update order status error:', error);
        return response(res, false, null, '更新失败');
    }
});

module.exports = router;
