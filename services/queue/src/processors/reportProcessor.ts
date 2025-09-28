import { Job, Worker } from 'bullmq';
import PDFDocument from 'pdfkit';
import { promises as fs } from 'fs';
import path from 'path';
import { ReportJobData, ReportResult, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class ReportProcessor {
  private readonly worker: Worker<ReportJobData, ReportResult>;

  constructor(config: QueueConfig) {
    this.worker = new Worker<ReportJobData, ReportResult>(
      'report-generation',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: parseInt(process.env.REPORT_PROCESSOR_CONCURRENCY || '2', 10),
        limiter: {
          max: 10,
          duration: 60000, // 10 reports per minute
        },
      }
    );

    this.worker.on('completed', (job: Job<ReportJobData, ReportResult>) => {
      logger.info(`Report generation job ${job.id || 'unknown'} completed successfully`);
    });

    this.worker.on('failed', (job: Job<ReportJobData, ReportResult> | undefined, error: Error) => {
      logger.error(`Report generation job ${job?.id || 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Report processor worker error:', error);
    });
  }

  private async processJob(job: Job<ReportJobData, ReportResult>): Promise<ReportResult> {
    const startTime = Date.now();

    try {
      logger.info(`Processing report job ${job.id || 'unknown'} for user ${job.data.userId}`);

      await job.updateProgress(10);

      let reportBuffer: Buffer;
      let filename: string;

      switch (job.data.reportType) {
        case 'pdf':
          reportBuffer = await this.generatePDFReport(job.data, job);
          filename = `report_${job.data.userId}_${Date.now()}.pdf`;
          break;
        case 'excel':
          reportBuffer = await this.generateExcelReport(job.data, job);
          filename = `report_${job.data.userId}_${Date.now()}.xlsx`;
          break;
        case 'csv':
          reportBuffer = await this.generateCSVReport(job.data, job);
          filename = `report_${job.data.userId}_${Date.now()}.csv`;
          break;
        default:
          throw new Error(`Unsupported report type: ${job.data.reportType}`);
      }

      await job.updateProgress(90);

      // Upload report to storage
      const reportUrl = await this.uploadReport(reportBuffer, filename);

      await job.updateProgress(100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          reportUrl,
          fileSize: reportBuffer.length,
          generatedAt: new Date(),
        },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Report generation failed for job ${job.id || 'unknown'}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
      };
    }
  }

  private async generatePDFReport(
    data: ReportJobData,
    job: Job<ReportJobData, ReportResult>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: data.format?.pageSize || 'A4',
          layout: data.format?.orientation || 'portrait',
          margins: data.format?.margins || { top: 50, left: 50, bottom: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', (error: Error) => {
          reject(error);
        });

        // Generate PDF content
        this.generatePDFContent(doc, data, job);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generatePDFContent(
    doc: PDFKit.PDFDocument,
    data: ReportJobData,
    job: Job<ReportJobData, ReportResult>
  ): Promise<void> {
    // Header
    doc.fontSize(20).text('FocusFlow Report', { align: 'center' });
    doc.moveDown();

    await job.updateProgress(30);

    // Report metadata
    doc.fontSize(12);
    doc.text(`Report Type: ${data.reportType.toUpperCase()}`);
    doc.text(`Template: ${data.template}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.text(`User ID: ${data.userId}`);
    doc.moveDown();

    await job.updateProgress(50);

    // Filters (if any)
    if (data.filters && Object.keys(data.filters).length > 0) {
      doc.fontSize(14).text('Applied Filters:', { underline: true });
      doc.fontSize(10);
      Object.entries(data.filters).forEach(([key, value]) => {
        doc.text(`${key}: ${String(value)}`);
      });
      doc.moveDown();
    }

    await job.updateProgress(70);

    // Data content
    doc.fontSize(14).text('Report Data:', { underline: true });
    doc.fontSize(10);

    if (Array.isArray(data.data)) {
      // Handle array data (table-like)
      data.data.forEach((item, index) => {
        doc.text(`Row ${index + 1}:`);
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            doc.text(`  ${key}: ${String(value)}`);
          });
        } else {
          doc.text(`  ${String(item)}`);
        }
        doc.moveDown(0.5);
      });
    } else if (typeof data.data === 'object' && data.data !== null) {
      // Handle object data
      Object.entries(data.data).forEach(([key, value]) => {
        doc.text(`${key}: ${String(value)}`);
      });
    } else {
      doc.text(String(data.data));
    }

    // Footer
    doc.fontSize(8).text(
      'Generated by FocusFlow Queue System',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  private async generateExcelReport(
    data: ReportJobData,
    job: Job<ReportJobData, ReportResult>
  ): Promise<Buffer> {
    await job.updateProgress(30);

    // Simulate Excel generation (would use a library like ExcelJS in real implementation)
    const csvContent = await this.generateCSVContent(data);

    await job.updateProgress(70);

    // For now, return CSV content as Excel is more complex to implement
    // In a real implementation, you would use ExcelJS or similar
    return Buffer.from(csvContent, 'utf-8');
  }

  private async generateCSVReport(
    data: ReportJobData,
    job: Job<ReportJobData, ReportResult>
  ): Promise<Buffer> {
    await job.updateProgress(30);

    const csvContent = await this.generateCSVContent(data);

    await job.updateProgress(70);

    return Buffer.from(csvContent, 'utf-8');
  }

  private async generateCSVContent(data: ReportJobData): Promise<string> {
    const lines: string[] = [];

    // Add header information
    lines.push('# FocusFlow Report');
    lines.push(`# Template: ${data.template}`);
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push(`# User ID: ${data.userId}`);
    lines.push('');

    // Add filters if any
    if (data.filters && Object.keys(data.filters).length > 0) {
      lines.push('# Filters');
      Object.entries(data.filters).forEach(([key, value]) => {
        lines.push(`# ${key}: ${String(value)}`);
      });
      lines.push('');
    }

    // Add data
    if (Array.isArray(data.data) && data.data.length > 0) {
      const firstItem = data.data[0];

      if (typeof firstItem === 'object' && firstItem !== null) {
        // Generate CSV header
        const headers = Object.keys(firstItem);
        lines.push(headers.map(header => this.escapeCsvValue(header)).join(','));

        // Generate CSV rows
        data.data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const row = headers.map(header => {
              const value = (item as Record<string, unknown>)[header];
              return this.escapeCsvValue(String(value ?? ''));
            });
            lines.push(row.join(','));
          }
        });
      } else {
        // Simple array data
        lines.push('Value');
        data.data.forEach(item => {
          lines.push(this.escapeCsvValue(String(item)));
        });
      }
    } else if (typeof data.data === 'object' && data.data !== null) {
      // Object data
      lines.push('Key,Value');
      Object.entries(data.data).forEach(([key, value]) => {
        lines.push(`${this.escapeCsvValue(key)},${this.escapeCsvValue(String(value))}`);
      });
    } else {
      // Simple data
      lines.push('Data');
      lines.push(this.escapeCsvValue(String(data.data)));
    }

    return lines.join('\n');
  }

  private escapeCsvValue(value: string): string {
    // Escape CSV values that contain commas, quotes, or newlines
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private async uploadReport(buffer: Buffer, filename: string): Promise<string> {
    try {
      // Simulate upload to storage service
      // In real implementation, this would upload to S3, GCS, or similar
      const reportsDir = path.join(process.cwd(), 'reports');

      // Ensure reports directory exists
      await fs.mkdir(reportsDir, { recursive: true });

      const filePath = path.join(reportsDir, filename);
      await fs.writeFile(filePath, buffer);

      // Return mock URL
      const mockUrl = `https://storage.focusflow.com/reports/${filename}`;

      logger.info(`Report uploaded to: ${mockUrl}`);
      return mockUrl;
    } catch (error) {
      throw new Error(`Failed to upload report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportTemplates(): Promise<string[]> {
    try {
      const templatesDir = path.join(process.cwd(), 'templates', 'reports');
      const files = await fs.readdir(templatesDir);
      return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
    } catch (error) {
      logger.warn('Could not load report templates:', error);
      return ['default', 'summary', 'detailed'];
    }
  }

  async close(): Promise<void> {
    await this.worker.close();
    logger.info('Report processor worker closed');
  }

  getWorker(): Worker<ReportJobData, ReportResult> {
    return this.worker;
  }
}