# デプロイ手順

## GitHub Pages + GitHub Actions でのデプロイ

### 1. GitHubリポジトリのシークレット設定

以下の環境変数をGitHubリポジトリのシークレットに設定してください：

1. GitHubリポジトリにアクセス: https://github.com/ganta9/lunch-chooser
2. Settings → Secrets and variables → Actions
3. 「New repository secret」で以下を追加：

| Name | Value | 説明 |
|------|-------|------|
| `GOOGLE_SHEETS_API_KEY` | あなたのAPIキー | Google Sheets API キー |
| `GOOGLE_SPREADSHEET_ID` | スプレッドシートID | Google SheetsのID |
| `GOOGLE_APPS_SCRIPT_URL` | Apps Script URL | Google Apps ScriptのWebアプリURL |

### 2. GitHub Pages設定

1. Settings → Pages
2. Source: "GitHub Actions"
3. Save

### 3. デプロイ実行

1. main ブランチにプッシュ
2. GitHub Actions が自動実行
3. 完了後、https://ganta9.github.io/lunch-chooser/ でアクセス可能

## ローカル開発

### 環境変数設定
```bash
export GOOGLE_SHEETS_API_KEY="your_api_key"
export GOOGLE_SPREADSHEET_ID="your_spreadsheet_id"
export GOOGLE_APPS_SCRIPT_URL="your_apps_script_url"
```

### ビルド実行
```bash
./build.sh
```

### ローカルサーバー起動
```bash
python3 -m http.server 8000
```

## セキュリティ

- APIキーはGitHubのシークレット機能で安全に管理
- ビルド時のみconfig.jsが生成される
- ソースコードには機密情報は含まれない

## トラブルシューティング

### GitHub Actionsが失敗する場合
1. リポジトリシークレットが正しく設定されているか確認
2. GitHub Pagesの設定が「GitHub Actions」になっているか確認
3. Actions タブでログを確認

### APIが動作しない場合
1. Google Cloud Console でAPIキーの制限を確認
2. HTTPリファラー制限にデプロイ先ドメインを追加
3. Google Sheets APIが有効になっているか確認