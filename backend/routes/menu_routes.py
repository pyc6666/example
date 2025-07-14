"""
菜單相關 API 路由
提供菜單項目的 CRUD 操作和查詢功能
"""
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps
import json
from models.menu import MenuModel, CategoryModel, get_sample_menu_data

menu_bp = Blueprint('menu', __name__)

# MongoDB 連接設定
def get_db():
    client = MongoClient('mongodb://localhost:27017/')
    return client.restaurant_db


@menu_bp.route('/api/menu', methods=['GET'])
def get_menu():
    """
    獲取菜單列表
    支援分類篩選、分頁、搜尋功能
    """
    try:
        db = get_db()
        menu_collection = db.menu
        
        # 獲取查詢參數
        category = request.args.get('category')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search')
        sort_by = request.args.get('sort_by', 'popularity_score')
        sort_order = request.args.get('sort_order', 'desc')
        available_only = request.args.get('available', 'true').lower() == 'true'
        
        # 建立查詢條件
        query = {}
        
        # 分類篩選
        if category and category != 'all':
            query['category'] = category
            
        # 可用狀態篩選
        if available_only:
            query['available'] = True
            
        # 搜尋功能
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}},
                {'ingredients': {'$in': [search]}}
            ]
        
        # 排序設定
        sort_direction = -1 if sort_order == 'desc' else 1
        sort_criteria = [(sort_by, sort_direction)]
        
        # 執行查詢
        skip = (page - 1) * limit
        
        cursor = menu_collection.find(query).sort(sort_criteria).skip(skip).limit(limit)
        items = list(cursor)
        
        # 轉換 ObjectId 為字串
        for item in items:
            item['_id'] = str(item['_id'])
        
        # 獲取總數
        total_count = menu_collection.count_documents(query)
        total_pages = (total_count + limit - 1) // limit
        
        response = {
            'success': True,
            'data': {
                'items': items,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total_count,
                    'items_per_page': limit
                },
                'filters': {
                    'category': category,
                    'search': search,
                    'available_only': available_only
                }
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/menu/<item_id>', methods=['GET'])
def get_menu_item(item_id):
    """獲取單一菜單項目詳情"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        item = menu_collection.find_one({'_id': ObjectId(item_id)})
        
        if not item:
            return jsonify({
                'success': False,
                'error': '菜單項目不存在'
            }), 404
            
        item['_id'] = str(item['_id'])
        
        return jsonify({
            'success': True,
            'data': item
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """獲取菜單分類列表"""
    try:
        db = get_db()
        categories_collection = db.categories
        
        # 獲取所有可用分類，按顯示順序排序
        categories = list(categories_collection.find(
            {'available': True}
        ).sort('display_order', 1))
        
        # 轉換 ObjectId 為字串
        for category in categories:
            category['_id'] = str(category['_id'])
        
        return jsonify({
            'success': True,
            'data': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/categories/<category_id>/menu', methods=['GET'])
def get_menu_by_category(category_id):
    """獲取特定分類的菜單項目"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        # 獲取查詢參數
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        sort_by = request.args.get('sort_by', 'popularity_score')
        sort_order = request.args.get('sort_order', 'desc')
        
        # 查詢條件
        query = {
            'category': category_id,
            'available': True
        }
        
        # 排序設定
        sort_direction = -1 if sort_order == 'desc' else 1
        sort_criteria = [(sort_by, sort_direction)]
        
        # 執行查詢
        skip = (page - 1) * limit
        cursor = menu_collection.find(query).sort(sort_criteria).skip(skip).limit(limit)
        items = list(cursor)
        
        # 轉換 ObjectId 為字串
        for item in items:
            item['_id'] = str(item['_id'])
        
        # 獲取總數
        total_count = menu_collection.count_documents(query)
        total_pages = (total_count + limit - 1) // limit
        
        response = {
            'success': True,
            'data': {
                'category': category_id,
                'items': items,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total_count,
                    'items_per_page': limit
                }
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/menu/search', methods=['GET'])
def search_menu():
    """搜尋菜單項目"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        # 獲取搜尋參數
        query_text = request.args.get('q', '')
        category = request.args.get('category')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        vegetarian = request.args.get('vegetarian', type=bool)
        vegan = request.args.get('vegan', type=bool)
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # 建立搜尋條件
        search_query = {'available': True}
        
        # 文字搜尋
        if query_text:
            search_query['$or'] = [
                {'name': {'$regex': query_text, '$options': 'i'}},
                {'description': {'$regex': query_text, '$options': 'i'}},
                {'ingredients': {'$in': [query_text]}}
            ]
        
        # 分類篩選
        if category:
            search_query['category'] = category
            
        # 價格範圍
        if min_price is not None or max_price is not None:
            price_filter = {}
            if min_price is not None:
                price_filter['$gte'] = min_price
            if max_price is not None:
                price_filter['$lte'] = max_price
            search_query['price'] = price_filter
        
        # 素食篩選
        if vegetarian:
            search_query['is_vegetarian'] = True
        if vegan:
            search_query['is_vegan'] = True
        
        # 執行搜尋
        skip = (page - 1) * limit
        cursor = menu_collection.find(search_query).sort('popularity_score', -1).skip(skip).limit(limit)
        items = list(cursor)
        
        # 轉換 ObjectId 為字串
        for item in items:
            item['_id'] = str(item['_id'])
        
        # 獲取總數
        total_count = menu_collection.count_documents(search_query)
        
        response = {
            'success': True,
            'data': {
                'query': query_text,
                'items': items,
                'total_results': total_count,
                'filters_applied': {
                    'category': category,
                    'price_range': [min_price, max_price],
                    'vegetarian': vegetarian,
                    'vegan': vegan
                }
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/menu/popular', methods=['GET'])
def get_popular_items():
    """獲取熱門菜單項目"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        limit = int(request.args.get('limit', 10))
        
        # 獲取熱門項目（按受歡迎程度和評分排序）
        pipeline = [
            {'$match': {'available': True}},
            {'$addFields': {
                'combined_score': {
                    '$add': [
                        {'$multiply': ['$popularity_score', 0.6]},
                        {'$multiply': ['$rating', 20]}  # 評分 * 20 來平衡分數
                    ]
                }
            }},
            {'$sort': {'combined_score': -1}},
            {'$limit': limit}
        ]
        
        items = list(menu_collection.aggregate(pipeline))
        
        # 轉換 ObjectId 為字串
        for item in items:
            item['_id'] = str(item['_id'])
        
        return jsonify({
            'success': True,
            'data': items
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@menu_bp.route('/api/menu/init-sample-data', methods=['POST'])
def init_sample_data():
    """初始化樣本資料（開發用）"""
    try:
        db = get_db()
        menu_collection = db.menu
        categories_collection = db.categories
        
        # 檢查是否已有資料
        if menu_collection.count_documents({}) > 0:
            return jsonify({
                'success': False,
                'message': '資料庫中已有菜單資料'
            }), 400
        
        # 插入分類資料
        categories = CategoryModel.get_default_categories()
        for cat_data in categories:
            category = CategoryModel.create_category(cat_data)
            categories_collection.insert_one(category)
        
        # 插入菜單項目資料
        sample_items = get_sample_menu_data()
        for item_data in sample_items:
            menu_item = MenuModel.create_menu_item(item_data)
            menu_collection.insert_one(menu_item)
        
        return jsonify({
            'success': True,
            'message': f'成功初始化 {len(categories)} 個分類和 {len(sample_items)} 個菜單項目'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
