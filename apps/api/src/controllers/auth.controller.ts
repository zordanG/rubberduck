import {
  LoginSchema,
  SignUpSchema,
  AuthResponseSchema,
  ChangePasswordSchema,
  ResetPasswordRequestSchema,
  ResetPasswordConfirmSchema,
} from '../models/auth.model.ts';
import { FastifyTypedInstance } from '../types.ts';
import { prisma } from '@repo/database';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { AppError, ErrorDefaults } from '../utils/app-error.ts';
import z from 'zod';

type Token = {
  token: string;
  tokenHash: string;
};

function createToken(): Token {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);

  return { token, tokenHash };
}

function hashToken(token: string): string {
  const hashedToken = createHash('sha256').update(token).digest('hex');
  return hashedToken;
}

export default async function route(app: FastifyTypedInstance) {
  app.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        description: 'Create account',
        body: SignUpSchema,
        response: {
          201: AuthResponseSchema,
          400: ErrorDefaults[400],
          500: ErrorDefaults[500],
        },
      },
    },
    async (request, reply) => {
      let { email, password, username, provider } = request.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw AppError.emailExists();

      const hashedPassword = await bcrypt.hash(password, 10);

      const { user, session, refreshToken } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            provider,
            email_verified: true,
          },
        });

        const session = await tx.sessions.create({
          data: {
            user_id: user.id,
            ip_address: request.ip,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          },
        });

        const { token: refreshToken, tokenHash: refreshTokenHash } = createToken();

        await tx.refreshTokens.create({
          data: {
            session_id: session.id,
            token: refreshTokenHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
          },
        });

        return { user, session, refreshToken };
      });

      const accessToken = await reply.jwtSign({
        userId: user.id,
        sessionId: session.id,
      });

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return reply.status(201).send({
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 60 * 15, // 15 min
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      });
    },
  );

  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Authenticate user',
        body: LoginSchema,
        response: {
          200: AuthResponseSchema,
          400: ErrorDefaults[400],
          401: ErrorDefaults[401],
          500: ErrorDefaults[500],
        },
      },
    },
    async (request, reply) => {
      let { email, password } = request.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw AppError.invalidCredentials();

      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) throw AppError.invalidCredentials();

      const { session, refreshToken } = await prisma.$transaction(async (tx) => {
        await tx.sessions.deleteMany({
          where: {
            user_id: user.id,
            ip_address: request.ip,
          },
        });

        const session = await tx.sessions.create({
          data: {
            user_id: user.id,
            ip_address: request.ip,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          },
        });

        const { token: refreshToken, tokenHash: refreshTokenHash } = createToken();

        await tx.refreshTokens.create({
          data: {
            session_id: session.id,
            token: refreshTokenHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
          },
        });

        return { session, refreshToken };
      });

      const accessToken = await reply.jwtSign({
        userId: user.id,
        sessionId: session.id,
      });

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return reply.send({
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 60 * 15, // 15 min
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      });
    },
  );

  app.post(
    '/logout',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Auth'],
        description: 'Logout',
        response: {
          204: z.undefined(),
          500: ErrorDefaults[500],
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.user;

      await prisma.sessions.delete({
        where: {
          id: sessionId,
        },
      });

      reply.clearCookie('refreshToken', { path: '/auth/refresh' });

      return reply.status(204).send();
    },
  );

  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        description: 'Refresh expired tokens',
        response: {
          200: AuthResponseSchema,
          401: ErrorDefaults[401],
          500: ErrorDefaults[500],
        },
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) throw AppError.unauthorized();

      const hashedToken = hashToken(refreshToken);

      const userRefreshToken = await prisma.refreshTokens.findUnique({
        where: {
          token: hashedToken,
        },
        include: {
          session: {
            include: {
              user: true,
            },
          },
        },
      });

      const now = new Date();
      // Verify token
      if (!userRefreshToken || userRefreshToken.revoked || userRefreshToken.expires_at < now)
        throw AppError.unauthorized();

      // Verify session
      if (!userRefreshToken.session || userRefreshToken.session.expires_at < now) throw AppError.unauthorized();

      // Verify user
      if (!userRefreshToken.session.user) throw AppError.unauthorized();

      const { newSession, newRefreshToken } = await prisma.$transaction(async (tx) => {
        await tx.sessions.delete({
          where: { id: userRefreshToken.session_id },
        });

        const session = await tx.sessions.create({
          data: {
            user_id: userRefreshToken.session.user.id,
            ip_address: request.ip,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          },
        });

        const { token: refreshToken, tokenHash: refreshTokenHash } = createToken();

        await tx.refreshTokens.create({
          data: {
            session_id: session.id,
            token: refreshTokenHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
          },
        });

        return { newSession: session, newRefreshToken: refreshToken };
      });

      const accessToken = await reply.jwtSign({
        userId: userRefreshToken.session.user.id,
        sessionId: newSession.id,
      });

      reply.setCookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return reply.send({
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 60 * 15, // 15 min
        user: {
          id: userRefreshToken.session.user.id,
          username: userRefreshToken.session.user.username,
          email: userRefreshToken.session.user.email,
          avatar_url: userRefreshToken.session.user.avatar_url,
        },
      });
    },
  );

  app.patch(
    '/password',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Password change'],
        description: 'Change password of authenticated user',
        body: ChangePasswordSchema,
        response: {
          204: z.undefined(),
          400: ErrorDefaults[400],
          401: ErrorDefaults[401],
          500: ErrorDefaults[500],
        },
      },
    },
    async (request, reply) => {
      const { new_password, old_password } = request.body;
      const { userId, sessionId } = request.user;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          password: true,
        },
      });

      if (!user) throw AppError.internal();

      const passwordMatch = await bcrypt.compare(old_password, user.password);

      if (!passwordMatch) throw AppError.invalidCredentials();

      const newPasswordMatch = await bcrypt.compare(new_password, user.password);

      if (newPasswordMatch)
        throw new AppError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'New password must be different from current password',
        });

      const passwordHash = await bcrypt.hash(new_password, 10);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          data: {
            password: passwordHash,
            updated_at: new Date(),
          },
          where: {
            id: userId,
          },
        });

        await tx.sessions.deleteMany({
          where: {
            user_id: userId,
            NOT: {
              id: sessionId,
            },
          },
        });
      });

      return reply.status(204).send();
    },
  );

  app.post(
    '/password/reset/request',
    {
      schema: {
        tags: ['Password change'],
        description: 'Request change password for unauthenticated user',
        body: ResetPasswordRequestSchema,
        response: {
          200: z.undefined(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) return reply.status(200).send();

      const { token, tokenHash } = createToken();

      await prisma.$transaction(async (tx) => {
        await tx.resetPassword.updateMany({
          data: {
            invalid: true,
          },
          where: {
            email,
          },
        });

        await tx.resetPassword.create({
          data: {
            email,
            expires_at: new Date(Date.now() + 1000 * 60 * 15),
            token: tokenHash,
          },
        });
      });
      // send email with token

      return reply.status(200).send();
    },
  );

  app.post(
    '/password/reset/confirm',
    {
      schema: {
        tags: ['Password change'],
        description: 'Confirm unauthenticated user password change',
        body: ResetPasswordConfirmSchema,
        response: {
          204: z.undefined(),
          400: ErrorDefaults[400],
        },
      },
    },
    async (request, reply) => {
      const { new_password, token } = request.body;
      const hashedToken = hashToken(token);

      const resetPassRequest = await prisma.resetPassword.findUnique({
        where: {
          token: hashedToken,
        },
        select: {
          id: true,
          expires_at: true,
          email: true,
          invalid: true,
          used_at: true,
        },
      });

      const now = new Date();
      if (
        !resetPassRequest ||
        resetPassRequest.invalid ||
        resetPassRequest.used_at !== null ||
        resetPassRequest.expires_at < now
      )
        throw AppError.badRequest();

      const passwordHash = await bcrypt.hash(new_password, 10);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          data: {
            password: passwordHash,
            updated_at: new Date(),
          },
          where: {
            email: resetPassRequest.email,
          },
          select: {
            id: true,
          },
        });

        await tx.sessions.deleteMany({
          where: {
            user_id: user.id,
          },
        });

        await tx.resetPassword.update({
          data: {
            used_at: now,
          },
          where: {
            id: resetPassRequest.id,
          },
        });
      });

      return reply.status(204).send();
    },
  );
}
