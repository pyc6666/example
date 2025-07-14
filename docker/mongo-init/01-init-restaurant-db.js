// MongoDB 初始化腳本
// 為點餐系統建立資料庫和集合

// 切換到餐廳資料庫
db = db.getSiblingDB('restaurant_db');

print('✅ 切換到資料庫: restaurant_db');

// 建立集合和索引
// 1. 菜單集合
db.createCollection('menu');
db.menu.createIndex({ "name": 1 });
db.menu.createIndex({ "category": 1 });
db.menu.createIndex({ "price": 1 });
db.menu.createIndex({ "availability": 1 });
db.menu.createIndex({ "popularity_score": -1 });

print('✅ 建立菜單集合和索引');

// 2. 分類集合
db.createCollection('categories');
db.categories.createIndex({ "name": 1 }, { unique: true });

print('✅ 建立分類集合和索引');

// 3. 購物車集合
db.createCollection('cart');
db.cart.createIndex({ "session_id": 1 });
db.cart.createIndex({ "user_id": 1 });
db.cart.createIndex({ "status": 1 });
db.cart.createIndex({ "expires_at": 1 });
db.cart.createIndex({ "created_at": -1 });
db.cart.createIndex({ "updated_at": -1 });
// 複合索引
db.cart.createIndex({ "session_id": 1, "status": 1 });
db.cart.createIndex({ "expires_at": 1, "status": 1 });

print('✅ 建立購物車集合和索引');

// 4. 訂單集合
db.createCollection('orders');
db.orders.createIndex({ "order_number": 1 }, { unique: true });
db.orders.createIndex({ "customer_info.phone": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "created_at": -1 });
db.orders.createIndex({ "updated_at": -1 });

print('✅ 建立訂單集合和索引');

// 5. 訂單項目集合
db.createCollection('order_items');
db.order_items.createIndex({ "order_id": 1 });
db.order_items.createIndex({ "menu_item_id": 1 });

print('✅ 建立訂單項目集合和索引');

// 插入預設分類資料
const categories = [
  {
    "_id": "appetizer",
    "name": "開胃菜",
    "description": "精緻開胃小點",
    "icon": "bi-cup-hot",
    "display_order": 1,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": "main-dish",
    "name": "主菜",
    "description": "豐盛主要料理",
    "icon": "bi-egg-fried",
    "display_order": 2,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": "soup",
    "name": "湯品",
    "description": "暖心湯品",
    "icon": "bi-cup-straw",
    "display_order": 3,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": "dessert",
    "name": "甜點",
    "description": "甜蜜結尾",
    "icon": "bi-heart-fill",
    "display_order": 4,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": "beverage",
    "name": "飲品",
    "description": "清爽飲料",
    "icon": "bi-cup",
    "display_order": 5,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": "noodle",
    "name": "麵食",
    "description": "各式麵條",
    "icon": "bi-egg",
    "display_order": 6,
    "is_active": true,
    "created_at": new Date(),
    "updated_at": new Date()
  }
];

db.categories.insertMany(categories);
print('✅ 插入預設分類資料: ' + categories.length + ' 個分類');

// 插入範例菜單資料
const menuItems = [
  {
    "name": "蒜泥白肉",
    "description": "選用優質豬五花肉，搭配特製蒜泥醬，清爽不膩",
    "price": 180,
    "category": "appetizer",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=蒜泥白肉",
    "ingredients": ["豬五花肉", "大蒜", "醬油", "香油"],
    "prep_time": 15,
    "rating": 4.5,
    "popularity_score": 85,
    "dietary_info": {
      "vegetarian": false,
      "vegan": false,
      "spicy": false,
      "allergens": ["豬肉"]
    },
    "tags": ["popular", "appetizer"],
    "availability": true,
    "calories": 280,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "紅燒獅子頭",
    "description": "手工製作的大肉丸，軟嫩多汁，配菜豐富",
    "price": 220,
    "category": "main-dish",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=紅燒獅子頭",
    "ingredients": ["豬絞肉", "白菜", "冬筍", "香菇"],
    "prep_time": 25,
    "rating": 4.7,
    "popularity_score": 92,
    "dietary_info": {
      "vegetarian": false,
      "vegan": false,
      "spicy": false,
      "allergens": ["豬肉"]
    },
    "tags": ["popular", "main-dish"],
    "availability": true,
    "calories": 450,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "素食麻婆豆腐",
    "description": "使用天然調料製作，麻辣鮮香，素食者最愛",
    "price": 150,
    "category": "main-dish",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=素食麻婆豆腐",
    "ingredients": ["嫩豆腐", "豆瓣醬", "花椒", "蔥"],
    "prep_time": 10,
    "rating": 4.3,
    "popularity_score": 78,
    "dietary_info": {
      "vegetarian": true,
      "vegan": true,
      "spicy": true,
      "allergens": ["大豆"]
    },
    "tags": ["vegetarian", "vegan", "spicy"],
    "availability": true,
    "calories": 180,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "銀耳蓮子湯",
    "description": "養生甜湯，銀耳軟糯，蓮子清香",
    "price": 80,
    "category": "soup",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=銀耳蓮子湯",
    "ingredients": ["銀耳", "蓮子", "冰糖", "紅棗"],
    "prep_time": 20,
    "rating": 4.4,
    "popularity_score": 70,
    "dietary_info": {
      "vegetarian": true,
      "vegan": true,
      "spicy": false,
      "allergens": []
    },
    "tags": ["healthy", "sweet", "vegetarian"],
    "availability": true,
    "calories": 120,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "提拉米蘇",
    "description": "經典義式甜點，濃郁香醇，入口即化",
    "price": 120,
    "category": "dessert",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=提拉米蘇",
    "ingredients": ["馬斯卡彭起司", "咖啡", "可可粉", "手指餅乾"],
    "prep_time": 5,
    "rating": 4.8,
    "popularity_score": 95,
    "dietary_info": {
      "vegetarian": true,
      "vegan": false,
      "spicy": false,
      "allergens": ["蛋", "奶", "小麥"]
    },
    "tags": ["dessert", "coffee", "popular"],
    "availability": true,
    "calories": 320,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "檸檬蜂蜜茶",
    "description": "新鮮檸檬片配天然蜂蜜，酸甜清香",
    "price": 60,
    "category": "beverage",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=檸檬蜂蜜茶",
    "ingredients": ["檸檬", "蜂蜜", "綠茶", "薄荷"],
    "prep_time": 3,
    "rating": 4.2,
    "popularity_score": 65,
    "dietary_info": {
      "vegetarian": true,
      "vegan": false,
      "spicy": false,
      "allergens": []
    },
    "tags": ["refreshing", "healthy"],
    "availability": true,
    "calories": 45,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "牛肉麵",
    "description": "濃郁牛骨湯底，Q彈麵條，軟嫩牛肉",
    "price": 180,
    "category": "noodle",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=牛肉麵",
    "ingredients": ["牛肉", "麵條", "青菜", "牛骨湯"],
    "prep_time": 15,
    "rating": 4.6,
    "popularity_score": 88,
    "dietary_info": {
      "vegetarian": false,
      "vegan": false,
      "spicy": false,
      "allergens": ["牛肉", "小麥"]
    },
    "tags": ["popular", "comfort-food"],
    "availability": true,
    "calories": 520,
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "name": "素食春捲",
    "description": "酥脆外皮包裹新鮮蔬菜，健康美味",
    "price": 90,
    "category": "appetizer",
    "image": "https://via.placeholder.com/300x200/f8f9fa/6c757d?text=素食春捲",
    "ingredients": ["春捲皮", "高麗菜", "紅蘿蔔", "豆芽菜"],
    "prep_time": 12,
    "rating": 4.1,
    "popularity_score": 75,
    "dietary_info": {
      "vegetarian": true,
      "vegan": true,
      "spicy": false,
      "allergens": ["小麥"]
    },
    "tags": ["vegetarian", "healthy", "crispy"],
    "availability": true,
    "calories": 150,
    "created_at": new Date(),
    "updated_at": new Date()
  }
];

db.menu.insertMany(menuItems);
print('✅ 插入範例菜單資料: ' + menuItems.length + ' 個項目');

print('🎉 MongoDB 初始化完成！');
print('📊 資料庫統計:');
print('   - 分類數量: ' + db.categories.countDocuments());
print('   - 菜單項目數量: ' + db.menu.countDocuments());
print('   - 集合總數: ' + db.getCollectionNames().length);
