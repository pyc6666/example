"""
菜單資料模型
定義菜單項目和分類的資料結構
"""
from datetime import datetime
from bson.objectid import ObjectId


class MenuModel:
    """菜單項目資料模型"""
    
    @staticmethod
    def create_menu_item(data):
        """建立菜單項目"""
        menu_item = {
            "_id": ObjectId(),
            "name": data.get("name"),
            "description": data.get("description", ""),
            "price": float(data.get("price", 0)),
            "category": data.get("category"),
            "image": data.get("image", ""),
            "available": data.get("available", True),
            "ingredients": data.get("ingredients", []),
            "allergens": data.get("allergens", []),
            "nutritional_info": data.get("nutritional_info", {}),
            "preparation_time": data.get("preparation_time", 15),  # 分鐘
            "spiciness_level": data.get("spiciness_level", 0),  # 0-5
            "is_vegetarian": data.get("is_vegetarian", False),
            "is_vegan": data.get("is_vegan", False),
            "calories": data.get("calories", 0),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "popularity_score": 0,  # 受歡迎程度分數
            "rating": 0.0,  # 平均評分
            "review_count": 0,  # 評論數量
        }
        return menu_item
    
    @staticmethod
    def get_menu_schema():
        """獲取菜單項目的 JSON Schema"""
        schema = {
            "type": "object",
            "properties": {
                "_id": {"type": "string"},
                "name": {"type": "string", "maxLength": 100},
                "description": {"type": "string", "maxLength": 500},
                "price": {"type": "number", "minimum": 0},
                "category": {"type": "string", "enum": ["main", "drinks", "desserts", "soups", "appetizers", "salads"]},
                "image": {"type": "string"},
                "available": {"type": "boolean"},
                "ingredients": {"type": "array", "items": {"type": "string"}},
                "allergens": {"type": "array", "items": {"type": "string"}},
                "nutritional_info": {
                    "type": "object",
                    "properties": {
                        "protein": {"type": "number"},
                        "carbs": {"type": "number"},
                        "fat": {"type": "number"},
                        "fiber": {"type": "number"}
                    }
                },
                "preparation_time": {"type": "integer", "minimum": 1},
                "spiciness_level": {"type": "integer", "minimum": 0, "maximum": 5},
                "is_vegetarian": {"type": "boolean"},
                "is_vegan": {"type": "boolean"},
                "calories": {"type": "integer", "minimum": 0}
            },
            "required": ["name", "price", "category"]
        }
        return schema
    
    def get_menu_item_by_id(self, item_id):
        """根據 ID 取得單一菜單項目"""
        try:
            return self.menu_collection.find_one({"_id": ObjectId(item_id)})
        except:
            return None


class CategoryModel:
    """分類資料模型"""
    
    @staticmethod
    def create_category(data):
        """建立分類"""
        category = {
            "_id": ObjectId(),
            "id": data.get("id"),  # 英文 ID (如 'main', 'drinks')
            "name": data.get("name"),  # 中文名稱
            "description": data.get("description", ""),
            "icon": data.get("icon", ""),
            "color": data.get("color", "#007bff"),
            "display_order": data.get("display_order", 0),
            "available": data.get("available", True),
            "image": data.get("image", ""),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        return category
    
    @staticmethod
    def get_default_categories():
        """獲取預設分類清單"""
        categories = [
            {
                "id": "main",
                "name": "主餐",
                "description": "精選主食料理",
                "icon": "bi-egg-fried",
                "color": "#ffc107",
                "display_order": 1
            },
            {
                "id": "drinks",
                "name": "飲品",
                "description": "新鮮現調飲料",
                "icon": "bi-cup-straw",
                "color": "#0dcaf0",
                "display_order": 2
            },
            {
                "id": "desserts",
                "name": "甜點",
                "description": "精緻手作甜品",
                "icon": "bi-cake2",
                "color": "#dc3545",
                "display_order": 3
            },
            {
                "id": "soups",
                "name": "湯品",
                "description": "暖心營養湯品",
                "icon": "bi-droplet",
                "color": "#198754",
                "display_order": 4
            },
            {
                "id": "appetizers",
                "name": "開胃菜",
                "description": "精緻前菜小食",
                "icon": "bi-star",
                "color": "#fd7e14",
                "display_order": 5
            },
            {
                "id": "salads",
                "name": "沙拉",
                "description": "新鮮健康沙拉",
                "icon": "bi-leaf",
                "color": "#20c997",
                "display_order": 6
            }
        ]
        return categories


# MongoDB 索引設定
def setup_menu_indexes(db):
    """設定菜單集合的索引"""
    menu_collection = db.menu
    categories_collection = db.categories
    
    # 菜單項目索引
    menu_collection.create_index("category")
    menu_collection.create_index("available")
    menu_collection.create_index("price")
    menu_collection.create_index("popularity_score")
    menu_collection.create_index("rating")
    menu_collection.create_index([("name", "text"), ("description", "text")])  # 文字搜尋
    
    # 分類索引
    categories_collection.create_index("id", unique=True)
    categories_collection.create_index("display_order")
    categories_collection.create_index("available")
    
    print("菜單資料庫索引設定完成")


# 樣本資料
def get_sample_menu_data():
    """獲取樣本菜單資料"""
    sample_items = [
        # 主餐
        {
            "name": "經典牛肉漢堡",
            "description": "100% 純牛肉排，搭配新鮮生菜、番茄、洋蔥，特製醬料",
            "price": 280,
            "category": "main",
            "image": "/images/menu/classic-burger.jpg",
            "ingredients": ["牛肉排", "漢堡包", "生菜", "番茄", "洋蔥", "特製醬料"],
            "allergens": ["麩質", "蛋"],
            "preparation_time": 15,
            "calories": 650,
            "is_vegetarian": False
        },
        {
            "name": "香烤雞腿排",
            "description": "嫩煎雞腿排配時蔬，香草調味，營養均衡",
            "price": 320,
            "category": "main",
            "image": "/images/menu/grilled-chicken.jpg",
            "ingredients": ["雞腿排", "時令蔬菜", "香草", "橄欖油"],
            "preparation_time": 20,
            "calories": 480,
            "is_vegetarian": False
        },
        {
            "name": "素食義大利麵",
            "description": "新鮮蔬菜搭配番茄醬汁，健康美味",
            "price": 240,
            "category": "main",
            "image": "/images/menu/veggie-pasta.jpg",
            "ingredients": ["義大利麵", "番茄", "洋蔥", "彩椒", "橄欖油"],
            "preparation_time": 12,
            "calories": 420,
            "is_vegetarian": True,
            "is_vegan": True
        },
        
        # 飲品
        {
            "name": "現煮咖啡",
            "description": "精選咖啡豆，現場烘焙研磨",
            "price": 120,
            "category": "drinks",
            "image": "/images/menu/fresh-coffee.jpg",
            "preparation_time": 5,
            "calories": 5,
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "name": "新鮮檸檬汁",
            "description": "當季檸檬現榨，清香解膩",
            "price": 90,
            "category": "drinks",
            "image": "/images/menu/lemon-juice.jpg",
            "preparation_time": 3,
            "calories": 60,
            "is_vegetarian": True,
            "is_vegan": True
        },
        
        # 甜點
        {
            "name": "巧克力蛋糕",
            "description": "濃郁巧克力蛋糕，配香草冰淇淋",
            "price": 180,
            "category": "desserts",
            "image": "/images/menu/chocolate-cake.jpg",
            "ingredients": ["巧克力", "雞蛋", "麵粉", "奶油", "香草冰淇淋"],
            "allergens": ["蛋", "麩質", "乳製品"],
            "preparation_time": 8,
            "calories": 420,
            "is_vegetarian": True
        },
        
        # 湯品
        {
            "name": "蘑菇濃湯",
            "description": "新鮮蘑菇熬煮，口感濃郁順滑",
            "price": 150,
            "category": "soups",
            "image": "/images/menu/mushroom-soup.jpg",
            "ingredients": ["新鮮蘑菇", "洋蔥", "奶油", "香草"],
            "allergens": ["乳製品"],
            "preparation_time": 10,
            "calories": 180,
            "is_vegetarian": True
        }
    ]
    
    return sample_items
