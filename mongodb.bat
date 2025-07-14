@echo off
REM MongoDB Docker 管理腳本

if "%1"=="start" (
    echo 🚀 啟動 MongoDB 容器...
    docker-compose up -d
    echo.
    echo ✅ MongoDB 服務已啟動！
    echo.
    echo 📡 服務資訊:
    echo    MongoDB: mongodb://localhost:27017
    echo    Web 管理介面: http://localhost:8081
    echo    帳號: webadmin / webpass123
    echo.
    echo 📊 檢查服務狀態:
    timeout /t 5 /nobreak >nul
    docker-compose ps
    goto :eof
)

if "%1"=="stop" (
    echo 🛑 停止 MongoDB 容器...
    docker-compose down
    echo ✅ MongoDB 服務已停止！
    goto :eof
)

if "%1"=="restart" (
    echo 🔄 重啟 MongoDB 容器...
    docker-compose down
    docker-compose up -d
    echo ✅ MongoDB 服務已重啟！
    goto :eof
)

if "%1"=="logs" (
    echo 📋 顯示 MongoDB 日誌...
    docker-compose logs -f mongodb
    goto :eof
)

if "%1"=="shell" (
    echo 🐚 連接到 MongoDB Shell...
    docker exec -it restaurant_mongodb mongosh restaurant_db -u restaurant_user -p restaurant_pass
    goto :eof
)

if "%1"=="status" (
    echo 📊 檢查服務狀態...
    docker-compose ps
    echo.
    echo 🔍 檢查容器健康狀態...
    docker inspect restaurant_mongodb --format="{{.State.Health.Status}}"
    goto :eof
)

if "%1"=="reset" (
    echo ⚠️  重置 MongoDB 資料庫 (將刪除所有資料)
    set /p confirm="確定要重置嗎? (y/N): "
    if /i "%confirm%"=="y" (
        echo 🗑️  刪除容器和資料...
        docker-compose down -v
        echo 🚀 重新啟動並初始化...
        docker-compose up -d
        echo ✅ 資料庫已重置並初始化！
    ) else (
        echo ❌ 操作已取消
    )
    goto :eof
)

if "%1"=="backup" (
    echo 💾 備份 MongoDB 資料庫...
    set backup_file=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%.gz
    docker exec restaurant_mongodb mongodump --db restaurant_db --gzip --archive=/backup.gz
    docker cp restaurant_mongodb:/backup.gz ./backups/%backup_file%
    echo ✅ 備份完成: ./backups/%backup_file%
    goto :eof
)

REM 顯示幫助資訊
echo 🍽️  餐廳點餐系統 - MongoDB 管理工具
echo.
echo 使用方法: mongodb.bat [command]
echo.
echo 可用命令:
echo   start     - 啟動 MongoDB 服務
echo   stop      - 停止 MongoDB 服務
echo   restart   - 重啟 MongoDB 服務
echo   status    - 檢查服務狀態
echo   logs      - 顯示服務日誌
echo   shell     - 連接到 MongoDB Shell
echo   reset     - 重置資料庫 (刪除所有資料)
echo   backup    - 備份資料庫
echo.
echo 範例:
echo   mongodb.bat start
echo   mongodb.bat shell
echo   mongodb.bat logs
