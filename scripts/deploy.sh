#!/bin/bash
set -e

echo "=== 开始部署 ==="

# 安装依赖
echo "安装依赖..."
pnpm install

# 构建
echo "构建项目..."
pnpm build

# 复制静态资源到 standalone 目录
echo "复制静态资源..."
mkdir -p .next/standalone/.next
mkdir -p .next/standalone/public

# 复制 public 目录内容（如果存在）
if [ -d "public" ]; then
  cp -r public/* .next/standalone/public/ 2>/dev/null || true
fi

# 复制静态文件
if [ -d ".next/static" ]; then
  cp -r .next/static .next/standalone/.next/
fi

# 重启 PM2
echo "重启 PM2..."
pm2 restart ecosystem.config.js

echo "=== 部署完成 ==="
