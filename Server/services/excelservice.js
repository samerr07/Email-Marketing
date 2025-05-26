const xlsx = require('xlsx');
const fs = require('fs');

function previewExcel(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error('Excel file does not exist');
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
        throw new Error('Excel file is empty or has no valid data');
    }

    const headers = Object.keys(data[0] || {});

    if (headers.length === 0) {
        throw new Error('No columns found in Excel file');
    }

    return {
        headers,
        sample: data.slice(0, 5),
        totalRows: data.length,
        data // optional: full data
    };
}

module.exports = { previewExcel };