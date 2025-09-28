import fp from 'fastify-plugin';
import env from '@fastify/env';
import { EnvironmentSchema } from '@/types/env';

export default fp(async function (fastify) {
  await fastify.register(env, {
    schema: EnvironmentSchema,
    dotenv: true,
    data: process.env
  });
});