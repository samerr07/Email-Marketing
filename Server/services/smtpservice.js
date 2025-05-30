// services/smtpService.js
const nodemailer = require('nodemailer');

async function testSMTPConnection({ smtpServer, smtpPort, emailUser, emailPass }) {
    // if (!smtpServer || !smtpPort || !emailUser || !emailPass) {
    //     throw new Error('Missing required SMTP configuration fields');
    // }

    const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: smtpPort === '465', // true for 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPass
        },
        connectionTimeout: 10000,
        socketTimeout: 30000,
    });

    await transporter.verify();
}

module.exports = { testSMTPConnection };