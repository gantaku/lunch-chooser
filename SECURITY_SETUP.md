# セキュリティ設定手順

## ⚠️ 重要：APIキーの設定

このプロジェクトを使用する前に、必ず以下の手順でAPIキーを設定してください。

### 1. Google Cloud Console でのAPIキー作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. Google Sheets API を有効化
4. 「APIs & Services」→「認証情報」でAPIキーを作成
5. **重要**: APIキーに以下の制限を設定：
   - **HTTPリファラー制限**: あなたのドメインのみ許可
   - **API制限**: Google Sheets API のみ許可

### 2. 設定ファイルの作成

```bash
# テンプレートファイルをコピー
cp config.js.template config.js
```

### 3. config.js ファイルの編集

```javascript
// config.js
window.GOOGLE_SHEETS_API_KEY = '新しく作成したAPIキー';
window.GOOGLE_SPREADSHEET_ID = 'あなたのスプレッドシートID';
window.GOOGLE_APPS_SCRIPT_URL = 'あなたのApps Script URL';
```

### 4. スプレッドシートのセキュリティ設定

1. Google Sheetsで共有設定を確認
2. 「リンクを知っている全員が表示可能」に設定
3. または特定のユーザーのみにアクセス制限

## 🚨 絶対にやってはいけないこと

- **config.js ファイルをGitにコミットしない**
- **APIキーをコードに直接書かない**
- **APIキーを公開リポジトリに含めない**

## ファイル構成

```
slack-lunch-decider/
├── config.js.template  # 設定テンプレート
├── config.js          # 実際の設定（Gitで除外）
├── .gitignore         # config.js等を除外
└── SECURITY_SETUP.md  # このファイル
```

## トラブルシューティング

### APIキーが動作しない場合

1. Google Cloud Console でAPIキーの制限を確認
2. Google Sheets API が有効になっているか確認
3. スプレッドシートの共有設定を確認

### 設定が読み込まれない場合

1. config.js ファイルが存在するか確認
2. ブラウザの開発者ツールでエラーを確認
3. HTMLで config.js が script.js より先に読み込まれているか確認