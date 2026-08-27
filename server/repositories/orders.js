const { randomUUID } = require('crypto');
const { pool, withTransaction } = require('../db');
const cartRepository = require('./cart');
const {
    asNumber,
    serializeOrder,
    serializeOrderItem
} = require('../utils/serializers');

const PRODUCT_COLUMNS = `
    p.name AS current_product_name,
    p.series AS current_product_series,
    p.category AS current_product_category,
    p.price AS current_product_price,
    p.original_price AS current_product_original_price,
    p.description AS current_product_description,
    p.images AS current_product_images,
    p.stock AS current_product_stock,
    p.sales AS current_product_sales,
    p.rating AS current_product_rating,
    p.tags AS current_product_tags,
    p.specs AS current_product_specs,
    p.is_active AS current_product_is_active,
    p.is_featured AS current_product_is_featured,
    p.created_at AS current_product_created_at,
    p.updated_at AS current_product_updated_at
`;

function generateOrderNo() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD${timestamp}${random}`;
}

function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function fetchOrderItems(orderIds, executor = pool) {
    if (orderIds.length === 0) return new Map();

    const result = await executor.query(
        `SELECT
            oi.order_id,
            oi.product_id,
            oi.name,
            oi.price,
            oi.quantity,
            oi.image,
            ${PRODUCT_COLUMNS}
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ANY($1::uuid[])
         ORDER BY oi.order_id, oi.id`,
        [orderIds]
    );

    const itemsByOrder = new Map();
    for (const row of result.rows) {
        if (!itemsByOrder.has(row.order_id)) {
            itemsByOrder.set(row.order_id, []);
        }
        itemsByOrder.get(row.order_id).push(serializeOrderItem(row));
    }

    return itemsByOrder;
}

async function hydrateOrders(rows, options = {}, executor = pool) {
    const itemsByOrder = await fetchOrderItems(
        rows.map(row => row.id),
        executor
    );

    return rows.map(row => {
        const user = options.includeUser
            ? {
                _id: row.user_id,
                username: row.user_username,
                email: row.user_email
            }
            : null;

        return serializeOrder(
            row,
            itemsByOrder.get(row.id) || [],
            user
        );
    });
}

async function listUserOrders(userId, options = {}, executor = pool) {
    const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(options.limit, 10) || 10)
    );
    const values = [userId];
    let statusClause = '';

    if (options.status) {
        values.push(options.status);
        statusClause = `AND status = $${values.length}`;
    }

    const countResult = await executor.query(
        `SELECT COUNT(*)::INTEGER AS total
         FROM orders
         WHERE user_id = $1 ${statusClause}`,
        values
    );

    const listValues = [
        ...values,
        limit,
        (page - 1) * limit
    ];
    const rowsResult = await executor.query(
        `SELECT *
         FROM orders
         WHERE user_id = $1 ${statusClause}
         ORDER BY created_at DESC
         LIMIT $${values.length + 1}
         OFFSET $${values.length + 2}`,
        listValues
    );

    const total = Number(countResult.rows[0].total);
    return {
        orders: await hydrateOrders(rowsResult.rows, {}, executor),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

async function getOrderById(id, userId, executor = pool) {
    const values = [id];
    let userClause = '';

    if (userId) {
        values.push(userId);
        userClause = `AND user_id = $${values.length}`;
    }

    const result = await executor.query(
        `SELECT *
         FROM orders
         WHERE id = $1 ${userClause}
         LIMIT 1`,
        values
    );

    const orders = await hydrateOrders(result.rows, {}, executor);
    return orders[0] || null;
}

async function createOrder(data, transactionRunner = withTransaction) {
    return transactionRunner(async client => {
        const cart = await cartRepository.ensureCart(data.userId, client);
        const selectedResult = await client.query(
            `SELECT
                ci.id AS cart_item_id,
                ci.quantity,
                p.id AS product_id,
                p.name,
                p.price,
                p.images,
                p.stock,
                p.is_active
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = $1 AND ci.selected = TRUE
             ORDER BY ci.created_at
             FOR UPDATE`,
            [cart.id]
        );

        if (selectedResult.rows.length === 0) {
            const error = new Error('请选择要购买的商品');
            error.code = 'EMPTY_CART';
            throw error;
        }

        let totalAmount = 0;
        for (const item of selectedResult.rows) {
            if (!item.is_active) {
                const error = new Error(`${item.name}已下架`);
                error.code = 'PRODUCT_INACTIVE';
                throw error;
            }
            if (Number(item.stock) < Number(item.quantity)) {
                const error = new Error(
                    `${item.name}库存不足，当前库存：${item.stock}`
                );
                error.code = 'INSUFFICIENT_STOCK';
                throw error;
            }
            totalAmount += asNumber(item.price) * Number(item.quantity);
        }

        totalAmount = roundMoney(totalAmount);
        const discountAmount = roundMoney(
            data.calculateDiscount(data.couponCode, totalAmount)
        );
        const actualAmount = roundMoney(totalAmount - discountAmount);
        const orderId = randomUUID();
        const orderNo = generateOrderNo();
        const paymentMethod = data.paymentMethod || 'cod';

        await client.query(
            `INSERT INTO orders (
                id, order_no, user_id, total_amount, discount_amount,
                actual_amount, coupon_code, status, shipping_name,
                shipping_phone, shipping_address, payment_method, payment_time
             )
             VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12, $13
             )`,
            [
                orderId,
                orderNo,
                data.userId,
                totalAmount,
                discountAmount,
                actualAmount,
                data.couponCode || '',
                paymentMethod === 'cod' ? 'pending' : 'paid',
                data.shippingAddress.name,
                data.shippingAddress.phone,
                data.shippingAddress.address,
                paymentMethod,
                paymentMethod === 'cod' ? null : new Date()
            ]
        );

        for (const item of selectedResult.rows) {
            await client.query(
                `UPDATE products
                 SET
                    stock = stock - $1::integer,
                    sales = sales + $1::integer,
                    updated_at = NOW()
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
            await client.query(
                `INSERT INTO order_items (
                    id, order_id, product_id, name, price, quantity, image
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    randomUUID(),
                    orderId,
                    item.product_id,
                    item.name,
                    item.price,
                    item.quantity,
                    item.images?.[0] || ''
                ]
            );
        }

        await client.query(
            `DELETE FROM cart_items
             WHERE cart_id = $1 AND selected = TRUE`,
            [cart.id]
        );
        await client.query(
            'UPDATE carts SET updated_at = NOW() WHERE id = $1',
            [cart.id]
        );

        return getOrderById(orderId, data.userId, client);
    });
}

async function cancelOrder(id, userId, transactionRunner = withTransaction) {
    return transactionRunner(async client => {
        const result = await client.query(
            `SELECT *
             FROM orders
             WHERE id = $1 AND user_id = $2
             FOR UPDATE`,
            [id, userId]
        );
        const order = result.rows[0];

        if (!order) return null;
        if (!['pending', 'paid'].includes(order.status)) {
            const error = new Error('该订单无法取消');
            error.code = 'INVALID_ORDER_STATUS';
            throw error;
        }

        const itemsResult = await client.query(
            `SELECT product_id, quantity
             FROM order_items
             WHERE order_id = $1`,
            [id]
        );

        for (const item of itemsResult.rows) {
            if (!item.product_id) continue;
            await client.query(
                `UPDATE products
                 SET
                    stock = stock + $1::integer,
                    sales = GREATEST(0, sales - $1::integer),
                    updated_at = NOW()
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        await client.query(
            `UPDATE orders
             SET status = 'cancelled', updated_at = NOW()
             WHERE id = $1`,
            [id]
        );

        return true;
    });
}

async function confirmDelivery(id, userId, executor = pool) {
    const result = await executor.query(
        `UPDATE orders
         SET status = 'delivered', delivery_time = NOW(), updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND status = 'shipped'
         RETURNING id`,
        [id, userId]
    );

    if (result.rowCount > 0) return 'updated';

    const existing = await executor.query(
        'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    return existing.rowCount > 0 ? 'invalid_status' : 'not_found';
}

async function updateStatus(id, status, executor = pool) {
    const result = await executor.query(
        `UPDATE orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
    );

    if (result.rowCount === 0) return null;
    const orders = await hydrateOrders(result.rows, {}, executor);
    return orders[0];
}

async function listAllOrders(options = {}, executor = pool) {
    const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(options.limit, 10) || 20)
    );
    const values = [];
    let where = '';

    if (options.status) {
        values.push(options.status);
        where = `WHERE o.status = $${values.length}`;
    }

    const countResult = await executor.query(
        `SELECT COUNT(*)::INTEGER AS total FROM orders o ${where}`,
        values
    );
    const listValues = [
        ...values,
        limit,
        (page - 1) * limit
    ];
    const rowsResult = await executor.query(
        `SELECT
            o.*,
            u.username AS user_username,
            u.email AS user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT $${values.length + 1}
         OFFSET $${values.length + 2}`,
        listValues
    );

    const total = Number(countResult.rows[0].total);
    return {
        orders: await hydrateOrders(
            rowsResult.rows,
            { includeUser: true },
            executor
        ),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

async function getStats(executor = pool) {
    const result = await executor.query(
        `SELECT
            COUNT(*)::INTEGER AS total_orders,
            COUNT(*) FILTER (
                WHERE status = 'pending'
            )::INTEGER AS pending_orders,
            COUNT(*) FILTER (
                WHERE created_at >= CURRENT_DATE
            )::INTEGER AS today_orders,
            COALESCE(SUM(actual_amount), 0) AS total_amount
         FROM orders`
    );
    const row = result.rows[0];

    return {
        totalOrders: Number(row.total_orders),
        pendingOrders: Number(row.pending_orders),
        todayOrders: Number(row.today_orders),
        totalAmount: asNumber(row.total_amount)
    };
}

module.exports = {
    generateOrderNo,
    listUserOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    confirmDelivery,
    updateStatus,
    listAllOrders,
    getStats
};
