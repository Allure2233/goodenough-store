// ============================================
// 数据库初始化脚本
// ============================================

const {
    initializeDatabase,
    withTransaction,
    closeDatabase,
    getDatabaseSummary
} = require('../db');
const users = require('../repositories/users');
const productRepository = require('../repositories/products');
const cart = require('../repositories/cart');

const IMAGE_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';

function productImage(prompt) {
    return `${IMAGE_API}?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;
}

// 商品数据
const products = [
    {
        name: '运动T恤',
        series: '破界系列',
        category: 'clothing',
        price: 199,
        originalPrice: 299,
        description: '轻盈透气的运动T恤，采用高科技面料，排汗速干，适合各种运动场景。',
        images: [productImage('lightweight athletic t-shirt in matte charcoal with coral accents, premium realistic sportswear product photography on warm neutral background, no model, no text, no logo')],
        stock: 100,
        sales: 520,
        rating: 4.8,
        tags: ['运动', '透气', '新品'],
        specs: { material: '涤纶', size: 'M/L/XL', color: '黑色/白色' },
        isFeatured: true
    },
    {
        name: '蓝牙音箱',
        series: '光年系列',
        category: 'digital',
        price: 399,
        originalPrice: 599,
        description: '360度环绕音效，IPX7级防水，续航长达12小时，支持蓝牙5.0。',
        images: [productImage('compact cylindrical portable bluetooth speaker in deep teal fabric with bright lime carry loop, realistic commercial product photography on warm neutral background, no text, no logo')],
        stock: 80,
        sales: 380,
        rating: 4.9,
        tags: ['音箱', '蓝牙', '防水'],
        specs: { material: '塑料', size: '15x15x15cm', color: '银色' },
        isFeatured: true
    },
    {
        name: '马克杯',
        series: '溯洄系列',
        category: 'home',
        price: 89,
        originalPrice: 129,
        description: '简约设计的陶瓷马克杯，容量350ml，适合咖啡和茶饮。',
        images: [productImage('handcrafted ceramic coffee mug with soft curved handle, matte off-white glaze and small teal accent, realistic ecommerce product photography on pale warm background, no text, no logo')],
        stock: 200,
        sales: 890,
        rating: 4.7,
        tags: ['杯子', '陶瓷', '简约'],
        specs: { material: '陶瓷', size: '350ml', color: '米白色' },
        isFeatured: false
    },
    {
        name: '吊坠',
        series: '棱镜系列',
        category: 'accessories',
        price: 299,
        originalPrice: 399,
        description: '精致的925纯银吊坠，镶嵌立方氧化锆石，时尚优雅。',
        images: [productImage('minimal geometric sterling silver pendant necklace with faceted prism shape, elegant realistic jewelry product photography on warm gray stone surface, no text, no logo')],
        stock: 50,
        sales: 210,
        rating: 4.6,
        tags: ['首饰', '银饰', '精致'],
        specs: { material: '925纯银', size: '2.5cm', color: '银色' },
        isFeatured: true
    },
    {
        name: '机械键盘',
        series: '重构系列',
        category: 'digital',
        price: 599,
        originalPrice: 799,
        description: '青轴机械键盘，87键紧凑布局，RGB背光，全键无冲突。',
        images: [productImage('compact 75 percent mechanical keyboard, off-white keycaps with teal and coral accent keys, premium product photography, warm neutral studio background, no text, no logo')],
        stock: 60,
        sales: 450,
        rating: 4.8,
        tags: ['键盘', '机械', 'RGB'],
        specs: { material: '铝合金+ABS', size: '87键', color: '黑色' },
        isFeatured: true
    },
    {
        name: '太阳镜',
        series: '蚀日系列',
        category: 'accessories',
        price: 259,
        originalPrice: 359,
        description: '偏光太阳镜，UV400防护，轻量钛合金镜架，时尚设计。',
        images: [productImage('stylish polarized sunglasses with translucent smoke gray frame and subtle coral temple tips, realistic premium ecommerce product photography on pale neutral background, no text, no logo')],
        stock: 120,
        sales: 680,
        rating: 4.5,
        tags: ['眼镜', '防晒', '时尚'],
        specs: { material: '钛合金+PC镜片', size: '标准', color: '黑色/金色' },
        isFeatured: false
    },
    {
        name: '钢笔',
        series: '异客系列',
        category: 'stationery',
        price: 168,
        originalPrice: 238,
        description: '铱金笔尖钢笔，流畅书写，经典设计，适合商务办公。',
        images: [productImage('minimal brushed brass fountain pen with deep teal cap, premium realistic stationery product photography on warm paper background, elegant diagonal composition, no text, no logo')],
        stock: 150,
        sales: 720,
        rating: 4.7,
        tags: ['文具', '钢笔', '商务'],
        specs: { material: '黄铜+树脂', size: 'F尖/EF尖', color: '黑色' },
        isFeatured: true
    },
    {
        name: '笔记本',
        series: '尘影系列',
        category: 'stationery',
        price: 68,
        originalPrice: 98,
        description: '优质纸张笔记本，120页，精装封面，适合记录灵感。',
        images: [productImage('premium hardcover notebook in deep teal with embossed minimal pattern, realistic stationery product photography on warm paper background, no text, no logo')],
        stock: 300,
        sales: 1200,
        rating: 4.6,
        tags: ['文具', '笔记本', '精装'],
        specs: { material: '纸张+硬壳封面', size: 'A5', color: '灰色/深蓝' },
        isFeatured: false
    },
    {
        name: '数据线',
        series: '黑钢系列',
        category: 'digital',
        price: 49,
        originalPrice: 79,
        description: 'USB-C快充数据线，编织材质，1.5米长度，支持100W快充。',
        images: [productImage('braided nylon USB-C cable in matte black with metal connectors, premium realistic tech accessory product photography on light gray background, no text, no logo')],
        stock: 500,
        sales: 2100,
        rating: 4.4,
        tags: ['数码', '充电', '快充'],
        specs: { material: '尼龙编织', size: '1.5m', color: '黑色' },
        isFeatured: false
    },
    {
        name: '运动背包',
        series: '破界系列',
        category: 'bags',
        price: 299,
        originalPrice: 449,
        description: '大容量运动背包，防水面料，多功能分区，适合户外出行。',
        images: [productImage('modern structured commuter backpack in deep forest green recycled nylon, premium realistic product photography on warm light gray background, no text, no logo')],
        stock: 80,
        sales: 350,
        rating: 4.7,
        tags: ['背包', '运动', '户外'],
        specs: { material: '防水尼龙', size: '30L', color: '黑色/军绿' },
        isFeatured: true
    },
    {
        name: '无线耳机',
        series: '光年系列',
        category: 'digital',
        price: 499,
        originalPrice: 699,
        description: '主动降噪无线耳机，蓝牙5.3，续航30小时，Hi-Fi音质。',
        images: [productImage('premium over-ear noise cancelling headphones in matte charcoal and coral accents, isolated product photography on warm light gray studio background, no text, no logo')],
        stock: 70,
        sales: 420,
        rating: 4.8,
        tags: ['耳机', '降噪', '无线'],
        specs: { material: '塑料+金属', size: '入耳式', color: '白色/黑色' },
        isFeatured: true
    },
    {
        name: '保温杯',
        series: '溯洄系列',
        category: 'home',
        price: 129,
        originalPrice: 189,
        description: '316不锈钢保温杯，24小时保温，真空双层设计。',
        images: [productImage('sleek vacuum insulated travel bottle in brushed stainless steel and burnt coral cap, premium realistic product photography on light gray studio surface, no text, no logo')],
        stock: 200,
        sales: 980,
        rating: 4.5,
        tags: ['杯子', '保温', '不锈钢'],
        specs: { material: '316不锈钢', size: '500ml', color: '银色/黑色' },
        isFeatured: false
    },
    {
        name: '手链',
        series: '棱镜系列',
        category: 'accessories',
        price: 189,
        originalPrice: 269,
        description: '简约钛钢手链，可调节长度，时尚百搭，不易褪色。',
        images: [productImage('minimal titanium steel bracelet with adjustable clasp, elegant realistic jewelry product photography on warm gray background, no text, no logo')],
        stock: 100,
        sales: 560,
        rating: 4.4,
        tags: ['首饰', '手链', '钛钢'],
        specs: { material: '钛钢', size: '可调', color: '银色/黑色' },
        isFeatured: false
    },
    {
        name: '帆布包',
        series: '尘影系列',
        category: 'bags',
        price: 79,
        originalPrice: 119,
        description: '环保帆布材质，大容量设计，简约文艺风格。',
        images: [productImage('eco-friendly canvas tote bag in natural off-white with minimal design, realistic fashion product photography on warm neutral background, no text, no logo')],
        stock: 250,
        sales: 1500,
        rating: 4.3,
        tags: ['包包', '帆布', '环保'],
        specs: { material: '帆布', size: '大号', color: '米白/黑色' },
        isFeatured: false
    }
];

async function seedDatabase() {
    try {
        console.log('正在连接 PostgreSQL...');
        await initializeDatabase();
        console.log(`数据库连接成功: ${getDatabaseSummary()}\n`);

        await withTransaction(async client => {
            console.log('清空现有业务数据...');
            await client.query(
                'TRUNCATE TABLE users, products RESTART IDENTITY CASCADE'
            );
            console.log('数据已清空\n');

            console.log('创建管理员账户...');
            const adminUser = await users.createUser({
                username: 'admin',
                email: 'admin@goodenough.com',
                password: 'admin123',
                role: 'admin',
                phone: '13800138000'
            }, client);
            await cart.ensureCart(adminUser._id, client);

            console.log('创建测试用户...');
            const testUser = await users.createUser({
                username: 'test',
                email: 'test@goodenough.com',
                password: 'test123',
                role: 'user',
                phone: '13900139000'
            }, client);
            await cart.ensureCart(testUser._id, client);

            console.log('导入商品数据...');
            for (const product of products) {
                await productRepository.createProduct(product, client);
            }
        });

        console.log(`成功导入 ${products.length} 个商品\n`);
        console.log('PostgreSQL 数据库初始化完成\n');
        console.log('='.repeat(50));
        console.log('测试账号信息：');
        console.log('='.repeat(50));
        console.log('管理员: admin / admin123');
        console.log('测试用户: test / test123');
        console.log('='.repeat(50) + '\n');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exitCode = 1;
    } finally {
        await closeDatabase();
    }
}

seedDatabase();
