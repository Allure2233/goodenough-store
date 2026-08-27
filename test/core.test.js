const test = require('node:test');
const assert = require('node:assert/strict');
const {
    serializeUser,
    serializeProduct,
    serializeOrder
} = require('../server/utils/serializers');
const {
    normalizePagination
} = require('../server/repositories/products');
const {
    generateOrderNo
} = require('../server/repositories/orders');

test('serializeUser never exposes password hashes by default', () => {
    const user = serializeUser({
        id: 'user-id',
        username: 'tester',
        email: 'tester@example.com',
        password_hash: 'secret-hash',
        role: 'user',
        addresses: [],
        is_active: true
    });

    assert.equal(user._id, 'user-id');
    assert.equal(user.isActive, true);
    assert.equal('password_hash' in user, false);
    assert.equal('passwordHash' in user, false);
});

test('serializeProduct converts PostgreSQL numeric fields and virtuals', () => {
    const product = serializeProduct({
        id: 'product-id',
        name: 'Test product',
        series: 'Test series',
        category: 'digital',
        price: '80.00',
        original_price: '100.00',
        images: ['image.jpg'],
        stock: 0,
        sales: 4,
        rating: '4.5',
        tags: [],
        specs: {},
        is_active: true,
        is_featured: false
    });

    assert.equal(product.price, 80);
    assert.equal(product.originalPrice, 100);
    assert.equal(product.discount, 20);
    assert.equal(product.outOfStock, true);
});

test('serializeOrder preserves the existing camelCase API contract', () => {
    const order = serializeOrder({
        id: 'order-id',
        order_no: 'ORD123',
        user_id: 'user-id',
        total_amount: '100.00',
        discount_amount: '10.00',
        actual_amount: '90.00',
        coupon_code: 'NEWUSER',
        status: 'paid',
        shipping_name: 'Tester',
        shipping_phone: '13800138000',
        shipping_address: 'Test address',
        payment_method: 'card'
    });

    assert.equal(order.orderNo, 'ORD123');
    assert.equal(order.actualAmount, 90);
    assert.equal(order.statusText, '已支付');
    assert.deepEqual(order.shippingAddress, {
        name: 'Tester',
        phone: '13800138000',
        address: 'Test address'
    });
});

test('pagination rejects invalid values and enforces the upper limit', () => {
    assert.deepEqual(normalizePagination('-2', '1000'), {
        page: 1,
        limit: 100
    });
    assert.deepEqual(normalizePagination('3', '12'), {
        page: 3,
        limit: 12
    });
});

test('generated order numbers use the public order number format', () => {
    const orderNo = generateOrderNo();
    assert.match(orderNo, /^ORD[A-Z0-9]+$/);
});
