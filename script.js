const IMAGE_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';
const API_BASE = 'http://localhost:3000/api';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const STORAGE_KEYS = {
    cart: 'goodenough_cart_v2',
    favorites: 'goodenough_favorites_v2',
    orders: 'goodenough_orders_v2',
    subscriber: 'goodenough_subscriber_v2',
    auth: 'goodenough_auth_v2',
    aiKey: 'goodenough_ai_key',
    aiHistory: 'goodenough_ai_history_v2'
};

const CATEGORY_LABELS = {
    clothing: '服饰',
    digital: '数码',
    home: '家居',
    accessories: '配饰'
};

const COUPONS = {
    NEW10: { rate: 0.1, min: 0, label: '新人 9 折' },
    EDIT20: { rate: 0.2, min: 600, label: '编辑精选 8 折' }
};

const products = [
    {
        id: 'ge-101',
        name: '共鸣 Pro 降噪耳机',
        category: 'digital',
        price: 1199,
        originalPrice: 1499,
        rating: 4.9,
        reviews: 426,
        sales: 1680,
        stock: 32,
        badge: 'NEW',
        tags: ['耳机', '通勤', '降噪', '无线'],
        description: '40mm 动圈单元与自适应降噪系统兼顾细节和安静。轻量头梁适合长时间通勤，单次充电可连续使用 38 小时。',
        specs: { 材质: '铝合金 / 蛋白皮', 续航: '38 小时', 连接: '蓝牙 5.3' },
        prompt: 'premium over-ear noise cancelling headphones in matte charcoal and coral accents, isolated product photography on warm light gray studio background, realistic commercial ecommerce image, soft natural shadow, front three-quarter view, no text, no logo'
    },
    {
        id: 'ge-102',
        name: '晨昏无级调光台灯',
        category: 'home',
        price: 469,
        originalPrice: 599,
        rating: 4.8,
        reviews: 238,
        sales: 920,
        stock: 47,
        badge: 'EDITOR PICK',
        tags: ['台灯', '家居', '阅读', '氛围'],
        description: '日落橙与阅读白两组光源独立控制，触控旋钮支持无级调光。底座占用空间小，适合书桌、床头与工作台。',
        specs: { 材质: '铝合金 / 玻璃', 色温: '2700K-5000K', 功率: '12W' },
        prompt: 'minimal sculptural desk lamp with frosted glass shade and brushed silver base, switched on with warm glow, isolated product photography on pale warm gray background, realistic ecommerce image, subtle shadow, no text, no logo'
    },
    {
        id: 'ge-103',
        name: '界面 75 机械键盘',
        category: 'digital',
        price: 829,
        originalPrice: 999,
        rating: 4.8,
        reviews: 351,
        sales: 1450,
        stock: 18,
        badge: 'HOT',
        tags: ['键盘', '办公', '数码', '无线'],
        description: '紧凑 75% 布局保留完整功能区，Gasket 结构提供柔和一致的敲击反馈。支持有线、蓝牙与 2.4G 三模连接。',
        specs: { 配列: '82 键', 连接: '三模', 键帽: 'PBT 热升华' },
        prompt: 'compact 75 percent mechanical keyboard, off-white keycaps with teal and coral accent keys, premium product photography, warm neutral studio background, realistic ecommerce image, top three-quarter view, no text, no logo'
    },
    {
        id: 'ge-104',
        name: '折线通勤双肩包',
        category: 'accessories',
        price: 589,
        originalPrice: 699,
        rating: 4.7,
        reviews: 194,
        sales: 760,
        stock: 56,
        badge: '',
        tags: ['背包', '通勤', '防水', '收纳'],
        description: '防泼水再生尼龙与立体背板兼顾轻量和支撑，独立电脑仓可容纳 16 英寸设备，内部收纳逻辑适合日常通勤。',
        specs: { 容量: '22L', 材质: '再生尼龙', 重量: '780g' },
        prompt: 'modern structured commuter backpack in deep forest green recycled nylon, premium realistic product photography on warm light gray background, subtle studio shadow, front three-quarter view, no text, no logo'
    },
    {
        id: 'ge-105',
        name: '留白羊毛针织开衫',
        category: 'clothing',
        price: 699,
        originalPrice: 899,
        rating: 4.8,
        reviews: 287,
        sales: 630,
        stock: 24,
        badge: 'LIMITED',
        tags: ['针织', '羊毛', '服饰', '秋季'],
        description: '细支美丽诺羊毛织成轻薄而有垂感的轮廓，微落肩剪裁适合叠穿。所有贴身接缝均做柔软处理。',
        specs: { 面料: '100% 美丽诺羊毛', 版型: '宽松', 尺码: 'S / M / L' },
        prompt: 'premium minimalist merino wool cardigan in muted coral red, carefully folded with visible soft knit texture, realistic fashion ecommerce product photography on warm off-white background, no model, no text, no logo'
    },
    {
        id: 'ge-106',
        name: '环流便携蓝牙音箱',
        category: 'digital',
        price: 399,
        originalPrice: 499,
        rating: 4.6,
        reviews: 319,
        sales: 1890,
        stock: 73,
        badge: 'BESTSELLER',
        tags: ['音箱', '户外', '防水', '蓝牙'],
        description: '小体积带来均衡而饱满的 360 度声场，IP67 防尘防水，附可替换织物提环，适合桌面与短途出行。',
        specs: { 防护: 'IP67', 续航: '16 小时', 重量: '520g' },
        prompt: 'compact cylindrical portable bluetooth speaker in deep teal fabric with a bright lime carry loop, realistic commercial product photography on warm neutral background, subtle shadow, no text, no logo'
    },
    {
        id: 'ge-107',
        name: '弧面陶瓷马克杯',
        category: 'home',
        price: 139,
        originalPrice: 169,
        rating: 4.9,
        reviews: 672,
        sales: 2670,
        stock: 108,
        badge: '',
        tags: ['杯子', '陶瓷', '咖啡', '家居'],
        description: '手工修坯保留细微触感，宽口设计便于清洁，弧形杯耳握持自然。高温烧制釉面可用于洗碗机与微波炉。',
        specs: { 容量: '380ml', 材质: '高温陶瓷', 工艺: '哑光釉' },
        prompt: 'handcrafted ceramic coffee mug with soft curved handle, matte off-white glaze and small teal accent, realistic ecommerce product photography on pale warm background, soft morning shadow, no text, no logo'
    },
    {
        id: 'ge-108',
        name: '刻度真空保温杯',
        category: 'home',
        price: 269,
        originalPrice: 329,
        rating: 4.7,
        reviews: 458,
        sales: 2200,
        stock: 86,
        badge: 'HOT',
        tags: ['保温杯', '通勤', '户外', '家居'],
        description: '316L 不锈钢内胆与旋拧密封结构可稳定保温 12 小时，杯盖可直接作为饮水杯使用，适合办公与短途出行。',
        specs: { 容量: '520ml', 材质: '316L 不锈钢', 保温: '12 小时' },
        prompt: 'sleek vacuum insulated travel bottle in brushed stainless steel and burnt coral cap, premium realistic product photography on light gray studio surface, clean shadow, no text, no logo'
    },
    {
        id: 'ge-109',
        name: '轨迹轻量运动外套',
        category: 'clothing',
        price: 799,
        originalPrice: 999,
        rating: 4.7,
        reviews: 166,
        sales: 540,
        stock: 29,
        badge: 'NEW',
        tags: ['外套', '运动', '防风', '服饰'],
        description: '四向弹力面料结合腋下透气结构，日常骑行和轻户外都能保持舒适。隐藏式帽绳减少运动时的干扰。',
        specs: { 面料: '弹力防风织物', 防护: 'UPF 40+', 尺码: 'S / M / L / XL' },
        prompt: 'lightweight technical windbreaker jacket in stone gray with dark teal panels, neatly arranged fashion ecommerce product photography, warm off-white background, no model, realistic fabric, no text, no logo'
    },
    {
        id: 'ge-110',
        name: '棱镜银质吊坠',
        category: 'accessories',
        price: 629,
        originalPrice: 759,
        rating: 4.9,
        reviews: 205,
        sales: 480,
        stock: 15,
        badge: 'LIMITED',
        tags: ['吊坠', '银饰', '礼物', '配饰'],
        description: '几何切面以手工拉丝与镜面抛光交替呈现，随光线变化形成克制的层次。链长可在两档间调节。',
        specs: { 材质: '925 银', 链长: '45 / 50cm', 重量: '8.4g' },
        prompt: 'minimal geometric sterling silver pendant necklace with faceted prism shape, elegant realistic jewelry product photography on warm gray stone surface, crisp detail, soft shadow, no text, no logo'
    },
    {
        id: 'ge-111',
        name: '页间黄铜钢笔',
        category: 'accessories',
        price: 389,
        originalPrice: 459,
        rating: 4.8,
        reviews: 390,
        sales: 1020,
        stock: 64,
        badge: '',
        tags: ['钢笔', '书写', '礼物', '办公'],
        description: '黄铜笔身经过细腻喷砂处理，重量分布适合长时间书写。德制铱金笔尖提供顺滑且有控制感的落笔体验。',
        specs: { 笔尖: 'F / EF', 材质: '黄铜', 上墨: '旋转吸墨器' },
        prompt: 'minimal brushed brass fountain pen with deep teal cap, premium realistic stationery product photography on warm paper background, elegant diagonal composition, soft shadows, no text, no logo'
    },
    {
        id: 'ge-112',
        name: '日影偏光太阳镜',
        category: 'accessories',
        price: 459,
        originalPrice: 559,
        rating: 4.6,
        reviews: 147,
        sales: 590,
        stock: 41,
        badge: 'SEASONAL',
        tags: ['太阳镜', '偏光', '旅行', '配饰'],
        description: '轻量板材镜框结合高清偏光镜片，降低路面与水面的强烈反光。鼻托弧度适合亚洲面部轮廓。',
        specs: { 镜片: 'UV400 偏光', 镜框: '轻量板材', 尺寸: '52-20-145mm' },
        prompt: 'stylish polarized sunglasses with translucent smoke gray frame and subtle coral temple tips, realistic premium ecommerce product photography on pale neutral background, clean hard light shadow, no text, no logo'
    }
];

const state = {
    category: 'all',
    search: '',
    sort: 'featured',
    favoritesOnly: false,
    visibleCount: 8,
    currentProductId: null,
    coupon: null,
    cart: loadStoredObject(STORAGE_KEYS.cart, {}),
    favorites: loadStoredArray(STORAGE_KEYS.favorites),
    orders: loadStoredArray(STORAGE_KEYS.orders),
    auth: loadStoredObject(STORAGE_KEYS.auth, null),
    aiHistory: loadStoredArray(STORAGE_KEYS.aiHistory),
    aiStreaming: false
};

const elements = {};
let revealObserver;

function imageUrl(prompt, imageSize = 'square_hd') {
    return `${IMAGE_API}?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

function productImage(product) {
    if (product && product.id && ['ge-101','ge-102','ge-103','ge-104','ge-105','ge-106','ge-107','ge-108','ge-109','ge-110','ge-111','ge-112'].includes(product.id)) {
        return `images/${product.id}.jpg`;
    }
    return imageUrl(product ? product.prompt : 'premium lifestyle product on warm neutral background, no text, no logo');
}

function loadStoredObject(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function loadStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(state.orders));
}

function currency(value) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        maximumFractionDigits: 0
    }).format(value);
}

function getProduct(id) {
    return products.find(product => product.id === id);
}

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
    }
}

function cacheElements() {
    [
        'siteHeader', 'menuToggle', 'mobileMenu', 'searchToggle', 'searchPanel', 'searchClose',
        'globalSearch', 'catalogSearch', 'sortSelect', 'favoriteFilter', 'categoryTabs',
        'resultCount', 'clearFilters', 'productGrid', 'emptyState', 'emptyReset', 'loadMore',
        'cartToggle', 'cartCount', 'drawerCartCount', 'cartDrawer', 'cartBody', 'cartSummary',
        'drawerBackdrop', 'shippingMessage', 'shippingPercent', 'shippingBar', 'couponInput',
        'couponApply', 'couponFeedback', 'cartSubtotal', 'shippingFee', 'discountLine',
        'discountValue', 'cartTotal', 'checkoutButton', 'ordersToggle', 'ordersDrawer',
        'ordersBody', 'orderDot', 'footerOrders', 'productModal', 'detailImage', 'detailCategory',
        'detailTitle', 'detailRating', 'detailReviews', 'detailPrice', 'detailOriginal',
        'detailDescription', 'detailSpecs', 'detailQuantity', 'detailMinus', 'detailPlus',
        'detailAdd', 'checkoutModal', 'checkoutForm', 'checkoutItems', 'checkoutTotals',
        'checkoutError', 'placeOrder', 'successModal', 'successOrderNo', 'viewOrderButton',
        'newsletterForm', 'newsletterEmail', 'toastRegion', 'heroImage', 'editorialImage',
        'headerAuth', 'authModal', 'loginForm', 'registerForm', 'loginError', 'registerError',
        'loginSubmit', 'registerSubmit', 'profileModal', 'profileAvatar', 'profileTitle',
        'profileEmail', 'profilePhone', 'profileAvatarUrl', 'profileSave', 'profileInfo',
        'profileSecurity', 'profileOrdersPane', 'profileOrdersBody', 'oldPassword', 'newPassword',
        'passwordSave', 'logoutButton', 'aiFab', 'aiChat', 'aiMessages', 'aiInput', 'aiSend',
        'aiClose', 'aiSettings', 'aiSettingsModal', 'aiApiKey', 'aiKeyError', 'aiKeySave'
    ].forEach(id => {
        elements[id] = document.getElementById(id);
    });
}

function setPageImages() {
    elements.heroImage.src = 'images/hero.jpg';
    elements.editorialImage.src = 'images/editorial.jpg';
}

function getFilteredProducts() {
    const query = state.search.trim().toLocaleLowerCase('zh-CN');
    let result = products.filter(product => {
        const categoryMatches = state.category === 'all' || product.category === state.category;
        const text = [product.name, CATEGORY_LABELS[product.category], product.description, ...product.tags]
            .join(' ')
            .toLocaleLowerCase('zh-CN');
        const searchMatches = !query || text.includes(query);
        const favoriteMatches = !state.favoritesOnly || state.favorites.includes(product.id);
        return categoryMatches && searchMatches && favoriteMatches;
    });

    result = [...result].sort((a, b) => {
        switch (state.sort) {
            case 'sales':
                return b.sales - a.sales;
            case 'rating':
                return b.rating - a.rating || b.reviews - a.reviews;
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || b.rating - a.rating;
        }
    });

    return result;
}

function productCardTemplate(product) {
    const favorite = state.favorites.includes(product.id);
    return `
        <article class="product-card reveal" data-product-id="${product.id}">
            <div class="product-media" data-action="details" tabindex="0" role="button" aria-label="查看 ${product.name} 详情">
                <img src="${productImage(product)}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <button class="product-favorite${favorite ? ' active' : ''}" type="button" data-action="favorite" aria-label="${favorite ? '取消收藏' : '收藏'} ${product.name}" title="${favorite ? '取消收藏' : '收藏'}">
                    <i data-lucide="heart"></i>
                </button>
                <button class="quick-add" type="button" data-action="add" aria-label="将 ${product.name} 加入购物车" title="加入购物车">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span>${CATEGORY_LABELS[product.category]}</span>
                    <span>★ ${product.rating} · ${product.reviews} 评价</span>
                </div>
                <h3>${product.name}</h3>
                <div class="product-price-row">
                    <strong>${currency(product.price)}</strong>
                    <del>${currency(product.originalPrice)}</del>
                </div>
            </div>
        </article>
    `;
}

function renderProducts() {
    const filtered = getFilteredProducts();
    const visible = filtered.slice(0, state.visibleCount);

    elements.productGrid.innerHTML = visible.map(productCardTemplate).join('');
    elements.resultCount.textContent = `${filtered.length} 件商品`;
    elements.emptyState.classList.toggle('hidden', filtered.length > 0);
    elements.productGrid.classList.toggle('hidden', filtered.length === 0);
    elements.loadMore.classList.toggle('hidden', filtered.length === 0 || visible.length >= filtered.length);
    elements.clearFilters.classList.toggle(
        'hidden',
        state.category === 'all' && !state.search && !state.favoritesOnly && state.sort === 'featured'
    );

    refreshIcons();
    observeReveals();
    attachImageFallbacks(elements.productGrid);
}

function resetFilters() {
    state.category = 'all';
    state.search = '';
    state.sort = 'featured';
    state.favoritesOnly = false;
    state.visibleCount = 8;
    elements.catalogSearch.value = '';
    elements.globalSearch.value = '';
    elements.sortSelect.value = 'featured';
    elements.favoriteFilter.classList.remove('active');
    elements.favoriteFilter.setAttribute('aria-pressed', 'false');
    document.querySelectorAll('.category-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.category === 'all');
    });
    renderProducts();
}

function setCategory(category, shouldScroll = false) {
    state.category = category;
    state.visibleCount = 8;
    document.querySelectorAll('.category-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.category === category);
    });
    renderProducts();
    if (shouldScroll) {
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleFavorite(productId) {
    const index = state.favorites.indexOf(productId);
    const product = getProduct(productId);
    if (index >= 0) {
        state.favorites.splice(index, 1);
        showToast(`已取消收藏「${product.name}」`);
    } else {
        state.favorites.push(productId);
        showToast(`已收藏「${product.name}」`);
    }
    saveState();
    renderProducts();
}

function normalizeCart() {
    Object.entries(state.cart).forEach(([id, quantity]) => {
        if (!getProduct(id) || !Number.isInteger(quantity) || quantity <= 0) {
            delete state.cart[id];
        } else {
            state.cart[id] = Math.min(quantity, getProduct(id).stock, 10);
        }
    });
}

function cartEntries() {
    return Object.entries(state.cart)
        .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
        .filter(item => item.product);
}

function cartCount() {
    return cartEntries().reduce((sum, item) => sum + item.quantity, 0);
}

function totals() {
    const subtotal = cartEntries().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 300 ? 0 : 18;
    const coupon = state.coupon ? COUPONS[state.coupon] : null;
    const discount = coupon && subtotal >= coupon.min ? Math.round(subtotal * coupon.rate) : 0;
    return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function addToCart(productId, quantity = 1) {
    const product = getProduct(productId);
    if (!product) return;
    const current = state.cart[productId] || 0;
    const next = Math.min(current + quantity, product.stock, 10);
    state.cart[productId] = next;
    saveState();
    renderCart();
    showToast(current === next ? '单件商品最多购买 10 件' : `「${product.name}」已加入购物车`);
}

function updateCartItem(productId, delta) {
    const product = getProduct(productId);
    if (!product || !state.cart[productId]) return;
    const next = state.cart[productId] + delta;
    if (next <= 0) {
        delete state.cart[productId];
    } else {
        state.cart[productId] = Math.min(next, product.stock, 10);
    }
    saveState();
    renderCart();
}

function removeCartItem(productId) {
    const product = getProduct(productId);
    delete state.cart[productId];
    saveState();
    renderCart();
    if (product) showToast(`已移除「${product.name}」`);
}

function cartItemTemplate({ product, quantity }) {
    return `
        <li class="cart-item" data-product-id="${product.id}">
            <img src="${productImage(product)}" alt="${product.name}">
            <div class="cart-item-info">
                <h3>${product.name}</h3>
                <span>${CATEGORY_LABELS[product.category]} · 库存 ${product.stock}</span>
                <strong>${currency(product.price)}</strong>
            </div>
            <div class="cart-item-actions">
                <button class="remove-item" type="button" data-cart-action="remove" aria-label="移除 ${product.name}">
                    <i data-lucide="trash-2"></i>
                </button>
                <div class="mini-stepper">
                    <button type="button" data-cart-action="decrease" aria-label="减少数量"><i data-lucide="minus"></i></button>
                    <span>${quantity}</span>
                    <button type="button" data-cart-action="increase" aria-label="增加数量"><i data-lucide="plus"></i></button>
                </div>
            </div>
        </li>
    `;
}

function renderCart() {
    normalizeCart();
    const entries = cartEntries();
    const count = cartCount();
    const prices = totals();

    elements.cartCount.textContent = count > 99 ? '99+' : count;
    elements.drawerCartCount.textContent = count;
    elements.cartBody.innerHTML = entries.length
        ? `<ul class="cart-items">${entries.map(cartItemTemplate).join('')}</ul>`
        : `
            <div class="cart-empty">
                <i data-lucide="shopping-bag"></i>
                <h3>购物车还是空的</h3>
                <p>从本周精选里挑一件真正需要的物件。</p>
                <button class="button button-dark" type="button" data-cart-action="browse">浏览商品</button>
            </div>
        `;
    elements.cartSummary.classList.toggle('hidden', entries.length === 0);

    const shippingProgress = Math.min(100, Math.round((prices.subtotal / 300) * 100));
    elements.shippingPercent.textContent = `${shippingProgress}%`;
    elements.shippingBar.style.width = `${shippingProgress}%`;
    elements.shippingMessage.textContent = prices.subtotal >= 300
        ? '已享受免运费'
        : `再选购 ${currency(Math.max(0, 300 - prices.subtotal))} 即可免运费`;

    elements.cartSubtotal.textContent = currency(prices.subtotal);
    elements.shippingFee.textContent = prices.shipping ? currency(prices.shipping) : '免运费';
    elements.discountLine.classList.toggle('hidden', prices.discount === 0);
    elements.discountValue.textContent = `-${currency(prices.discount)}`;
    elements.cartTotal.textContent = currency(prices.total);

    if (state.coupon && COUPONS[state.coupon] && prices.subtotal < COUPONS[state.coupon].min) {
        elements.couponFeedback.textContent = `该优惠码满 ${currency(COUPONS[state.coupon].min)} 可用`;
        elements.couponFeedback.classList.add('error');
    }

    refreshIcons();
    attachImageFallbacks(elements.cartBody);
}

function applyCoupon() {
    const code = elements.couponInput.value.trim().toUpperCase();
    const coupon = COUPONS[code];
    elements.couponFeedback.classList.remove('error');

    if (!coupon) {
        state.coupon = null;
        elements.couponFeedback.textContent = '优惠码无效，可试试 NEW10';
        elements.couponFeedback.classList.add('error');
    } else if (totals().subtotal < coupon.min) {
        state.coupon = code;
        elements.couponFeedback.textContent = `该优惠码满 ${currency(coupon.min)} 可用`;
        elements.couponFeedback.classList.add('error');
    } else {
        state.coupon = code;
        elements.couponInput.value = code;
        elements.couponFeedback.textContent = `已使用：${coupon.label}`;
        showToast(`优惠码 ${code} 已生效`);
    }
    renderCart();
}

function openDrawer(drawer) {
    closeAllModals();
    [elements.cartDrawer, elements.ordersDrawer].forEach(item => {
        const open = item === drawer;
        item.classList.toggle('open', open);
        item.setAttribute('aria-hidden', String(!open));
    });
    elements.drawerBackdrop.classList.add('open');
    document.body.classList.add('locked');
    const closeButton = drawer.querySelector('[data-close-drawer]');
    window.setTimeout(() => closeButton?.focus(), 100);
}

function closeDrawers() {
    [elements.cartDrawer, elements.ordersDrawer].forEach(drawer => {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
    });
    elements.drawerBackdrop.classList.remove('open');
    unlockBodyIfClear();
}

function openModal(modal) {
    closeDrawers();
    closeAllModals();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    window.setTimeout(() => {
        const focusTarget = modal.querySelector('button, input, textarea, select');
        focusTarget?.focus();
    }, 100);
}

function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    unlockBodyIfClear();
}

function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    });
    unlockBodyIfClear();
}

function unlockBodyIfClear() {
    const hasOpenLayer = document.querySelector('.drawer.open, .modal-backdrop.open');
    if (!hasOpenLayer) document.body.classList.remove('locked');
}

function openProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    state.currentProductId = productId;
    elements.detailImage.src = productImage(product);
    elements.detailImage.alt = product.name;
    elements.detailCategory.textContent = `${CATEGORY_LABELS[product.category]} / ${product.badge || 'GOOD ENOUGH'}`;
    elements.detailTitle.textContent = product.name;
    elements.detailRating.textContent = `★ ${product.rating}`;
    elements.detailReviews.textContent = `${product.reviews} 条评价`;
    elements.detailPrice.textContent = currency(product.price);
    elements.detailOriginal.textContent = currency(product.originalPrice);
    elements.detailDescription.textContent = product.description;
    elements.detailSpecs.innerHTML = Object.entries(product.specs)
        .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
        .join('');
    elements.detailQuantity.value = '1';
    attachImageFallbacks(elements.productModal);
    openModal(elements.productModal);
}

function changeDetailQuantity(delta) {
    const current = Number.parseInt(elements.detailQuantity.value, 10) || 1;
    elements.detailQuantity.value = String(Math.max(1, Math.min(10, current + delta)));
}

function renderCheckout() {
    const entries = cartEntries();
    const prices = totals();
    elements.checkoutItems.innerHTML = entries.map(({ product, quantity }) => `
        <div class="checkout-review-item">
            <img src="${productImage(product)}" alt="${product.name}">
            <span><strong>${product.name}</strong><small>数量 ${quantity}</small></span>
            <strong>${currency(product.price * quantity)}</strong>
        </div>
    `).join('');
    elements.checkoutTotals.innerHTML = `
        <div class="price-line"><span>商品小计</span><span>${currency(prices.subtotal)}</span></div>
        <div class="price-line"><span>运费</span><span>${prices.shipping ? currency(prices.shipping) : '免运费'}</span></div>
        ${prices.discount ? `<div class="price-line discount-line"><span>优惠</span><span>-${currency(prices.discount)}</span></div>` : ''}
        <div class="price-line"><strong>应付合计</strong><strong>${currency(prices.total)}</strong></div>
    `;
    elements.checkoutError.textContent = '';
    attachImageFallbacks(elements.checkoutItems);
}

function openCheckout() {
    if (!cartEntries().length) {
        showToast('请先选择商品');
        return;
    }
    renderCheckout();
    openModal(elements.checkoutModal);
}

function submitOrder(event) {
    event.preventDefault();
    const form = new FormData(elements.checkoutForm);
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const address = String(form.get('address') || '').trim();
    const payment = String(form.get('payment') || 'wechat');

    if (name.length < 2) {
        elements.checkoutError.textContent = '请填写正确的收货人姓名';
        return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        elements.checkoutError.textContent = '请填写正确的 11 位手机号';
        return;
    }
    if (address.length < 8) {
        elements.checkoutError.textContent = '请填写完整的收货地址';
        return;
    }

    const buttonText = elements.placeOrder.childNodes[0];
    const originalText = buttonText.textContent;
    buttonText.textContent = '正在提交...';
    elements.placeOrder.disabled = true;

    window.setTimeout(() => {
        const prices = totals();
        const now = new Date();
        const order = {
            id: `GE${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            createdAt: now.toISOString(),
            status: payment === 'cod' ? '待发货' : '已支付',
            payment,
            address: { name, phone, address },
            items: cartEntries().map(({ product, quantity }) => ({ id: product.id, quantity })),
            prices,
            coupon: state.coupon
        };

        state.orders.unshift(order);
        state.cart = {};
        state.coupon = null;
        saveState();
        renderCart();
        renderOrders();
        elements.checkoutForm.reset();
        elements.couponInput.value = '';
        elements.couponFeedback.textContent = '';
        buttonText.textContent = originalText;
        elements.placeOrder.disabled = false;
        closeModal(elements.checkoutModal);
        elements.successOrderNo.textContent = order.id;
        openModal(elements.successModal);
    }, 550);
}

function orderCardTemplate(order) {
    const orderProducts = order.items
        .map(item => ({ product: getProduct(item.id), quantity: item.quantity }))
        .filter(item => item.product);
    const visible = orderProducts.slice(0, 4);
    const date = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(order.createdAt));

    return `
        <article class="order-card">
            <div class="order-card-head"><strong>${order.id}</strong><span>${order.status}</span></div>
            <time datetime="${order.createdAt}">${date}</time>
            <div class="order-products">
                ${visible.map(({ product }) => `<img src="${productImage(product)}" alt="${product.name}"` title="${product.name}">`).join('')}
                ${orderProducts.length > visible.length ? `<span class="order-more">+${orderProducts.length - visible.length}</span>` : ''}
            </div>
            <div class="order-card-foot"><span>共 ${order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品</span><strong>${currency(order.prices.total)}</strong></div>
        </article>
    `;
}

function renderOrders() {
    elements.ordersBody.innerHTML = state.orders.length
        ? state.orders.map(orderCardTemplate).join('')
        : `
            <div class="orders-empty">
                <i data-lucide="package-open"></i>
                <h3>还没有订单</h3>
                <p>完成结算后，订单会显示在这里。</p>
                <button class="button button-dark" type="button" data-orders-action="browse">浏览商品</button>
            </div>
        `;
    elements.orderDot.classList.toggle('hidden', state.orders.length === 0);
    refreshIcons();
    attachImageFallbacks(elements.ordersBody);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle-2"></i><span>${message}</span>`;
    elements.toastRegion.appendChild(toast);
    refreshIcons();
    window.setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        window.setTimeout(() => toast.remove(), 220);
    }, 2400);
}

// ============================================
// Auth & Profile
// ============================================

function getAuthToken() {
    return state.auth?.token || null;
}

function isLoggedIn() {
    return !!(state.auth?.token && state.auth?.user);
}

async function apiRequest(path, options = {}) {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return res.json();
}

function renderHeaderAuth() {
    if (isLoggedIn()) {
        const user = state.auth.user;
        const initial = (user.username || 'U')[0].toUpperCase();
        elements.headerAuth.innerHTML = `
            <div class="auth-user" id="authUserBtn" role="button" tabindex="0" aria-label="个人中心">
                <span class="auth-user-avatar">${initial}</span>
                <span class="auth-user-name">${user.username}</span>
            </div>
        `;
        document.getElementById('authUserBtn')?.addEventListener('click', openProfileModal);
        document.getElementById('authUserBtn')?.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfileModal(); }
        });
    } else {
        elements.headerAuth.innerHTML = `
            <button class="auth-btn" type="button" id="loginBtn">登录</button>
            <button class="auth-btn auth-btn-primary" type="button" id="registerBtn">注册</button>
        `;
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            switchAuthTab('login');
            openModal(elements.authModal);
        });
        document.getElementById('registerBtn')?.addEventListener('click', () => {
            switchAuthTab('register');
            openModal(elements.authModal);
        });
    }
    refreshIcons();
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.authTab === tab);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === (tab === 'login' ? 'loginForm' : 'registerForm'));
    });
    elements.loginError.textContent = '';
    elements.registerError.textContent = '';
}

async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(elements.loginForm);
    const username = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '').trim();
    if (!username || !password) {
        elements.loginError.textContent = '请填写用户名和密码';
        return;
    }
    elements.loginSubmit.textContent = '登录中...';
    elements.loginSubmit.disabled = true;
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.success) {
            state.auth = { token: data.data.token, user: data.data.user };
            localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
            renderHeaderAuth();
            closeModal(elements.authModal);
            elements.loginForm.reset();
            showToast(`欢迎回来，${data.data.user.username}`);
        } else {
            elements.loginError.textContent = data.message || '登录失败';
        }
    } catch {
        elements.loginError.textContent = '服务未启动，请先启动后端API或使用本地模式';
    }
    elements.loginSubmit.textContent = '登录';
    elements.loginSubmit.disabled = false;
}

async function handleRegister(event) {
    event.preventDefault();
    const form = new FormData(elements.registerForm);
    const username = String(form.get('username') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '').trim();
    if (!username || !email || !password) {
        elements.registerError.textContent = '请填写所有字段';
        return;
    }
    elements.registerSubmit.textContent = '注册中...';
    elements.registerSubmit.disabled = true;
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        if (data.success) {
            state.auth = { token: data.data.token, user: data.data.user };
            localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
            renderHeaderAuth();
            closeModal(elements.authModal);
            elements.registerForm.reset();
            showToast('注册成功，欢迎加入');
        } else {
            elements.registerError.textContent = data.message || '注册失败';
        }
    } catch {
        elements.registerError.textContent = '服务未启动，请先启动后端API';
    }
    elements.registerSubmit.textContent = '注册';
    elements.registerSubmit.disabled = false;
}

function handleLogout() {
    state.auth = null;
    localStorage.removeItem(STORAGE_KEYS.auth);
    renderHeaderAuth();
    closeModal(elements.profileModal);
    showToast('已退出登录');
}

function openProfileModal() {
    if (!isLoggedIn()) {
        switchAuthTab('login');
        openModal(elements.authModal);
        return;
    }
    const user = state.auth.user;
    const initial = (user.username || 'U')[0].toUpperCase();
    elements.profileAvatar.textContent = initial;
    elements.profileTitle.textContent = user.username;
    elements.profileEmail.textContent = user.email || '';
    elements.profilePhone.value = user.phone || '';
    elements.profileAvatarUrl.value = user.avatar || '';
    switchProfileTab('info');
    renderProfileOrders();
    openModal(elements.profileModal);
}

function switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.profileTab === tab);
    });
    const paneMap = { info: 'profileInfo', security: 'profileSecurity', orders: 'profileOrdersPane' };
    document.querySelectorAll('.profile-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === paneMap[tab]);
    });
}

async function saveProfile() {
    const phone = elements.profilePhone.value.trim();
    const avatar = elements.profileAvatarUrl.value.trim();
    elements.profileSave.textContent = '保存中...';
    elements.profileSave.disabled = true;
    try {
        const data = await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ phone, avatar })
        });
        if (data.success) {
            state.auth.user = data.data;
            localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
            renderHeaderAuth();
            const initial = (data.data.username || 'U')[0].toUpperCase();
            elements.profileAvatar.textContent = initial;
            showToast('资料已更新');
        } else {
            showToast(data.message || '更新失败');
        }
    } catch {
        showToast('服务未启动，无法保存');
    }
    elements.profileSave.textContent = '保存修改';
    elements.profileSave.disabled = false;
}

async function changePassword() {
    const oldPwd = elements.oldPassword.value;
    const newPwd = elements.newPassword.value;
    if (!oldPwd || !newPwd) {
        showToast('请填写原密码和新密码');
        return;
    }
    elements.passwordSave.textContent = '修改中...';
    elements.passwordSave.disabled = true;
    try {
        const data = await apiRequest('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
        });
        if (data.success) {
            elements.oldPassword.value = '';
            elements.newPassword.value = '';
            showToast('密码修改成功');
        } else {
            showToast(data.message || '修改失败');
        }
    } catch {
        showToast('服务未启动，无法修改');
    }
    elements.passwordSave.textContent = '修改密码';
    elements.passwordSave.disabled = false;
}

function renderProfileOrders() {
    if (!state.orders.length) {
        elements.profileOrdersBody.innerHTML = '<div class="profile-empty">还没有订单记录</div>';
        return;
    }
    elements.profileOrdersBody.innerHTML = state.orders.slice(0, 5).map(order => {
        const items = order.items || [];
        const firstItem = items[0];
        const product = firstItem ? getProduct(firstItem.id) : null;
        return `
            <div class="profile-order-item">
                ${product ? `<img src="${productImage(product)}" alt="${product.name}">` : ''}
                <div class="info">
                    <strong>${order.id}</strong>
                    <small>${order.status} · ${items.length} 件商品</small>
                </div>
                <span class="price">${currency(order.prices.total)}</span>
            </div>
        `;
    }).join('');
    attachImageFallbacks(elements.profileOrdersBody);
}

// ============================================
// AI Shopping Assistant
// ============================================

const AI_SYSTEM_PROMPT = `你是"古德因纳夫商城"的AI购物助手，名字叫"小古"。你的任务是帮助顾客挑选商品、解答疑问、提供购物建议。

回复规则：
1. 用友好、简洁的中文回复，像一个贴心的导购员
2. 推荐商品时，使用标记格式 [PRODUCT:商品ID] 让前端自动渲染为可点击的商品卡片
3. 可以推荐多个商品，每个商品ID独占一行标记
4. 如果没有合适的商品，诚实告知并引导顾客浏览商品分类
5. 回复控制在200字以内，突出商品卖点`;

function buildAiProductContext() {
    return products.map(p =>
        `ID:${p.id} | ${p.name} | ${p.category} | ¥${p.price}（原价¥${p.originalPrice}）| 评分${p.rating} | 库存${p.stock} | 标签:${(p.tags || []).join('、')} | ${p.description}`
    ).join('\n');
}

function buildAiMockReply(message) {
    const lower = message.toLowerCase();
    const keywordMap = {
        '耳机': 'ge-101', '降噪': 'ge-101',
        '台灯': 'ge-102', '灯': 'ge-102',
        '键盘': 'ge-103',
        '背包': 'ge-104', '包': 'ge-104', '通勤包': 'ge-104',
        '针织': 'ge-105', '开衫': 'ge-105', '毛衣': 'ge-105',
        '音箱': 'ge-106',
        '杯': 'ge-107', '马克杯': 'ge-107', '咖啡': 'ge-107',
        '保温': 'ge-108',
        '外套': 'ge-109', '运动外套': 'ge-109',
        '吊坠': 'ge-110', '项链': 'ge-110', '银饰': 'ge-110',
        '钢笔': 'ge-111', '笔': 'ge-111',
        '太阳镜': 'ge-112', '眼镜': 'ge-112',
    };
    for (const [keyword, id] of Object.entries(keywordMap)) {
        if (lower.includes(keyword)) {
            const product = getProduct(id);
            if (product) {
                return `根据您的需求，推荐这款「${product.name}」：\n\n${product.description}\n\n现价 ${currency(product.price)}，评分 ${product.rating} 星，库存 ${product.stock} 件。\n\n[PRODUCT:${id}]\n\n您还想知道其他信息吗？`;
            }
        }
    }
    if (lower.includes('推荐') || lower.includes('热门') || lower.includes('畅销') || lower.includes('精选')) {
        const featured = products.filter(p => p.badge).slice(0, 3);
        let reply = '为您推荐本周精选好物：\n\n';
        featured.forEach(p => { reply += `[PRODUCT:${p.id}]\n`; });
        reply += '\n这些都是本周编辑精选，品质有保障。您对哪类商品感兴趣？';
        return reply;
    }
    if (lower.includes('数码') || lower.includes('电子')) {
        const digital = products.filter(p => p.category === 'digital').slice(0, 3);
        let reply = '这些数码好物值得一试：\n\n';
        digital.forEach(p => { reply += `[PRODUCT:${p.id}]\n`; });
        reply += '\n从耳机到键盘，覆盖通勤与办公场景。';
        return reply;
    }
    return `您好！我是小古，古德因纳夫商城的 AI 购物助手。\n\n我可以帮您：\n- 推荐合适的商品\n- 对比不同商品\n- 解答购物疑问\n\n您可以告诉我您的需求，比如"推荐一款耳机"或"有什么家居好物"。\n\n本周精选：\n[PRODUCT:ge-101]\n[PRODUCT:ge-107]\n[PRODUCT:ge-106]`;
}

function renderAiMessageContent(text) {
    const parts = text.split(/(\[PRODUCT:[^\]]+\])/g);
    return parts.map(part => {
        const match = part.match(/\[PRODUCT:([^\]]+)\]/);
        if (match) {
            const product = getProduct(match[1]);
            if (product) {
                return `
                    <div class="ai-product-card" data-product-card="${product.id}" role="button" tabindex="0">
                        <img src="${productImage(product)}" alt="${product.name}">
                        <div class="pcard-info">
                            <div class="pcard-name">${product.name}</div>
                            <div class="pcard-price">${currency(product.price)} <del>${currency(product.originalPrice)}</del></div>
                        </div>
                    </div>
                `;
            }
            return '';
        }
        return part ? `<span>${part}</span>` : '';
    }).join('');
}

function appendAiMessage(role, content) {
    const wrapper = document.createElement('div');
    wrapper.className = `ai-msg ai-msg-${role === 'user' ? 'user' : 'bot'}`;
    if (role === 'user') {
        wrapper.textContent = content;
    } else {
        wrapper.innerHTML = renderAiMessageContent(content);
        wrapper.querySelectorAll('[data-product-card]').forEach(card => {
            card.addEventListener('click', () => {
                const pid = card.dataset.productCard;
                toggleAiChat(false);
                openProduct(pid);
            });
        });
    }
    elements.aiMessages.appendChild(wrapper);
    elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
    return wrapper;
}

function showAiTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-msg ai-msg-bot';
    typing.id = 'aiTyping';
    typing.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
    elements.aiMessages.appendChild(typing);
    elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
    return typing;
}

function toggleAiChat(forceOpen) {
    const shouldOpen = forceOpen !== undefined ? forceOpen : !elements.aiChat.classList.contains('open');
    elements.aiChat.classList.toggle('open', shouldOpen);
    elements.aiChat.setAttribute('aria-hidden', String(!shouldOpen));
    elements.aiFab.style.display = shouldOpen ? 'none' : 'flex';
    if (shouldOpen) {
        renderAiHistory();
        window.setTimeout(() => elements.aiInput?.focus(), 200);
    }
}

function renderAiHistory() {
    if (!state.aiHistory.length) return;
    elements.aiMessages.innerHTML = '';
    state.aiHistory.forEach(msg => {
        appendAiMessage(msg.role, msg.content);
    });
}

function saveAiHistory() {
    localStorage.setItem(STORAGE_KEYS.aiHistory, JSON.stringify(state.aiHistory.slice(-20)));
}

async function sendAiMessage(text) {
    if (!text || !text.trim() || state.aiStreaming) return;
    appendAiMessage('user', text);
    state.aiHistory.push({ role: 'user', content: text });
    saveAiHistory();
    elements.aiInput.value = '';
    elements.aiInput.style.height = 'auto';

    const typing = showAiTyping();
    state.aiStreaming = true;
    elements.aiSend.disabled = true;

    const productContext = products.map(p => ({
        id: p.id, name: p.name, category: p.category,
        price: p.price, originalPrice: p.originalPrice,
        rating: p.rating, stock: p.stock, tags: p.tags, description: p.description
    }));

    let fullReply = '';
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg ai-msg-bot';

    try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: state.aiHistory.slice(-12, -1),
                products: productContext
            }),
            signal: controller.signal
        });

        window.clearTimeout(timeoutId);

        if (!response.ok) throw new Error('API error');
        typing.remove();
        elements.aiMessages.appendChild(botMsg);
        elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let lastRender = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            const now = Date.now();
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        fullReply += parsed.content;
                        if (now - lastRender > 50) {
                            botMsg.innerHTML = renderAiMessageContent(fullReply);
                            botMsg.querySelectorAll('[data-product-card]').forEach(card => {
                                card.addEventListener('click', () => {
                                    toggleAiChat(false);
                                    openProduct(card.dataset.productCard);
                                });
                            });
                            elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
                            lastRender = now;
                        }
                    }
                } catch { /* skip */ }
            }
        }

        if (!fullReply) {
            fullReply = buildAiMockReply(text);
        }
        botMsg.innerHTML = renderAiMessageContent(fullReply);
        botMsg.querySelectorAll('[data-product-card]').forEach(card => {
            card.addEventListener('click', () => {
                toggleAiChat(false);
                openProduct(card.dataset.productCard);
            });
        });
        elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;

    } catch {
        typing.remove();
        fullReply = buildAiMockReply(text);
        const chunks = fullReply.match(/[\s\S]{1,3}/g) || [fullReply];
        for (const chunk of chunks) {
            if (!botMsg.parentNode) elements.aiMessages.appendChild(botMsg);
            botMsg.innerHTML = renderAiMessageContent(
                (botMsg.dataset.partial || '') + chunk
            );
            botMsg.dataset.partial = (botMsg.dataset.partial || '') + chunk;
            elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
            await new Promise(r => setTimeout(r, 50));
        }
        fullReply = botMsg.dataset.partial || fullReply;
        botMsg.removeAttribute('data-partial');
        botMsg.innerHTML = renderAiMessageContent(fullReply);
        botMsg.querySelectorAll('[data-product-card]').forEach(card => {
            card.addEventListener('click', () => {
                toggleAiChat(false);
                openProduct(card.dataset.productCard);
            });
        });
    }

    state.aiHistory.push({ role: 'assistant', content: fullReply });
    saveAiHistory();
    state.aiStreaming = false;
    elements.aiSend.disabled = false;
}

function saveAiApiKey() {
    const key = elements.aiApiKey.value.trim();
    localStorage.setItem(STORAGE_KEYS.aiKey, key);
    elements.aiKeyError.textContent = '';
    closeModal(elements.aiSettingsModal);
    showToast(key ? 'API Key 已保存' : '已清除 API Key，将使用 Mock 模式');
}

function bindAiEvents() {
    elements.aiFab.addEventListener('click', () => toggleAiChat(true));
    elements.aiClose.addEventListener('click', () => toggleAiChat(false));
    elements.aiSend.addEventListener('click', () => sendAiMessage(elements.aiInput.value.trim()));
    elements.aiInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAiMessage(elements.aiInput.value.trim());
        }
    });
    elements.aiInput.addEventListener('input', () => {
        elements.aiInput.style.height = 'auto';
        elements.aiInput.style.height = Math.min(elements.aiInput.scrollHeight, 80) + 'px';
    });
    elements.aiSettings.addEventListener('click', () => {
        elements.aiApiKey.value = localStorage.getItem(STORAGE_KEYS.aiKey) || '';
        openModal(elements.aiSettingsModal);
    });
    elements.aiKeySave.addEventListener('click', saveAiApiKey);
    document.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            elements.aiInput.value = chip.textContent;
            sendAiMessage(chip.textContent);
        });
    });
}

function bindAuthEvents() {
    document.querySelectorAll('[data-auth-tab]').forEach(btn => {
        btn.addEventListener('click', () => switchAuthTab(btn.dataset.authTab));
    });
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.profileSave.addEventListener('click', saveProfile);
    elements.passwordSave.addEventListener('click', changePassword);
    elements.logoutButton.addEventListener('click', handleLogout);
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => switchProfileTab(tab.dataset.profileTab));
    });
}

function attachImageFallbacks(container) {
    container.querySelectorAll('img').forEach(image => {
        if (image.dataset.fallbackReady) return;
        image.dataset.fallbackReady = 'true';
        image.addEventListener('error', () => {
            if (image.dataset.fallbackUsed) return;
            image.dataset.fallbackUsed = 'true';
            image.src = 'images/fallback.jpg';
        });
    });
}

function observeReveals() {
    if (!revealObserver) return;
    document.querySelectorAll('.reveal:not(.visible)').forEach(element => revealObserver.observe(element));
}

function initializeRevealObserver() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
        return;
    }
    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
}

function openSearch() {
    elements.searchPanel.classList.add('open');
    elements.searchPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    window.setTimeout(() => elements.globalSearch.focus(), 120);
}

function closeSearch() {
    elements.searchPanel.classList.remove('open');
    elements.searchPanel.setAttribute('aria-hidden', 'true');
    unlockBodyIfClear();
}

function applySearch(query, shouldScroll = false) {
    state.search = query;
    state.visibleCount = 8;
    elements.catalogSearch.value = query;
    elements.globalSearch.value = query;
    renderProducts();
    if (shouldScroll) {
        closeSearch();
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    }
}

function bindEvents() {
    window.addEventListener('scroll', () => {
        elements.siteHeader.classList.toggle('scrolled', window.scrollY > 16);
    }, { passive: true });

    elements.menuToggle.addEventListener('click', () => {
        const open = elements.mobileMenu.classList.toggle('open');
        elements.menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    elements.mobileMenu.addEventListener('click', event => {
        if (event.target.closest('a')) elements.mobileMenu.classList.remove('open');
    });

    elements.categoryTabs.addEventListener('click', event => {
        const button = event.target.closest('[data-category]');
        if (button) setCategory(button.dataset.category);
    });

    document.querySelectorAll('[data-category-jump]').forEach(button => {
        button.addEventListener('click', () => setCategory(button.dataset.categoryJump, true));
    });

    elements.catalogSearch.addEventListener('input', event => applySearch(event.target.value));
    elements.sortSelect.addEventListener('change', event => {
        state.sort = event.target.value;
        renderProducts();
    });
    elements.favoriteFilter.addEventListener('click', () => {
        state.favoritesOnly = !state.favoritesOnly;
        state.visibleCount = 8;
        elements.favoriteFilter.classList.toggle('active', state.favoritesOnly);
        elements.favoriteFilter.setAttribute('aria-pressed', String(state.favoritesOnly));
        renderProducts();
    });
    elements.clearFilters.addEventListener('click', resetFilters);
    elements.emptyReset.addEventListener('click', resetFilters);
    elements.loadMore.addEventListener('click', () => {
        state.visibleCount += 4;
        renderProducts();
    });

    elements.productGrid.addEventListener('click', event => {
        const card = event.target.closest('[data-product-id]');
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (!card || !action) return;
        if (action === 'favorite') toggleFavorite(card.dataset.productId);
        if (action === 'add') addToCart(card.dataset.productId);
        if (action === 'details') openProduct(card.dataset.productId);
    });
    elements.productGrid.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-action="details"]')) {
            event.preventDefault();
            openProduct(event.target.closest('[data-product-id]').dataset.productId);
        }
    });

    elements.cartToggle.addEventListener('click', () => openDrawer(elements.cartDrawer));
    elements.ordersToggle.addEventListener('click', () => openDrawer(elements.ordersDrawer));
    elements.footerOrders.addEventListener('click', () => openDrawer(elements.ordersDrawer));
    elements.drawerBackdrop.addEventListener('click', closeDrawers);
    document.querySelectorAll('[data-close-drawer]').forEach(button => button.addEventListener('click', closeDrawers));

    elements.cartBody.addEventListener('click', event => {
        const action = event.target.closest('[data-cart-action]')?.dataset.cartAction;
        const productId = event.target.closest('[data-product-id]')?.dataset.productId;
        if (action === 'increase') updateCartItem(productId, 1);
        if (action === 'decrease') updateCartItem(productId, -1);
        if (action === 'remove') removeCartItem(productId);
        if (action === 'browse') {
            closeDrawers();
            document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        }
    });
    elements.ordersBody.addEventListener('click', event => {
        if (event.target.closest('[data-orders-action="browse"]')) {
            closeDrawers();
            document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        }
    });

    elements.couponApply.addEventListener('click', applyCoupon);
    elements.couponInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') applyCoupon();
    });
    elements.checkoutButton.addEventListener('click', openCheckout);

    elements.detailMinus.addEventListener('click', () => changeDetailQuantity(-1));
    elements.detailPlus.addEventListener('click', () => changeDetailQuantity(1));
    elements.detailQuantity.addEventListener('change', () => {
        const value = Number.parseInt(elements.detailQuantity.value, 10) || 1;
        elements.detailQuantity.value = String(Math.max(1, Math.min(10, value)));
    });
    elements.detailAdd.addEventListener('click', () => {
        addToCart(state.currentProductId, Number.parseInt(elements.detailQuantity.value, 10) || 1);
        closeModal(elements.productModal);
        openDrawer(elements.cartDrawer);
    });

    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop')));
    });
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', event => {
            if (event.target === backdrop) closeModal(backdrop);
        });
    });

    elements.checkoutForm.addEventListener('submit', submitOrder);
    elements.viewOrderButton.addEventListener('click', () => {
        closeModal(elements.successModal);
        openDrawer(elements.ordersDrawer);
    });

    elements.searchToggle.addEventListener('click', openSearch);
    elements.searchClose.addEventListener('click', closeSearch);
    elements.globalSearch.addEventListener('input', event => applySearch(event.target.value));
    elements.globalSearch.addEventListener('keydown', event => {
        if (event.key === 'Enter') applySearch(event.target.value, true);
    });
    document.querySelectorAll('.search-hints button').forEach(button => {
        button.addEventListener('click', () => applySearch(button.textContent, true));
    });

    elements.newsletterForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = elements.newsletterEmail.value.trim();
        localStorage.setItem(STORAGE_KEYS.subscriber, email);
        elements.newsletterEmail.value = '';
        showToast('订阅成功，下周见');
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeSearch();
            closeDrawers();
            closeAllModals();
            toggleAiChat(false);
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            openSearch();
        }
    });

    bindAuthEvents();
    bindAiEvents();
}

function init() {
    cacheElements();
    normalizeCart();
    initializeRevealObserver();
    setPageImages();
    renderProducts();
    renderCart();
    renderOrders();
    renderHeaderAuth();
    bindEvents();
    refreshIcons();
    attachImageFallbacks(document);
}

document.addEventListener('DOMContentLoaded', init);
