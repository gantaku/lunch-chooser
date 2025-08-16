# セキュリティ設定手順

## ⚠️ 重要：GitHub Actions環境でのセキュア設定

このプロジェクトはGitHub ActionsとGitHub Pagesを使用してセキュアにデプロイされます。
APIキーは**環境変数として管理**され、ソースコードには含まれません。

### 1. Google Cloud Console でのAPIキー作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. Google Sheets API を有効化
4. 「APIs & Services」→「認証情報」でAPIキーを作成
5. **重要**: APIキーに以下の制限を設定：
   - **HTTPリファラー制限**: `https://ganta9.github.io/*` を許可
   - **API制限**: Google Sheets API のみ許可

### 2. GitHub Repository Secretsの設定

**本番環境（推奨）**:

1. GitHubリポジトリにアクセス: https://github.com/ganta9/lunch-chooser
2. Settings → Secrets and variables → Actions
3. 「New repository secret」で以下を追加：

| Secret Name | 値の例 | 説明 |
|-------------|--------|------|
| `GOOGLE_SHEETS_API_KEY` | `AIzaSyD...` | Google Sheets APIキー |
| `GOOGLE_SPREADSHEET_ID` | `18tNpNwW...` | スプレッドシートID |
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/...` | Apps Script WebアプリURL |

### 3. ローカル開発環境（オプション）

ローカル開発時のみ、以下の手順で設定：

```bash
# テンプレートファイルをコピー
cp config.js.template config.js
```

config.jsファイルを編集：
```javascript
// config.js （ローカル開発用のみ）
window.GOOGLE_SHEETS_API_KEY = '開発用APIキー';
window.GOOGLE_SPREADSHEET_ID = 'スプレッドシートID';
window.GOOGLE_APPS_SCRIPT_URL = 'Apps Script URL';
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