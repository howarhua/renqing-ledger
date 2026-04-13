#!/bin/bash
# MongoDB Docker 部署脚本 - 用于远程服务器
# 使用方法: ./deploy-mongodb.sh [MONGODB_PASSWORD]

set -e

# 配置
CONTAINER_NAME="renqing-mongodb"
MONGO_DATA_DIR="/data/renqing-mongodb"
MONGODB_PASSWORD=${1:-"renqing2024"}

echo "===== MongoDB Docker 部署脚本 ====="
echo "容器名称: $CONTAINER_NAME"
echo "数据目录: $MONGO_DATA_DIR"
echo "密码: $MONGODB_PASSWORD"

# 创建数据目录
echo "创建数据目录..."
sudo mkdir -p "$MONGO_DATA_DIR"
sudo chown -R 1000:1000 "$MONGO_DATA_DIR"

# 检查并停止旧容器
echo "检查旧容器..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "停止并删除旧容器..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

# 拉取最新镜像
echo "拉取 MongoDB 镜像..."
docker pull mongo:7

# 启动 MongoDB 容器
echo "启动 MongoDB 容器..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=root \
    -e MONGO_INITDB_ROOT_PASSWORD="$MONGODB_PASSWORD" \
    -e MONGO_INITDB_DATABASE=renqing \
    -v "$MONGO_DATA_DIR:/data/db" \
    mongo:7

# 等待 MongoDB 启动
echo "等待 MongoDB 启动..."
sleep 5

# 检查容器状态
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "===== MongoDB 部署成功 ====="
    echo "连接字符串: mongodb://root:${MONGODB_PASSWORD}@localhost:27017/renqing?authSource=admin"
    docker logs "$CONTAINER_NAME" | tail -5
else
    echo "===== MongoDB 部署失败 ====="
    docker logs "$CONTAINER_NAME"
    exit 1
fi