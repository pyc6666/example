# Cart Routes for Restaurant Ordering System
from flask import Blueprint, request, jsonify, session
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import uuid
import sys
import os

# 添加 backend 目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.cart import CartModel
from models.menu import MenuModel

cart_bp = Blueprint('cart', __name__)

def get_session_id():
    """取得或建立 session ID"""
    if 'cart_session_id' not in session:
        session['cart_session_id'] = str(uuid.uuid4())
    return session['cart_session_id']

@cart_bp.route('/api/cart', methods=['GET'])
def get_cart():
    """取得購物車內容"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        session_id = get_session_id()
        cart = cart_model.get_cart_with_menu_details(session_id)
        
        if not cart:
            # 建立空購物車
            cart = cart_model.create_cart(session_id)
            cart['items'] = []
        
        # 轉換 ObjectId 為字串
        if cart:
            cart['_id'] = str(cart['_id'])
            for item in cart.get('items', []):
                item['menu_item_id'] = str(item['menu_item_id'])
        
        return jsonify({
            'success': True,
            'data': cart
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'取得購物車失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    """新增商品到購物車"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': '請提供有效的 JSON 資料'
            }), 400
        
        # 驗證必要欄位
        menu_item_id = data.get('menu_item_id')
        quantity = data.get('quantity', 1)
        special_requests = data.get('special_requests', '')
        
        if not menu_item_id:
            return jsonify({
                'success': False,
                'message': '請提供菜單項目 ID'
            }), 400
        
        if not isinstance(quantity, int) or quantity <= 0:
            return jsonify({
                'success': False,
                'message': '數量必須為正整數'
            }), 400
        
        if quantity > 10:
            return jsonify({
                'success': False,
                'message': '單項商品數量不能超過 10 個'
            }), 400
        
        # 驗證 ObjectId 格式
        try:
            ObjectId(menu_item_id)
        except InvalidId:
            return jsonify({
                'success': False,
                'message': '無效的菜單項目 ID'
            }), 400
        
        session_id = get_session_id()
        
        # 新增到購物車
        cart = cart_model.add_item_to_cart(
            session_id=session_id,
            menu_item_id=menu_item_id,
            quantity=quantity,
            special_requests=special_requests
        )
        
        # 取得完整購物車資訊
        cart = cart_model.get_cart_with_menu_details(session_id)
        
        # 轉換 ObjectId 為字串
        if cart:
            cart['_id'] = str(cart['_id'])
            for item in cart.get('items', []):
                item['menu_item_id'] = str(item['menu_item_id'])
        
        return jsonify({
            'success': True,
            'message': '商品已成功加入購物車',
            'data': cart
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'新增到購物車失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/update', methods=['PUT'])
def update_cart_item():
    """更新購物車中商品的數量"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': '請提供有效的 JSON 資料'
            }), 400
        
        # 驗證必要欄位
        menu_item_id = data.get('menu_item_id')
        quantity = data.get('quantity')
        special_requests = data.get('special_requests', '')
        
        if not menu_item_id:
            return jsonify({
                'success': False,
                'message': '請提供菜單項目 ID'
            }), 400
        
        if quantity is None or not isinstance(quantity, int) or quantity < 0:
            return jsonify({
                'success': False,
                'message': '數量必須為非負整數'
            }), 400
        
        if quantity > 10:
            return jsonify({
                'success': False,
                'message': '單項商品數量不能超過 10 個'
            }), 400
        
        # 驗證 ObjectId 格式
        try:
            ObjectId(menu_item_id)
        except InvalidId:
            return jsonify({
                'success': False,
                'message': '無效的菜單項目 ID'
            }), 400
        
        session_id = get_session_id()
        
        # 更新購物車
        cart = cart_model.update_item_quantity(
            session_id=session_id,
            menu_item_id=menu_item_id,
            quantity=quantity,
            special_requests=special_requests
        )
        
        # 取得完整購物車資訊
        cart = cart_model.get_cart_with_menu_details(session_id)
        
        # 轉換 ObjectId 為字串
        if cart:
            cart['_id'] = str(cart['_id'])
            for item in cart.get('items', []):
                item['menu_item_id'] = str(item['menu_item_id'])
        
        message = '商品已從購物車移除' if quantity == 0 else '購物車已更新'
        
        return jsonify({
            'success': True,
            'message': message,
            'data': cart
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'更新購物車失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/remove', methods=['DELETE'])
def remove_from_cart():
    """從購物車移除商品"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        # 取得參數
        menu_item_id = request.args.get('menu_item_id')
        special_requests = request.args.get('special_requests', '')
        
        if not menu_item_id:
            return jsonify({
                'success': False,
                'message': '請提供菜單項目 ID'
            }), 400
        
        # 驗證 ObjectId 格式
        try:
            ObjectId(menu_item_id)
        except InvalidId:
            return jsonify({
                'success': False,
                'message': '無效的菜單項目 ID'
            }), 400
        
        session_id = get_session_id()
        
        # 從購物車移除
        cart = cart_model.remove_item_from_cart(
            session_id=session_id,
            menu_item_id=menu_item_id,
            special_requests=special_requests
        )
        
        # 取得完整購物車資訊
        cart = cart_model.get_cart_with_menu_details(session_id)
        
        # 轉換 ObjectId 為字串
        if cart:
            cart['_id'] = str(cart['_id'])
            for item in cart.get('items', []):
                item['menu_item_id'] = str(item['menu_item_id'])
        
        return jsonify({
            'success': True,
            'message': '商品已從購物車移除',
            'data': cart
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'移除商品失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    """清空購物車"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        session_id = get_session_id()
        
        # 清空購物車
        cart = cart_model.clear_cart(session_id)
        
        # 轉換 ObjectId 為字串
        if cart:
            cart['_id'] = str(cart['_id'])
            for item in cart.get('items', []):
                item['menu_item_id'] = str(item['menu_item_id'])
        
        return jsonify({
            'success': True,
            'message': '購物車已清空',
            'data': cart
        }), 200
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'清空購物車失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/count', methods=['GET'])
def get_cart_count():
    """取得購物車商品數量"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        session_id = get_session_id()
        cart = cart_model.get_cart_by_session(session_id)
        
        count = cart['total_items'] if cart else 0
        
        return jsonify({
            'success': True,
            'data': {
                'count': count
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'取得購物車數量失敗: {str(e)}',
            'data': {
                'count': 0
            }
        }), 500

@cart_bp.route('/api/cart/summary', methods=['GET'])
def get_cart_summary():
    """取得購物車摘要資訊"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        session_id = get_session_id()
        cart = cart_model.get_cart_by_session(session_id)
        
        if not cart:
            return jsonify({
                'success': True,
                'data': {
                    'total_items': 0,
                    'total_amount': 0.0,
                    'item_count': 0
                }
            }), 200
        
        return jsonify({
            'success': True,
            'data': {
                'total_items': cart['total_items'],
                'total_amount': cart['total_amount'],
                'item_count': len(cart['items'])
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'取得購物車摘要失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/cart/validate', methods=['POST'])
def validate_cart():
    """驗證購物車內容（檢查商品是否仍然可用）"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        menu_model = MenuModel(db)
        
        session_id = get_session_id()
        cart = cart_model.get_cart_by_session(session_id)
        
        if not cart or not cart.get('items'):
            return jsonify({
                'success': True,
                'data': {
                    'valid': True,
                    'issues': []
                }
            }), 200
        
        issues = []
        
        for item in cart['items']:
            menu_item = menu_model.get_menu_item_by_id(str(item['menu_item_id']))
            
            if not menu_item:
                issues.append({
                    'type': 'item_not_found',
                    'item_name': item['name'],
                    'message': f'商品 "{item["name"]}" 已不存在'
                })
                continue
            
            if not menu_item.get('availability', True):
                issues.append({
                    'type': 'item_unavailable',
                    'item_name': item['name'],
                    'message': f'商品 "{item["name"]}" 目前無法訂購'
                })
            
            if menu_item['price'] != item['price']:
                issues.append({
                    'type': 'price_changed',
                    'item_name': item['name'],
                    'old_price': item['price'],
                    'new_price': menu_item['price'],
                    'message': f'商品 "{item["name"]}" 價格已變更：${item["price"]} → ${menu_item["price"]}'
                })
        
        return jsonify({
            'success': True,
            'data': {
                'valid': len(issues) == 0,
                'issues': issues
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'驗證購物車失敗: {str(e)}'
        }), 500

# 管理員 API
@cart_bp.route('/api/admin/cart/stats', methods=['GET'])
def get_cart_statistics():
    """取得購物車統計資料（管理員用）"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        # 這裡應該加入管理員權限驗證
        
        stats = cart_model.get_cart_statistics()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'取得統計資料失敗: {str(e)}'
        }), 500

@cart_bp.route('/api/admin/cart/cleanup', methods=['POST'])
def cleanup_expired_carts():
    """清理過期的購物車（管理員用）"""
    try:
        from flask import current_app
        db = current_app.db
        cart_model = CartModel(db)
        
        # 這裡應該加入管理員權限驗證
        
        cart_model.cleanup_expired_carts()
        
        return jsonify({
            'success': True,
            'message': '過期購物車清理完成'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'清理過期購物車失敗: {str(e)}'
        }), 500
