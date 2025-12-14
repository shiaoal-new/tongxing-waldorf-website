function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = doc.getSheetByName("visit-registration");
        // If the sheet doesn't exist, create it
        if (!sheet) {
            sheet = doc.insertSheet("visit-registration");
        }

        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var nextRow = sheet.getLastRow() + 1;

        // Parse the data
        // SurveyJS sends data as a JSON object
        var data = JSON.parse(e.postData.contents);

        // Default headers if sheet is empty
        if (sheet.getLastRow() === 0) {
            var defaultHeaders = ["Timestamp", "name", "email", "cellphone", "visitors", "date", "time"];
            sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
            headers = defaultHeaders;
            nextRow = 2; // Data starts at row 2
        }

        var newRow = [];

        // Add Timestamp
        newRow.push(new Date());

        // Map other fields based on headers (skipping Timestamp at index 0)
        // We start loop from 1 if we assume column 1 is Timestamp
        // Actually, simpler approach for this specific use case:
        // Just hardcode the order or map dynamically. 
        // Let's hardcode for stability as per variable names

        newRow.push(data.name || "");
        newRow.push(data.email || "");
        newRow.push(data.cellphone || "");
        newRow.push(data.visitors || "");

        // We can also pass the session date/time from the frontend if we want
        newRow.push(data.sessionDate || "");
        newRow.push(data.sessionTime || "");

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("visit-registration");
    if (!sheet) {
        sheet = doc.insertSheet("visit-registration");
    }
    var headers = ["Timestamp", "name", "email", "cellphone", "visitors", "date", "time"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function testDoPost() {
    var e = {
        postData: {
            contents: JSON.stringify({
                "visitors": 1,
                "name": "al001",
                "email": "al002@gmail.com",
                "cellphone": "13243434343",
                "sessionDate": "2024-03-15 (五)",
                "sessionTime": "09:30 - 11:30"
            })
        }
    };
    var result = doPost(e);
    Logger.log(result.getContent());
}
