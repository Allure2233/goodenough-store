const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { DataType, newDb } = require('pg-mem');
const users = require('../server/repositories/users');
const products = require('../server/repositories/products');
const cart = require('../server/repositories/cart');
const orders = require('../server/repositories/orders');

function createTransactionRunner(pool) {
    return async callback => {
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
    };
}

test('PostgreSQL repositories support the core shopping workflow', async t => {
    const database = newDb({ autoCreateForeignKeyIndices: true });
    database.public.registerFunction({
        name: 'jsonb_typeof',
        args: [DataType.jsonb],
        returns: DataType.text,
        implementation: value => (
            Array.isArray(value) ? 'array' : typeof value
        )
    });
    database.public.registerFunction({
        name: 'cardinality',
        args: [database.public.getType(DataType.text).asArray()],
        returns: DataType.integer,
        implementation: value => value.length
    });
    const adapter = database.adapters.createPg();
    const pool = new adapter.Pool();
    const schema = fs.readFileSync(
        path.resolve(__dirname, '..', 'server', 'db', 'schema.sql'),
        'utf8'
    );

    t.after(() => pool.end());
    await pool.query(schema);

    const user = await users.createUser({
        username: 'integration-user',
        email: 'integration@example.com',
        password: 'secret123'
    }, pool);
    await cart.ensureCart(user._id, pool);

    const product = await products.createProduct({
        name: 'Integration Product',
        series: 'Test Series',
        category: 'digital',
        price: 100,
        originalPrice: 120,
        images: ['https://example.com/product.jpg'],
        stock: 5,
        isFeatured: true
    }, pool);

    const productList = await products.listProducts({}, {}, pool);
    assert.equal(productList.pagination.total, 1);
    assert.equal(productList.products[0]._id, product._id);

    assert.equal(
        await users.addFavorite(user._id, product._id, pool),
        true
    );
    const favorites = await users.getFavorites(user._id, pool);
    assert.equal(favorites[0]._id, product._id);

    await cart.addItem(user._id, product._id, 2, pool);
    const cartBeforeCheckout = await cart.getCart(user._id, pool);
    assert.equal(cartBeforeCheckout.totalItems, 2);
    assert.equal(cartBeforeCheckout.totalPrice, 200);

    const transactionRunner = createTransactionRunner(pool);
    const order = await orders.createOrder({
        userId: user._id,
        shippingAddress: {
            name: 'Integration User',
            phone: '13800138000',
            address: 'Integration test address'
        },
        couponCode: 'TEST10',
        paymentMethod: 'cod',
        calculateDiscount: (code, amount) => (
            code === 'TEST10' ? amount * 0.1 : 0
        )
    }, transactionRunner);

    assert.equal(order.totalAmount, 200);
    assert.equal(order.actualAmount, 180);
    assert.equal(order.status, 'pending');

    const productAfterCheckout = await products.getById(
        product._id,
        {},
        pool
    );
    assert.equal(productAfterCheckout.stock, 3);
    assert.equal(productAfterCheckout.sales, 2);

    const cartAfterCheckout = await cart.getCart(user._id, pool);
    assert.equal(cartAfterCheckout.items.length, 0);

    assert.equal(
        await orders.cancelOrder(order._id, user._id, transactionRunner),
        true
    );
    const cancelledOrder = await orders.getOrderById(
        order._id,
        user._id,
        pool
    );
    assert.equal(cancelledOrder.status, 'cancelled');

    const restoredProduct = await products.getById(product._id, {}, pool);
    assert.equal(restoredProduct.stock, 5);
    assert.equal(restoredProduct.sales, 0);
});
