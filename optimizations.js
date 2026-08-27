// ============================================
// 古德因纳夫商城 - 优化脚本
// ============================================

// --- 性能优化: 防抖函数 ---
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// --- 性能优化: 节流函数 ---
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// --- 性能优化: 图片懒加载增强 ---
function enhanceLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                img.onload = () => {
                    img.classList.add('lazy-loaded');
                    img.style.removeProperty('filter');
                };
                
                img.onerror = () => {
                    img.src = 'https://picsum.photos/400/400?grayscale';
                };
                
                img.src = src;
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// --- 性能优化: CSS动画硬件加速 ---
function enableGPUAcceleration() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
        el.style.transform = 'translateZ(0)';
    });
}

// --- 交互优化: 平滑滚动增强 ---
function enhanceSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 72;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// --- 交互优化: 键盘导航支持 ---
function enableKeyboardNavigation() {
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]');
    const modal = document.querySelector('.modal');
    
    document.addEventListener('keydown', (e) => {
        // ESC关闭模态框
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Tab键导航优化
        if (e.key === 'Tab' && modal?.classList.contains('active')) {
            const modalFocusable = modal.querySelectorAll('a, button, input');
            const firstEl = modalFocusable[0];
            const lastEl = modalFocusable[modalFocusable.length - 1];
            
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
        
        // 空格键触发按钮
        if (e.key === ' ' && document.activeElement.tagName === 'BUTTON') {
            e.preventDefault();
            document.activeElement.click();
        }
    });
}

// --- 交互优化: 触摸设备支持 ---
function enableTouchSupport() {
    const touchableElements = document.querySelectorAll('.btn, .product-card, .category-card');
    
    touchableElements.forEach(el => {
        let touchStartX = 0;
        let touchStartY = 0;
        
        el.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            el.classList.add('touch-active');
        });
        
        el.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            if (deltaX < 10 && deltaY < 10) {
                el.click();
            }
            
            setTimeout(() => el.classList.remove('touch-active'), 150);
        });
    });
}

// --- 用户体验: 加载状态优化 ---
function enhanceLoadingStates() {
    // 骨架屏增强
    const skeletonLoaders = document.querySelectorAll('.skeleton');
    
    skeletonLoaders.forEach(skeleton => {
        skeleton.style.animation = 'skeleton-loading 1.5s ease-in-out infinite';
    });
    
    // 页面加载完成后移除骨架屏
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('.skeleton').forEach(skeleton => {
                skeleton.style.display = 'none';
            });
        }, 500);
    });
}

// --- 用户体验: 错误边界处理 ---
function setupErrorBoundary() {
    // 图片加载失败降级
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = 'https://picsum.photos/400/400?grayscale';
            this.alt = '图片加载失败';
        };
    });
    
    // 网络状态提示
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'network-status';
    statusIndicator.innerHTML = `
        <span class="status-icon"></span>
        <span class="status-text"></span>
    `;
    document.body.appendChild(statusIndicator);
    
    function updateNetworkStatus() {
        if (navigator.onLine) {
            statusIndicator.classList.remove('offline');
            statusIndicator.querySelector('.status-text').textContent = '已连接';
            setTimeout(() => statusIndicator.classList.add('hidden'), 2000);
        } else {
            statusIndicator.classList.add('offline');
            statusIndicator.classList.remove('hidden');
            statusIndicator.querySelector('.status-text').textContent = '网络断开';
        }
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
}

// --- 用户体验: 响应式菜单优化 ---
function enhanceResponsiveMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    menuBtn?.addEventListener('click', () => {
        const isOpen = navMenu?.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        // 动画菜单按钮
        menuBtn.classList.toggle('open');
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (navMenu?.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !menuBtn?.contains(e.target)) {
            navMenu.classList.remove('active');
            menuBtn?.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// --- 性能优化: 首屏加载优化 ---
function optimizeCriticalRendering() {
    // 预加载关键资源
    const criticalResources = [
        { rel: 'preload', href: 'https://s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.a.woff2', as: 'font', type: 'font/woff2' },
        { rel: 'preload', href: 'https://s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.f.woff2', as: 'font', type: 'font/woff2' }
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = resource.rel;
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) link.type = resource.type;
        document.head.appendChild(link);
    });
    
    // DNS预解析
    const domains = ['//cdn.jsdelivr.net', '//s1.hdslb.com', '//picsum.photos'];
    domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
    });
}

// --- 性能优化: 缓存策略 ---
function setupCaching() {
    // LocalStorage缓存商品数据
    const CACHE_KEY = 'store_products_cache';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时
    
    window.storeCache = {
        get: (key) => {
            try {
                const cached = localStorage.getItem(key);
                if (!cached) return null;
                
                const data = JSON.parse(cached);
                if (Date.now() > data.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                return data.value;
            } catch {
                return null;
            }
        },
        
        set: (key, value, ttl = CACHE_TTL) => {
            try {
                localStorage.setItem(key, JSON.stringify({
                    value,
                    expiry: Date.now() + ttl
                }));
            } catch {
                console.warn('LocalStorage unavailable');
            }
        }
    };
}

// --- 初始化所有优化 ---
document.addEventListener('DOMContentLoaded', () => {
    // 性能优化
    optimizeCriticalRendering();
    setupCaching();
    enhanceLazyLoading();
    enableGPUAcceleration();
    
    // 交互优化
    enhanceSmoothScroll();
    enableKeyboardNavigation();
    enableTouchSupport();
    enhanceResponsiveMenu();
    
    // 用户体验
    enhanceLoadingStates();
    setupErrorBoundary();
});

// --- 导出优化函数供其他脚本使用 ---
window.optimizationUtils = {
    debounce,
    throttle,
    storeCache: window.storeCache || null
};
