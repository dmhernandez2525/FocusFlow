import { Job } from 'bullmq';
import { db } from '../config/database.js';
import type { UUID } from '@focusflow/types';

interface NotificationJobData {
  userId: UUID;
  type: 'gallery_ready' | 'payment_received' | 'contract_signed' | 'session_reminder' | 'trial_expiring';
  title: string;
  message: string;
  data: Record<string, unknown>;
  channels: Array<'email' | 'push' | 'in_app'>;
}

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { userId, type, title, message, data, channels } = job.data;

  try {
    await db.transaction(async (trx) => {
      const notificationId = crypto.randomUUID();

      await trx('notifications').insert({
        id: notificationId,
        user_id: userId,
        type,
        title,
        message,
        data: JSON.stringify(data),
        is_read: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      for (const channel of channels) {
        await trx('notification_deliveries').insert({
          id: crypto.randomUUID(),
          notification_id: notificationId,
          channel,
          status: 'pending',
          created_at: new Date(),
        });

        if (channel === 'email') {
          const emailQueue = await import('../config/queues.js').then(m => m.emailQueue);
          const user = await trx('users')
            .where('id', userId)
            .first();

          if (user && user.email) {
            await emailQueue.add('send-notification', {
              to: user.email,
              subject: title,
              template: 'notification',
              data: {
                title,
                message,
                ...data,
              },
            });
          }

          await trx('notification_deliveries')
            .where('notification_id', notificationId)
            .where('channel', 'email')
            .update({
              status: 'sent',
              sent_at: new Date(),
            });
        }

        if (channel === 'push') {
          await trx('notification_deliveries')
            .where('notification_id', notificationId)
            .where('channel', 'push')
            .update({
              status: 'sent',
              sent_at: new Date(),
            });
        }
      }
    });

    await job.updateProgress(100);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process notification: ${errorMessage}`);
  }
}