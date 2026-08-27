const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

process.env.PORT = process.env.PORT || '3000';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8080';
process.env.JWT_SECRET = process.env.JWT_SECRET
    || 'goodenough_secret_key_2024_change_in_production';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
    initializeDatabase,
    checkDatabase,
    closeDatabase,
    getDatabaseSummary
} = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = Number(process.env.PORT);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const database = await checkDatabase();
        return res.json({
            success: true,
            message: '古德因纳夫商城API服务运行正常',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                engine: 'PostgreSQL',
                name: database.database,
                status: 'connected'
            }
        });
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: 'PostgreSQL数据库不可用',
            timestamp: new Date().toISOString()
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

async function startServer() {
    await initializeDatabase();
    const database = await checkDatabase();
    console.log(
        `PostgreSQL connected: ${getDatabaseSummary()} (${database.database})`
    );

    const server = app.listen(PORT, () => {
        console.log(`API server: http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = signal => {
        console.log(`${signal} received, closing API server...`);
        server.close(async () => {
            await closeDatabase();
            process.exit(0);
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

    return server;
}

if (require.main === module) {
    startServer().catch(error => {
        console.error('PostgreSQL startup failed:', error.message);
        process.exit(1);
    });
}

module.exports = app;
module.exports.startServer = startServer;
