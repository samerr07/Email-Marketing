// services/schedulerservice.js
const cron = require('node-cron');
const supabase = require('../config/supabase_client');
const {
    readExcelData,
    getTemplateContent,
    filterValidRecipients,
    createTransporter,
    sendEmailsJob
} = require('./emailhelper');

class CampaignScheduler {
    constructor() {
        this.scheduledJobs = new Map(); // Store active cron jobs
        this.activeSendingJobs = null; // Will be set from main app
        this.init();
    }

    // Initialize scheduler - load existing scheduled campaigns
    async init() {
        try {
            console.log('Initializing Campaign Scheduler...');
            await this.loadScheduledCampaigns();
            console.log('Campaign Scheduler initialized successfully');
        } catch (error) {
            console.error('Error initializing scheduler:', error);
        }
    }

    // Set reference to active sending jobs from main app
    setActiveSendingJobs(activeSendingJobs) {
        this.activeSendingJobs = activeSendingJobs;
    }

    // Load and schedule existing campaigns from database
    async loadScheduledCampaigns() {
        try {
            const { data: campaigns, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('is_scheduled', true)
                .eq('status', 'scheduled');

            if (error) throw error;

            for (const campaign of campaigns) {
                if (campaign.schedule_pattern) {
                    await this.scheduleCampaign(campaign);
                }
            }

            console.log(`Loaded ${campaigns.length} scheduled campaigns`);
        } catch (error) {
            console.error('Error loading scheduled campaigns:', error);
        }
    }

    // Schedule a campaign
    async scheduleCampaign(campaign) {
        try {
            const { id, schedule_pattern, campaign_name } = campaign;
            
            if (this.scheduledJobs.has(id)) {
                // If already scheduled, destroy existing job first
                this.scheduledJobs.get(id).destroy();
            }

            // Create cron job
            const job = cron.schedule(schedule_pattern, async () => {
                console.log(`Executing scheduled campaign: ${campaign_name} (ID: ${id})`);
                await this.executeCampaign(campaign);
            }, {
                scheduled: true,
                timezone: "Asia/Kolkata" // Adjust timezone as needed
            });

            this.scheduledJobs.set(id, job);
            
            // Update campaign status in database
            await supabase
                .from('campaigns')
                .update({ status: 'scheduled' })
                .eq('id', id);

            console.log(`Campaign ${campaign_name} scheduled with pattern: ${schedule_pattern}`);
            return { success: true, message: 'Campaign scheduled successfully' };

        } catch (error) {
            console.error('Error scheduling campaign:', error);
            throw error;
        }
    }

    // Execute a scheduled campaign
    async executeCampaign(campaign) {
        try {
            const {
                id,
                excel_path,
                email_column,
                name_column,
                subject_line,
                smtp_server,
                smtp_port,
                email_user,
                email_pass,
                sender_name,
                variables,
                delay_between_emails,
                template,
                campaign_name
            } = campaign;

            console.log(`Starting scheduled execution of campaign: ${campaign_name}`);

            // Update campaign status to sending
            await supabase
                .from('campaigns')
                .update({ 
                    status: 'sending',
                    last_executed: new Date().toISOString()
                })
                .eq('id', id);

            // Read Excel data and filter recipients
            const recipientsRaw = readExcelData(excel_path);
            const recipients = filterValidRecipients(recipientsRaw, email_column);

            if (recipients.length === 0) {
                console.log(`No valid recipients found for campaign: ${campaign_name}`);
                await supabase
                    .from('campaigns')
                    .update({ status: 'scheduled' })
                    .eq('id', id);
                return;
            }

            // Create transporter
            const transporter = createTransporter({
                smtpServer: smtp_server,
                smtpPort: smtp_port,
                emailUser: email_user,
                emailPass: email_pass,
                delayBetweenEmails: delay_between_emails
            });

            // Create job info
            const jobId = `scheduled-campaign-${id}-${Date.now()}`;
            const jobInfo = {
                id: jobId,
                campaignId: id,
                total: recipients.length,
                sentEmails: 0,
                failedEmails: 0,
                shouldStop: false,
                completed: false,
                startedAt: new Date(),
                isScheduled: true
            };

            this.activeSendingJobs.set(jobId, jobInfo);

            // Start sending emails
            sendEmailsJob({
                jobId,
                recipients,
                emailColumn: email_column,
                nameColumn: name_column,
                subjectLine: subject_line,
                senderName: sender_name,
                templateContent: template,
                variables: Array.isArray(variables) ? variables : JSON.parse(variables || '[]'),
                transporter,
                delayBetweenEmails: parseInt(delay_between_emails),
                activeSendingJobs: this.activeSendingJobs,
                uploadsPath: './uploads/images/'
            }).then(async () => {
                // Update campaign status back to scheduled after completion
                await supabase
                    .from('campaigns')
                    .update({ 
                        status: 'scheduled',
                        execution_count: campaign.execution_count + 1
                    })
                    .eq('id', id);
                
                console.log(`Scheduled campaign ${campaign_name} completed successfully`);
            }).catch(async (error) => {
                console.error(`Error in scheduled campaign ${campaign_name}:`, error);
                await supabase
                    .from('campaigns')
                    .update({ 
                        status: 'scheduled',
                        last_error: error.message
                    })
                    .eq('id', id);
            });

        } catch (error) {
            console.error('Error executing scheduled campaign:', error);
            
            // Update campaign status back to scheduled on error
            await supabase
                .from('campaigns')
                .update({ 
                    status: 'scheduled',
                    last_error: error.message
                })
                .eq('id', campaign.id);
        }
    }

    // Unschedule a campaign
    async unscheduleCampaign(campaignId) {
        try {
            // const numCampaignId = parseInt(campaignId);
            
            // if (isNaN(numCampaignId)) {
            //     throw new Error('Invalid campaign ID');
            // }

            // First, pause any active jobs
            // await this.pauseCampaign(numCampaignId);
             if (!campaignId || typeof campaignId !== 'string' || campaignId.trim() === '') {
            throw new Error(`Invalid campaign ID: ${campaignId}`);
        }
            if (this.scheduledJobs.has(campaignId)) {
                this.scheduledJobs.get(campaignId).destroy();
                this.scheduledJobs.delete(campaignId);
                 console.log(`Stopped scheduled job for campaign: ${campaignId}`);
            }

            // Update database
            await supabase
                .from('campaigns')
                .update({ 
                    is_scheduled: false,
                    status: 'draft',
                    schedule_pattern: null
                })
                .eq('id', campaignId);

            console.log(`Campaign ${campaignId} unscheduled`);
            return { success: true, message: 'Campaign unscheduled successfully' };

        } catch (error) {
            console.error('Error unscheduling campaign:', error);
            throw error;
        }
    }

     async pauseCampaign(campaignId) {
        try {
            const numCampaignId = parseInt(campaignId);
            
            // if (isNaN(numCampaignId)) {
            //     throw new Error('Invalid campaign ID');
            // }

            // Find and stop any active sending jobs for this campaign
            let jobsStopped = 0;
            for (const [jobId, jobInfo] of this.activeSendingJobs.entries()) {
                if (jobInfo.campaignId === numCampaignId) {
                    jobInfo.shouldStop = true;
                    jobsStopped++;
                    console.log(`Stopping active job ${jobId} for campaign ${numCampaignId}`);
                }
            }

            // Update campaign status to paused
            await supabase
                .from('campaigns')
                .update({ 
                    status: 'paused'
                })
                .eq('id', numCampaignId);

            console.log(`Campaign ${numCampaignId} paused. Stopped ${jobsStopped} active jobs.`);
            
            return { 
                success: true, 
                message: `Campaign paused successfully. Stopped ${jobsStopped} active jobs.`,
                jobsStopped 
            };

        } catch (error) {
            console.error('Error pausing campaign:', error);
            throw error;
        }
    }
    // async unscheduleCampaign(campaignId) {
    //     try {
    //         const numCampaignId = parseInt(campaignId);
    //         console.log(campaignId)
            
    //         if (isNaN(numCampaignId)) {
    //             throw new Error('Invalid campaign ID');
    //         }

    //         // First, pause any active jobs
    //         await this.pauseCampaign(numCampaignId);

    //         // Remove from scheduled jobs
    //         if (this.scheduledJobs.has(numCampaignId)) {
    //             this.scheduledJobs.get(numCampaignId).destroy();
    //             this.scheduledJobs.delete(numCampaignId);
    //         }

    //         // Update database
    //         await supabase
    //             .from('campaigns')
    //             .update({ 
    //                 is_scheduled: false,
    //                 status: 'draft',
    //                 schedule_pattern: null
    //             })
    //             .eq('id', numCampaignId);

    //         console.log(`Campaign ${numCampaignId} unscheduled`);
    //         return { success: true, message: 'Campaign unscheduled successfully' };

    //     } catch (error) {
    //         console.error('Error unscheduling campaign:', error);
    //         throw error;
    //     }
    // }


    // Get schedule status
    getScheduleStatus(campaignId) {
        return {
            isScheduled: this.scheduledJobs.has(campaignId),
            jobExists: this.scheduledJobs.has(campaignId)
        };
    }

    // Get all scheduled campaigns
    getScheduledCampaigns() {
        return Array.from(this.scheduledJobs.keys());
    }

    // Validate cron pattern
    validateCronPattern(pattern) {
        try {
            const isValid = cron.validate(pattern);
            return { valid: isValid };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Get next execution times for a cron pattern
    getNextExecutions(pattern, count = 5) {
        try {
            const task = cron.schedule(pattern, () => {}, { scheduled: false });
            const executions = [];
            
            // This is a simplified approach - in production, you might want to use a proper cron parser
            return { success: true, executions: [`Next execution based on pattern: ${pattern}`] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Cleanup - destroy all scheduled jobs
    cleanup() {
        console.log('Cleaning up scheduled jobs...');
        for (const [id, job] of this.scheduledJobs) {
            job.destroy();
        }
        this.scheduledJobs.clear();
        console.log('All scheduled jobs cleaned up');
    }
}

// Export singleton instance
const campaignScheduler = new CampaignScheduler();
module.exports = campaignScheduler;

// Additional helper functions for common schedule patterns
const SchedulePatterns = {
    // Every minute (for testing)
    EVERY_MINUTE: '* * * * *',
    
    // Hourly
    EVERY_HOUR: '0 * * * *',
    EVERY_2_HOURS: '0 */2 * * *',
    EVERY_6_HOURS: '0 */6 * * *',
    EVERY_12_HOURS: '0 */12 * * *',
    
    // Daily
    DAILY_9AM: '0 9 * * *',
    DAILY_6PM: '0 18 * * *',
    DAILY_MIDNIGHT: '0 0 * * *',
    
    // Weekly
    WEEKLY_MONDAY_9AM: '0 9 * * 1',
    WEEKLY_FRIDAY_5PM: '0 17 * * 5',
    
    // Monthly
    MONTHLY_FIRST_9AM: '0 9 1 * *',
    MONTHLY_15TH_6PM: '0 18 15 * *'
};

module.exports.SchedulePatterns = SchedulePatterns;