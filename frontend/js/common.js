/**
 * 通用 JavaScript 功能
 * 包含購物車管理、工具函數等
 */

// 購物車管理類
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCount();
    }

    // 從 LocalStorage 載入購物車
    loadCart() {
        try {
            const cart = localStorage.getItem('restaurant_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('載入購物車失敗:', error);
            return [];
        }
    }

    // 儲存購物車到 LocalStorage
    saveCart() {
        try {
            localStorage.setItem('restaurant_cart', JSON.stringify(this.cart));
            this.updateCartCount();
        } catch (error) {
            console.error('儲存購物車失敗:', error);
        }
    }

    // 新增商品到購物車
    addItem(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image || '',
                category: item.category || ''
            });
        }
        
        this.saveCart();
        this.showToast('商品已加入購物車', 'success');
    }

    // 移除購物車商品
    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.showToast('商品已從購物車移除', 'info');
    }

    // 更新商品數量
    updateQuantity(itemId, quantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // 清空購物車
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.showToast('購物車已清空', 'info');
    }

    // 獲取購物車商品總數
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // 獲取購物車總金額
    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // 更新購物車計數器顯示
    updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            const totalItems = this.getTotalItems();
            countElement.textContent = totalItems;
            countElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // 顯示通知訊息
    showToast(message, type = 'info') {
        // 建立 toast 容器（如果不存在）
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1055';
            document.body.appendChild(toastContainer);
        }

        // 建立 toast 元素
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // 初始化並顯示 toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        bsToast.show();

        // 在 toast 隱藏後移除元素
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// 工具函數
const Utils = {
    // 格式化金額
    formatPrice(price) {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(price);
    },

    // 格式化日期
    formatDate(date) {
        return new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // 生成隨機 ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 防抖函數
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 節流函數
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 載入狀態管理
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            const spinner = element.querySelector('.spinner-border');
            if (spinner) {
                spinner.style.display = 'inline-block';
            }
        }
    },

    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            const spinner = element.querySelector('.spinner-border');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    },

    // API 請求封裝
    async apiRequest(url, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw error;
        }
    },

    // 圖片載入錯誤處理
    handleImageError(img) {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguWcluS4jeWtmOWcqDwvdGV4dD4KPC9zdmc+';
        img.alt = '圖片載入失敗';
    }
};

// 全域變數
let cartManager;

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化購物車管理器
    cartManager = new CartManager();

    // 初始化工具提示
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 初始化彈出框
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // 平滑滾動到錨點
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 圖片載入錯誤處理
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => Utils.handleImageError(img));
    });

    // 回到頂部按鈕
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollToTopBtn.className = 'btn btn-primary position-fixed';
    scrollToTopBtn.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000; display: none; border-radius: 50%; width: 50px; height: 50px;';
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(scrollToTopBtn);

    // 滾動事件處理
    window.addEventListener('scroll', Utils.throttle(() => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }, 100));
});

// 匯出全域變數供其他檔案使用
window.CartManager = CartManager;
window.Utils = Utils;
