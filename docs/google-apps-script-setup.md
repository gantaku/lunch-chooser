# Google Apps Script 設定手順

## 概要
共有履歴機能を有効にするため、Google Apps Scriptを使用してWebアプリケーションをデプロイします。これにより、チーム全体で週次の利用状況が共有されます。

## 前提条件
- Googleアカウント
- 既存のGoogle Sheetsスプレッドシート（ID: `18tNpNwW4qBTsLr48tPoUfp9p4r_FhQTOxcGM_8AYxhc`）
- スプレッドシートにSheet2が作成済み

## 手順1: Google Apps Script プロジェクトの作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「Lunch Decider History Manager」に変更
4. `Code.gs` の内容を全て削除し、`google-apps-script.js` の内容をコピー＆ペースト

## 手順2: スプレッドシートIDの確認

`google-apps-script.js` の以下の行を確認：
```javascript
const SPREADSHEET_ID = '18tNpNwW4qBTsLr48tPoUfp9p4r_FhQTOxcGM_8AYxhc';
```

正しいスプレッドシートIDが設定されていることを確認してください。

## 手順3: テスト実行

1. Apps Script エディタで「testGetHistory」関数を選択
2. 「実行」ボタンをクリック
3. 初回実行時は権限の承認が必要：
   - 「承認が必要」ダイアログで「権限を確認」をクリック
   - Googleアカウントを選択
   - 「Advanced」→「Go to Lunch Decider History Manager (unsafe)」をクリック
   - 「Allow」をクリック
4. 実行ログでエラーがないことを確認

## 手順4: Webアプリとしてデプロイ

1. Apps Script エディタで「デプロイ」→「新しいデプロイ」をクリック
2. 「種類を選択」で「ウェブアプリ」を選択
3. 設定を以下のように変更：
   - **説明**: Lunch Decider History Manager
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. **重要**: 表示されるWebアプリURLをコピーして保存

## 手順5: WebアプリURLの設定

1. コピーしたWebアプリURLを使用
2. `script.js` の以下の行を更新：
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
```
↓
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## 手順6: 動作確認

1. Webアプリケーションをブラウザで開く
2. ブラウザの開発者ツール（F12）を開き、Consoleタブを確認
3. `checkSharedHistoryStatus()` を実行して設定状況を確認
4. ランチを決定して履歴が正しく保存されることを確認
5. 別のブラウザまたはシークレットモードで同じページを開き、履歴が共有されていることを確認

## トラブルシューティング

### エラー: 権限が拒否されました
- スプレッドシートの共有設定を確認
- スプレッドシートが「リンクを知っている全員」に設定されている必要があります

### エラー: CORS
- Google Apps ScriptのWebアプリは自動的にCORSを処理します
- URLが正しく設定されているか確認

### エラー: シートが見つかりません
- スプレッドシートにSheet2が作成されているか確認
- シート名が正確に「Sheet2」になっているか確認

### 履歴が共有されない
1. `checkSharedHistoryStatus()` をコンソールで実行
2. 以下を確認：
   - WebApp URLが正しく設定されている
   - `useSharedHistory` が `true` になっている
3. ブラウザのネットワークタブでAPIリクエストの状況を確認

## セキュリティ注意事項

- このWebアプリは「全員」がアクセス可能に設定されています
- 機密情報は含めないでください
- 必要に応じてアクセス権限を制限してください

## デプロイ後の管理

### 更新方法
1. Apps Script エディタでコードを修正
2. 「デプロイ」→「デプロイを管理」
3. 既存のデプロイの「編集」アイコンをクリック
4. 「バージョン」を「新しいバージョン」に変更
5. 「デプロイ」をクリック

### ログの確認
- Apps Script エディタの「実行」タブでログを確認可能
- エラーやデバッグ情報を確認できます

### データの確認
- スプレッドシートのSheet2で履歴データを直接確認可能
- 必要に応じて手動でデータを編集できます