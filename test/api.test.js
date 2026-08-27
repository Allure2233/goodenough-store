const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { DataType, newDb } = require('pg-mem');

function createMemoryPool() {
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
    database.public.registerFunction({
        name: 'current_database',
        args: [],
        returns: DataType.text,
        implementation: () => 'goodenough_test'
    });

    const adapter = database.adapters.createPg();
    return new adapter.Pool();
}

async function request(baseUrl, pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    return {
        status: response.status,
        body: await response.json()
    };
}

test('REST API completes register, cart and order flows', async t => {
    const memoryPool = createMemoryPool();
    const schema = fs.readFileSync(
        path.resolve(__dirname, '..', 'server', 'db', 'schema.sql'),
        'utf8'
    );
    await memoryPool.query(schema);

    const databaseModule = require('../server/db');
    databaseModule.pool.query = memoryPool.query.bind(memoryPool);
    databaseModule.pool.connect = memoryPool.connect.bind(memoryPool);

    const products = require('../server/repositories/products');
    const product = await products.createProduct({
        name: 'API Product',
        series: 'API Series',
        category: 'digital',
        price: 50,
        images: ['https://example.com/api-product.jpg'],
        stock: 10
    }, memoryPool);

    const app = require('../server/server');
    const server = await new Promise(resolve => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        await memoryPool.end();
    });

    const registration = await request(baseUrl, '/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: 'api-user',
            email: 'api@example.com',
            password: 'secret123'
        })
    });
    assert.equal(registration.status, 200);
    assert.equal(registration.body.success, true);
    assert.ok(registration.body.data.token);

    const authorization = {
        Authorization: `Bearer ${registration.body.data.token}`
    };
    const productList = await request(baseUrl, '/products');
    assert.equal(productList.body.data.pagination.total, 1);

    const addToCart = await request(baseUrl, '/cart/items', {
        method: 'POST',
        headers: authorization,
        body: JSON.stringify({
            productId: product._id,
            quantity: 2
        })
    });
    assert.equal(addToCart.body.success, true);

    const checkout = await request(baseUrl, '/orders', {
        method: 'POST',
        headers: authorization,
        body: JSON.stringify({
            shippingAddress: {
                name: 'API User',
                phone: '13800138000',
                address: 'API test address'
            },
            paymentMethod: 'cod'
        })
    });
    assert.equal(checkout.body.success, true);
    assert.equal(checkout.body.data.actualAmount, 100);

    const health = await request(baseUrl, '/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.database.engine, 'PostgreSQL');
});
