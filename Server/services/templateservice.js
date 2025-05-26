const fs = require('fs');

function parseHtmlTemplate(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error('Template file does not exist');
    }

    const template = fs.readFileSync(filePath, 'utf8');

    if (!template || template.trim() === '') {
        throw new Error('HTML template is empty');
    }

    return template;
}

module.exports = { parseHtmlTemplate };