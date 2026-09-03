// ============================================
// 动效系统（motion.js）
// 基于 anime.js v3（CDN）；依赖 script.js 先行执行
// 关键交互通过 store:* 自定义事件解耦；anime 未加载时动效降级
// ============================================

(() => {
    'use strict';
    if (window.__motionReady) return;
    window.__motionReady = true;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const animeLib = window.anime || null;

    const header = document.getElementById('siteHeader');
    const mobileMenu = document.getElementById('mobileMenu');
    const progressBar = document.querySelector('#scrollProgress span');
    const backToTop = document.getElementById('backToTop');
    const ringFg = backToTop?.querySelector('.ring-fg');
    const heroImage = document.querySelector('.hero-media img');
    const cartToggle = document.getElementById('cartToggle');
    const cartDrawer = document.getElementById('cartDrawer');
    const productGrid = document.getElementById('productGrid');
    const ringLength = 2 * Math.PI * 20;

    /* ---------- 滚动驱动（rAF 节流） ---------- */
    let lastY = window.scrollY;
    let scrollScheduled = false;

    function updateScrollUI() {
        const y = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, y / max);

        if (progressBar) progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
        if (ringFg) ringFg.style.strokeDashoffset = (ringLength * (1 - progress)).toFixed(2);
        backToTop?.classList.toggle('show', y > window.innerHeight * 1.1);

        const layerOpen = document.querySelector('.drawer.open, .modal-backdrop.open, .search-panel.open, .ai-chat.open');

        if (header) {
            if (layerOpen || mobileMenu?.classList.contains('open')) {
                header.classList.remove('header-hidden');
            } else if (y > 160 && y > lastY + 6) {
                header.classList.add('header-hidden');
            } else if (y < lastY - 6 || y <= 160) {
                header.classList.remove('header-hidden');
            }
        }

        if (!reducedMotion && heroImage && y <= window.innerHeight * 1.25) {
            heroImage.style.transform = `translateY(${Math.round(y * 0.16)}px) scale(1.02)`;
        }

        lastY = y;
    }

    window.addEventListener('scroll', () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        if (document.hidden) {
            updateScrollUI();
            scrollScheduled = false;
            return;
        }
        requestAnimationFrame(() => {
            updateScrollUI();
            scrollScheduled = false;
        });
    }, { passive: true });

    if (heroImage && lastY > window.innerHeight * 1.25) {
        heroImage.style.animation = 'none';
    }
    updateScrollUI();

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    // 弹层开关会改 body.locked / 菜单 class，借机同步顶栏可见性
    const layerObserver = new MutationObserver(updateScrollUI);
    layerObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (mobileMenu) layerObserver.observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });

    // 购物车抽屉每次打开时重放商品级联入场
    if (cartDrawer) {
        let enteringTimer = 0;
        new MutationObserver(() => {
            if (!cartDrawer.classList.contains('open')) return;
            cartDrawer.classList.add('drawer-entering');
            window.clearTimeout(enteringTimer);
            enteringTimer = window.setTimeout(() => cartDrawer.classList.remove('drawer-entering'), 900);
        }).observe(cartDrawer, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------- 商品网格级联延迟 ---------- */
    if (productGrid) {
        const assignStagger = () => {
            productGrid.querySelectorAll('.reveal').forEach((card, index) => {
                card.style.setProperty('--reveal-delay', `${(index % 8) * 60}ms`);
            });
        };
        assignStagger();
        new MutationObserver(assignStagger).observe(productGrid, { childList: true });
    }

    /* ---------- 编辑区数字滚动 ---------- */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                counterObserver.unobserve(entry.target);
                runCount(entry.target);
            });
        }, { threshold: 0.5 });
        counters.forEach(el => counterObserver.observe(el));
    }

    function runCount(el) {
        const target = Number.parseFloat(el.dataset.count);
        if (Number.isNaN(target)) return;
        const decimals = Number.parseInt(el.dataset.countDecimals || '0', 10);
        const suffix = el.dataset.countSuffix || '';
        if (reducedMotion || !animeLib) {
            el.textContent = target.toFixed(decimals) + suffix;
            return;
        }
        const proxy = { val: 0 };
        animeLib({
            targets: proxy,
            val: target,
            duration: 1100,
            easing: 'easeOutCubic',
            update: () => {
                el.textContent = proxy.val.toFixed(decimals) + suffix;
            }
        });
    }

    /* ---------- 商品卡 3D 倾斜 ---------- */
    if (finePointer && !reducedMotion) {
        let tiltScheduled = false;
        let lastPointerEvent = null;

        document.addEventListener('pointermove', event => {
            if (!event.target?.closest?.('.product-media')) return;
            lastPointerEvent = event;
            if (tiltScheduled) return;
            tiltScheduled = true;
            requestAnimationFrame(() => {
                tiltScheduled = false;
                applyTilt(lastPointerEvent);
            });
        }, { passive: true });

        document.addEventListener('pointerout', event => {
            const media = event.target?.closest?.('.product-media');
            if (!media || media.contains(event.relatedTarget)) return;
            media.style.setProperty('--tilt-x', '0deg');
            media.style.setProperty('--tilt-y', '0deg');
        });
    }

    function applyTilt(event) {
        const media = event.target?.closest?.('.product-media');
        if (!media) return;
        const rect = media.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        media.style.setProperty('--tilt-y', `${(nx * 7).toFixed(2)}deg`);
        media.style.setProperty('--tilt-x', `${(-ny * 7).toFixed(2)}deg`);
    }

    /* ---------- 按钮涟漪 ---------- */
    document.addEventListener('pointerdown', event => {
        const button = event.target?.closest?.('.button');
        if (!button || reducedMotion || !animeLib) return;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.1;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        button.appendChild(ripple);
        animeLib({
            targets: ripple,
            scale: [0, 1],
            opacity: [0.55, 0],
            duration: 550,
            easing: 'easeOutQuad',
            complete: () => ripple.remove()
        });
    });

    /* ---------- Hero 按钮磁吸 ---------- */
    if (finePointer && !reducedMotion) {
        document.querySelectorAll('.hero-actions .button').forEach(button => {
            button.addEventListener('pointermove', event => {
                if (animeLib) {
                    animeLib.remove(button);
                    button.style.transform = '';
                }
                const rect = button.getBoundingClientRect();
                const mx = (event.clientX - rect.left - rect.width / 2) * 0.12;
                const my = (event.clientY - rect.top - rect.height / 2) * 0.24;
                button.style.setProperty('--mag-x', `${mx.toFixed(1)}px`);
                button.style.setProperty('--mag-y', `${my.toFixed(1)}px`);
            });
            button.addEventListener('pointerleave', () => {
                if (animeLib) {
                    animeLib({
                        targets: button,
                        translateX: 0,
                        translateY: 0,
                        duration: 650,
                        easing: 'spring(1, 80, 10, 0)',
                        complete: () => { button.style.transform = ''; }
                    });
                } else {
                    button.style.setProperty('--mag-x', '0px');
                    button.style.setProperty('--mag-y', '0px');
                }
            });
        });
    }

    /* ---------- 图片加载揭示（同时停掉 shimmer 占位） ---------- */
    const IMG_REVEAL_SELECTOR = '.product-media img, .detail-media img, .ai-product-card img';

    function armImageReveal(img) {
        if (reducedMotion || !img.matches?.(IMG_REVEAL_SELECTOR) || img.dataset.revealState) return;
        img.dataset.revealState = 'done';
        img.classList.add('img-reveal');
        img.closest('.product-media')?.classList.add('media-loaded');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                img.classList.add('img-loaded');
                window.setTimeout(() => img.classList.remove('img-reveal', 'img-loaded'), 900);
            });
        });
    }

    document.addEventListener('load', event => {
        if (event.target instanceof HTMLImageElement) armImageReveal(event.target);
    }, true);

    document.querySelectorAll('img').forEach(img => {
        if (img.complete && img.naturalWidth > 0) armImageReveal(img);
    });

    /* ---------- 飞入购物车 + 徽标弹跳 ---------- */
    document.addEventListener('store:cart-add', event => {
        const { rect, imgSrc } = event.detail || {};
        if (reducedMotion || !rect || !imgSrc || !cartToggle) return;
        flyToCart(rect, imgSrc);
    });

    document.addEventListener('store:cart-changed', bounceCartBadge);

    function bounceCartBadge() {
        const badge = document.getElementById('cartCount');
        if (!badge) return;
        badge.classList.remove('bounce');
        void badge.offsetWidth;
        badge.classList.add('bounce');
    }

    function flyToCart(rect, imgSrc) {
        const targetRect = cartToggle.getBoundingClientRect();
        const ghost = document.createElement('img');
        ghost.src = imgSrc;
        ghost.alt = '';
        ghost.className = 'fly-img';
        ghost.decoding = 'async';
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        document.body.appendChild(ghost);

        if (!animeLib) {
            ghost.remove();
            bounceCartBadge();
            return;
        }

        const dx = targetRect.left + targetRect.width / 2 - (rect.left + rect.width / 2);
        const dy = targetRect.top + targetRect.height / 2 - (rect.top + rect.height / 2);

        // X 轴单向飞出，Y 轴两段先扬后落形成弧线，整体缩小淡出
        animeLib({
            targets: ghost,
            translateX: { value: dx, duration: 780, easing: 'easeOutCubic' },
            translateY: [
                { value: dy * 0.4 - 90, duration: 330, easing: 'easeOutQuad' },
                { value: dy, duration: 450, easing: 'easeInQuad' }
            ],
            scale: { value: 0.12, duration: 780, easing: 'easeInQuad' },
            opacity: [
                { value: 0.95, duration: 380, easing: 'linear' },
                { value: 0.3, duration: 400, easing: 'linear' }
            ],
            complete: () => {
                ghost.remove();
                bounceCartBadge();
            }
        });
    }

    /* ---------- 收藏心形爆裂 ---------- */
    document.addEventListener('store:favorite', event => {
        const { btn, active } = event.detail || {};
        if (!btn || reducedMotion) return;
        btn.classList.remove('pop');
        void btn.offsetWidth;
        btn.classList.add('pop');
        if (active) heartBurst(btn);
    });

    function heartBurst(button) {
        if (!animeLib) return;
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const particles = Array.from({ length: 8 }, () => {
            const particle = document.createElement('span');
            particle.className = 'fav-particle';
            particle.textContent = '♥';
            particle.style.left = `${cx}px`;
            particle.style.top = `${cy}px`;
            document.body.appendChild(particle);
            return particle;
        });

        const angles = particles.map((_, i) => (Math.PI * 2 * i) / 8 + Math.random() * 0.5);
        const distances = particles.map(() => 32 + Math.random() * 20);

        animeLib({
            targets: particles,
            translateX: (el, i) => Math.cos(angles[i]) * distances[i],
            translateY: (el, i) => Math.sin(angles[i]) * distances[i],
            scale: [1, 0.2],
            opacity: [1, 0],
            duration: 620,
            easing: 'easeOutCubic',
            complete: () => particles.forEach(particle => particle.remove())
        });
    }
})();
