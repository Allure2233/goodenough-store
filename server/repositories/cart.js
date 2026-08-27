const { randomUUID } = require('crypto');
const { pool } = require('../db');
const { serializeCartItem } = require('../utils/serializers');

const PRODUCT_COLUMNS = `
    p.id AS product_id,
    p.name AS product_name,
    p.series AS product_series,
    p.category AS product_category,
    p.price AS product_price,
    p.original_price AS product_original_price,
    p.description AS product_description,
    p.images AS product_images,
    p.stock AS product_stock,
    p.sales AS product_sales,
    p.rating AS product_rating,
    p.tags AS product_tags,
    p.specs AS product_specs,
    p.is_active AS product_is_active,
    p.is_featured AS product_is_featured,
    p.created_at AS product_created_at,
    p.updated_at AS product_updated_at
`;

async function ensureCart(userId, executor = pool) {
    await executor.query(
        `INSERT INTO carts (id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [randomUUID(), userId]
    );

    const result = await executor.query(
        'SELECT * FROM carts WHERE user_id = $1 LIMIT 1',
        [userId]
    );

    return result.rows[0];
}

async function getCart(userId, executor = pool) {
    const cart = await ensureCart(userId, executor);
    const result = await executor.query(
        `SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            ci.selected,
            ${PRODUCT_COLUMNS}
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1 AND p.is_active = TRUE
         ORDER BY ci.created_at ASC`,
        [cart.id]
    );

    const items = result.rows.map(serializeCartItem);
    const totalPrice = items.reduce((total, item) => (
        item.selected ? total + item.product.price * item.quantity : total
    ), 0);

    return {
        _id: cart.id,
        id: cart.id,
        user: userId,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at
    };
}

async function addItem(userId, productId, quantity, executor = pool) {
    const cart = await ensureCart(userId, executor);
    await executor.query(
        `INSERT INTO cart_items (
            id, cart_id, product_id, quantity, selected
         )
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET
            quantity = cart_items.quantity + EXCLUDED.quantity,
            updated_at = NOW()`,
        [randomUUID(), cart.id, productId, quantity]
    );
    await touchCart(cart.id, executor);
}

async function updateQuantity(userId, productId, quantity, executor = pool) {
    const cart = await ensureCart(userId, executor);
    const result = await executor.query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE cart_id = $2 AND product_id = $3`,
        [quantity, cart.id, productId]
    );
    await touchCart(cart.id, executor);
    return result.rowCount > 0;
}

async function removeItem(userId, productId, executor = pool) {
    const cart = await ensureCart(userId, executor);
    const result = await executor.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cart.id, productId]
    );
    await touchCart(cart.id, executor);
    return result.rowCount > 0;
}

async function clearCart(userId, executor = pool) {
    const cart = await ensureCart(userId, executor);
    await executor.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cart.id]
    );
    await touchCart(cart.id, executor);
}

async function toggleItem(userId, productId, executor = pool) {
    const cart = await ensureCart(userId, executor);
    const result = await executor.query(
        `UPDATE cart_items
         SET selected = NOT selected, updated_at = NOW()
         WHERE cart_id = $1 AND product_id = $2`,
        [cart.id, productId]
    );
    await touchCart(cart.id, executor);
    return result.rowCount > 0;
}

async function toggleAll(userId, selected, executor = pool) {
    const cart = await ensureCart(userId, executor);
    await executor.query(
        `UPDATE cart_items
         SET selected = $1, updated_at = NOW()
         WHERE cart_id = $2`,
        [Boolean(selected), cart.id]
    );
    await touchCart(cart.id, executor);
}

async function touchCart(cartId, executor = pool) {
    await executor.query(
        'UPDATE carts SET updated_at = NOW() WHERE id = $1',
        [cartId]
    );
}

module.exports = {
    ensureCart,
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    toggleItem,
    toggleAll
};
