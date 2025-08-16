/**
 * Lunch Decider - Google Apps Script for Shared History (CORS Fixed)
 */

// スプレッドシートID
const SPREADSHEET_ID = '18tNpNwW4qBTsLr48tPoUfp9p4r_FhQTOxcGM_8AYxhc';
const HISTORY_SHEET_NAME = 'Sheet2';

/**
 * doPost - 履歴データの保存
 */
function doPost(e) {
  try {
    // CORS preflight対応
    if (!e || !e.postData || !e.postData.contents) {
      return createCORSResponse(JSON.stringify({success: false, error: 'No POST data'}));
    }
    
    const postData = JSON.parse(e.postData.contents);
    
    if (postData.action === 'addHistory') {
      const result = addHistoryEntry(postData.data);
      return createCORSResponse(result);
    } else {
      return createCORSResponse(JSON.stringify({success: false, error: 'Invalid action'}));
    }
  } catch (error) {
    return createCORSResponse(JSON.stringify({success: false, error: error.toString()}));
  }
}

/**
 * doOptions - CORS preflight対応
 */
function doOptions(e) {
  return createCORSResponse(JSON.stringify({success: true, message: 'CORS preflight OK'}));
}

/**
 * doGet - 履歴データの読み取り（JSONP対応）
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    
    // JSONP用のコールバック関数名
    const callback = params.callback || 'callback';
    
    if (params.action === 'getHistory') {
      const result = getHistoryData();
      const jsonpResponse = `${callback}(${result});`;
      return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
      
    } else if (params.action === 'addHistory') {
      // GET経由での履歴追加（URLパラメータ）
      const historyData = {
        date: params.date,
        dayOfWeek: params.dayOfWeek,
        restaurantName: params.restaurantName,
        genre: params.genre
      };
      
      const result = addHistoryEntry(historyData);
      const jsonpResponse = `${callback}(${result});`;
      return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
      
    } else {
      const errorResult = JSON.stringify({success: false, error: 'Invalid action'});
      const jsonpResponse = `${callback}(${errorResult});`;
      return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } catch (error) {
    const callback = (e.parameter && e.parameter.callback) || 'callback';
    const errorResult = JSON.stringify({success: false, error: error.toString()});
    const jsonpResponse = `${callback}(${errorResult});`;
    return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/**
 * 履歴エントリを追加
 */
function addHistoryEntry(historyData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let historySheet;
    
    // Sheet2を取得または作成
    historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
    if (!historySheet) {
      historySheet = spreadsheet.insertSheet(HISTORY_SHEET_NAME);
      historySheet.getRange(1, 1, 1, 4).setValues([['日付', '曜日', '店名', 'ジャンル']]);
    }
    
    // ヘッダーがない場合は追加
    if (historySheet.getLastRow() === 0) {
      historySheet.getRange(1, 1, 1, 4).setValues([['日付', '曜日', '店名', 'ジャンル']]);
    }
    
    // 新しい行を追加
    const newRow = historySheet.getLastRow() + 1;
    const rowData = [
      historyData.date,
      historyData.dayOfWeek,
      historyData.restaurantName,
      historyData.genre
    ];
    
    historySheet.getRange(newRow, 1, 1, 4).setValues([rowData]);
    
    return JSON.stringify({success: true, message: 'History added successfully'});
    
  } catch (error) {
    return JSON.stringify({success: false, error: error.toString()});
  }
}

/**
 * 履歴データを取得
 */
function getHistoryData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let historySheet;
    
    historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
    if (!historySheet) {
      return JSON.stringify({success: true, data: []});
    }
    
    const lastRow = historySheet.getLastRow();
    
    if (lastRow <= 1) {
      return JSON.stringify({success: true, data: []});
    }
    
    const data = historySheet.getRange(2, 1, lastRow - 1, 4).getValues();
    
    const historyData = data.map(row => ({
      date: row[0] instanceof Date ? row[0].toISOString().split('T')[0] : row[0],
      dayOfWeek: row[1],
      restaurantName: row[2],
      genre: row[3]
    })).filter(entry => entry.date && entry.restaurantName);
    
    return JSON.stringify({success: true, data: historyData});
    
  } catch (error) {
    return JSON.stringify({success: false, error: error.toString()});
  }
}

/**
 * CORS対応レスポンスを作成
 */
function createCORSResponse(content) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    });
}

/**
 * テスト用関数
 */
function testAddHistory() {
  const testData = {
    date: '2024-08-17',
    dayOfWeek: '土',
    restaurantName: 'テスト店舗',
    genre: 'テスト'
  };
  
  const result = addHistoryEntry(testData);
  console.log('Test Result:', result);
  return result;
}