const fs = require('fs');
const report = JSON.parse(fs.readFileSync('/Users/alsiao/Documents/git/tongxing/website/frontend/measurement_result/lighthouse_index_2026-01-23.compact.json', 'utf8'));

const detailedAudits = [];
for (const [id, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 0.9) {
        detailedAudits.push({
            id,
            title: audit.title,
            score: audit.score,
            displayValue: audit.displayValue,
            description: audit.description
        });
    }
}

console.log(JSON.stringify(detailedAudits, null, 2));
