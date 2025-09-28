import { Job, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { EmailJobData, EmailResult, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class EmailProcessor {
  private readonly worker: Worker<EmailJobData, EmailResult>;
  private readonly transporter: nodemailer.Transporter;
  private readonly templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(config: QueueConfig) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    this.worker = new Worker<EmailJobData, EmailResult>(
      'email-notification',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: parseInt(process.env.EMAIL_PROCESSOR_CONCURRENCY || '5', 10),
        limiter: {
          max: 50,
          duration: 60000, // 50 emails per minute
        },
      }
    );

    this.worker.on('completed', (job: Job<EmailJobData, EmailResult>) => {
      logger.info(`Email job ${job.id || 'unknown'} completed successfully`);
    });

    this.worker.on('failed', (job: Job<EmailJobData, EmailResult> | undefined, error: Error) => {
      logger.error(`Email job ${job?.id || 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Email processor worker error:', error);
    });

    // Verify SMTP connection
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
    } catch (error) {
      logger.error('SMTP connection verification failed:', error);
    }
  }

  private async processJob(job: Job<EmailJobData, EmailResult>): Promise<EmailResult> {
    const startTime = Date.now();

    try {
      logger.info(`Processing email job ${job.id || 'unknown'} for template: ${job.data.template}`);

      await job.updateProgress(20);

      // Load and compile template
      const template = await this.getTemplate(job.data.template);
      const htmlContent = template(job.data.variables);

      await job.updateProgress(50);

      // Prepare email options
      const recipients = Array.isArray(job.data.to) ? job.data.to : [job.data.to];
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.SMTP_FROM || 'noreply@focusflow.com',
        to: recipients.join(', '),
        cc: job.data.cc ? (Array.isArray(job.data.cc) ? job.data.cc.join(', ') : job.data.cc) : undefined,
        bcc: job.data.bcc ? (Array.isArray(job.data.bcc) ? job.data.bcc.join(', ') : job.data.bcc) : undefined,
        subject: this.extractSubjectFromTemplate(htmlContent) || 'Notification from FocusFlow',
        html: htmlContent,
        priority: this.mapPriority(job.data.priority),
        attachments: job.data.attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          path: attachment.path,
          contentType: attachment.contentType,
        })),
      };

      await job.updateProgress(80);

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      await job.updateProgress(100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          messageId: info.messageId,
          recipients,
          sentAt: new Date(),
        },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Email processing failed for job ${job.id || 'unknown'}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
      };
    }
  }

  private async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      const cached = this.templateCache.get(templateName);
      if (cached) {
        return cached;
      }
    }

    try {
      // Load template from file system
      const templatePath = path.join(process.cwd(), 'templates', 'email', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Compile template
      const compiledTemplate = handlebars.compile(templateContent);

      // Cache the compiled template
      this.templateCache.set(templateName, compiledTemplate);

      return compiledTemplate;
    } catch (error) {
      logger.error(`Failed to load email template ${templateName}:`, error);

      // Fallback to basic template
      const fallbackTemplate = handlebars.compile(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>{{subject}}</title>
          </head>
          <body>
            <h2>{{subject}}</h2>
            <p>{{message}}</p>
            {{#if link}}
            <p><a href="{{link}}">{{linkText}}</a></p>
            {{/if}}
            <p>Best regards,<br>FocusFlow Team</p>
          </body>
        </html>
      `);

      this.templateCache.set(templateName, fallbackTemplate);
      return fallbackTemplate;
    }
  }

  private extractSubjectFromTemplate(htmlContent: string): string | null {
    // Try to extract subject from HTML title tag
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    // Try to extract from first h1 tag
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }

    return null;
  }

  private mapPriority(priority?: 'low' | 'normal' | 'high'): 'low' | 'normal' | 'high' {
    switch (priority) {
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const testMailOptions: nodemailer.SendMailOptions = {
        from: process.env.SMTP_FROM || 'noreply@focusflow.com',
        to,
        subject: 'Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify the email service is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
      };

      const info = await this.transporter.sendMail(testMailOptions);
      logger.info(`Test email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send test email:', error);
      return false;
    }
  }

  async getEmailStats(): Promise<{
    poolSize: number;
    queueSize: number;
    isIdle: boolean;
  }> {
    return {
      poolSize: this.transporter.getMaxListeners(),
      queueSize: 0, // Nodemailer doesn't expose queue size
      isIdle: this.transporter.isIdle(),
    };
  }

  async close(): Promise<void> {
    this.transporter.close();
    await this.worker.close();
    logger.info('Email processor worker closed');
  }

  getWorker(): Worker<EmailJobData, EmailResult> {
    return this.worker;
  }
}