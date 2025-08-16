#!/bin/bash

# Lunch Chooser ビルドスクリプト
# GitHub Actions環境変数からconfig.jsを生成

echo "🔧 Building Lunch Chooser..."

# 環境変数の確認
if [ -z "$GOOGLE_SHEETS_API_KEY" ]; then
    echo "❌ Error: GOOGLE_SHEETS_API_KEY is not set"
    exit 1
fi

if [ -z "$GOOGLE_SPREADSHEET_ID" ]; then
    echo "❌ Error: GOOGLE_SPREADSHEET_ID is not set"
    exit 1
fi

if [ -z "$GOOGLE_APPS_SCRIPT_URL" ]; then
    echo "❌ Error: GOOGLE_APPS_SCRIPT_URL is not set"
    exit 1
fi

# config.jsの生成
echo "📝 Generating config.js..."
cat > config.js << EOF
// Google Sheets API設定 - 環境変数から生成
// 生成日時: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

window.GOOGLE_SHEETS_API_KEY = '${GOOGLE_SHEETS_API_KEY}';
window.GOOGLE_SPREADSHEET_ID = '${GOOGLE_SPREADSHEET_ID}';
window.GOOGLE_APPS_SCRIPT_URL = '${GOOGLE_APPS_SCRIPT_URL}';

// ビルド情報
window.BUILD_TIMESTAMP = '$(date -u +"%Y-%m-%d %H:%M:%S UTC")';
EOF

echo "✅ config.js generated successfully"
echo "🚀 Build completed!"