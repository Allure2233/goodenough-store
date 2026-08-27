const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

const SYSTEM_PROMPT = `你是"古德因纳夫商城"的AI购物助手，名字叫"小古"。你的任务是帮助顾客挑选商品、解答疑问、提供购物建议。

回复规则：
1. 用友好、简洁的中文回复，像一个贴心的导购员
2. 推荐商品时，使用标记格式 [PRODUCT:商品ID] 让前端自动渲染为可点击的商品卡片
3. 可以推荐多个商品，每个商品ID独占一行标记
4. 如果没有合适的商品，诚实告知并引导顾客浏览商品分类
5. 回复控制在200字以内，突出商品卖点

可用商品列表：`;

function buildProductContext(products) {
    if (!products || !products.length) return '';
    return products.map(p =>
        `ID:${p.id} | ${p.name} | ${p.category} | ¥${p.price}（原价¥${p.originalPrice}）| 评分${p.rating} | 库存${p.stock} | 标签:${(p.tags || []).join('、')} | ${p.description}`
    ).join('\n');
}

function buildMockReply(message, products) {
    const lower = message.toLowerCase();
    const keywords = {
        '耳机': 'ge-101', '降噪': 'ge-101',
        '台灯': 'ge-102', '灯': 'ge-102',
        '键盘': 'ge-103',
        '背包': 'ge-104', '包': 'ge-104',
        '针织': 'ge-105', '开衫': 'ge-105', '毛衣': 'ge-105',
        '音箱': 'ge-106', '蓝牙音箱': 'ge-106',
        '杯': 'ge-107', '马克杯': 'ge-107', '咖啡': 'ge-107',
        '保温': 'ge-108', '保温杯': 'ge-108',
        '外套': 'ge-109', '运动': 'ge-109',
        '吊坠': 'ge-110', '项链': 'ge-110', '银饰': 'ge-110',
        '钢笔': 'ge-111', '笔': 'ge-111',
        '太阳镜': 'ge-112', '眼镜': 'ge-112',
    };

    for (const [keyword, id] of Object.entries(keywords)) {
        if (lower.includes(keyword)) {
            const product = products.find(p => p.id === id);
            if (product) {
                return `根据您的需求，推荐这款「${product.name}」：\n\n${product.description}\n\n现价 ${product.price} 元，评分 ${product.rating} 星，库存 ${product.stock} 件。\n\n[PRODUCT:${id}]\n\n您还想知道其他信息吗？`;
            }
        }
    }

    if (lower.includes('推荐') || lower.includes('热门') || lower.includes('畅销')) {
        const featured = products.filter(p => p.badge).slice(0, 3);
        let reply = '为您推荐本周精选好物：\n\n';
        featured.forEach(p => {
            reply += `[PRODUCT:${p.id}]\n`;
        });
        reply += '\n这些都是本周编辑精选，品质有保障。您对哪类商品感兴趣？';
        return reply;
    }

    return `您好！我是小古，古德因纳夫商城的AI购物助手 🛍️\n\n我可以帮您：\n- 推荐合适的商品\n- 对比不同商品\n- 解答购物疑问\n\n您可以告诉我您的需求，比如"推荐一款耳机"或"有什么家居好物"。\n\n以下是本周精选：\n[PRODUCT:ge-101]\n[PRODUCT:ge-107]\n[PRODUCT:ge-106]`;
}

router.post('/chat', async (req, res) => {
    try {
        const { message, history = [], products = [] } = req.body;

        if (!message || !message.trim()) {
            return res.json({ success: false, message: '消息不能为空' });
        }

        if (!DEEPSEEK_API_KEY) {
            const reply = buildMockReply(message, products);
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const chunks = reply.match(/[\s\S]{1,3}/g) || [reply];
            for (const chunk of chunks) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                await new Promise(r => setTimeout(r, 50));
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        const productContext = buildProductContext(products);
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + (productContext ? '\n' + productContext : '') },
            ...history.slice(-10).map(h => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content
            })),
            { role: 'user', content: message }
        ];

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages,
                stream: true,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API error:', response.status, errText);
            const reply = buildMockReply(message, products);
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const chunks = reply.match(/[\s\S]{1,3}/g) || [reply];
            for (const chunk of chunks) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                await new Promise(r => setTimeout(r, 50));
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                } catch { /* skip malformed chunks */ }
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('AI chat error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'AI服务暂时不可用' });
        } else {
            res.end();
        }
    }
});

module.exports = router;
