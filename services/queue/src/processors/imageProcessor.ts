import { Job, Worker } from 'bullmq';
import sharp from 'sharp';
import axios from 'axios';
import { ImageProcessingJobData, ImageProcessingResult, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class ImageProcessor {
  private readonly worker: Worker<ImageProcessingJobData, ImageProcessingResult>;

  constructor(config: QueueConfig) {
    this.worker = new Worker<ImageProcessingJobData, ImageProcessingResult>(
      'image-processing',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: parseInt(process.env.IMAGE_PROCESSOR_CONCURRENCY || '2', 10),
        limiter: {
          max: 10,
          duration: 60000, // 10 jobs per minute
        },
      }
    );

    this.worker.on('completed', (job: Job<ImageProcessingJobData, ImageProcessingResult>) => {
      logger.info(`Image processing job ${job.id || 'unknown'} completed successfully`);
    });

    this.worker.on('failed', (job: Job<ImageProcessingJobData, ImageProcessingResult> | undefined, error: Error) => {
      logger.error(`Image processing job ${job?.id || 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Image processor worker error:', error);
    });
  }

  private async processJob(job: Job<ImageProcessingJobData, ImageProcessingResult>): Promise<ImageProcessingResult> {
    const startTime = Date.now();

    try {
      logger.info(`Processing image job ${job.id || 'unknown'} for user ${job.data.userId}`);

      // Download the image
      const imageBuffer = await this.downloadImage(job.data.imageUrl);
      const originalSize = imageBuffer.length;

      // Process the image through all operations
      let processedBuffer = imageBuffer;
      const tags: string[] = [];

      for (let i = 0; i < job.data.operations.length; i++) {
        const operation = job.data.operations[i];
        const progress = ((i + 1) / job.data.operations.length) * 80; // Reserve 20% for upload
        await job.updateProgress(progress);

        switch (operation.type) {
          case 'resize':
            processedBuffer = await this.resizeImage(processedBuffer, operation.params);
            break;
          case 'watermark':
            processedBuffer = await this.addWatermark(processedBuffer, operation.params);
            break;
          case 'ai-tag':
            const imageTags = await this.generateAITags(processedBuffer, operation.params);
            tags.push(...imageTags);
            break;
        }
      }

      // Upload processed image
      await job.updateProgress(90);
      const processedImageUrl = await this.uploadProcessedImage(
        processedBuffer,
        job.data.userId,
        job.data.outputFormat || 'jpeg',
        job.data.quality
      );

      await job.updateProgress(100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          processedImageUrl,
          originalSize,
          processedSize: processedBuffer.length,
          tags: tags.length > 0 ? tags : undefined,
        },
        executionTime,
        metadata: job.data.metadata,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Image processing failed for job ${job.id || 'unknown'}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
      };
    }
  }

  private async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024, // 50MB max
      });

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async resizeImage(buffer: Buffer, params: unknown): Promise<Buffer> {
    const resizeParams = params as { width?: number; height?: number; fit?: 'cover' | 'contain' | 'fill' };

    try {
      let sharpInstance = sharp(buffer);

      if (resizeParams.width || resizeParams.height) {
        sharpInstance = sharpInstance.resize({
          width: resizeParams.width,
          height: resizeParams.height,
          fit: resizeParams.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async addWatermark(buffer: Buffer, params: unknown): Promise<Buffer> {
    const watermarkParams = params as {
      text?: string;
      imageUrl?: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity: number;
    };

    try {
      const image = sharp(buffer);
      const { width, height } = await image.metadata();

      if (!width || !height) {
        throw new Error('Unable to get image dimensions');
      }

      if (watermarkParams.text) {
        // Text watermark
        const svgWatermark = this.createTextWatermarkSVG(
          watermarkParams.text,
          width,
          height,
          watermarkParams.position,
          watermarkParams.opacity
        );

        return await image
          .composite([{ input: Buffer.from(svgWatermark), gravity: this.getGravity(watermarkParams.position) }])
          .toBuffer();
      } else if (watermarkParams.imageUrl) {
        // Image watermark
        const watermarkBuffer = await this.downloadImage(watermarkParams.imageUrl);
        const watermarkImage = sharp(watermarkBuffer)
          .resize({ width: Math.floor(width * 0.2), height: Math.floor(height * 0.2), fit: 'inside' })
          .png({ quality: Math.floor(watermarkParams.opacity * 100) });

        return await image
          .composite([{ input: await watermarkImage.toBuffer(), gravity: this.getGravity(watermarkParams.position) }])
          .toBuffer();
      }

      return buffer;
    } catch (error) {
      throw new Error(`Failed to add watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createTextWatermarkSVG(
    text: string,
    imageWidth: number,
    imageHeight: number,
    position: string,
    opacity: number
  ): string {
    const fontSize = Math.min(imageWidth, imageHeight) * 0.05;
    const x = position.includes('center') ? '50%' : position.includes('right') ? '95%' : '5%';
    const y = position.includes('center') ? '50%' : position.includes('bottom') ? '95%' : '5%';

    return `
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          fill="white"
          opacity="${opacity}"
          text-anchor="${position.includes('center') ? 'middle' : position.includes('right') ? 'end' : 'start'}"
          dominant-baseline="central"
        >
          ${text}
        </text>
      </svg>
    `;
  }

  private getGravity(position: string): string {
    switch (position) {
      case 'top-left':
        return 'northwest';
      case 'top-right':
        return 'northeast';
      case 'bottom-left':
        return 'southwest';
      case 'bottom-right':
        return 'southeast';
      case 'center':
        return 'center';
      default:
        return 'center';
    }
  }

  private async generateAITags(buffer: Buffer, params: unknown): Promise<string[]> {
    const aiParams = params as { confidence?: number; maxTags?: number };

    try {
      // Simulate AI tagging - in real implementation, this would call an AI service
      // like Google Vision API, AWS Rekognition, or a custom model
      const metadata = await sharp(buffer).metadata();
      const mockTags: string[] = [];

      // Generate mock tags based on image properties
      if (metadata.width && metadata.height) {
        if (metadata.width > metadata.height) {
          mockTags.push('landscape');
        } else if (metadata.height > metadata.width) {
          mockTags.push('portrait');
        } else {
          mockTags.push('square');
        }
      }

      if (metadata.format) {
        mockTags.push(metadata.format);
      }

      // Simulate confidence filtering
      const confidence = aiParams.confidence || 0.7;
      const filteredTags = mockTags.filter(() => Math.random() > (1 - confidence));

      // Apply max tags limit
      const maxTags = aiParams.maxTags || 10;
      return filteredTags.slice(0, maxTags);
    } catch (error) {
      logger.warn(`AI tagging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  private async uploadProcessedImage(
    buffer: Buffer,
    userId: string,
    format: 'jpeg' | 'png' | 'webp',
    quality?: number
  ): Promise<string> {
    try {
      // Convert to desired format
      let processedBuffer = buffer;

      switch (format) {
        case 'jpeg':
          processedBuffer = await sharp(buffer).jpeg({ quality: quality || 85 }).toBuffer();
          break;
        case 'png':
          processedBuffer = await sharp(buffer).png({ quality: quality || 85 }).toBuffer();
          break;
        case 'webp':
          processedBuffer = await sharp(buffer).webp({ quality: quality || 85 }).toBuffer();
          break;
      }

      // Simulate upload to storage service
      // In real implementation, this would upload to S3, GCS, or similar
      const filename = `processed_${userId}_${Date.now()}.${format}`;
      const mockUrl = `https://storage.focusflow.com/processed/${filename}`;

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockUrl;
    } catch (error) {
      throw new Error(`Failed to upload processed image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async close(): Promise<void> {
    await this.worker.close();
    logger.info('Image processor worker closed');
  }

  getWorker(): Worker<ImageProcessingJobData, ImageProcessingResult> {
    return this.worker;
  }
}