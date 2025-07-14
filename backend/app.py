"""
Flask 主應用程式
點餐系統後端 API 服務
"""
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from routes.menu_routes import menu_bp
from routes.cart_routes import cart_bp
from config import config

def create_app():
    """建立 Flask 應用程式"""
    app = Flask(__name__)
    
    # 載入配置
    app.config.from_object(config['default'])
    
    # 建立 MongoDB 連接
    client = MongoClient(app.config['MONGODB_URI'])
    app.db = client[app.config['MONGODB_DB']]
    
    # 啟用 CORS 支援前端跨域請求
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # 註冊藍圖
    app.register_blueprint(menu_bp)
    app.register_blueprint(cart_bp)
    
    # 健康檢查端點
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': '點餐系統 API',
            'version': '1.0.0'
        })
    
    # 根路徑
    @app.route('/')
    def index():
        return jsonify({
            'message': '歡迎使用點餐系統 API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'menu': '/api/menu',
                'categories': '/api/categories',
                'menu_search': '/api/menu/search',
                'popular_items': '/api/menu/popular',
                'cart': '/api/cart',
                'cart_add': '/api/cart/add',
                'cart_update': '/api/cart/update',
                'cart_remove': '/api/cart/remove',
                'cart_clear': '/api/cart/clear',
                'cart_count': '/api/cart/count'
            }
        })
    
    # 錯誤處理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': '找不到請求的資源'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': '伺服器內部錯誤'
        }), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    
    print("🍽️ 點餐系統 API 服務啟動中...")
    print("📡 API 文檔:")
    print("   健康檢查: http://localhost:5000/api/health")
    print("   菜單列表: http://localhost:5000/api/menu")
    print("   分類列表: http://localhost:5000/api/categories")
    print("   搜尋菜單: http://localhost:5000/api/menu/search")
    print("   熱門項目: http://localhost:5000/api/menu/popular")
    print("   初始化資料: POST http://localhost:5000/api/menu/init-sample-data")
    print("   購物車: http://localhost:5000/api/cart")
    print("   加入購物車: POST http://localhost:5000/api/cart/add")
    print("   更新購物車: PUT http://localhost:5000/api/cart/update")
    print("   移除商品: DELETE http://localhost:5000/api/cart/remove")
    print("   清空購物車: DELETE http://localhost:5000/api/cart/clear")
    
    # 開發模式運行
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
