// 環境変数から設定を読み込む関数
function loadEnvironmentConfig() {
    // ブラウザ環境では、設定は別途読み込む必要があります
    // 実際の実装では、設定ファイルやサーバーサイドAPIを使用してください
    
    // config.js が読み込まれているかチェック
    if (typeof window.GOOGLE_SHEETS_API_KEY === 'undefined') {
        console.error('Config.js が読み込まれていません。GitHub Actions でのデプロイを確認してください。');
        // フォールバック設定を使用
        return {
            apiKey: '',
            spreadsheetId: '',
            googleAppsScriptUrl: '',
            range: 'Sheet1!A1:Z100'
        };
    }
    
    console.log('Config.js が正常に読み込まれました');
    console.log('APIキー（最初の10文字）:', window.GOOGLE_SHEETS_API_KEY ? window.GOOGLE_SHEETS_API_KEY.substring(0, 10) + '...' : '未設定');
    console.log('スプレッドシートID:', window.GOOGLE_SPREADSHEET_ID ? 'OK' : '未設定');
    console.log('Apps Script URL:', window.GOOGLE_APPS_SCRIPT_URL ? 'OK' : '未設定');
    
    return {
        apiKey: window.GOOGLE_SHEETS_API_KEY || '',
        spreadsheetId: window.GOOGLE_SPREADSHEET_ID || '',
        googleAppsScriptUrl: window.GOOGLE_APPS_SCRIPT_URL || '',
        range: 'Sheet1!A1:Z100'
    };
}

// Google Sheets API設定（環境変数から読み込み）
const GOOGLE_SHEETS_CONFIG = loadEnvironmentConfig();

// Google Apps Script Web App URL（環境変数から読み込み）
const GOOGLE_APPS_SCRIPT_URL = GOOGLE_SHEETS_CONFIG.googleAppsScriptUrl;

// 履歴管理の設定
const HISTORY_CONFIG = {
    useSharedHistory: true, // 共有履歴を使用するかどうか（JSONP方式でCORS回避）
    fallbackToLocal: true   // 共有履歴が使えない場合にローカルストレージを使用
};

// フォールバック用の店舗データ（スプレッドシートが読み込めない場合）
const FALLBACK_RESTAURANT_DATA = {
    "restaurants": [
        {
            "id": 1,
            "name": "山田食堂",
            "genre": "和食",
            "isNearby": true,
            "canAccommodateFourPlus": true,
            "ratings": [
                {"userId": "田中", "stars": 4},
                {"userId": "佐藤", "stars": 5},
                {"userId": "山田", "stars": 3}
            ]
        },
        {
            "id": "new-discovery",
            "name": "新規開拓",
            "genre": "新規開拓",
            "isNearby": true,
            "canAccommodateFourPlus": true,
            "ratings": [
                {"userId": "system", "stars": 1.5}
            ]
        }
    ]
};

// グローバル変数
let restaurants = [];
let weeklyHistory = [];
let currentSelection = null;
let settings = {
    ratingWeight: 1.5,
    newDiscoveryRating: 1.5 // 新規開拓の確率調整（1.0=低確率、3.0=普通、5.0=高確率）
};

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    initializeUI();
    updateWeeklyStatus();
});

// データ読み込み
async function loadData() {
    try {
        // ローディング表示
        showLoadingStatus('データを読み込み中...');
        
        // 並列読み込みで高速化
        const [restaurantsResult, historyResult] = await Promise.allSettled([
            loadRestaurantsFromGoogleSheets(),
            loadHistory()
        ]);
        
        if (restaurantsResult.status === 'rejected') {
            console.error('店舗データ読み込みエラー:', restaurantsResult.reason);
        }
        
        if (historyResult.status === 'rejected') {
            console.error('履歴データ読み込みエラー:', historyResult.reason);
        }

        // 設定を読み込み
        const savedSettings = localStorage.getItem('lunchSettings');
        if (savedSettings) {
            settings = {...settings, ...JSON.parse(savedSettings)};
            document.getElementById('rating-weight').value = settings.ratingWeight;
            document.getElementById('rating-weight-value').textContent = settings.ratingWeight;
            document.getElementById('new-discovery-rating').value = settings.newDiscoveryRating;
            document.getElementById('new-discovery-rating-value').textContent = settings.newDiscoveryRating;
        }

        hideLoadingStatus();
        console.log('データ読み込み完了:', restaurants.length, '件の店舗');
    } catch (error) {
        hideLoadingStatus();
        console.error('データ読み込みエラー:', error);
        // フォールバックデータを使用
        restaurants = FALLBACK_RESTAURANT_DATA.restaurants;
        console.log('フォールバックデータを使用:', restaurants.length, '件の店舗');
    }
}

// Google Sheetsからレストランデータを読み込み
async function loadRestaurantsFromGoogleSheets() {
    const apiKey = GOOGLE_SHEETS_CONFIG.apiKey;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'YOUR_NEW_API_KEY_HERE') {
        console.warn('APIキーが正しく設定されていません。SECURITY_SETUP.md を参照してください。');
        throw new Error('APIキーが設定されていません。config.js ファイルを確認してください。');
    }
    
    if (!GOOGLE_SHEETS_CONFIG.spreadsheetId || GOOGLE_SHEETS_CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        throw new Error('スプレッドシートIDが設定されていません。config.js ファイルを確認してください。');
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Google Sheets API エラー: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length <= 1) {
        throw new Error('スプレッドシートにデータがありません');
    }
    
    // ヘッダー行を取得（評価者名の特定）
    const headers = rows[0];
    const evaluatorColumns = [];
    
    // F列以降で評価者列を特定（A:店名, B:ジャンル, C:補足, D:近場, E:4人以上, F以降:評価者）
    for (let i = 5; i < headers.length; i++) {
        if (headers[i] && headers[i].trim() !== '' && headers[i].trim() !== '平均') {
            evaluatorColumns.push({
                index: i,
                name: headers[i].trim()
            });
        }
    }
    
    // データ行を処理
    const restaurantData = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // 空行をスキップ
        if (!row || !row[0] || row[0].trim() === '') continue;
        
        // 評価データを収集
        const ratings = [];
        evaluatorColumns.forEach(col => {
            const rating = row[col.index];
            if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
                ratings.push({
                    userId: col.name,
                    stars: parseInt(rating)
                });
            }
        });
        
        // レストランデータオブジェクト作成
        const restaurant = {
            id: i, // 行番号をIDとして使用
            name: row[0] ? row[0].trim() : '',
            genre: row[1] ? row[1].trim() : '未分類',
            notes: row[2] ? row[2].trim() : '', // 補足列を追加
            isNearby: row[3] === '○',
            canAccommodateFourPlus: row[4] === '○',
            ratings: ratings
        };
        
        restaurantData.push(restaurant);
    }
    
    // 新規開拓を追加（低確率設定）
    restaurantData.push({
        id: "new-discovery",
        name: "新規開拓",
        genre: "新規開拓",
        isNearby: true,
        canAccommodateFourPlus: true,
        ratings: [
            {userId: "system", stars: settings.newDiscoveryRating} // 設定値を使用
        ]
    });
    
    restaurants = restaurantData;
    console.log('Google Sheetsからデータ読み込み成功:', restaurants);
}

// UI初期化
function initializeUI() {
    // ランチ決定ボタン
    const decideBtn = document.getElementById('decide-btn');
    if (decideBtn) decideBtn.addEventListener('click', decideLunch);
    
    // やり直しボタン
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', retrySelection);
    
    // 確定ボタン
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmSelection);
    
    // 設定関連
    const ratingWeightSlider = document.getElementById('rating-weight');
    if (ratingWeightSlider) {
        ratingWeightSlider.addEventListener('input', function() {
            settings.ratingWeight = parseFloat(this.value);
            const valueElement = document.getElementById('rating-weight-value');
            if (valueElement) valueElement.textContent = settings.ratingWeight;
            saveSettings();
        });
    }
    
    const newDiscoverySlider = document.getElementById('new-discovery-rating');
    if (newDiscoverySlider) {
        newDiscoverySlider.addEventListener('input', function() {
            settings.newDiscoveryRating = parseFloat(this.value);
            const valueElement = document.getElementById('new-discovery-rating-value');
            if (valueElement) valueElement.textContent = settings.newDiscoveryRating;
            saveSettings();
        });
    }
    
    // 履歴リセットボタン
    const resetBtn = document.getElementById('reset-history-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetHistory);
}

// ランチ決定メイン処理
function decideLunch() {
    // 条件を取得
    const nearbyOnly = document.getElementById('nearby-filter').checked;
    const capacityOnly = document.getElementById('capacity-filter').checked;
    
    // 候補をフィルタリング
    let candidates = filterRestaurants(nearbyOnly, capacityOnly);
    
    // 今週使用済みジャンルを除外
    candidates = excludeUsedGenres(candidates);
    
    if (candidates.length === 0) {
        alert('条件に合う店舗がありません。条件を変更するか、履歴をリセットしてください。');
        return;
    }
    
    // 重み付けランダム選択
    const selected = weightedRandomSelect(candidates);
    
    // 結果を表示
    displayResult(selected);
    currentSelection = selected;
}

// 店舗フィルタリング
function filterRestaurants(nearbyOnly, capacityOnly) {
    return restaurants.filter(restaurant => {
        // 新規開拓は常に含める
        if (restaurant.id === 'new-discovery') return true;
        
        // 近場フィルタ
        if (nearbyOnly && !restaurant.isNearby) return false;
        
        // 人数フィルタ
        if (capacityOnly && !restaurant.canAccommodateFourPlus) return false;
        
        return true;
    });
}

// 今週使用済みジャンルを除外
function excludeUsedGenres(candidates) {
    const thisWeekGenres = getThisWeekGenres();
    
    return candidates.filter(restaurant => {
        // 新規開拓は常に含める
        if (restaurant.id === 'new-discovery') return true;
        
        // 使用済みジャンルでない場合のみ含める
        return !thisWeekGenres.includes(restaurant.genre);
    });
}

// 今週のジャンル一覧を取得
function getThisWeekGenres() {
    const thisWeekStart = getThisWeekStart();
    
    return weeklyHistory
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= thisWeekStart;
        })
        .map(entry => entry.genre);
}

// 今週の開始日（月曜日）を取得
function getThisWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=日曜, 1=月曜, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までの日数
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    return monday;
}

// 重み付けランダム選択
function weightedRandomSelect(candidates) {
    // 各店舗の重みを計算
    const weights = candidates.map(restaurant => {
        if (restaurant.id === 'new-discovery') {
            return 1; // 新規開拓は基本重み
        }
        
        const avgRating = calculateAverageRating(restaurant);
        return Math.pow(avgRating / 5, settings.ratingWeight);
    });
    
    // 重み付け抽選
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < candidates.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return candidates[i];
        }
    }
    
    // フォールバック
    return candidates[candidates.length - 1];
}

// 平均評価を計算
function calculateAverageRating(restaurant) {
    if (!restaurant.ratings || restaurant.ratings.length === 0) {
        return 3; // デフォルト評価
    }
    
    const sum = restaurant.ratings.reduce((total, rating) => total + rating.stars, 0);
    return sum / restaurant.ratings.length;
}

// 結果表示
function displayResult(restaurant) {
    // 結果セクションを表示
    document.getElementById('condition-section').style.display = 'none';
    document.getElementById('result-section').classList.remove('hidden');
    
    // 店舗情報を表示
    document.getElementById('restaurant-name').textContent = restaurant.name;
    document.getElementById('restaurant-genre').textContent = restaurant.genre;
    
    if (restaurant.id === 'new-discovery') {
        document.getElementById('restaurant-rating').textContent = '新しい発見へ！';
        
        // 新規開拓の場合も補足表示
        const notesElement = document.getElementById('restaurant-notes');
        const notesContainer = notesElement.parentElement;
        notesElement.textContent = '未知のお店を開拓しましょう！';
        notesContainer.style.display = 'block';
        
        document.getElementById('nearby-status').textContent = '📍 新規開拓';
        document.getElementById('capacity-status').textContent = '🆕 冒険タイム';
    } else {
        const avgRating = calculateAverageRating(restaurant);
        const ratingCount = restaurant.ratings ? restaurant.ratings.length : 0;
        document.getElementById('restaurant-rating').textContent = 
            `${avgRating.toFixed(1)} (${ratingCount}人の評価)`;
        
        // 補足情報を表示
        const notesElement = document.getElementById('restaurant-notes');
        const notesContainer = notesElement.parentElement;
        if (restaurant.notes && restaurant.notes.trim()) {
            notesElement.textContent = restaurant.notes;
            notesContainer.style.display = 'block';
        } else {
            notesElement.textContent = '';
            notesContainer.style.display = 'none';
        }
        
        // 条件表示
        document.getElementById('nearby-status').textContent = 
            restaurant.isNearby ? '📍 近場' : '📍 遠出';
        document.getElementById('capacity-status').textContent = 
            restaurant.canAccommodateFourPlus ? '👥 4人以上OK' : '👥 少人数向け';
    }
}

// やり直し処理
function retrySelection() {
    document.getElementById('condition-section').style.display = 'block';
    document.getElementById('result-section').classList.add('hidden');
    currentSelection = null;
}

// 選択確定処理
async function confirmSelection() {
    if (!currentSelection) return;
    
    // 履歴に追加
    const today = new Date();
    const historyEntry = {
        date: today.toISOString().split('T')[0],
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][today.getDay()],
        restaurantId: currentSelection.id,
        restaurantName: currentSelection.name,
        genre: currentSelection.genre
    };
    
    weeklyHistory.push(historyEntry);
    await saveHistory();
    
    // UI更新
    updateWeeklyStatus();
    alert(`${currentSelection.name} に決定しました！楽しいランチタイムを！`);
    
    // 初期状態に戻る
    retrySelection();
}

// 今週の利用状況更新
function updateWeeklyStatus() {
    const thisWeekEntries = getThisWeekEntries();
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
    
    days.forEach((day, index) => {
        const dayElement = document.getElementById(`${day}-status`);
        const entry = thisWeekEntries.find(e => e.dayOfWeek === dayNames[index]);
        
        if (entry) {
            dayElement.textContent = `${entry.genre} ✅`;
            dayElement.style.color = '#28a745';
        } else {
            dayElement.textContent = '-';
            dayElement.style.color = '#6c757d';
        }
    });
}

// 今週のエントリを取得
function getThisWeekEntries() {
    const thisWeekStart = getThisWeekStart();
    
    return weeklyHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= thisWeekStart;
    });
}

// 履歴保存（共有履歴とローカルストレージ両方）
async function saveHistory() {
    // ローカルストレージには常に保存（フォールバック用）
    localStorage.setItem('lunchHistory', JSON.stringify(weeklyHistory));
    
    // 共有履歴にも保存を試行
    if (HISTORY_CONFIG.useSharedHistory && GOOGLE_APPS_SCRIPT_URL !== 'YOUR_WEB_APP_URL_HERE') {
        await saveToSharedHistory();
    }
}

// 履歴読み込み（共有履歴を優先）
async function loadHistory() {
    try {
        if (HISTORY_CONFIG.useSharedHistory && GOOGLE_APPS_SCRIPT_URL !== 'YOUR_WEB_APP_URL_HERE') {
            // 共有履歴から読み込み
            await loadFromSharedHistory();
            console.log('共有履歴から読み込み完了:', weeklyHistory.length, '件');
        } else {
            throw new Error('共有履歴設定が無効');
        }
    } catch (error) {
        console.warn('共有履歴読み込みエラー:', error.message);
        
        if (HISTORY_CONFIG.fallbackToLocal) {
            // ローカルストレージから読み込み
            const savedHistory = localStorage.getItem('lunchHistory');
            if (savedHistory) {
                weeklyHistory = JSON.parse(savedHistory);
                console.log('ローカルストレージから読み込み完了:', weeklyHistory.length, '件');
            }
        }
    }
}

// 共有履歴から読み込み（JSONP使用）
async function loadFromSharedHistory() {
    return new Promise((resolve, reject) => {
        const callbackName = 'loadHistoryCallback_' + Date.now();
        const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getHistory&callback=${callbackName}`;
        
        // 5秒タイムアウト設定
        const timeout = setTimeout(() => {
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
            reject(new Error('共有履歴読み込みタイムアウト (5秒)'));
        }, 5000);
        
        // グローバルコールバック関数を作成
        window[callbackName] = function(result) {
            clearTimeout(timeout);
            try {
                // スクリプトタグを削除
                document.head.removeChild(script);
                delete window[callbackName];
                
                if (!result.success) {
                    reject(new Error(result.error || '共有履歴の読み込みに失敗'));
                    return;
                }
                
                // 共有履歴を優先使用（ローカル履歴は無視）
                const sharedHistory = result.data || [];
                console.log('共有履歴データ:', sharedHistory);
                
                // 共有履歴のみを使用（古いローカルデータを無視）
                weeklyHistory = sharedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // ローカルストレージも共有履歴で更新（同期）
                localStorage.setItem('lunchHistory', JSON.stringify(weeklyHistory));
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        // スクリプトタグを作成してJSONPリクエスト
        const script = document.createElement('script');
        script.src = url;
        script.onerror = () => {
            clearTimeout(timeout);
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
            reject(new Error('JSONP request failed'));
        };
        document.head.appendChild(script);
    });
}

// 共有履歴に保存（JSONP使用）
async function saveToSharedHistory() {
    // 最新のエントリのみを送信
    if (weeklyHistory.length === 0) return;
    
    const latestEntry = weeklyHistory[weeklyHistory.length - 1];
    
    return new Promise((resolve, reject) => {
        const callbackName = 'saveHistoryCallback_' + Date.now();
        const params = new URLSearchParams({
            action: 'addHistory',
            callback: callbackName,
            date: latestEntry.date,
            dayOfWeek: latestEntry.dayOfWeek,
            restaurantName: latestEntry.restaurantName,
            genre: latestEntry.genre
        });
        
        const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
        
        // グローバルコールバック関数を作成
        window[callbackName] = function(result) {
            try {
                // スクリプトタグを削除
                document.head.removeChild(script);
                delete window[callbackName];
                
                if (!result.success) {
                    console.warn('共有履歴保存エラー:', result.error);
                    reject(new Error(result.error || '共有履歴の保存に失敗'));
                    return;
                }
                
                console.log('共有履歴に保存成功:', latestEntry.restaurantName);
                resolve();
            } catch (error) {
                console.warn('共有履歴保存エラー:', error.message);
                reject(error);
            }
        };
        
        // スクリプトタグを作成してJSONPリクエスト
        const script = document.createElement('script');
        script.src = url;
        script.onerror = () => {
            document.head.removeChild(script);
            delete window[callbackName];
            console.warn('共有履歴保存エラー: JSONP request failed');
            reject(new Error('JSONP request failed'));
        };
        document.head.appendChild(script);
    }).catch(error => {
        // エラーが発生してもローカルストレージには保存済みなので続行
        console.warn('共有履歴保存は失敗しましたが、ローカル履歴は保存されています');
    });
}

// 設定保存
function saveSettings() {
    localStorage.setItem('lunchSettings', JSON.stringify(settings));
}

// 履歴リセット
async function resetHistory() {
    if (confirm('履歴をリセットしますか？この操作は取り消せません。\n\n注意: 共有履歴は削除されず、ローカルの履歴のみがリセットされます。')) {
        weeklyHistory = [];
        localStorage.setItem('lunchHistory', JSON.stringify(weeklyHistory));
        updateWeeklyStatus();
        alert('ローカル履歴をリセットしました。\n\n共有履歴を確認するにはページを再読み込みしてください。');
    }
}

// 共有履歴状態の確認（デバッグ用）
function checkSharedHistoryStatus() {
    console.log('=== 共有履歴設定状況 ===');
    console.log('共有履歴使用:', HISTORY_CONFIG.useSharedHistory);
    console.log('WebApp URL設定済み:', GOOGLE_APPS_SCRIPT_URL !== 'YOUR_WEB_APP_URL_HERE');
    console.log('WebApp URL:', GOOGLE_APPS_SCRIPT_URL);
    console.log('フォールバック設定:', HISTORY_CONFIG.fallbackToLocal);
    console.log('現在の履歴件数:', weeklyHistory.length);
}

// ローディング表示
function showLoadingStatus(message) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
    } else {
        console.log('🔄', message);
    }
}

function hideLoadingStatus() {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// デバッグ用関数
function debugInfo() {
    console.log('=== デバッグ情報 ===');
    console.log('店舗数:', restaurants.length);
    console.log('履歴件数:', weeklyHistory.length);
    console.log('今週の利用:', getThisWeekGenres());
    console.log('設定:', settings);
}