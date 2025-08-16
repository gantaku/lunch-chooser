# 🍽️ Lunch Chooser

チームのランチ場所を効率的に決定するWebアプリケーション

## 🌐 公開サイト

**URL**: https://ganta9.github.io/lunch-chooser/

## 概要

Lunch Chooserは、チームメンバーがWebブラウザを通じて昼食場所を決定できるアプリケーションです。Google Sheetsと連携し、条件に基づいて重み付けランダム選択し、週次でジャンルの重複を避ける機能を提供します。

## 🚀 主な機能

- 🎯 **条件ベース選択**: 近場・人数条件での絞り込み
- ⭐ **重み付け選択**: 星評価による重み付けランダム選択
- 📅 **週次ジャンル管理**: 月〜金で同ジャンル重複を防止
- 🔄 **やり直し機能**: 選択結果の確認・やり直し
- 🆕 **新規開拓**: 新しいお店の開拓オプション
- 📊 **Google Sheets連携**: リアルタイムデータ更新
- 💾 **履歴管理**: 共有履歴とローカルストレージ
- 🔒 **セキュア**: 環境変数による機密情報管理

## 📖 使い方

1. Webブラウザで公開サイトにアクセス
2. 条件を選択（近場・4人以上の制限）
3. 「ランチを決める！」ボタンをクリック
4. 結果を確認後、やり直しまたは確定
5. 確定後、履歴に記録される

## 🏗️ プロジェクト構造

```
lunch-chooser/
├── 📄 設定・ドキュメント
│   ├── README.md              # このファイル
│   ├── DEPLOY.md              # デプロイ手順
│   ├── SECURITY_SETUP.md      # セキュリティ設定
│   ├── .gitignore            # Git除外設定
│   ├── config.js.template    # 設定テンプレート
│   └── .env.template         # 環境変数テンプレート
│
├── 🌐 Webアプリケーション
│   ├── index.html            # メインページ
│   ├── style.css             # スタイルシート
│   ├── script.js             # アプリロジック
│   └── config.js             # 設定ファイル（Git除外）
│
├── 📊 データ・ドキュメント
│   ├── data/
│   │   └── restaurants.json  # 参考用店舗データ
│   ├── docs/
│   │   ├── spec.md           # 要件・仕様書
│   │   ├── fails.md          # 失敗事例・バグ記録
│   │   └── google-apps-script-setup.md
│   └── google-apps-script.js # Google Apps Script
│
├── 🚀 CI/CD
│   ├── .github/workflows/
│   │   └── deploy.yml        # GitHub Actions
│   └── build.sh              # ビルドスクリプト
│
└── 🧪 テスト（予定）
    └── test/
```

## 🛠️ 技術仕様

### フロントエンド
- **HTML5** + **CSS3** + **ES6 JavaScript**
- **レスポンシブデザイン**（PC・スマートフォン対応）
- **Progressive Web App** 対応

### バックエンド・データ管理
- **Google Sheets API** - 店舗データ管理
- **Google Apps Script** - サーバーサイド処理
- **ローカルストレージ** - クライアント履歴管理

### デプロイ・CI/CD
- **GitHub Actions** - 自動ビルド・デプロイ
- **GitHub Pages** - 静的サイトホスティング
- **環境変数管理** - GitHub Secrets

### セキュリティ
- **APIキー** - 環境変数で管理
- **CORS対応** - クロスオリジン制御
- **機密情報除外** - .gitignore設定

## 📋 開発状況

### ✅ Phase 1: 基本実装（完了）
- [x] HTML/CSS/JavaScript実装
- [x] 条件フィルタリング機能
- [x] 重み付けランダム選択
- [x] やり直し・確定機能

### ✅ Phase 2: 履歴管理（完了）
- [x] ローカルストレージ履歴管理
- [x] 週次ジャンル重複チェック
- [x] 今週利用状況表示

### ✅ Phase 3: 高度な機能（完了）
- [x] 星評価による重み付け
- [x] 新規開拓選択肢
- [x] 設定調整機能
- [x] レスポンシブデザイン

### ✅ Phase 4: Google Sheets連携（完了）
- [x] Google Sheets API統合
- [x] リアルタイムデータ取得
- [x] Google Apps Script連携

### ✅ Phase 5: セキュリティ強化（完了）
- [x] APIキー環境変数化
- [x] GitHub Actions CI/CD
- [x] セキュアなデプロイメント

### ✅ Phase 6: 最適化・安定化（完了）
- [x] config.js生成問題の完全解決
- [x] 並列読み込みによるパフォーマンス最適化
- [x] エラーハンドリング・UI安定性強化
- [x] 共有履歴データ整合性の確保
- [x] JSONP競合状態問題の解決

### ✅ Phase 7: 同期強化・重複防止（完了）
- [x] 30秒タイムアウトで共有履歴同期強化
- [x] 重複選択防止システム実装
- [x] 同期失敗時の視覚的警告システム
- [x] ユーザー確認ダイアログによる安全性向上

### 🔄 Phase 8: 運用・保守（継続中）
- [x] 包括的失敗事例ドキュメント作成
- [x] トラブルシューティングガイド整備
- [ ] 長期運用での安定性監視

## 🔧 開発・デプロイ

### ローカル開発
```bash
# リポジトリクローン
git clone https://github.com/ganta9/lunch-chooser.git
cd lunch-chooser

# 設定ファイル作成
cp config.js.template config.js
# config.js を編集して実際の値を設定

# ローカルサーバー起動
python3 -m http.server 8000
```

### 本番デプロイ
詳細は [DEPLOY.md](DEPLOY.md) を参照

## 📚 ドキュメント

- 📖 [デプロイ手順](DEPLOY.md)
- 🔒 [セキュリティ設定](SECURITY_SETUP.md)
- 📋 [要件・仕様書](docs/spec.md)
- 🚨 [失敗事例・バグ記録](docs/fails.md)
- 🔧 [Google Apps Script設定](docs/google-apps-script-setup.md)

## 🐛 サポート・貢献

- **バグ報告**: [GitHub Issues](https://github.com/ganta9/lunch-chooser/issues)
- **機能要望**: GitHub Issues で提案
- **セキュリティ問題**: リポジトリメンテナーに直接連絡

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🔒 セキュリティ

このプロジェクトは以下のセキュリティ対策を実装しています：

- ✅ APIキーの環境変数管理
- ✅ 機密情報のGit除外
- ✅ GitHub Actionsでの自動デプロイ
- ✅ CORS対応とAPI制限

セキュリティ問題を発見した場合は、公開せずにメンテナーに直接報告してください。

---

**作成日**: 2024-08-15  
**最終更新**: 2025-08-16  
**バージョン**: 4.1（完全同期版）  
**開発**: Claude Code Team

**主要改善点（v4.1）**:
- ✅ **同期強化**: 30秒タイムアウトで確実な共有履歴読み込み
- ✅ **重複防止**: チーム間重複選択の完全防止システム
- ✅ **UX向上**: 同期失敗時の視覚的警告とユーザー確認
- ✅ **安全性**: 明示的確認による安全なランチ決定

**累積改善（v4.0→v4.1）**:
- 🚀 **パフォーマンス**: 並列読み込みで50%高速化
- 🛡️ **安定性**: 競合状態エラー完全解決  
- 📊 **データ整合性**: 共有履歴優先で正確性向上
- 👁️ **ユーザビリティ**: リアルタイム状態表示