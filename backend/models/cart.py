# Cart Model for Restaurant Ordering System
from datetime import datetime
from bson import ObjectId
import pymongo

class CartModel:
    def __init__(self, db):
        self.db = db
        self.cart_collection = db.cart
        self.menu_collection = db.menu
        
    def get_cart_schema(self):
        """購物車資料結構 Schema"""
        return {
            "_id": ObjectId(),
            "session_id": str,  # 匿名用戶的 session ID
            "user_id": ObjectId(),  # 未來擴展：註冊用戶的 ID
            "items": [
                {
                    "menu_item_id": ObjectId(),
                    "name": str,
                    "price": float,
                    "quantity": int,
                    "subtotal": float,
                    "special_requests": str,  # 特殊需求
                    "added_at": datetime
                }
            ],
            "total_amount": float,
            "total_items": int,
            "created_at": datetime,
            "updated_at": datetime,
            "status": str,  # 'active', 'abandoned', 'checkout'
            "expires_at": datetime  # 購物車過期時間
        }
    
    def create_cart(self, session_id, user_id=None):
        """建立新的購物車"""
        cart_data = {
            "session_id": session_id,
            "user_id": user_id,
            "items": [],
            "total_amount": 0.0,
            "total_items": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active",
            "expires_at": datetime.utcnow().replace(hour=23, minute=59, second=59)  # 當天結束過期
        }
        
        result = self.cart_collection.insert_one(cart_data)
        cart_data["_id"] = result.inserted_id
        return cart_data
    
    def get_cart_by_session(self, session_id):
        """根據 session ID 取得購物車"""
        cart = self.cart_collection.find_one({
            "session_id": session_id,
            "status": "active",
            "expires_at": {"$gte": datetime.utcnow()}
        })
        return cart
    
    def add_item_to_cart(self, session_id, menu_item_id, quantity=1, special_requests=""):
        """新增商品到購物車"""
        # 取得菜單項目資訊
        menu_item = self.menu_collection.find_one({"_id": ObjectId(menu_item_id)})
        if not menu_item:
            raise ValueError("菜單項目不存在")
        
        # 取得或建立購物車
        cart = self.get_cart_by_session(session_id)
        if not cart:
            cart = self.create_cart(session_id)
        
        # 檢查是否已存在相同商品
        existing_item = None
        for item in cart["items"]:
            if (item["menu_item_id"] == ObjectId(menu_item_id) and 
                item["special_requests"] == special_requests):
                existing_item = item
                break
        
        if existing_item:
            # 更新數量
            new_quantity = existing_item["quantity"] + quantity
            new_subtotal = new_quantity * menu_item["price"]
            
            self.cart_collection.update_one(
                {
                    "_id": cart["_id"],
                    "items.menu_item_id": ObjectId(menu_item_id),
                    "items.special_requests": special_requests
                },
                {
                    "$set": {
                        "items.$.quantity": new_quantity,
                        "items.$.subtotal": new_subtotal,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        else:
            # 新增商品
            new_item = {
                "menu_item_id": ObjectId(menu_item_id),
                "name": menu_item["name"],
                "price": menu_item["price"],
                "quantity": quantity,
                "subtotal": quantity * menu_item["price"],
                "special_requests": special_requests,
                "added_at": datetime.utcnow()
            }
            
            self.cart_collection.update_one(
                {"_id": cart["_id"]},
                {
                    "$push": {"items": new_item},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        
        # 重新計算總金額
        self.recalculate_cart_totals(cart["_id"])
        
        return self.get_cart_by_id(cart["_id"])
    
    def update_item_quantity(self, session_id, menu_item_id, quantity, special_requests=""):
        """更新購物車中商品的數量"""
        cart = self.get_cart_by_session(session_id)
        if not cart:
            raise ValueError("購物車不存在")
        
        if quantity <= 0:
            # 移除商品
            return self.remove_item_from_cart(session_id, menu_item_id, special_requests)
        
        # 更新數量
        menu_item = self.menu_collection.find_one({"_id": ObjectId(menu_item_id)})
        if not menu_item:
            raise ValueError("菜單項目不存在")
        
        new_subtotal = quantity * menu_item["price"]
        
        result = self.cart_collection.update_one(
            {
                "_id": cart["_id"],
                "items.menu_item_id": ObjectId(menu_item_id),
                "items.special_requests": special_requests
            },
            {
                "$set": {
                    "items.$.quantity": quantity,
                    "items.$.subtotal": new_subtotal,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise ValueError("找不到指定的購物車項目")
        
        # 重新計算總金額
        self.recalculate_cart_totals(cart["_id"])
        
        return self.get_cart_by_id(cart["_id"])
    
    def remove_item_from_cart(self, session_id, menu_item_id, special_requests=""):
        """從購物車移除商品"""
        cart = self.get_cart_by_session(session_id)
        if not cart:
            raise ValueError("購物車不存在")
        
        self.cart_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$pull": {
                    "items": {
                        "menu_item_id": ObjectId(menu_item_id),
                        "special_requests": special_requests
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # 重新計算總金額
        self.recalculate_cart_totals(cart["_id"])
        
        return self.get_cart_by_id(cart["_id"])
    
    def clear_cart(self, session_id):
        """清空購物車"""
        cart = self.get_cart_by_session(session_id)
        if not cart:
            raise ValueError("購物車不存在")
        
        self.cart_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$set": {
                    "items": [],
                    "total_amount": 0.0,
                    "total_items": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return self.get_cart_by_id(cart["_id"])
    
    def recalculate_cart_totals(self, cart_id):
        """重新計算購物車總金額和數量"""
        cart = self.cart_collection.find_one({"_id": cart_id})
        if not cart:
            return
        
        total_amount = sum(item["subtotal"] for item in cart["items"])
        total_items = sum(item["quantity"] for item in cart["items"])
        
        self.cart_collection.update_one(
            {"_id": cart_id},
            {
                "$set": {
                    "total_amount": total_amount,
                    "total_items": total_items,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def get_cart_by_id(self, cart_id):
        """根據 ID 取得購物車"""
        return self.cart_collection.find_one({"_id": cart_id})
    
    def get_cart_with_menu_details(self, session_id):
        """取得包含完整菜單資訊的購物車"""
        cart = self.get_cart_by_session(session_id)
        if not cart:
            return None
        
        # 使用 aggregation 來取得完整的菜單資訊
        pipeline = [
            {"$match": {"_id": cart["_id"]}},
            {"$unwind": "$items"},
            {
                "$lookup": {
                    "from": "menu",
                    "localField": "items.menu_item_id",
                    "foreignField": "_id",
                    "as": "menu_detail"
                }
            },
            {"$unwind": "$menu_detail"},
            {
                "$addFields": {
                    "items.image": "$menu_detail.image",
                    "items.description": "$menu_detail.description",
                    "items.category": "$menu_detail.category",
                    "items.dietary_info": "$menu_detail.dietary_info",
                    "items.availability": "$menu_detail.availability"
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "session_id": {"$first": "$session_id"},
                    "user_id": {"$first": "$user_id"},
                    "items": {"$push": "$items"},
                    "total_amount": {"$first": "$total_amount"},
                    "total_items": {"$first": "$total_items"},
                    "created_at": {"$first": "$created_at"},
                    "updated_at": {"$first": "$updated_at"},
                    "status": {"$first": "$status"},
                    "expires_at": {"$first": "$expires_at"}
                }
            }
        ]
        
        result = list(self.cart_collection.aggregate(pipeline))
        return result[0] if result else cart
    
    def cleanup_expired_carts(self):
        """清理過期的購物車"""
        self.cart_collection.update_many(
            {
                "expires_at": {"$lt": datetime.utcnow()},
                "status": "active"
            },
            {
                "$set": {
                    "status": "abandoned",
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def get_cart_statistics(self):
        """取得購物車統計資料"""
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "avg_items": {"$avg": "$total_items"},
                    "avg_amount": {"$avg": "$total_amount"}
                }
            }
        ]
        
        return list(self.cart_collection.aggregate(pipeline))

def get_default_cart_indexes():
    """購物車集合的建議索引"""
    return [
        ("session_id", 1),
        ("user_id", 1),
        ("status", 1),
        ("expires_at", 1),
        ("created_at", -1),
        ("updated_at", -1),
        # 複合索引
        ("session_id", 1, "status", 1),
        ("expires_at", 1, "status", 1)
    ]

def create_cart_indexes(db):
    """建立購物車集合的索引"""
    cart_collection = db.cart
    
    for index in get_default_cart_indexes():
        if isinstance(index, tuple) and len(index) > 2:
            # 複合索引
            cart_collection.create_index([(index[i], index[i+1]) for i in range(0, len(index), 2)])
        else:
            # 單一索引
            cart_collection.create_index([index])
    
    print("購物車索引建立完成")
