const fs = require('fs');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const path = require('path');

// Read Excel file and return data
function readExcelData(excelPath) {
    if (!fs.existsSync(excelPath)) throw new Error('Excel file not found');
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);
}

// Get the email template content either from pasted template or HTML file
function getTemplateContent(template, htmlPath) {
    if (template) return template;
    if (htmlPath && fs.existsSync(htmlPath)) return fs.readFileSync(htmlPath, 'utf8');
    throw new Error('Template not found');
}

// Filter valid emails from data based on email column
function filterValidRecipients(data, emailColumn) {
    return data.filter(row => {
        const email = row[emailColumn];
        return email && typeof email === 'string' && email.includes('@') && email.includes('.');
    });
}

// Create nodemailer transporter with given SMTP config and delay
function createTransporter({ smtpServer, smtpPort, emailUser, emailPass, delayBetweenEmails }) {
    return nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: smtpPort === '465',
        auth: { user: emailUser, pass: emailPass },
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        rateDelta: delayBetweenEmails,
        rateLimit: 3,
        connectionTimeout: 15000,
        socketTimeout: 45000,
    });
}

// Extract CID references from HTML template
function extractCIDReferences(htmlContent) {
    const cidPattern = /src=["']cid:([^"']+)["']/gi;
    const cids = [];
    let match;
    
    while ((match = cidPattern.exec(htmlContent)) !== null) {
        cids.push(match[1]); // Extract the CID name
    }
    
    return [...new Set(cids)]; // Remove duplicates
}

// Build attachments array from CID references
function buildAttachmentsFromCIDs(cids, uploadsPath = './uploads/images/') {
    const attachments = [];
    
    cids.forEach(cid => {
        // Try different common image extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        let foundFile = null;
        
        for (const ext of extensions) {
            const possiblePath = path.join(uploadsPath, cid + ext);
            if (fs.existsSync(possiblePath)) {
                foundFile = possiblePath;
                break;
            }
            
            // Also try without extension (in case CID already includes it)
            const directPath = path.join(uploadsPath, cid);
            if (fs.existsSync(directPath)) {
                foundFile = directPath;
                break;
            }
        }
        
        if (foundFile) {
            attachments.push({
                filename: path.basename(foundFile),
                path: foundFile,
                cid: cid
            });
        } else {
            console.warn(`Image not found for CID: ${cid}`);
        }
    });
    
    return attachments;
}


// Send emails with retry and personalization
async function sendEmailsJob({
    jobId,
    recipients,
    emailColumn,
    nameColumn,
    subjectLine,
    senderName,
    templateContent,
    variables,
    transporter,
    delayBetweenEmails,
    activeSendingJobs,
    uploadsPath = './uploads/images/'
}) {
    let success = 0;
    let failed = 0;

    // Extract CID references from template once
    const cidReferences = extractCIDReferences(templateContent);
    const baseAttachments = buildAttachmentsFromCIDs(cidReferences, uploadsPath);

    for (let i = 0; i < recipients.length; i++) {
        const currentJobData = activeSendingJobs.get(jobId);
        if (!currentJobData || currentJobData.shouldStop) {
            if (currentJobData) {
                currentJobData.sentEmails = success;
                currentJobData.failedEmails = failed;
                currentJobData.stopped = true;
            }
            break;
        }

        const row = recipients[i];
        const email = row[emailColumn];
        const name = nameColumn ? row[nameColumn] || '' : '';

        try {
            let personalized = templateContent;
            if (Array.isArray(variables)) {
                variables.forEach(variable => {
                    if (variable.placeholder && variable.column && row[variable.column]) {
                        const value = String(row[variable.column]);
                        const regex = new RegExp(`{{${variable.placeholder}}}`, 'g');
                        personalized = personalized.replace(regex, value);
                    }
                });
            }
            const personalizedSubject = subjectLine.replace(/{{name}}/gi, name);
            personalized = personalized.replace(/{{name}}/gi, name);

             // Prepare email options
            const mailOptions = {
                from: `"${senderName || 'Email Marketing Tool'}" <${transporter.options.auth.user}>`,
                to: email,
                subject: personalizedSubject,
                html: personalized,
                attachments: baseAttachments // Include CID attachments
            };

            let retries = 2;
            let sent = false;



            // while (retries >= 0 && !sent) {
            //     try {
            //         await transporter.sendMail({
            //             from: `"${senderName || 'Email Marketing Tool'}" <${transporter.options.auth.user}>`,
            //             to: email,
            //             subject: personalizedSubject,
            //             html: personalized,
            //         });
            //         sent = true;
            //         success++;
            //         const jobData = activeSendingJobs.get(jobId);
            //         if (jobData) jobData.sentEmails = success;
            //     } catch (err) {
            //         retries--;
            //         if (retries < 0) throw err;
            //         await new Promise(r => setTimeout(r, 1000));
            //     }
            // }
            while (retries >= 0 && !sent) {
                try {
                    await transporter.sendMail(mailOptions);
                    sent = true;
                    success++;
                    const jobData = activeSendingJobs.get(jobId);
                    if (jobData) jobData.sentEmails = success;
                } catch (err) {
                    retries--;
                    if (retries < 0) throw err;
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        } catch (err) {
            failed++;
            const jobData = activeSendingJobs.get(jobId);
            if (jobData) jobData.failedEmails = failed;
        }

        if (i < recipients.length - 1) {
            await new Promise(r => setTimeout(r, delayBetweenEmails));
        }
    }

    const finalJobData = activeSendingJobs.get(jobId);
    if (finalJobData) {
        finalJobData.completed = true;
        finalJobData.endTime = new Date();
    }
    transporter.close();
}

module.exports = {
    readExcelData,
    getTemplateContent,
    filterValidRecipients,
    createTransporter,
    sendEmailsJob,
     extractCIDReferences,
    buildAttachmentsFromCIDs
};