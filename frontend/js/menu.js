// Menu Page JavaScript
class MenuManager {
    constructor() {
        this.currentFilters = {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            vegetarian: false,
            vegan: false,
            sort: 'popularity_score,desc'
        };
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.menuItems = [];
        this.categories = [];
        this.selectedItem = null;
        
        this.init();
    }

    async init() {
        console.log('正在初始化菜單管理器...');
        
        // 綁定事件監聽器
        this.bindEventListeners();
        
        // 載入初始數據
        await this.loadCategories();
        await this.loadMenuItems();
        
        // 更新購物車計數
        this.updateCartCount();
        
        console.log('菜單管理器初始化完成');
    }

    bindEventListeners() {
        // 搜尋功能
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.currentFilters.search = searchInput.value.trim();
                this.currentPage = 1;
                this.loadMenuItems();
            }, 500));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadMenuItems();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('search-input');
                this.currentFilters.search = searchInput.value.trim();
                this.currentPage = 1;
                this.loadMenuItems();
            });
        }

        // 分類篩選
        const categoryFilters = document.getElementById('category-filters');
        if (categoryFilters) {
            categoryFilters.addEventListener('change', (e) => {
                if (e.target.name === 'category') {
                    this.currentFilters.category = e.target.value;
                    this.currentPage = 1;
                    this.loadMenuItems();
                    this.updateActiveFilters();
                }
            });
        }

        // 價格篩選
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('change', () => {
                this.currentFilters.minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : null;
                this.currentPage = 1;
                this.loadMenuItems();
                this.updateActiveFilters();
            });
        }
        
        if (maxPriceInput) {
            maxPriceInput.addEventListener('change', () => {
                this.currentFilters.maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : null;
                this.currentPage = 1;
                this.loadMenuItems();
                this.updateActiveFilters();
            });
        }

        // 飲食偏好篩選
        const vegetarianFilter = document.getElementById('vegetarian-filter');
        const veganFilter = document.getElementById('vegan-filter');
        
        if (vegetarianFilter) {
            vegetarianFilter.addEventListener('change', () => {
                this.currentFilters.vegetarian = vegetarianFilter.checked;
                this.currentPage = 1;
                this.loadMenuItems();
                this.updateActiveFilters();
            });
        }
        
        if (veganFilter) {
            veganFilter.addEventListener('change', () => {
                this.currentFilters.vegan = veganFilter.checked;
                this.currentPage = 1;
                this.loadMenuItems();
                this.updateActiveFilters();
            });
        }

        // 排序
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentFilters.sort = sortSelect.value;
                this.currentPage = 1;
                this.loadMenuItems();
            });
        }

        // 檢視模式切換
        const gridViewBtn = document.getElementById('grid-view');
        const listViewBtn = document.getElementById('list-view');
        
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.setViewMode('grid');
            });
            
            listViewBtn.addEventListener('click', () => {
                this.setViewMode('list');
            });
        }

        // 清除篩選
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Modal 數量控制
        const qtyDecrease = document.getElementById('qty-decrease');
        const qtyIncrease = document.getElementById('qty-increase');
        const qtyInput = document.getElementById('item-quantity');
        
        if (qtyDecrease) {
            qtyDecrease.addEventListener('click', () => {
                const current = parseInt(qtyInput.value);
                if (current > 1) {
                    qtyInput.value = current - 1;
                }
            });
        }
        
        if (qtyIncrease) {
            qtyIncrease.addEventListener('click', () => {
                const current = parseInt(qtyInput.value);
                if (current < 10) {
                    qtyInput.value = current + 1;
                }
            });
        }

        // 加入購物車
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
    }

    async loadCategories() {
        try {
            console.log('正在載入分類...');
            
            // 模擬 API 呼叫或使用實際 API
            const categories = await this.fetchCategories();
            this.categories = categories;
            
            this.renderCategoryFilters();
            this.renderCategoryTabs();
            
            console.log(`已載入 ${categories.length} 個分類`);
        } catch (error) {
            console.error('載入分類失敗：', error);
            Utils.showToast('載入分類失敗', 'error');
        }
    }

    async fetchCategories() {
        // 如果有後端 API，使用這個
        // return Utils.apiRequest('/api/categories');
        
        // 模擬數據
        return [
            { _id: 'appetizer', name: '開胃菜', icon: 'bi-cup-hot', description: '精緻開胃小點' },
            { _id: 'main-dish', name: '主菜', icon: 'bi-egg-fried', description: '豐盛主要料理' },
            { _id: 'soup', name: '湯品', icon: 'bi-cup-straw', description: '暖心湯品' },
            { _id: 'dessert', name: '甜點', icon: 'bi-heart-fill', description: '甜蜜結尾' },
            { _id: 'beverage', name: '飲品', icon: 'bi-cup', description: '清爽飲料' },
            { _id: 'noodle', name: '麵食', icon: 'bi-egg', description: '各式麵條' }
        ];
    }

    async loadMenuItems() {
        try {
            console.log('正在載入菜單項目...', this.currentFilters);
            
            // 顯示載入動畫
            this.showLoading(true);
            
            // 模擬 API 呼叫或使用實際 API
            const result = await this.fetchMenuItems();
            this.menuItems = result.items;
            
            this.renderMenuItems(result.items);
            this.renderPagination(result.pagination);
            this.updateResultsInfo(result.pagination);
            
            // 隱藏載入動畫
            this.showLoading(false);
            
            console.log(`已載入 ${result.items.length} 個菜單項目`);
        } catch (error) {
            console.error('載入菜單項目失敗：', error);
            Utils.showToast('載入菜單失敗', 'error');
            this.showLoading(false);
        }
    }

    async fetchMenuItems() {
        // 如果有後端 API，使用這個
        // const params = new URLSearchParams({
        //     page: this.currentPage,
        //     limit: this.itemsPerPage,
        //     category: this.currentFilters.category,
        //     search: this.currentFilters.search,
        //     minPrice: this.currentFilters.minPrice || '',
        //     maxPrice: this.currentFilters.maxPrice || '',
        //     vegetarian: this.currentFilters.vegetarian,
        //     vegan: this.currentFilters.vegan,
        //     sort: this.currentFilters.sort
        // });
        // return Utils.apiRequest(`/api/menu?${params}`);
        
        // 模擬數據
        await this.delay(800); // 模擬網路延遲
        
        const allItems = this.generateMockMenuItems();
        let filteredItems = [...allItems];
        
        // 應用篩選
        if (this.currentFilters.category !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === this.currentFilters.category);
        }
        
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
            );
        }
        
        if (this.currentFilters.minPrice !== null) {
            filteredItems = filteredItems.filter(item => item.price >= this.currentFilters.minPrice);
        }
        
        if (this.currentFilters.maxPrice !== null) {
            filteredItems = filteredItems.filter(item => item.price <= this.currentFilters.maxPrice);
        }
        
        if (this.currentFilters.vegetarian) {
            filteredItems = filteredItems.filter(item => item.dietary_info.vegetarian);
        }
        
        if (this.currentFilters.vegan) {
            filteredItems = filteredItems.filter(item => item.dietary_info.vegan);
        }
        
        // 應用排序
        const [sortField, sortOrder] = this.currentFilters.sort.split(',');
        filteredItems.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            if (sortField === 'name') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
        
        // 分頁
        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = filteredItems.slice(startIndex, endIndex);
        
        return {
            items: pageItems,
            pagination: {
                currentPage: this.currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: this.itemsPerPage
            }
        };
    }

    generateMockMenuItems() {
        return [
            {
                _id: '1',
                name: '蒜泥白肉',
                description: '選用優質豬五花肉，搭配特製蒜泥醬，清爽不膩',
                price: 180,
                category: 'appetizer',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=蒜泥白肉',
                ingredients: ['豬五花肉', '大蒜', '醬油', '香油'],
                prep_time: 15,
                rating: 4.5,
                popularity_score: 85,
                dietary_info: { vegetarian: false, vegan: false },
                tags: ['popular', 'appetizer']
            },
            {
                _id: '2',
                name: '紅燒獅子頭',
                description: '手工製作的大肉丸，軟嫩多汁，配菜豐富',
                price: 220,
                category: 'main-dish',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=紅燒獅子頭',
                ingredients: ['豬絞肉', '白菜', '冬筍', '香菇'],
                prep_time: 25,
                rating: 4.7,
                popularity_score: 92,
                dietary_info: { vegetarian: false, vegan: false },
                tags: ['popular', 'main-dish']
            },
            {
                _id: '3',
                name: '素食麻婆豆腐',
                description: '使用天然調料製作，麻辣鮮香，素食者最愛',
                price: 150,
                category: 'main-dish',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=素食麻婆豆腐',
                ingredients: ['嫩豆腐', '豆瓣醬', '花椒', '蔥'],
                prep_time: 10,
                rating: 4.3,
                popularity_score: 78,
                dietary_info: { vegetarian: true, vegan: true },
                tags: ['vegetarian', 'vegan', 'spicy']
            },
            {
                _id: '4',
                name: '銀耳蓮子湯',
                description: '養生甜湯，銀耳軟糯，蓮子清香',
                price: 80,
                category: 'soup',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=銀耳蓮子湯',
                ingredients: ['銀耳', '蓮子', '冰糖', '紅棗'],
                prep_time: 20,
                rating: 4.4,
                popularity_score: 70,
                dietary_info: { vegetarian: true, vegan: true },
                tags: ['healthy', 'sweet', 'vegetarian']
            },
            {
                _id: '5',
                name: '提拉米蘇',
                description: '經典義式甜點，濃郁香醇，入口即化',
                price: 120,
                category: 'dessert',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=提拉米蘇',
                ingredients: ['馬斯卡彭起司', '咖啡', '可可粉', '手指餅乾'],
                prep_time: 5,
                rating: 4.8,
                popularity_score: 95,
                dietary_info: { vegetarian: true, vegan: false },
                tags: ['dessert', 'coffee', 'popular']
            },
            {
                _id: '6',
                name: '檸檬蜂蜜茶',
                description: '新鮮檸檬片配天然蜂蜜，酸甜清香',
                price: 60,
                category: 'beverage',
                image: 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=檸檬蜂蜜茶',
                ingredients: ['檸檬', '蜂蜜', '綠茶', '薄荷'],
                prep_time: 3,
                rating: 4.2,
                popularity_score: 65,
                dietary_info: { vegetarian: true, vegan: false },
                tags: ['refreshing', 'healthy']
            }
        ];
    }

    renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;
        
        // 保留 "全部" 選項
        const allOption = container.querySelector('input[value="all"]').parentElement;
        container.innerHTML = '';
        container.appendChild(allOption);
        
        // 添加分類選項
        this.categories.forEach(category => {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'form-check';
            filterDiv.innerHTML = `
                <input class="form-check-input" type="radio" name="category" id="category-${category._id}" value="${category._id}">
                <label class="form-check-label" for="category-${category._id}">
                    <i class="${category.icon} me-1"></i>${category.name}
                </label>
            `;
            container.appendChild(filterDiv);
        });
    }

    renderCategoryTabs() {
        const container = document.getElementById('category-tabs');
        if (!container) return;
        
        const navList = container.querySelector('.nav-pills');
        if (!navList) return;
        
        // 清空現有標籤（保留全部）
        navList.innerHTML = `
            <li class="nav-item">
                <button class="nav-link active" data-category="all">全部</button>
            </li>
        `;
        
        // 添加分類標籤
        this.categories.forEach(category => {
            const tabItem = document.createElement('li');
            tabItem.className = 'nav-item';
            tabItem.innerHTML = `
                <button class="nav-link" data-category="${category._id}">
                    <i class="${category.icon} me-1"></i>${category.name}
                </button>
            `;
            navList.appendChild(tabItem);
        });
        
        // 綁定標籤點擊事件
        navList.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'I') {
                const button = e.target.tagName === 'I' ? e.target.parentElement : e.target;
                const category = button.dataset.category;
                
                // 更新活動狀態
                navList.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                button.classList.add('active');
                
                // 更新篩選並重新載入
                this.currentFilters.category = category;
                this.currentPage = 1;
                
                // 同步側邊欄篩選
                const sidebarRadio = document.querySelector(`input[value="${category}"]`);
                if (sidebarRadio) {
                    sidebarRadio.checked = true;
                }
                
                this.loadMenuItems();
                this.updateActiveFilters();
            }
        });
    }

    renderMenuItems(items) {
        const container = document.getElementById('menu-items-container');
        const noResults = document.getElementById('no-results');
        
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }
        
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        container.innerHTML = items.map(item => this.createMenuItemCard(item)).join('');
        
        // 綁定卡片點擊事件
        container.querySelectorAll('.menu-item-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 如果點擊的是按鈕，不觸發卡片點擊
                if (e.target.closest('.add-to-cart-btn') || e.target.closest('.quantity-controls')) {
                    return;
                }
                
                const itemId = card.dataset.itemId;
                this.showItemDetails(itemId);
            });
        });
        
        // 綁定快速加入購物車按鈕
        container.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = btn.dataset.itemId;
                this.quickAddToCart(itemId);
            });
        });
        
        // 綁定數量控制按鈕
        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const itemId = btn.dataset.itemId;
                const display = btn.parentElement.querySelector('.quantity-display');
                let currentQty = parseInt(display.textContent);
                
                if (action === 'decrease' && currentQty > 0) {
                    currentQty--;
                } else if (action === 'increase' && currentQty < 10) {
                    currentQty++;
                }
                
                display.textContent = currentQty;
                
                // 更新加入購物車按鈕狀態
                const addBtn = btn.parentElement.parentElement.querySelector('.quick-add-btn');
                if (addBtn) {
                    addBtn.disabled = currentQty === 0;
                    addBtn.innerHTML = currentQty === 0 
                        ? '<i class="bi bi-cart-plus me-2"></i>加入購物車'
                        : `<i class="bi bi-cart-plus me-2"></i>加入 ${currentQty} 個`;
                }
            });
        });
    }

    createMenuItemCard(item) {
        const badges = this.createItemBadges(item);
        const rating = '★'.repeat(Math.floor(item.rating)) + (item.rating % 1 >= 0.5 ? '☆' : '');
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="menu-item-card" data-item-id="${item._id}">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="menu-item-title">${item.name}</h5>
                        <p class="menu-item-description">${item.description}</p>
                        
                        <div class="menu-item-badges mb-2">
                            ${badges}
                        </div>
                        
                        <div class="menu-item-meta">
                            <span class="menu-item-price">$${item.price}</span>
                            <div class="menu-item-rating">
                                <span class="rating-stars">${rating}</span>
                                <span class="rating-score">${item.rating}</span>
                            </div>
                        </div>
                        
                        <div class="add-to-cart-section">
                            <div class="quantity-controls mb-2">
                                <button class="quantity-btn" data-action="decrease" data-item-id="${item._id}">-</button>
                                <span class="quantity-display">1</span>
                                <button class="quantity-btn" data-action="increase" data-item-id="${item._id}">+</button>
                            </div>
                            <button type="button" class="btn btn-warning btn-sm w-100 quick-add-btn" data-item-id="${item._id}">
                                <i class="bi bi-cart-plus me-2"></i>加入 1 個
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createItemBadges(item) {
        const badges = [];
        
        if (item.tags?.includes('popular')) {
            badges.push('<span class="badge badge-popular">熱門</span>');
        }
        
        if (item.tags?.includes('new')) {
            badges.push('<span class="badge badge-new">新品</span>');
        }
        
        if (item.dietary_info?.vegetarian) {
            badges.push('<span class="badge badge-vegetarian">素食</span>');
        }
        
        if (item.dietary_info?.vegan) {
            badges.push('<span class="badge badge-vegan">純素</span>');
        }
        
        return badges.join('');
    }

    showItemDetails(itemId) {
        const item = this.menuItems.find(item => item._id === itemId);
        if (!item) return;
        
        this.selectedItem = item;
        
        // 填充 Modal 內容
        document.getElementById('modal-item-name').textContent = item.name;
        document.getElementById('modal-item-title').textContent = item.name;
        document.getElementById('modal-item-description').textContent = item.description;
        document.getElementById('modal-item-price').textContent = `$${item.price}`;
        document.getElementById('modal-item-time').textContent = item.prep_time;
        document.getElementById('modal-item-image').src = item.image;
        document.getElementById('modal-item-image').alt = item.name;
        
        // 食材列表
        const ingredientsContainer = document.getElementById('modal-item-ingredients');
        ingredientsContainer.innerHTML = item.ingredients.map(ingredient => 
            `<span class="ingredient-tag">${ingredient}</span>`
        ).join('');
        
        // 飲食標籤
        const dietaryContainer = document.getElementById('modal-dietary-badges');
        dietaryContainer.innerHTML = this.createItemBadges(item);
        
        // 重置數量
        document.getElementById('item-quantity').value = 1;
        
        // 顯示 Modal
        const modal = new bootstrap.Modal(document.getElementById('menuItemModal'));
        modal.show();
    }

    quickAddToCart(itemId) {
        const item = this.menuItems.find(item => item._id === itemId);
        if (!item) return;
        
        const card = document.querySelector(`[data-item-id="${itemId}"]`);
        const quantityDisplay = card.querySelector('.quantity-display');
        const quantity = parseInt(quantityDisplay.textContent);
        
        if (quantity > 0) {
            CartManager.addItem(item, quantity);
            this.updateCartCount();
            Utils.showToast(`已將 ${item.name} x${quantity} 加入購物車`, 'success');
            
            // 重置數量
            quantityDisplay.textContent = '1';
            const addBtn = card.querySelector('.quick-add-btn');
            addBtn.innerHTML = '<i class="bi bi-cart-plus me-2"></i>加入 1 個';
        }
    }

    addToCart() {
        if (!this.selectedItem) return;
        
        const quantity = parseInt(document.getElementById('item-quantity').value);
        
        CartManager.addItem(this.selectedItem, quantity);
        this.updateCartCount();
        Utils.showToast(`已將 ${this.selectedItem.name} x${quantity} 加入購物車`, 'success');
        
        // 關閉 Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('menuItemModal'));
        modal.hide();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const count = CartManager.getItemCount();
            cartCount.textContent = count;
            
            // 添加動畫效果
            if (count > 0) {
                document.body.classList.add('cart-updated');
                setTimeout(() => document.body.classList.remove('cart-updated'), 600);
            }
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        const menuGrid = document.getElementById('menu-grid');
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        
        if (mode === 'grid') {
            menuGrid.classList.remove('list-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            menuGrid.classList.add('list-view');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        const menuGrid = document.getElementById('menu-grid');
        
        if (show) {
            spinner.style.display = 'block';
            menuGrid.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            menuGrid.style.display = 'block';
        }
    }

    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        const tagsContainer = container.querySelector('.filter-tags');
        const tags = [];
        
        // 分類標籤
        if (this.currentFilters.category !== 'all') {
            const category = this.categories.find(cat => cat._id === this.currentFilters.category);
            if (category) {
                tags.push(`分類: ${category.name}`);
            }
        }
        
        // 搜尋標籤
        if (this.currentFilters.search) {
            tags.push(`搜尋: "${this.currentFilters.search}"`);
        }
        
        // 價格標籤
        if (this.currentFilters.minPrice !== null || this.currentFilters.maxPrice !== null) {
            const min = this.currentFilters.minPrice || '0';
            const max = this.currentFilters.maxPrice || '無限';
            tags.push(`價格: $${min} - $${max}`);
        }
        
        // 飲食偏好標籤
        if (this.currentFilters.vegetarian) {
            tags.push('素食');
        }
        if (this.currentFilters.vegan) {
            tags.push('純素');
        }
        
        if (tags.length > 0) {
            tagsContainer.innerHTML = tags.map(tag => 
                `<span class="filter-tag">${tag}</span>`
            ).join('');
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    clearAllFilters() {
        // 重置篩選條件
        this.currentFilters = {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            vegetarian: false,
            vegan: false,
            sort: 'popularity_score,desc'
        };
        
        // 重置 UI
        document.getElementById('search-input').value = '';
        document.querySelector('input[value="all"]').checked = true;
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.getElementById('vegetarian-filter').checked = false;
        document.getElementById('vegan-filter').checked = false;
        document.getElementById('sort-select').value = 'popularity_score,desc';
        
        // 重置分類標籤
        document.querySelectorAll('.category-tabs .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('.category-tabs .nav-link[data-category="all"]').classList.add('active');
        
        // 重新載入
        this.currentPage = 1;
        this.loadMenuItems();
        this.updateActiveFilters();
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container || pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 上一頁
        if (pagination.currentPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${pagination.currentPage - 1}">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
            `;
        }
        
        // 頁碼
        const startPage = Math.max(1, pagination.currentPage - 2);
        const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        if (endPage < pagination.totalPages) {
            if (endPage < pagination.totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.totalPages}">${pagination.totalPages}</a></li>`;
        }
        
        // 下一頁
        if (pagination.currentPage < pagination.totalPages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${pagination.currentPage + 1}">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            `;
        }
        
        container.innerHTML = paginationHTML;
        
        // 綁定分頁點擊事件
        container.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.dataset.page) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.loadMenuItems();
                
                // 滾動到頂部
                document.querySelector('.page-header').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    updateResultsInfo(pagination) {
        const resultsText = document.getElementById('results-text');
        if (resultsText) {
            const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
            const end = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
            
            resultsText.textContent = `顯示第 ${start}-${end} 項，共 ${pagination.totalItems} 項結果`;
        }
    }

    // 工具方法
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
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 全域函數
function clearAllFilters() {
    if (window.menuManager) {
        window.menuManager.clearAllFilters();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('菜單頁面載入完成，正在初始化...');
    window.menuManager = new MenuManager();
});
