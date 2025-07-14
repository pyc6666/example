// Cart Page JavaScript
class CartPageManager {
    constructor() {
        this.cart = null;
        this.isLoading = false;
        this.recommendations = [];
        
        this.init();
    }

    async init() {
        console.log('正在初始化購物車頁面...');
        
        // 綁定事件監聽器
        this.bindEventListeners();
        
        // 載入購物車數據
        await this.loadCart();
        
        // 載入推薦商品
        await this.loadRecommendations();
        
        console.log('購物車頁面初始化完成');
    }

    bindEventListeners() {
        // 繼續選購按鈕
        const continueShoppingBtn = document.getElementById('continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                window.location.href = 'menu.html';
            });
        }

        // 清空購物車按鈕
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.showClearCartModal();
            });
        }

        // 確認清空購物車
        const confirmClearBtn = document.getElementById('confirm-clear-cart');
        if (confirmClearBtn) {
            confirmClearBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // 結帳按鈕
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }

        // 優惠代碼
        const applyPromoBtn = document.getElementById('apply-promo-btn');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
        }

        const promoInput = document.getElementById('promo-code-input');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyPromoCode();
                }
            });
        }

        // 稍後結帳
        const saveForLaterBtn = document.getElementById('save-for-later-btn');
        if (saveForLaterBtn) {
            saveForLaterBtn.addEventListener('click', () => {
                this.saveForLater();
            });
        }

        // 分享購物車
        const shareCartBtn = document.getElementById('share-cart-btn');
        if (shareCartBtn) {
            shareCartBtn.addEventListener('click', () => {
                this.shareCart();
            });
        }
    }

    async loadCart() {
        try {
            console.log('正在載入購物車...');
            this.showLoading(true);
            
            // 模擬 API 呼叫或使用實際 API
            const cart = await this.fetchCart();
            this.cart = cart;
            
            this.renderCart();
            this.updateCartCount();
            
            console.log('購物車載入完成', cart);
        } catch (error) {
            console.error('載入購物車失敗：', error);
            Utils.showToast('載入購物車失敗', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchCart() {
        // 如果有後端 API，使用這個
        // return Utils.apiRequest('/api/cart');
        
        // 模擬數據 - 從 LocalStorage 取得購物車
        await this.delay(800); // 模擬網路延遲
        
        const cartData = CartManager.getCart();
        
        // 模擬完整購物車結構
        return {
            _id: 'cart_' + Date.now(),
            session_id: 'session_' + Date.now(),
            items: cartData.items || [],
            total_amount: cartData.total || 0,
            total_items: cartData.itemCount || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active'
        };
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const emptyCart = document.getElementById('empty-cart');
        const itemsCount = document.getElementById('items-count');
        const cartSubtitle = document.getElementById('cart-subtitle');
        
        if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
            // 顯示空購物車
            container.style.display = 'none';
            emptyCart.style.display = 'block';
            itemsCount.textContent = '購物車是空的';
            cartSubtitle.textContent = '還沒有選購任何美味料理呢！';
            
            // 隱藏摘要和推薦
            this.hideCheckoutSection();
            this.hideRecommendations();
            
            return;
        }

        // 顯示購物車項目
        container.style.display = 'block';
        emptyCart.style.display = 'none';
        
        const itemCount = this.cart.items.length;
        const totalQuantity = this.cart.total_items;
        itemsCount.textContent = `${itemCount} 種商品，共 ${totalQuantity} 件`;
        cartSubtitle.textContent = `檢視您選購的 ${itemCount} 種美味料理`;

        // 渲染購物車項目
        container.innerHTML = this.cart.items.map(item => this.createCartItemHTML(item)).join('');
        
        // 綁定項目控制事件
        this.bindCartItemEvents();
        
        // 渲染訂單摘要
        this.renderOrderSummary();
        
        // 顯示結帳區域和推薦
        this.showCheckoutSection();
        this.showRecommendations();
    }

    createCartItemHTML(item) {
        const badges = this.createItemBadges(item);
        const specialRequests = item.special_requests || item.specialRequests;
        
        return `
            <div class="cart-item" data-item-id="${item.id || item._id}">
                <div class="cart-item-content">
                    <img src="${item.image || 'https://via.placeholder.com/100x100/f8f9fa/6c757d?text=' + encodeURIComponent(item.name)}" 
                         alt="${item.name}" class="cart-item-image">
                    
                    <div class="cart-item-details">
                        <h5 class="cart-item-name">${item.name}</h5>
                        <p class="cart-item-description">${item.description || '美味料理，精心製作'}</p>
                        
                        <div class="cart-item-meta">
                            <span class="cart-item-price">$${item.price}</span>
                            <span class="cart-item-category">${this.getCategoryName(item.category)}</span>
                        </div>
                        
                        <div class="cart-item-badges">
                            ${badges}
                        </div>
                        
                        ${specialRequests ? `
                            <div class="special-requests">
                                <strong><i class="bi bi-chat-left-text me-1"></i>特殊需求：</strong>
                                ${specialRequests}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-btn" data-action="decrease" data-item-id="${item.id || item._id}">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-action="increase" data-item-id="${item.id || item._id}">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        
                        <div class="subtotal-display">
                            $${(item.price * item.quantity).toFixed(0)}
                        </div>
                        
                        <button class="remove-item-btn" data-item-id="${item.id || item._id}" title="移除商品">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindCartItemEvents() {
        const container = document.getElementById('cart-items-container');
        
        // 數量控制按鈕
        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const itemId = btn.dataset.itemId;
                
                if (action === 'increase') {
                    this.increaseQuantity(itemId);
                } else if (action === 'decrease') {
                    this.decreaseQuantity(itemId);
                }
            });
        });

        // 移除按鈕
        container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = btn.dataset.itemId;
                this.removeItem(itemId);
            });
        });
    }

    async increaseQuantity(itemId) {
        try {
            const item = this.cart.items.find(item => (item.id || item._id) === itemId);
            if (!item) return;

            if (item.quantity >= 10) {
                Utils.showToast('單項商品數量不能超過 10 個', 'warning');
                return;
            }

            // 更新本地數據
            item.quantity += 1;
            
            // 更新 CartManager
            CartManager.updateQuantity(itemId, item.quantity);
            
            // 重新渲染
            this.updateItemDisplay(itemId, item.quantity);
            this.updateTotals();
            this.renderOrderSummary();
            this.updateCartCount();
            
            // 添加動畫
            this.animateQuantityChange(itemId, 'increase');
            
            Utils.showToast(`已增加 ${item.name} 的數量`, 'success');
        } catch (error) {
            console.error('增加數量失敗：', error);
            Utils.showToast('更新數量失敗', 'error');
        }
    }

    async decreaseQuantity(itemId) {
        try {
            const item = this.cart.items.find(item => (item.id || item._id) === itemId);
            if (!item) return;

            if (item.quantity <= 1) {
                this.removeItem(itemId);
                return;
            }

            // 更新本地數據
            item.quantity -= 1;
            
            // 更新 CartManager
            CartManager.updateQuantity(itemId, item.quantity);
            
            // 重新渲染
            this.updateItemDisplay(itemId, item.quantity);
            this.updateTotals();
            this.renderOrderSummary();
            this.updateCartCount();
            
            // 添加動畫
            this.animateQuantityChange(itemId, 'decrease');
            
            Utils.showToast(`已減少 ${item.name} 的數量`, 'success');
        } catch (error) {
            console.error('減少數量失敗：', error);
            Utils.showToast('更新數量失敗', 'error');
        }
    }

    async removeItem(itemId) {
        try {
            const item = this.cart.items.find(item => (item.id || item._id) === itemId);
            if (!item) return;

            // 從購物車移除
            this.cart.items = this.cart.items.filter(item => (item.id || item._id) !== itemId);
            
            // 更新 CartManager
            CartManager.removeItem(itemId);
            
            // 重新載入購物車
            await this.loadCart();
            
            Utils.showToast(`已移除 ${item.name}`, 'success');
        } catch (error) {
            console.error('移除商品失敗：', error);
            Utils.showToast('移除商品失敗', 'error');
        }
    }

    updateItemDisplay(itemId, quantity) {
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!itemElement) return;

        const quantityDisplay = itemElement.querySelector('.quantity-display');
        const subtotalDisplay = itemElement.querySelector('.subtotal-display');
        
        if (quantityDisplay) {
            quantityDisplay.textContent = quantity;
        }

        const item = this.cart.items.find(item => (item.id || item._id) === itemId);
        if (item && subtotalDisplay) {
            subtotalDisplay.textContent = `$${(item.price * quantity).toFixed(0)}`;
        }
    }

    updateTotals() {
        if (!this.cart || !this.cart.items) return;

        this.cart.total_amount = this.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        this.cart.total_items = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    animateQuantityChange(itemId, action) {
        const btn = document.querySelector(`[data-item-id="${itemId}"] .${action}-btn`);
        if (btn) {
            btn.classList.add('animate');
            setTimeout(() => btn.classList.remove('animate'), 600);
        }
    }

    renderOrderSummary() {
        const content = document.getElementById('order-summary-content');
        if (!content) return;

        if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
            content.innerHTML = `
                <div class="text-center py-3">
                    <i class="bi bi-cart-x text-muted mb-2" style="font-size: 2rem;"></i>
                    <p class="text-muted mb-0">購物車是空的</p>
                </div>
            `;
            return;
        }

        const subtotal = this.cart.total_amount;
        const deliveryFee = subtotal >= 300 ? 0 : 50;
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        content.innerHTML = `
            <div class="summary-line">
                <span class="summary-label">小計 (${this.cart.total_items} 件)</span>
                <span class="summary-value">$${subtotal.toFixed(0)}</span>
            </div>
            <div class="summary-line">
                <span class="summary-label">外送費</span>
                <span class="summary-value ${deliveryFee === 0 ? 'summary-discount' : ''}">
                    ${deliveryFee === 0 ? '免費' : '$' + deliveryFee}
                    ${subtotal >= 300 && deliveryFee === 0 ? '<small class="d-block text-success">滿 $300 免運</small>' : ''}
                </span>
            </div>
            ${discount > 0 ? `
                <div class="summary-line">
                    <span class="summary-label">優惠折扣</span>
                    <span class="summary-value summary-discount">-$${discount.toFixed(0)}</span>
                </div>
            ` : ''}
            <div class="summary-line total">
                <span class="summary-label">總計</span>
                <span class="summary-value">$${total.toFixed(0)}</span>
            </div>
        `;
    }

    calculateDiscount(subtotal) {
        // 模擬優惠計算
        if (subtotal >= 500) {
            return subtotal * 0.1; // 滿 500 享 9 折
        }
        return 0;
    }

    showCheckoutSection() {
        const section = document.getElementById('checkout-section');
        const promoSection = document.getElementById('promo-section');
        
        if (section) section.style.display = 'block';
        if (promoSection) promoSection.style.display = 'block';
    }

    hideCheckoutSection() {
        const section = document.getElementById('checkout-section');
        const promoSection = document.getElementById('promo-section');
        
        if (section) section.style.display = 'none';
        if (promoSection) promoSection.style.display = 'none';
    }

    async loadRecommendations() {
        try {
            // 模擬推薦商品
            this.recommendations = [
                {
                    id: 'rec_1',
                    name: '招牌炸雞',
                    description: '酥脆外皮，嫩滑內裡',
                    price: 180,
                    image: 'https://via.placeholder.com/150x120/f8f9fa/6c757d?text=招牌炸雞',
                    category: 'main-dish'
                },
                {
                    id: 'rec_2',
                    name: '蛋花湯',
                    description: '清淡爽口，營養豐富',
                    price: 60,
                    image: 'https://via.placeholder.com/150x120/f8f9fa/6c757d?text=蛋花湯',
                    category: 'soup'
                },
                {
                    id: 'rec_3',
                    name: '珍珠奶茶',
                    description: '台灣經典飲品',
                    price: 80,
                    image: 'https://via.placeholder.com/150x120/f8f9fa/6c757d?text=珍珠奶茶',
                    category: 'beverage'
                }
            ];
        } catch (error) {
            console.error('載入推薦商品失敗：', error);
        }
    }

    showRecommendations() {
        const section = document.getElementById('recommendations-section');
        const container = document.getElementById('recommendations-container');
        
        if (!section || !container || !this.cart || this.cart.items.length === 0) return;

        section.style.display = 'block';
        
        container.innerHTML = this.recommendations.map(item => `
            <div class="col-md-4 mb-3">
                <div class="recommendation-card">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h6 class="card-title">${item.name}</h6>
                        <p class="card-text">${item.description}</p>
                        <div class="price mb-2">$${item.price}</div>
                        <button class="btn btn-outline-primary btn-sm w-100 add-recommendation-btn" data-item-id="${item.id}">
                            <i class="bi bi-plus-circle me-1"></i>加入購物車
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // 綁定推薦商品按鈕
        container.querySelectorAll('.add-recommendation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                this.addRecommendationToCart(itemId);
            });
        });
    }

    hideRecommendations() {
        const section = document.getElementById('recommendations-section');
        if (section) section.style.display = 'none';
    }

    addRecommendationToCart(itemId) {
        const item = this.recommendations.find(item => item.id === itemId);
        if (!item) return;

        CartManager.addItem(item, 1);
        this.loadCart();
        Utils.showToast(`已將 ${item.name} 加入購物車`, 'success');
    }

    showClearCartModal() {
        const modal = new bootstrap.Modal(document.getElementById('clearCartModal'));
        modal.show();
    }

    async clearCart() {
        try {
            CartManager.clearCart();
            await this.loadCart();
            
            // 關閉 Modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('clearCartModal'));
            if (modal) modal.hide();
            
            Utils.showToast('購物車已清空', 'success');
        } catch (error) {
            console.error('清空購物車失敗：', error);
            Utils.showToast('清空購物車失敗', 'error');
        }
    }

    proceedToCheckout() {
        if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
            Utils.showToast('購物車是空的，無法結帳', 'warning');
            return;
        }

        // 這裡應該導向結帳頁面
        Utils.showToast('即將導向結帳頁面...', 'info');
        
        // 模擬導向結帳
        setTimeout(() => {
            // window.location.href = 'checkout.html';
            Utils.showToast('結帳功能開發中', 'info');
        }, 1500);
    }

    applyPromoCode() {
        const input = document.getElementById('promo-code-input');
        const feedback = document.getElementById('promo-feedback');
        
        if (!input || !feedback) return;

        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            feedback.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i>請輸入優惠代碼';
            feedback.className = 'promo-feedback error';
            return;
        }

        // 模擬優惠代碼驗證
        const validCodes = {
            'SAVE10': { discount: 0.1, description: '享 9 折優惠' },
            'WELCOME': { discount: 50, description: '新用戶享 $50 折扣' },
            'FREE50': { discount: 50, description: '滿額享 $50 折扣' }
        };

        if (validCodes[code]) {
            feedback.innerHTML = `<i class="bi bi-check-circle me-1"></i>優惠代碼已套用：${validCodes[code].description}`;
            feedback.className = 'promo-feedback success';
            input.value = '';
            
            // 重新計算摘要
            this.renderOrderSummary();
            Utils.showToast('優惠代碼套用成功', 'success');
        } else {
            feedback.innerHTML = '<i class="bi bi-x-circle me-1"></i>無效的優惠代碼';
            feedback.className = 'promo-feedback error';
        }
    }

    saveForLater() {
        Utils.showToast('購物車已保存，您可以稍後繼續購物', 'success');
    }

    shareCart() {
        if (navigator.share) {
            navigator.share({
                title: '美食點餐系統 - 我的購物車',
                text: '來看看我選購的美味料理！',
                url: window.location.href
            });
        } else {
            // 複製連結到剪貼板
            navigator.clipboard.writeText(window.location.href).then(() => {
                Utils.showToast('購物車連結已複製到剪貼板', 'success');
            }).catch(() => {
                Utils.showToast('分享功能暫不支援', 'info');
            });
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const count = CartManager.getItemCount();
            cartCount.textContent = count;
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        const container = document.getElementById('cart-items-container');
        const emptyCart = document.getElementById('empty-cart');
        
        if (show) {
            spinner.style.display = 'block';
            container.style.display = 'none';
            emptyCart.style.display = 'none';
        } else {
            spinner.style.display = 'none';
        }
    }

    // 工具方法
    createItemBadges(item) {
        const badges = [];
        
        if (item.tags?.includes('popular') || item.popular) {
            badges.push('<span class="badge bg-warning text-dark">熱門</span>');
        }
        
        if (item.tags?.includes('new') || item.isNew) {
            badges.push('<span class="badge bg-info">新品</span>');
        }
        
        if (item.dietary_info?.vegetarian || item.vegetarian) {
            badges.push('<span class="badge bg-success">素食</span>');
        }
        
        if (item.dietary_info?.vegan || item.vegan) {
            badges.push('<span class="badge bg-danger">純素</span>');
        }
        
        return badges.join('');
    }

    getCategoryName(category) {
        const categoryMap = {
            'appetizer': '開胃菜',
            'main-dish': '主菜',
            'soup': '湯品',
            'dessert': '甜點',
            'beverage': '飲品',
            'noodle': '麵食'
        };
        
        return categoryMap[category] || '其他';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化購物車頁面
document.addEventListener('DOMContentLoaded', () => {
    console.log('購物車頁面載入完成，正在初始化...');
    window.cartPageManager = new CartPageManager();
});
