import { Job } from 'bullmq';
import { db } from '../config/database.js';
import type { UUID } from '@focusflow/types';

interface AnalyticsJobData {
  event: string;
  userId?: UUID;
  photographerId?: UUID;
  sessionId?: UUID;
  galleryId?: UUID;
  properties: Record<string, unknown>;
  timestamp: string;
}

export async function processAnalyticsJob(job: Job<AnalyticsJobData>): Promise<void> {
  const { event, userId, photographerId, sessionId, galleryId, properties, timestamp } = job.data;

  try {
    await db('analytics_events').insert({
      id: crypto.randomUUID(),
      event,
      user_id: userId,
      photographer_id: photographerId,
      session_id: sessionId,
      gallery_id: galleryId,
      properties: JSON.stringify(properties),
      timestamp: new Date(timestamp),
      created_at: new Date(),
    });

    if (event === 'gallery_view' && galleryId) {
      await db('galleries')
        .where('id', galleryId)
        .increment('view_count', 1)
        .update('last_viewed_at', new Date());
    }

    if (event === 'photo_downloaded' && properties.photoId) {
      await db('photos')
        .where('id', properties.photoId as string)
        .increment('download_count', 1);
    }

    if (event === 'session_completed' && sessionId) {
      const session = await db('sessions')
        .where('id', sessionId)
        .first();

      if (session && session.photographer_id) {
        await db('photographer_stats')
          .where('photographer_id', session.photographer_id)
          .increment('completed_sessions', 1)
          .update('updated_at', new Date());
      }
    }

    await job.updateProgress(100);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process analytics event: ${errorMessage}`);
  }
}