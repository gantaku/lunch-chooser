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

### 🚨 よくある問題と解決方法

#### 1. 404エラー「There isn't a GitHub Pages site here」

**症状**: サイトにアクセスすると404エラー
**原因**: GitHub Pagesの設定が間違っている
**解決方法**:
1. Settings → Pages
2. **Source**: 「GitHub Actions」を選択（❌「Deploy from a branch」ではない）
3. Save をクリック
4. 数分待ってから再度アクセス

#### 2. GitHub Actionsの実行失敗

**症状**: Actions タブで赤い×マークが表示される
**原因と解決方法**:

**A. リポジトリシークレットの設定ミス**
- Settings → Secrets and variables → Actions
- 以下が正しく設定されているか確認:
  - `GOOGLE_SHEETS_API_KEY`
  - `GOOGLE_SPREADSHEET_ID` 
  - `GOOGLE_APPS_SCRIPT_URL`

**B. 権限設定の問題**
- Settings → Actions → General
- Workflow permissions を「**Read and write permissions**」に設定
- 「Allow GitHub Actions to create and approve pull requests」をチェック

**C. Pages設定の問題**
- Settings → Pages → Source が「GitHub Actions」になっているか確認

#### 3. config.js読み込みエラー

**症状**: サイトは表示されるが「APIキーが正しく設定されていません」エラー
**原因**: GitHub Actionsでconfig.jsが正しく生成されていない
**解決方法**:

1. **GitHub Actionsログを確認**:
   - Actions タブ → 最新のワークフロー
   - 「Verify config.js was created」ステップを確認
   - config.jsの内容が正しく表示されているか

2. **シークレットの値を確認**:
   - Settings → Secrets and variables → Actions
   - 各シークレットが空でないか確認

3. **ブラウザキャッシュをクリア**:
   - Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
   - ブラウザの開発者ツールでキャッシュ無効化

#### 4. Google Sheets API接続エラー

**症状**: 「フォールバックデータを使用」メッセージ
**原因**: Google Sheets APIの制限やキー設定問題
**解決方法**:

1. **APIキー制限の確認**:
   - Google Cloud Console → APIs & Services → 認証情報
   - APIキーの制限を確認:
     - HTTPリファラー: `https://ganta9.github.io/*`
     - API制限: Google Sheets API のみ

2. **スプレッドシートの共有設定**:
   - Google Sheets で「リンクを知っている全員が表示可能」に設定

3. **Google Sheets APIの有効化確認**:
   - Google Cloud Console → APIs & Services → ライブラリ
   - Google Sheets API が有効になっているか確認

#### 5. 共有履歴データ整合性問題

**症状**: Sheet2と表示される履歴が一致しない、古いデータが混在
**原因**: ローカルストレージの古いデータとの混在
**解決方法**:

1. **ローカルストレージクリア**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **共有履歴強制再読み込み**:
   ```javascript
   loadFromSharedHistory().then(() => {
       updateWeeklyStatus();
       console.log('最新履歴:', weeklyHistory);
   });
   ```

3. **Google Apps Script URL確認**:
   - 最新のデプロイURLが設定されているか確認
   - GitHub Secrets の `GOOGLE_APPS_SCRIPT_URL` 値を確認

#### 6. JSONP競合状態エラー

**症状**: `ReferenceError: loadHistoryCallback_xxx is not defined`
**原因**: タイムアウト処理とJSONPコールバックの競合
**解決方法**:

1. **ページリロード**: 通常は一時的なエラーのため、リロードで解決
2. **ブラウザキャッシュクリア**: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
3. **共有履歴無効化テスト**:
   ```javascript
   // 一時的に共有履歴を無効化してテスト
   HISTORY_CONFIG.useSharedHistory = false;
   location.reload();
   ```

#### 7. パフォーマンス・読み込み速度問題

**症状**: アプリの読み込みが遅い、応答しない
**解決方法**:

1. **ネットワーク確認**: 
   - Google Sheets API接続の確認
   - Google Apps Script応答速度の確認

2. **ブラウザ開発者ツールでの確認**:
   - Network タブで読み込み時間確認
   - Console タブでエラー確認

3. **タイムアウト確認**:
   - 5秒タイムアウト後はローカルデータで動作
   - 「共有履歴読み込みタイムアウト」は正常動作

#### 8. ブラウザでの表示問題

**症状**: レイアウトが崩れる、JavaScriptエラー
**解決方法**:

1. **ブラウザキャッシュクリア**
2. **JavaScript有効化確認**
3. **開発者ツールでエラー確認**:
   - F12 → Console タブ
   - エラーメッセージを確認

### 🔍 デバッグ手順

#### GitHub Actionsのデバッグ
1. Actions タブでワークフロー実行履歴を確認
2. 失敗したステップをクリックして詳細ログを確認
3. 「Verify config.js was created」で生成内容を確認

#### ブラウザでのデバッグ
1. F12で開発者ツールを開く
2. Console タブでJavaScriptエラーを確認
3. Network タブでconfig.js読み込み状況を確認
4. Sources タブでconfig.jsの内容を確認

### 🆘 緊急時の対応

#### サイトが完全に動かない場合
1. **一時的な修正**: ローカルで動作確認
2. **ロールバック**: 前回動作していたコミットに戻す
```bash
git revert HEAD
git push
```

#### 機密情報漏洩を発見した場合
1. **即座にAPIキーを無効化**（Google Cloud Console）
2. **新しいAPIキーを生成**
3. **シークレットを更新**
4. **過去のコミット履歴を確認**

### 📞 サポート

問題が解決しない場合:
1. [GitHub Issues](https://github.com/ganta9/lunch-chooser/issues) でバグ報告
2. GitHub Actionsのログを添付
3. ブラウザの開発者ツールのエラーログを添付