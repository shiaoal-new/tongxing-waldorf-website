function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var data = JSON.parse(e.postData.contents);
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheetName = "lighthouse-history";
        var sheet = doc.getSheetByName(sheetName);

        // 如果表格不存在則建立
        if (!sheet) {
            sheet = doc.insertSheet(sheetName);
            var headers = ["Timestamp", "Page", "Performance", "Accessibility", "Best Practices", "SEO", "Commit", "Branch", "Run ID", "Report"];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.setFrozenRows(1);
        }

        var nextRow = sheet.getLastRow() + 1;
        var timestamp = new Date();

        // 構造 Report 連結 (如果是在 GitHub Actions 環境)
        var reportLink = "";
        if (data.repo && data.runId) {
            var runUrl = "https://github.com/" + data.repo + "/actions/runs/" + data.runId;
            // 由於直接檔案網址難以獲得，我們連結到 Action Run 並顯示檔名
            reportLink = '=HYPERLINK("' + runUrl + '", "' + (data.compactReport || "View Run") + '")';
        } else {
            reportLink = data.compactReport || "";
        }

        var newRow = [
            timestamp,
            data.page || "unknown",
            data.scores.performance || 0,
            data.scores.accessibility || 0,
            data.scores.bestPractices || 0,
            data.scores.seo || 0,
            data.commit || "",
            data.branch || "",
            data.runId || "",
            reportLink
        ];

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

/**
 * 測試用的函數
 */
/**
 * 模擬 GitHub Action 傳來的 Lighthouse 資料進行測試
 */
function testLighthouseAudit() {
    const mockPages = [
        { page: "/", perf: 95, acc: 98, best: 100, seo: 100 },
        { page: "/about", perf: 88, acc: 95, best: 92, seo: 100 },
        { page: "/contact", perf: 92, acc: 100, best: 100, seo: 95 }
    ];

    mockPages.forEach(item => {
        var e = {
            postData: {
                contents: JSON.stringify({
                    "page": item.page,
                    "scores": {
                        "performance": item.perf,
                        "accessibility": item.acc,
                        "bestPractices": item.best,
                        "seo": item.seo
                    },
                    "commit": "abc1234567890",
                    "branch": "main",
                    "runId": "987654321",
                    "repo": "owner/repo",
                    "compactReport": "lighthouse_index_compact.json"
                })
            }
        };

        var result = doPost(e);
        Logger.log("測試頁面: " + item.page + " | 結果: " + result.getContent());
    });
}
