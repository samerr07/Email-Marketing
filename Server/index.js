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
const campaignScheduler = require('./services/schedulerservice');


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
app.use(express.urlencoded({ extended: true }));

// Global variable to track active sending processes
const activeSendingJobs = new Map();

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/excel', 'uploads/html','uploads/images'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const dest = file.fieldname === 'excel' ? 'uploads/excel/' : 'uploads/html/';
//         cb(null, dest);
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

campaignScheduler.setActiveSendingJobs(activeSendingJobs);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest;
        if (file.fieldname === 'excel') {
            dest = 'uploads/excel/';
        } else if (file.fieldname === 'template') {
            dest = 'uploads/html/';
        } else if (file.fieldname === 'image') {
            dest = 'uploads/images/';
        } else {
            dest = 'uploads/'; // fallback directory
        }
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
        } else if (file.fieldname === 'image') {
            if (file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        } else {
            cb(new Error('Invalid field name. Allowed fields: excel, template, image'), false);
        }
    }
});

// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 10 * 1024 * 1024 // 10MB limit
//     },
//     fileFilter: (req, file, cb) => {
//         if (file.fieldname === 'excel') {
//             if (file.mimetype.includes('spreadsheet') || file.originalname.match(/\.(xlsx|xls)$/)) {
//                 cb(null, true);
//             } else {
//                 cb(new Error('Only Excel files are allowed'), false);
//             }
//         } else if (file.fieldname === 'template') {
//             if (file.mimetype === 'text/html' || file.originalname.match(/\.(html|htm)$/)) {
//                 cb(null, true);
//             } else {
//                 cb(new Error('Only HTML files are allowed'), false);
//             }
//         } else {
//             cb(new Error('Invalid field name'), false);
//         }
//     }
// });


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






app.post('/campaign', upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'template', maxCount: 1 }
]), async(req, res) => {
    try {
        // Check if Excel file exists
        if (!req.files || !req.files.excel || !req.files.excel[0]) {
            return res.status(400).json({
                success: false,
                message: 'Excel file is required'
            });
        }

        const excelFile = req.files.excel[0];
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
            templateContent, // Use templateContent instead of template
            campaign_name
        } = req.body;
        console.log('Received body:', req.body);

        // Validate required fields
        if (!emailColumn || !subjectLine || !smtpServer || !emailUser || !emailPass) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: emailColumn, subjectLine, smtpServer, emailUser, emailPass'
            });
        }

        // Validate SMTP
        await testSMTPConnection({ smtpServer, smtpPort, emailUser, emailPass });

        // 3. Use template content or uploaded template file
        let finalTemplateContent = '';
        
        if (templateContent && typeof templateContent === 'string' && templateContent.trim() !== '') {
            finalTemplateContent = templateContent.trim();
        } else if (templateFile && templateFile.path) {
            finalTemplateContent = parseHtmlTemplate(templateFile.path);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either template content or template file is required'
            });
        }

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
                template: finalTemplateContent,
                campaign_name: campaign_name,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // 5. START EMAIL SENDING IMMEDIATELY USING HELPERS
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

        // Start sending (non-blocking)
        sendEmailsJob({
            jobId,
            recipients,
            emailColumn,
            nameColumn,
            subjectLine,
            senderName,
            templateContent: finalTemplateContent,
            variables: Array.isArray(variables) ? variables : JSON.parse(variables || '[]'),
            transporter,
            delayBetweenEmails: parseInt(delayBetweenEmails),
            activeSendingJobs,
             uploadsPath: './uploads/images/' // Add this for CID support
        });

        // 6. Respond with success
        res.json({
            success: true,
            message: 'Campaign created and emails are being sent',
            jobId: jobId,
            total: recipients.length,
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

app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        const imageUrl = `/uploads/images/${req.file.filename}`;
        res.json({
            success: true,
            imageUrl: imageUrl,
            originalName: req.file.originalname,
            filename: req.file.filename, // Include filename for CID reference
            cidName: req.file.filename.split('.')[0] // CID name without extension
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

app.delete('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // if (!id || isNaN(parseInt(id))) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Valid campaign ID is required'
        //     });
        // }

        // First, check if campaign exists and get file paths for cleanup
        const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('id, excel_path, html_path, status')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }
            throw fetchError;
        }

        // Check if campaign is currently running
        if (campaign.status === 'sending') {
            // Stop the sending job if it's running
            const jobId = `campaign-${id}`;
            if (activeSendingJobs.has(jobId)) {
                const jobInfo = activeSendingJobs.get(jobId);
                jobInfo.shouldStop = true;
                activeSendingJobs.delete(jobId);
            }
        }

        // Delete the campaign from database
        const { error: deleteError } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        // Clean up files if they exist
        const fs = require('fs');
        const path = require('path');

        if (campaign.excel_path && fs.existsSync(campaign.excel_path)) {
            try {
                fs.unlinkSync(campaign.excel_path);
                console.log(`Deleted Excel file: ${campaign.excel_path}`);
            } catch (fileError) {
                console.warn(`Could not delete Excel file: ${campaign.excel_path}`, fileError.message);
            }
        }

        if (campaign.html_path && fs.existsSync(campaign.html_path)) {
            try {
                fs.unlinkSync(campaign.html_path);
                console.log(`Deleted HTML file: ${campaign.html_path}`);
            } catch (fileError) {
                console.warn(`Could not delete HTML file: ${campaign.html_path}`, fileError.message);
            }
        }

        res.json({
            success: true,
            message: 'Campaign deleted successfully',
            deletedId: parseInt(id)
        });

    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting campaign',
            error: error.message
        });
    }
});

// app.post('/upload-image', upload.single('image'), (req, res) => {
//     try {
//         const imageUrl = `/uploads/images/${req.file.filename}`;
//         res.json({
//             success: true,
//             imageUrl: imageUrl,
//             originalName: req.file.originalname
//         });
//     } catch (error) {
//         res.json({
//             success: false,
//             message: error.message
//         });
//     }
// });

app.get('/get_campaigns', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message
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


app.post('/campaigns/:id/schedule', async (req, res) => {
    try {
        const { id } = req.params;
        const { schedulePattern, timezone = 'Asia/Kolkata' } = req.body;

        if (!schedulePattern) {
            return res.status(400).json({
                success: false,
                message: 'Schedule pattern is required'
            });
        }

        // Validate cron pattern
        const validation = campaignScheduler.validateCronPattern(schedulePattern);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cron pattern',
                error: validation.error
            });
        }

        // Get campaign from database
        const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Update campaign with schedule info
        const { error: updateError } = await supabase
            .from('campaigns')
            .update({
                is_scheduled: true,
                schedule_pattern: schedulePattern,
                status: 'scheduled',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Schedule the campaign
        const updatedCampaign = { ...campaign, schedule_pattern: schedulePattern, is_scheduled: true };
        await campaignScheduler.scheduleCampaign(updatedCampaign);

        res.json({
            success: true,
            message: 'Campaign scheduled successfully',
            schedule: {
                pattern: schedulePattern,
                timezone: timezone
            }
        });

    } catch (error) {
        console.error('Error scheduling campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error scheduling campaign',
            error: error.message
        });
    }
});

// Unschedule a campaign
app.delete('/campaigns/:id/schedule', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)


        await campaignScheduler.unscheduleCampaign(id);

        res.json({
            success: true,
            message: 'Campaign unscheduled successfully'
        });

    } catch (error) {
        console.error('Error unscheduling campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error unscheduling campaign',
            error: error.message
        });
    }
});

// Get campaign schedule status
app.get('/campaigns/:id/schedule', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: campaign, error } = await supabase
            .from('campaigns')
            .select('is_scheduled, schedule_pattern, last_executed, execution_count, last_error, status')
            .eq('id', id)
            .single();

        if (error || !campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const scheduleStatus = campaignScheduler.getScheduleStatus(id);

        res.json({
            success: true,
            schedule: {
                isScheduled: campaign.is_scheduled,
                pattern: campaign.schedule_pattern,
                lastExecuted: campaign.last_executed,
                executionCount: campaign.execution_count,
                lastError: campaign.last_error,
                status: campaign.status,
                jobActive: scheduleStatus.jobExists
            }
        });

    } catch (error) {
        console.error('Error getting schedule status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting schedule status',
            error: error.message
        });
    }
});

// Get all scheduled campaigns
app.get('/campaigns/scheduled', async (req, res) => {
    try {
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('is_scheduled', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const scheduledCampaigns = campaigns.map(campaign => ({
            ...campaign,
            jobActive: campaignScheduler.getScheduleStatus(campaign.id).jobExists
        }));

        res.json({
            success: true,
            campaigns: scheduledCampaigns
        });

    } catch (error) {
        console.error('Error getting scheduled campaigns:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting scheduled campaigns',
            error: error.message
        });
    }
});

// Validate cron pattern
app.post('/validate-cron', (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern) {
            return res.status(400).json({
                success: false,
                message: 'Cron pattern is required'
            });
        }

        const validation = campaignScheduler.validateCronPattern(pattern);
        
        if (validation.valid) {
            const nextExecutions = campaignScheduler.getNextExecutions(pattern);
            
            res.json({
                success: true,
                valid: true,
                pattern: pattern,
                nextExecutions: nextExecutions.executions || []
            });
        } else {
            res.json({
                success: false,
                valid: false,
                error: validation.error
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating cron pattern',
            error: error.message
        });
    }
});

// Get predefined schedule patterns
app.get('/schedule-patterns', (req, res) => {
    const { SchedulePatterns } = require('./services/schedulerservice');
    
    const patterns = {
        testing: {
            'Every Minute': SchedulePatterns.EVERY_MINUTE,
        },
        hourly: {
            'Every Hour': SchedulePatterns.EVERY_HOUR,
            'Every 2 Hours': SchedulePatterns.EVERY_2_HOURS,
            'Every 6 Hours': SchedulePatterns.EVERY_6_HOURS,
            'Every 12 Hours': SchedulePatterns.EVERY_12_HOURS,
        },
        daily: {
            'Daily at 9 AM': SchedulePatterns.DAILY_9AM,
            'Daily at 6 PM': SchedulePatterns.DAILY_6PM,
            'Daily at Midnight': SchedulePatterns.DAILY_MIDNIGHT,
        },
        weekly: {
            'Weekly Monday 9 AM': SchedulePatterns.WEEKLY_MONDAY_9AM,
            'Weekly Friday 5 PM': SchedulePatterns.WEEKLY_FRIDAY_5PM,
        },
        monthly: {
            'Monthly 1st at 9 AM': SchedulePatterns.MONTHLY_FIRST_9AM,
            'Monthly 15th at 6 PM': SchedulePatterns.MONTHLY_15TH_6PM,
        }
    };

    res.json({
        success: true,
        patterns: patterns,
        info: {
            format: 'minute hour day month dayOfWeek',
            examples: {
                '0 9 * * *': 'Every day at 9:00 AM',
                '0 */2 * * *': 'Every 2 hours',
                '0 9 * * 1': 'Every Monday at 9:00 AM',
                '0 18 1 * *': 'First day of every month at 6:00 PM'
            }
        }
    });
});

// Trigger immediate execution of a scheduled campaign (for testing)
app.post('/campaigns/:id/execute-now', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: campaign, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (!campaign.is_scheduled) {
            return res.status(400).json({
                success: false,
                message: 'Campaign is not scheduled'
            });
        }

        // Execute the campaign immediately
        await campaignScheduler.executeCampaign(campaign);

        res.json({
            success: true,
            message: 'Campaign execution triggered',
            campaignName: campaign.campaign_name
        });

    } catch (error) {
        console.error('Error executing campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error executing campaign',
            error: error.message
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
     campaignScheduler.cleanup();

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
     campaignScheduler.cleanup();

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