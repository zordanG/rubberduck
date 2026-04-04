import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { AppError } from '../utils/app-error.ts';
import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      sessionId: string;
    };
    user: {
      userId: string;
      sessionId: string;
    };
  }
}

export default fp(async function (app: FastifyInstance) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not defined');

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '15m',
    },
  });

  app.decorate('authenticate', async function (request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch (err) {
      console.error('JWT Error:', err);
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }
  });
});
