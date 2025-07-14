/**
 * 首頁專用 JavaScript
 * 處理首頁特有的功能和互動
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // 初始化首頁功能
    initHomePage();
    
    // 載入熱門分類
    loadPopularCategories();
    
    // 初始化動畫效果
    initAnimations();
});

/**
 * 初始化首頁功能
 */
function initHomePage() {
    console.log('首頁載入完成');
    
    // 檢查 URL 參數，如果有特定分類則直接跳轉到菜單頁
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        window.location.href = `menu.html?category=${category}`;
        return;
    }
    
    // 更新購物車計數
    if (window.cartManager) {
        window.cartManager.updateCartCount();
    }
}

/**
 * 載入熱門分類資料
 */
function loadPopularCategories() {
    // 模擬分類資料（稍後會從 API 獲取）
    const categories = [
        {
            id: 'main',
            name: '主餐',
            description: '精選主食料理',
            icon: 'bi-egg-fried',
            color: 'warning',
            count: 15
        },
        {
            id: 'drinks',
            name: '飲品',
            description: '新鮮現調飲料',
            icon: 'bi-cup-straw',
            color: 'info',
            count: 12
        },
        {
            id: 'desserts',
            name: '甜點',
            description: '精緻手作甜品',
            icon: 'bi-cake2',
            color: 'danger',
            count: 8
        },
        {
            id: 'soups',
            name: '湯品',
            description: '暖心營養湯品',
            icon: 'bi-droplet',
            color: 'success',
            count: 6
        }
    ];
    
    updateCategoryCards(categories);
}

/**
 * 更新分類卡片顯示
 */
function updateCategoryCards(categories) {
    // 這裡可以動態更新分類卡片的內容
    // 例如顯示每個分類的商品數量
    categories.forEach(category => {
        const categoryCard = document.querySelector(`a[href*="category=${category.id}"]`);
        if (categoryCard) {
            const parentCard = categoryCard.closest('.category-card');
            if (parentCard) {
                // 可以在這裡添加商品數量顯示
                const countBadge = document.createElement('span');
                countBadge.className = `badge bg-${category.color} position-absolute top-0 end-0 translate-middle`;
                countBadge.textContent = category.count;
                countBadge.style.fontSize = '0.75rem';
                
                // 檢查是否已經有徽章，避免重複添加
                if (!parentCard.querySelector('.badge')) {
                    parentCard.style.position = 'relative';
                    parentCard.appendChild(countBadge);
                }
            }
        }
    });
}

/**
 * 初始化動畫效果
 */
function initAnimations() {
    // 觀察器設定，用於觸發進入視窗的動畫
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // 只觸發一次
            }
        });
    }, observerOptions);
    
    // 監控需要動畫的元素
    const animatedElements = document.querySelectorAll('.feature-card, .category-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // 為分類卡片添加點擊動畫
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 添加點擊波紋效果
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 添加 CSS 動畫樣式
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 處理 CTA 按鈕點擊
 */
function handleCtaClick(buttonType) {
    // 追蹤用戶點擊行為（未來可以加入分析）
    console.log(`CTA 按鈕被點擊: ${buttonType}`);
    
    // 可以在這裡添加其他追蹤邏輯
    if (window.gtag) {
        window.gtag('event', 'click', {
            event_category: 'CTA',
            event_label: buttonType
        });
    }
}

/**
 * 處理導航連結點擊
 */
function handleNavClick(destination) {
    console.log(`導航到: ${destination}`);
    
    // 添加載入狀態
    const navLink = event.target;
    const originalText = navLink.textContent;
    
    if (navLink.tagName === 'A') {
        navLink.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${originalText}`;
        
        // 模擬載入延遲（實際應用中可以移除）
        setTimeout(() => {
            navLink.textContent = originalText;
        }, 1000);
    }
}

/**
 * 檢查購物車狀態並更新 UI
 */
function updateCartStatus() {
    if (window.cartManager) {
        const totalItems = window.cartManager.getTotalItems();
        const totalPrice = window.cartManager.getTotalPrice();
        
        // 如果購物車有商品，可以顯示快速結帳按鈕
        if (totalItems > 0) {
            showQuickCheckoutOption(totalItems, totalPrice);
        }
    }
}

/**
 * 顯示快速結帳選項
 */
function showQuickCheckoutOption(itemCount, totalPrice) {
    // 檢查是否已經有快速結帳按鈕
    let quickCheckout = document.getElementById('quick-checkout');
    
    if (!quickCheckout) {
        quickCheckout = document.createElement('div');
        quickCheckout.id = 'quick-checkout';
        quickCheckout.className = 'position-fixed bottom-0 start-50 translate-middle-x bg-success text-white p-3 rounded-top shadow';
        quickCheckout.style.zIndex = '1040';
        quickCheckout.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div>
                    <small>購物車</small>
                    <div class="fw-bold">${itemCount} 項商品 · ${Utils.formatPrice(totalPrice)}</div>
                </div>
                <a href="cart.html" class="btn btn-light btn-sm">查看購物車</a>
                <button type="button" class="btn-close btn-close-white" onclick="hideQuickCheckout()"></button>
            </div>
        `;
        document.body.appendChild(quickCheckout);
        
        // 添加滑入動畫
        setTimeout(() => {
            quickCheckout.style.transform = 'translateX(-50%) translateY(0)';
            quickCheckout.style.transition = 'transform 0.3s ease';
        }, 100);
    } else {
        // 更新現有的快速結帳資訊
        const infoDiv = quickCheckout.querySelector('.fw-bold');
        if (infoDiv) {
            infoDiv.textContent = `${itemCount} 項商品 · ${Utils.formatPrice(totalPrice)}`;
        }
    }
}

/**
 * 隱藏快速結帳選項
 */
function hideQuickCheckout() {
    const quickCheckout = document.getElementById('quick-checkout');
    if (quickCheckout) {
        quickCheckout.style.transform = 'translateX(-50%) translateY(100%)';
        setTimeout(() => {
            quickCheckout.remove();
        }, 300);
    }
}

// 定期檢查購物車狀態
setInterval(updateCartStatus, 2000);

// 匯出函數供 HTML 使用
window.handleCtaClick = handleCtaClick;
window.handleNavClick = handleNavClick;
window.hideQuickCheckout = hideQuickCheckout;
