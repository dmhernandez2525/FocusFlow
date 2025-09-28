import { Job } from 'bullmq';
import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { UUID } from '@focusflow/types';

interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'noreply@focusflow.com';

if (!sendgridApiKey) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(sendgridApiKey);

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  if (templateCache.has(templateName)) {
    const cached = templateCache.get(templateName);
    if (cached) return cached;
  }

  const templatePath = join(process.cwd(), 'templates', `${templateName}.hbs`);
  const templateSource = readFileSync(templatePath, 'utf-8');
  const compiled = handlebars.compile(templateSource);

  templateCache.set(templateName, compiled);
  return compiled;
}

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, template, data, attachments } = job.data;

  try {
    const compiledTemplate = loadTemplate(template);
    const html = compiledTemplate(data);

    const msg: sgMail.MailDataRequired = {
      to,
      from: fromEmail,
      subject,
      html,
      attachments,
    };

    await sgMail.send(msg);

    await job.updateProgress(100);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}