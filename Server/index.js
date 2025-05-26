const express = require('express');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const supabase = require('./config/supabase_client');
const authRoutes = require('./route/route');
const { previewExcel } = require('./services/excelservice');
const { parseHtmlTemplate } = require('./services/templateservice');
const { testSMTPConnection } = require('./services/smtpservice');
const {
    readExcelData,
    getTemplateContent,
    filterValidRecipients,
    createTransporter,
    sendEmailsJob
} = require('./services/emailhelper');


dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true,

}));

app.use(express.json()); // parse incoming JSON requests
app.use('/api/auth', authRoutes);

// Enable CORS for React frontend
app.use(cors({
    origin: true,
    credentials: true,

}));

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Global variable to track active sending processes
const activeSendingJobs = new Map();

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/excel', 'uploads/html'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname === 'excel' ? 'uploads/excel/' : 'uploads/html/';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'excel') {
            if (file.mimetype.includes('spreadsheet') || file.originalname.match(/\.(xlsx|xls)$/)) {
                cb(null, true);
            } else {
                cb(new Error('Only Excel files are allowed'), false);
            }
        } else if (file.fieldname === 'template') {
            if (file.mimetype === 'text/html' || file.originalname.match(/\.(html|htm)$/)) {
                cb(null, true);
            } else {
                cb(new Error('Only HTML files are allowed'), false);
            }
        } else {
            cb(new Error('Invalid field name'), false);
        }
    }
});


// Serve the HTML file (if you want to serve it from backend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        activeJobs: activeSendingJobs.size
    });
});

// Preview Excel file endpoint
// app.post('/preview-excel', upload.single('excel'), (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No Excel file uploaded'
//             });
//         }

//         const excelPath = req.file.path;
//         const workbook = xlsx.readFile(excelPath);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const data = xlsx.utils.sheet_to_json(sheet);

//         if (!data || data.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Excel file is empty or has no valid data'
//             });
//         }

//         // Get headers/columns
//         const headers = Object.keys(data[0] || {});

//         // Validate that we have headers
//         if (headers.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No columns found in Excel file'
//             });
//         }

//         // Return first few rows and headers
//         res.json({
//             success: true,
//             headers,
//             sample: data.slice(0, 5),
//             totalRows: data.length,
//             filePath: excelPath
//         });
//     } catch (err) {
//         console.error('Error processing Excel file:', err);
//         res.status(500).json({
//             success: false,
//             message: 'Error processing Excel file',
//             error: err.message
//         });
//     }
// });

// Upload HTML template endpoint
// adjust path as needed

app.post('/preview-excel', upload.single('excel'), (req, res) => {
    //neww
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No Excel file uploaded'
            });
        }

        const excelPath = req.file.path;
        const result = previewExcel(excelPath);

        res.json({
            success: true,
            headers: result.headers,
            sample: result.sample,
            totalRows: result.totalRows,
            filePath: excelPath
        });
    } catch (err) {
        console.error('Error processing Excel file:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Error processing Excel file'
        });
    }
});

// app.post('/upload-template', upload.single('template'), (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No template file uploaded'
//             });
//         }

//         const htmlPath = req.file.path;
//         const template = fs.readFileSync(htmlPath, 'utf8');

//         res.json({
//             success: true,
//             filePath: htmlPath,
//             template
//         });
//     } catch (err) {
//         console.error('Error processing HTML template:', err);
//         res.status(500).json({
//             success: false,
//             message: 'Error processing HTML template',
//             error: err.message
//         });
//     }
// });

// Test SMTP connection endpoint




app.post('/upload-template', upload.single('template'), (req, res) => {
    try { //neww
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No template file uploaded'
            });
        }

        const htmlPath = req.file.path;
        const template = parseHtmlTemplate(htmlPath);

        res.json({
            success: true,
            filePath: htmlPath,
            template
        });
    } catch (err) {
        console.error('Error processing HTML template:', err);
        res.status(500).json({
            success: false,
            message: 'Error processing HTML template',
            error: err.message
        });
    }
});


// app.post('/test-connection', async(req, res) => {
//     const { smtpServer, smtpPort, emailUser, emailPass } = req.body;

//     // Validate required fields
//     if (!smtpServer || !smtpPort || !emailUser || !emailPass) {
//         return res.status(400).json({
//             success: false,
//             message: 'Missing required SMTP configuration fields'
//         });
//     }

//     try {
//         const transporter = nodemailer.createTransport({
//             host: smtpServer,
//             port: parseInt(smtpPort),
//             secure: smtpPort === '465', // true for 465, false for other ports
//             auth: {
//                 user: emailUser,
//                 pass: emailPass
//             },
//             connectionTimeout: 10000,
//             socketTimeout: 30000,
//         });

//         // Verify connection
//         await transporter.verify();

//         res.json({
//             success: true,
//             message: 'SMTP connection successful!'
//         });
//     } catch (err) {
//         console.error('SMTP connection failed:', err);
//         res.json({
//             success: false,
//             message: 'SMTP connection failed',
//             error: err.message
//         });
//     }
// });

// Stop sending endpoint



app.post('/test-connection', async(req, res) => {
    try {
        await testSMTPConnection(req.body);

        res.json({
            success: true,
            message: 'SMTP connection successful!'
        });
    } catch (err) {
        console.error('SMTP connection failed:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});


app.post('/stop-sending', (req, res) => {
    const { jobId } = req.body;

    if (!jobId) {
        return res.status(400).json({
            success: false,
            message: 'Job ID is required'
        });
    }

    if (activeSendingJobs.has(jobId)) {
        // Set the shouldStop flag to true
        const jobData = activeSendingJobs.get(jobId);
        jobData.shouldStop = true;

        res.json({
            success: true,
            message: 'Stop signal sent. Email sending will stop after the current email completes.'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Job not found or already completed'
        });
    }
});

// Main send endpoint
// app.post('/send', async(req, res) => {
//     const {
//         excelPath,
//         htmlPath,
//         emailColumn,
//         nameColumn,
//         subjectLine,
//         smtpServer,
//         smtpPort,
//         emailUser,
//         emailPass,
//         senderName,
//         variables,
//         delayBetweenEmails = 2000,
//         template // For pasted templates
//     } = req.body;

//     try {
//         // Validate inputs
//         if (!emailColumn || !smtpServer || !emailUser || !emailPass || !subjectLine) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required parameters'
//             });
//         }

//         // Validate that we have either excelPath or template content
//         if (!excelPath || (!htmlPath && !template)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing Excel file or HTML template'
//             });
//         }

//         // Create a unique job ID for this sending process
//         const jobId = Date.now().toString();

//         // Initialize job data in the map
//         activeSendingJobs.set(jobId, {
//             shouldStop: false,
//             startTime: new Date(),
//             totalEmails: 0,
//             sentEmails: 0,
//             failedEmails: 0
//         });

//         // Read the data files
//         let data, templateContent;

//         try {
//             // Read Excel data
//             if (!fs.existsSync(excelPath)) {
//                 throw new Error('Excel file not found');
//             }

//             const workbook = xlsx.readFile(excelPath);
//             const sheet = workbook.Sheets[workbook.SheetNames[0]];
//             data = xlsx.utils.sheet_to_json(sheet);

//             // Read template
//             if (template) {
//                 templateContent = template;
//             } else if (htmlPath && fs.existsSync(htmlPath)) {
//                 templateContent = fs.readFileSync(htmlPath, 'utf8');
//             } else {
//                 throw new Error('Template not found');
//             }
//         } catch (readError) {
//             activeSendingJobs.delete(jobId);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Error reading files: ' + readError.message
//             });
//         }

//         // Validate email list
//         const validRecipients = data.filter(row => {
//             const email = row[emailColumn];
//             return email && typeof email === 'string' && email.includes('@') && email.includes('.');
//         });

//         if (validRecipients.length === 0) {
//             // Clean up the job data
//             activeSendingJobs.delete(jobId);

//             return res.status(400).json({
//                 success: false,
//                 message: 'No valid email addresses found in the selected column'
//             });
//         }

//         // Enforce email sending limit for safety
//         const MAX_EMAILS = 500;
//         const recipientsToProcess = validRecipients.slice(0, MAX_EMAILS);

//         // Update job data with total emails
//         const jobData = activeSendingJobs.get(jobId);
//         jobData.totalEmails = recipientsToProcess.length;

//         // Send initial response with job ID
//         res.json({
//             success: true,
//             jobId,
//             total: recipientsToProcess.length,
//             limit: MAX_EMAILS,
//             skipped: validRecipients.length > MAX_EMAILS ? validRecipients.length - MAX_EMAILS : 0
//         });

//         // Configure email transporter with improved settings
//         const transporter = nodemailer.createTransport({
//             host: smtpServer,
//             port: parseInt(smtpPort),
//             secure: smtpPort === '465',
//             auth: {
//                 user: emailUser,
//                 pass: emailPass
//             },
//             pool: true,
//             maxConnections: 3,
//             maxMessages: 50,
//             rateDelta: delayBetweenEmails,
//             rateLimit: 3,
//             connectionTimeout: 15000,
//             socketTimeout: 45000,
//             debug: false
//         });

//         // Process and send emails in the background
//         (async() => {
//             let success = 0;
//             let failed = 0;

//             console.log(`Starting to send ${recipientsToProcess.length} emails for job ${jobId}`);

//             for (let i = 0; i < recipientsToProcess.length; i++) {
//                 // Check if should stop
//                 const currentJobData = activeSendingJobs.get(jobId);
//                 if (!currentJobData || currentJobData.shouldStop) {
//                     console.log(`Job ${jobId} stopped by user or not found`);
//                     if (currentJobData) {
//                         currentJobData.sentEmails = success;
//                         currentJobData.failedEmails = failed;
//                         currentJobData.stopped = true;
//                     }
//                     break;
//                 }

//                 const row = recipientsToProcess[i];
//                 const email = row[emailColumn];
//                 const name = nameColumn ? row[nameColumn] || '' : '';

//                 try {
//                     // Personalize the email
//                     let personalized = templateContent;

//                     // Replace all variables based on mappings
//                     if (Array.isArray(variables)) {
//                         variables.forEach(variable => {
//                             if (variable.placeholder && variable.column && row[variable.column]) {
//                                 const value = String(row[variable.column]) || '';
//                                 const regex = new RegExp(`{{${variable.placeholder}}}`, 'g');
//                                 personalized = personalized.replace(regex, value);
//                             }
//                         });
//                     }

//                     // Replace name placeholder in subject and content
//                     const personalizedSubject = subjectLine.replace(/{{name}}/gi, name);
//                     personalized = personalized.replace(/{{name}}/gi, name);

//                     // Send email with retry logic
//                     let retries = 2;
//                     let sent = false;

//                     while (retries >= 0 && !sent) {
//                         try {
//                             await transporter.sendMail({
//                                 from: `"${senderName || 'Email Marketing Tool'}" <${emailUser}>`,
//                                 to: email,
//                                 subject: personalizedSubject,
//                                 html: personalized,
//                             });

//                             sent = true;
//                             success++;

//                             // Update job data
//                             const currentJobData = activeSendingJobs.get(jobId);
//                             if (currentJobData) {
//                                 currentJobData.sentEmails = success;
//                             }

//                             console.log(`Email ${i + 1}/${recipientsToProcess.length} sent successfully to ${email}`);

//                         } catch (sendErr) {
//                             retries--;
//                             console.error(`Send attempt failed for ${email}:`, sendErr.message);

//                             if (retries < 0) {
//                                 throw sendErr; // Re-throw if no more retries
//                             }

//                             // Wait before retrying
//                             await new Promise(resolve => setTimeout(resolve, 1000));
//                         }
//                     }
//                 } catch (err) {
//                     failed++;
//                     console.error(`Failed to send email to ${email}:`, err.message);

//                     // Update job data
//                     const currentJobData = activeSendingJobs.get(jobId);
//                     if (currentJobData) {
//                         currentJobData.failedEmails = failed;
//                     }
//                 }

//                 // Add a delay between emails to avoid being flagged as spam
//                 if (i < recipientsToProcess.length - 1) { // Don't delay after the last email
//                     await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
//                 }
//             }

//             // Update job as complete
//             const finalJobData = activeSendingJobs.get(jobId);
//             if (finalJobData) {
//                 finalJobData.completed = true;
//                 finalJobData.endTime = new Date();
//                 console.log(`Job ${jobId} completed: ${success} sent, ${failed} failed`);
//             }

//             // Close the transporter
//             transporter.close();

//             // Keep job data for 1 hour, then clean up
//             setTimeout(() => {
//                 activeSendingJobs.delete(jobId);
//                 console.log(`Cleaned up job data for ${jobId}`);
//             }, 3600000); // 1 hour

//         })().catch(err => {
//             console.error('Background email sending error:', err);
//             const jobData = activeSendingJobs.get(jobId);
//             if (jobData) {
//                 jobData.error = err.message;
//                 jobData.completed = true;
//             }
//         });

//     } catch (err) {
//         console.error('Send endpoint error:', err);

//         // Clean up job if it was created
//         if (activeSendingJobs.has(jobId)) {
//             activeSendingJobs.delete(jobId);
//         }

//         res.status(500).json({
//             success: false,
//             message: 'Error processing request',
//             error: err.message
//         });
//     }
// });


app.post('/send', async(req, res) => {
    const {
        excelPath,
        htmlPath,
        emailColumn,
        nameColumn,
        subjectLine,
        smtpServer,
        smtpPort,
        emailUser,
        emailPass,
        senderName,
        variables,
        delayBetweenEmails = 2000,
        template
    } = req.body;

    if (!emailColumn || !smtpServer || !emailUser || !emailPass || !subjectLine) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    if (!excelPath || (!htmlPath && !template)) {
        return res.status(400).json({ success: false, message: 'Missing Excel file or HTML template' });
    }

    const jobId = Date.now().toString();
    activeSendingJobs.set(jobId, { shouldStop: false, startTime: new Date(), totalEmails: 0, sentEmails: 0, failedEmails: 0 });

    let data, templateContent;
    try {
        data = readExcelData(excelPath);
        templateContent = getTemplateContent(template, htmlPath);
    } catch (err) {
        activeSendingJobs.delete(jobId);
        return res.status(400).json({ success: false, message: 'Error reading files: ' + err.message });
    }

    const validRecipients = filterValidRecipients(data, emailColumn);
    if (validRecipients.length === 0) {
        activeSendingJobs.delete(jobId);
        return res.status(400).json({ success: false, message: 'No valid email addresses found' });
    }

    const MAX_EMAILS = 500;
    const recipientsToProcess = validRecipients.slice(0, MAX_EMAILS);
    const jobData = activeSendingJobs.get(jobId);
    jobData.totalEmails = recipientsToProcess.length;

    res.json({ success: true, jobId, total: recipientsToProcess.length, limit: MAX_EMAILS, skipped: validRecipients.length - MAX_EMAILS });

    const transporter = createTransporter({ smtpServer, smtpPort, emailUser, emailPass, delayBetweenEmails });

    sendEmailsJob({
        jobId,
        recipients: recipientsToProcess,
        emailColumn,
        nameColumn,
        subjectLine,
        senderName,
        templateContent,
        variables,
        transporter,
        delayBetweenEmails,
        activeSendingJobs,
    }).catch(err => {
        const jobData = activeSendingJobs.get(jobId);
        if (jobData) {
            jobData.error = err.message;
            jobData.completed = true;
        }
    });

    // Optionally, cleanup after 1 hour, etc.
});


// const {
//     readExcelData,
//     getTemplateContent,
//     filterValidRecipients,
//     createTransporter,
//     sendEmailsJob
// } = require('./emailHelpers');

// const activeSendingJobs = new Map();

// app.post('/campaign', upload.fields([
//     { name: 'excel', maxCount: 1 },
//     { name: 'template', maxCount: 1 }
// ]), async(req, res) => {
//     try {
//         // Validate file presence
//         // if (!req.files || !req.files.excel || !req.files.template) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: 'Excel and template files are required'
//         //     });
//         // }
//         if (!req.files || !req.files.excel) {
//     return res.status(400).json({
//         success: false,
//         message: 'Excel file is required'
//     });
// }

//         const excelFile = req.files.excel[0];
//         const templateFile = req.files.template[0];



//         // 1. Preview Excel data
//         const excelPreview = previewExcel(excelFile.path);

//         // 2. Extract values from body
//         const {
//             emailColumn,
//             nameColumn,
//             subjectLine,
//             smtpServer,
//             smtpPort,
//             emailUser,
//             emailPass,
//             senderName,
//             variables,
//             delayBetweenEmails = 2000,
//             template: pastedTemplate,
//             campaign_name

//         } = req.body;
//         // Validate SMTP
//         await testSMTPConnection({ smtpServer, smtpPort, emailUser, emailPass });

//         // 3. Use pasted template or uploaded template file
//         // let templateContent = pastedTemplate && pastedTemplate.trim() !== '' ?
//         //     pastedTemplate :
//         //     parseHtmlTemplate(templateFile.path);
//         let templateContent = req.body.template && req.body.template.trim() !== '' ?
//     req.body.template :
//     (templateFile ? parseHtmlTemplate(templateFile.path) : '');

//         // 4. Save campaign to Supabase
//         const { data, error } = await supabase
//             .from('campaigns')
//             .insert([{
//                 excel_path: excelFile.path,
//                 html_path: templateFile.path,
//                 email_column: emailColumn,
//                 name_column: nameColumn,
//                 subject_line: subjectLine,
//                 smtp_server: smtpServer,
//                 smtp_port: smtpPort,
//                 email_user: emailUser,
//                 email_pass: emailPass,
//                 sender_name: senderName,
//                 variables,
//                 delay_between_emails: parseInt(delayBetweenEmails),
//                 template: templateContent,
//                 campaign_name: campaign_name,
//                 status: 'pending'
//             }])
//             .select()
//             .single();

//         if (error) throw error;

//         // ✅ 5. START EMAIL SENDING IMMEDIATELY USING HELPERS
//         const recipientsRaw = readExcelData(excelFile.path);
//         const recipients = filterValidRecipients(recipientsRaw, emailColumn);
//         const transporter = createTransporter({ smtpServer, smtpPort, emailUser, emailPass, delayBetweenEmails });

//         const jobId = `campaign-${data.id}`;
//         const jobInfo = {
//             id: jobId,
//             total: recipients.length,
//             sentEmails: 0,
//             failedEmails: 0,
//             shouldStop: false,
//             completed: false,
//             startedAt: new Date()
//         };
//         activeSendingJobs.set(jobId, jobInfo);

//         // Start sending (non-blocking — no need to await it unless you want to)
//         sendEmailsJob({
//             jobId,
//             recipients,
//             emailColumn,
//             nameColumn,
//             subjectLine,
//             senderName,
//             templateContent,
//             variables: Array.isArray(variables) ? variables : JSON.parse(variables),
//             transporter,
//             delayBetweenEmails: parseInt(delayBetweenEmails),
//             activeSendingJobs
//         });

//         // ✅ 6. Respond with success
//         res.json({
//             success: true,
//             message: 'Campaign created and emails are being sent',
//             campaign: data,
//             excelPreview
//         });

//     } catch (err) {
//         console.error('Error creating campaign:', err);
//         res.status(500).json({
//             success: false,
//             message: 'Error creating campaign',
//             error: err.message
//         });
//     }
// });

app.post('/campaign', upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'template', maxCount: 1 }
]), async(req, res) => {
    try {
        // if (!req.files || !req.files.excel || (!req.files.template && (!req.body.template || req.body.template.trim() === ''))) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Excel file and either HTML file or pasted template are required'
        //     });
        // }
        


        const excelFile = req.files.excel[0];
        // const templateFile = req.files.template[0];
        const templateFile = req.files && req.files.template && req.files.template[0];




        // 1. Preview Excel data
        const excelPreview = previewExcel(excelFile.path);

        // 2. Extract values from body
        const {
            emailColumn,
            nameColumn,
            subjectLine,
            smtpServer,
            smtpPort,
            emailUser,
            emailPass,
            senderName,
            variables,
            delayBetweenEmails = 2000,
            template: pastedTemplate,
            campaign_name

        } = req.body;
        // Validate SMTP
        await testSMTPConnection({ smtpServer, smtpPort, emailUser, emailPass });

        // 3. Use pasted template or uploaded template file
        // let templateContent = pastedTemplate && pastedTemplate.trim() !== '' ?
        //     pastedTemplate :
        //     templateFile ? parseHtmlTemplate(templateFile.path) : '';
        const safeTemplate = typeof pastedTemplate === 'string' ? pastedTemplate.trim() : '';

let templateContent = safeTemplate !== ''
    ? safeTemplate
    : parseHtmlTemplate(templateFile?.path);

        // 4. Save campaign to Supabase
        const { data, error } = await supabase
            .from('campaigns')
            .insert([{
                excel_path: excelFile.path,
                html_path: templateFile ? templateFile.path : null,
                email_column: emailColumn,
                name_column: nameColumn,
                subject_line: subjectLine,
                smtp_server: smtpServer,
                smtp_port: smtpPort,
                email_user: emailUser,
                email_pass: emailPass,
                sender_name: senderName,
                variables,
                delay_between_emails: parseInt(delayBetweenEmails),
                template: templateContent,
                campaign_name: campaign_name,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // ✅ 5. START EMAIL SENDING IMMEDIATELY USING HELPERS
        const recipientsRaw = readExcelData(excelFile.path);
        const recipients = filterValidRecipients(recipientsRaw, emailColumn);
        const transporter = createTransporter({ smtpServer, smtpPort, emailUser, emailPass, delayBetweenEmails });

        const jobId = `campaign-${data.id}`;
        const jobInfo = {
            id: jobId,
            total: recipients.length,
            sentEmails: 0,
            failedEmails: 0,
            shouldStop: false,
            completed: false,
            startedAt: new Date()
        };
        activeSendingJobs.set(jobId, jobInfo);

        // Start sending (non-blocking — no need to await it unless you want to)
        sendEmailsJob({
            jobId,
            recipients,
            emailColumn,
            nameColumn,
            subjectLine,
            senderName,
            templateContent,
            variables: Array.isArray(variables) ? variables : JSON.parse(variables),
            transporter,
            delayBetweenEmails: parseInt(delayBetweenEmails),
            activeSendingJobs
        });

        // ✅ 6. Respond with success
        res.json({
            success: true,
            message: 'Campaign created and emails are being sent',
            campaign: data,
            excelPreview
        });

    } catch (err) {
        console.error('Error creating campaign:', err);
        res.status(500).json({
            success: false,
            message: 'Error creating campaign',
            error: err.message
        });
    }
});


// Get sending status endpoint
app.get('/send-status/:jobId', (req, res) => {
    const { jobId } = req.params;

    if (!jobId || !activeSendingJobs.has(jobId)) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    const jobData = activeSendingJobs.get(jobId);

    res.json({
        success: true,
        jobId,
        total: jobData.totalEmails,
        sent: jobData.sentEmails,
        failed: jobData.failedEmails,
        completed: !!jobData.completed,
        stopped: !!jobData.stopped,
        error: jobData.error || null,
        startTime: jobData.startTime,
        endTime: jobData.endTime || null
    });
});

// Get all active jobs (for monitoring)
app.get('/jobs', (req, res) => {
    const jobs = [];
    activeSendingJobs.forEach((jobData, jobId) => {
        jobs.push({
            jobId,
            total: jobData.totalEmails,
            sent: jobData.sentEmails,
            failed: jobData.failedEmails,
            completed: !!jobData.completed,
            stopped: !!jobData.stopped,
            startTime: jobData.startTime,
            endTime: jobData.endTime || null
        });
    });

    res.json({
        success: true,
        jobs,
        totalActiveJobs: jobs.filter(job => !job.completed && !job.stopped).length
    });
});

// Clean up old files endpoint (optional maintenance)
app.post('/cleanup', (req, res) => {
    try {
        const directories = ['uploads/excel', 'uploads/html'];
        let cleanedFiles = 0;

        directories.forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const now = Date.now();
                const oneHourAgo = now - (60 * 60 * 1000); // 1 hour ago

                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);

                    if (stats.mtime.getTime() < oneHourAgo) {
                        fs.unlinkSync(filePath);
                        cleanedFiles++;
                    }
                });
            }
        });

        res.json({
            success: true,
            message: `Cleaned up ${cleanedFiles} old files`
        });
    } catch (err) {
        console.error('Cleanup error:', err);
        res.status(500).json({
            success: false,
            message: 'Error during cleanup',
            error: err.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');

    // Stop all active sending jobs
    activeSendingJobs.forEach((jobData, jobId) => {
        if (!jobData.completed && !jobData.stopped) {
            jobData.shouldStop = true;
            console.log(`Stopping job ${jobId} due to server shutdown`);
        }
    });

    // Give some time for jobs to stop gracefully
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');

    // Stop all active sending jobs
    activeSendingJobs.forEach((jobData, jobId) => {
        if (!jobData.completed && !jobData.stopped) {
            jobData.shouldStop = true;
            console.log(`Stopping job ${jobId} due to server shutdown`);
        }
    });

    // Give some time for jobs to stop gracefully
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Email Marketing Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directories: ${dirs.join(', ')}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Create sample .env file if it doesn't exist
    if (!fs.existsSync('.env')) {
        const sampleEnv = `# Email Marketing Tool Environment Variables
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Optional: Default SMTP settings (can be overridden in UI)
# DEFAULT_SMTP_HOST=smtp.gmail.com
# DEFAULT_SMTP_PORT=587
# DEFAULT_EMAIL_USER=your-email@gmail.com
# DEFAULT_EMAIL_PASS=your-app-password
`;
        fs.writeFileSync('.env', sampleEnv);
        console.log('📝 Created sample .env file');
    }
});