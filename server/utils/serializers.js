function asNumber(value) {
    return value === null || value === undefined ? null : Number(value);
}

function serializeUser(row, options = {}) {
    if (!row) return null;

    const user = {
        _id: row.id,
        username: row.username,
        email: row.email,
        phone: row.phone || '',
        avatar: row.avatar || '',
        role: row.role,
        addresses: row.addresses || [],
        favorites: options.favorites || [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };

    if (options.includePassword) {
        user.passwordHash = row.password_hash;
    }

    return user;
}

function serializeProduct(row) {
    if (!row) return null;

    const price = asNumber(row.price);
    const originalPrice = asNumber(row.original_price);

    return {
        _id: row.id,
        id: row.id,
        name: row.name,
        series: row.series,
        category: row.category,
        price,
        originalPrice,
        description: row.description || '',
        images: row.images || [],
        stock: Number(row.stock),
        sales: Number(row.sales),
        rating: asNumber(row.rating),
        tags: row.tags || [],
        specs: row.specs || {},
        isActive: row.is_active,
        isFeatured: row.is_featured,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        discount: originalPrice && originalPrice > price
            ? Math.round((1 - price / originalPrice) * 100)
            : 0,
        outOfStock: Number(row.stock) === 0
    };
}

function serializeCartItem(row) {
    return {
        _id: row.cart_item_id,
        product: serializeProduct({
            id: row.product_id,
            name: row.product_name,
            series: row.product_series,
            category: row.product_category,
            price: row.product_price,
            original_price: row.product_original_price,
            description: row.product_description,
            images: row.product_images,
            stock: row.product_stock,
            sales: row.product_sales,
            rating: row.product_rating,
            tags: row.product_tags,
            specs: row.product_specs,
            is_active: row.product_is_active,
            is_featured: row.product_is_featured,
            created_at: row.product_created_at,
            updated_at: row.product_updated_at
        }),
        quantity: Number(row.quantity),
        selected: row.selected
    };
}

function serializeOrderItem(row) {
    const product = row.product_id && row.current_product_name
        ? serializeProduct({
            id: row.product_id,
            name: row.current_product_name,
            series: row.current_product_series,
            category: row.current_product_category,
            price: row.current_product_price,
            original_price: row.current_product_original_price,
            description: row.current_product_description,
            images: row.current_product_images,
            stock: row.current_product_stock,
            sales: row.current_product_sales,
            rating: row.current_product_rating,
            tags: row.current_product_tags,
            specs: row.current_product_specs,
            is_active: row.current_product_is_active,
            is_featured: row.current_product_is_featured,
            created_at: row.current_product_created_at,
            updated_at: row.current_product_updated_at
        })
        : row.product_id;

    return {
        product,
        name: row.name,
        price: asNumber(row.price),
        quantity: Number(row.quantity),
        image: row.image || ''
    };
}

const STATUS_TEXT = {
    pending: '待支付',
    paid: '已支付',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已完成',
    cancelled: '已取消'
};

function serializeOrder(row, items = [], user = null) {
    if (!row) return null;

    const order = {
        _id: row.id,
        id: row.id,
        orderNo: row.order_no,
        user: user || row.user_id,
        products: items,
        totalAmount: asNumber(row.total_amount),
        discountAmount: asNumber(row.discount_amount),
        actualAmount: asNumber(row.actual_amount),
        couponCode: row.coupon_code || '',
        status: row.status,
        statusText: STATUS_TEXT[row.status] || '未知状态',
        shippingAddress: {
            name: row.shipping_name,
            phone: row.shipping_phone,
            address: row.shipping_address
        },
        paymentMethod: row.payment_method,
        paymentTime: row.payment_time,
        deliveryTime: row.delivery_time,
        notes: row.notes || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };

    return order;
}

module.exports = {
    asNumber,
    serializeUser,
    serializeProduct,
    serializeCartItem,
    serializeOrderItem,
    serializeOrder
};
