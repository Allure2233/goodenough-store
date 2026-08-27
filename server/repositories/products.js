const { randomUUID } = require('crypto');
const { pool } = require('../db');
const { serializeProduct } = require('../utils/serializers');

const SORT_COLUMNS = {
    '-sales': 'sales DESC, rating DESC',
    sales: 'sales ASC, rating DESC',
    '-rating': 'rating DESC, sales DESC',
    rating: 'rating ASC, sales DESC',
    '-price': 'price DESC',
    price: 'price ASC',
    '-createdAt': 'created_at DESC',
    createdAt: 'created_at ASC'
};

function normalizePagination(page, limit, maxLimit = 100) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(
        maxLimit,
        Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    return { page: safePage, limit: safeLimit };
}

function buildFilters(filters, options = {}) {
    const clauses = [];
    const values = [];

    if (!options.includeInactive) {
        clauses.push('is_active = TRUE');
    }

    if (filters.status === 'active') clauses.push('is_active = TRUE');
    if (filters.status === 'inactive') clauses.push('is_active = FALSE');

    if (filters.category) {
        values.push(filters.category);
        clauses.push(`category = $${values.length}`);
    }

    const minPrice = Number(filters.minPrice);
    if (filters.minPrice !== undefined && Number.isFinite(minPrice)) {
        values.push(minPrice);
        clauses.push(`price >= $${values.length}`);
    }

    const maxPrice = Number(filters.maxPrice);
    if (filters.maxPrice !== undefined && Number.isFinite(maxPrice)) {
        values.push(maxPrice);
        clauses.push(`price <= $${values.length}`);
    }

    if (filters.keyword) {
        values.push(`%${filters.keyword}%`);
        const placeholder = `$${values.length}`;
        clauses.push(
            `(name ILIKE ${placeholder}
              OR series ILIKE ${placeholder}
              OR description ILIKE ${placeholder})`
        );
    }

    return {
        where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
        values
    };
}

async function listProducts(filters = {}, options = {}, executor = pool) {
    const pagination = normalizePagination(
        filters.page,
        filters.limit,
        options.maxLimit || 100
    );
    const { where, values } = buildFilters(filters, options);
    const sort = SORT_COLUMNS[filters.sort] || SORT_COLUMNS['-sales'];

    const countResult = await executor.query(
        `SELECT COUNT(*)::INTEGER AS total FROM products ${where}`,
        values
    );

    const queryValues = [
        ...values,
        pagination.limit,
        (pagination.page - 1) * pagination.limit
    ];
    const productsResult = await executor.query(
        `SELECT *
         FROM products
         ${where}
         ORDER BY ${sort}
         LIMIT $${values.length + 1}
         OFFSET $${values.length + 2}`,
        queryValues
    );

    const total = Number(countResult.rows[0].total);
    return {
        products: productsResult.rows.map(serializeProduct),
        pagination: {
            ...pagination,
            total,
            pages: Math.ceil(total / pagination.limit)
        }
    };
}

async function searchProducts(keyword, limit = 20, executor = pool) {
    const safeLimit = normalizePagination(1, limit).limit;
    const result = await executor.query(
        `SELECT *
         FROM products
         WHERE is_active = TRUE
           AND (
               name ILIKE $1
               OR series ILIKE $1
               OR description ILIKE $1
           )
         ORDER BY
             CASE WHEN LOWER(name) = LOWER($2) THEN 0 ELSE 1 END,
             sales DESC,
             rating DESC
         LIMIT $3`,
        [`%${keyword}%`, keyword, safeLimit]
    );

    return result.rows.map(serializeProduct);
}

async function getFeatured(limit = 10, executor = pool) {
    const safeLimit = normalizePagination(1, limit).limit;
    const result = await executor.query(
        `SELECT *
         FROM products
         WHERE is_active = TRUE AND is_featured = TRUE
         ORDER BY sales DESC, rating DESC
         LIMIT $1`,
        [safeLimit]
    );

    return result.rows.map(serializeProduct);
}

async function getById(id, options = {}, executor = pool) {
    const result = await executor.query(
        `SELECT *
         FROM products
         WHERE id = $1 ${options.includeInactive ? '' : 'AND is_active = TRUE'}
         LIMIT 1`,
        [id]
    );

    return serializeProduct(result.rows[0]);
}

async function createProduct(data, executor = pool) {
    const result = await executor.query(
        `INSERT INTO products (
            id, name, series, category, price, original_price,
            description, images, stock, sales, rating, tags, specs,
            is_active, is_featured
         )
         VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13::jsonb,
            $14, $15
         )
         RETURNING *`,
        [
            randomUUID(),
            data.name,
            data.series,
            data.category,
            data.price,
            data.originalPrice ?? null,
            data.description || '',
            data.images,
            data.stock ?? 100,
            data.sales ?? 0,
            data.rating ?? 5,
            data.tags || [],
            JSON.stringify(data.specs || {}),
            data.isActive ?? true,
            data.isFeatured ?? false
        ]
    );

    return serializeProduct(result.rows[0]);
}

async function updateProduct(id, updates, executor = pool) {
    const columnMap = {
        name: 'name',
        series: 'series',
        category: 'category',
        price: 'price',
        originalPrice: 'original_price',
        description: 'description',
        images: 'images',
        stock: 'stock',
        sales: 'sales',
        rating: 'rating',
        tags: 'tags',
        specs: 'specs',
        isActive: 'is_active',
        isFeatured: 'is_featured'
    };
    const fields = [];
    const values = [];

    for (const [key, column] of Object.entries(columnMap)) {
        if (updates[key] === undefined) continue;

        const value = key === 'specs'
            ? JSON.stringify(updates[key] || {})
            : updates[key];
        values.push(value);
        fields.push(
            `${column} = $${values.length}${key === 'specs' ? '::jsonb' : ''}`
        );
    }

    if (fields.length === 0) {
        return getById(id, { includeInactive: true }, executor);
    }

    values.push(id);
    const result = await executor.query(
        `UPDATE products
         SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING *`,
        values
    );

    return serializeProduct(result.rows[0]);
}

async function softDelete(id, executor = pool) {
    return updateProduct(id, { isActive: false }, executor);
}

module.exports = {
    normalizePagination,
    listProducts,
    searchProducts,
    getFeatured,
    getById,
    createProduct,
    updateProduct,
    softDelete
};
