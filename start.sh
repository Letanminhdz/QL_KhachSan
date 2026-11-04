#!/bin/bash

echo "🚀 Đang khởi động hệ thống Quản lý Khách sạn..."

# Chạy docker compose ở chế độ ngầm và ẩn tất cả các log không cần thiết
docker compose up -d --build > /dev/null 2>&1

echo "⏳ Đang kiểm tra trạng thái..."
sleep 3

echo ""
echo "✅ HỆ THỐNG ĐÃ SẴN SÀNG!"
echo "================================================="
echo "🌐 Giao diện Web (Frontend) : http://localhost:5173"
echo "⚙️  Máy chủ API (Backend)    : http://localhost:8000"
echo "================================================="
echo "💡 Mẹo: Khi muốn tắt dự án, hãy chạy lệnh: docker compose down"
echo ""
