// ============================================
// 静态文件服务器 - 前端开发服务器
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.STORE_PORT) || 8080;
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(PUBLIC_DIR, relativePath);

    if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    const contentType = `${MIME_TYPES[extname] || 'application/octet-stream'}${
        ['.html', '.css', '.js', '.json'].includes(extname) ? '; charset=utf-8' : ''
    }`;

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 - 页面未找到', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('服务器错误: ' + err.code);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ 前端静态服务器已启动: http://localhost:${PORT}`);
    console.log(`🌐 访问 http://localhost:${PORT} 查看网站`);
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请先运行关闭脚本或设置 STORE_PORT。`);
    } else {
        console.error('❌ 静态服务器启动失败:', error.message);
    }
    process.exit(1);
});

module.exports = server;
