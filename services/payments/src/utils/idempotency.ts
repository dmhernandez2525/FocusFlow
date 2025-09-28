import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createHash } from 'crypto';

export class IdempotencyService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  generateIdempotencyKey(request: FastifyRequest): string {
    const method = request.method;
    const url = request.url;
    const body = request.body ? JSON.stringify(request.body) : '';
    const userId = (request as any).user?.id || 'anonymous';

    const content = `${method}:${url}:${body}:${userId}`;
    return createHash('sha256').update(content).digest('hex');
  }

  async checkIdempotency(
    idempotencyKey: string
  ): Promise<{ exists: boolean; response?: { body: string; status: number } }> {
    try {
      const result = await this.fastify.pg.query(
        'SELECT response_body, response_status FROM idempotency_records WHERE key = $1 AND expires_at > NOW()',
        [idempotencyKey]
      );

      if (result.rows.length > 0) {
        const record = result.rows[0];
        return {
          exists: true,
          response: {
            body: record.response_body,
            status: record.response_status
          }
        };
      }

      return { exists: false };
    } catch (error) {
      this.fastify.log.error('Error checking idempotency:', error);
      throw error;
    }
  }

  async storeIdempotencyRecord(
    idempotencyKey: string,
    responseBody: string,
    responseStatus: number,
    ttlMs: number = 86400000 // 24 hours default
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlMs);

      await this.fastify.pg.query(
        `INSERT INTO idempotency_records (key, response_body, response_status, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET
           response_body = EXCLUDED.response_body,
           response_status = EXCLUDED.response_status,
           expires_at = EXCLUDED.expires_at`,
        [idempotencyKey, responseBody, responseStatus, expiresAt]
      );
    } catch (error) {
      this.fastify.log.error('Error storing idempotency record:', error);
      throw error;
    }
  }

  async cleanupExpiredRecords(): Promise<void> {
    try {
      await this.fastify.pg.query(
        'DELETE FROM idempotency_records WHERE expires_at <= NOW()'
      );
    } catch (error) {
      this.fastify.log.error('Error cleaning up expired idempotency records:', error);
    }
  }
}

export async function idempotencyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const idempotencyKey = request.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return;
  }

  const idempotencyService = new IdempotencyService(request.server);

  try {
    const result = await idempotencyService.checkIdempotency(idempotencyKey);

    if (result.exists && result.response) {
      const parsedBody = JSON.parse(result.response.body);
      reply.status(result.response.status).send(parsedBody);
      return;
    }

    // Store the idempotency key for later use
    (request as any).idempotencyKey = idempotencyKey;
    (request as any).idempotencyService = idempotencyService;
  } catch (error) {
    request.log.error('Idempotency middleware error:', error);
    // Continue processing the request if idempotency check fails
  }
}

export async function storeIdempotentResponse(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: any
): Promise<void> {
  const idempotencyKey = (request as any).idempotencyKey;
  const idempotencyService = (request as any).idempotencyService;

  if (idempotencyKey && idempotencyService && reply.statusCode < 400) {
    try {
      await idempotencyService.storeIdempotencyRecord(
        idempotencyKey,
        JSON.stringify(payload),
        reply.statusCode,
        request.server.config.IDEMPOTENCY_TTL
      );
    } catch (error) {
      request.log.error('Error storing idempotent response:', error);
    }
  }
}