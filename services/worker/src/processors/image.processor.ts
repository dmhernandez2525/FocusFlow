import { Job } from 'bullmq';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { UUID } from '@focusflow/types';

interface ImageJobData {
  photoId: UUID;
  source: string;
  operations: Array<{
    type: 'resize' | 'watermark' | 'optimize' | 'thumbnail';
    options: Record<string, unknown>;
    output: string;
  }>;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const s3Bucket = process.env.S3_BUCKET || 'focusflow-production';
const s3ProcessedBucket = process.env.S3_PROCESSED_BUCKET || 'focusflow-processed';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error('No body in S3 response');
  }

  return streamToBuffer(response.Body as Readable);
}

async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: s3ProcessedBucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
}

function processResize(image: sharp.Sharp, options: Record<string, unknown>): sharp.Sharp {
  const width = options.width as number | undefined;
  const height = options.height as number | undefined;
  const fit = options.fit as keyof sharp.FitEnum | undefined;

  return image.resize(width, height, { fit: fit || 'cover' });
}

function processWatermark(image: sharp.Sharp, options: Record<string, unknown>): sharp.Sharp {
  const watermarkPath = options.path as string;
  const position = options.position as string || 'southeast';
  const opacity = options.opacity as number || 0.5;

  return image.composite([
    {
      input: watermarkPath,
      gravity: position as sharp.Gravity,
      blend: 'over' as const,
    },
  ]);
}

function processThumbnail(image: sharp.Sharp): sharp.Sharp {
  return image.resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 });
}

function processOptimize(image: sharp.Sharp, options: Record<string, unknown>): sharp.Sharp {
  const quality = options.quality as number || 85;
  const format = options.format as string || 'jpeg';

  switch (format) {
    case 'webp':
      return image.webp({ quality });
    case 'png':
      return image.png({ quality, compressionLevel: 9 });
    case 'avif':
      return image.avif({ quality });
    default:
      return image.jpeg({ quality, progressive: true });
  }
}

export async function processImageJob(job: Job<ImageJobData>): Promise<void> {
  const { photoId, source, operations } = job.data;

  try {
    const sourceBuffer = await downloadFromS3(source);
    let totalOperations = operations.length;
    let completedOperations = 0;

    for (const operation of operations) {
      let pipeline = sharp(sourceBuffer);

      switch (operation.type) {
        case 'resize':
          pipeline = processResize(pipeline, operation.options);
          break;
        case 'watermark':
          pipeline = processWatermark(pipeline, operation.options);
          break;
        case 'thumbnail':
          pipeline = processThumbnail(pipeline);
          break;
        case 'optimize':
          pipeline = processOptimize(pipeline, operation.options);
          break;
      }

      const processedBuffer = await pipeline.toBuffer();
      await uploadToS3(operation.output, processedBuffer, 'image/jpeg');

      completedOperations++;
      await job.updateProgress(Math.floor((completedOperations / totalOperations) * 100));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process image: ${errorMessage}`);
  }
}