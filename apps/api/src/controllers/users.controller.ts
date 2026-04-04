import { FastifyTypedInstance } from '../types.ts';
import { prisma } from '@repo/database';
import { AppError, AppErrorSchema } from '../utils/app-error.ts';
import { UserSchema } from '../models/users.model.ts';

export default async function route(app: FastifyTypedInstance) {
  app.get(
    '/user/me',
    {
      schema: {
        tags: ['User'],
        description: 'Get logged user data',
        response: {
          200: UserSchema.omit({
            password: true,
            id: true,
          }),
          500: AppErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user)
        throw new AppError({
          code: 'RESOURCE_NOT_FOUND',
          message: 'User data not found',
          status: 404,
        });

      return reply.status(200).send(user);
    },
  );

  app.get(
    '/user/:email',
    {
      schema: {
        tags: ['User'],
        description: 'Get user by email',
        params: UserSchema.pick({
          email: true,
        }),
        response: {
          200: UserSchema.omit({
            password: true,
            id: true,
          }),
          500: AppErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.params;

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user)
        throw new AppError({
          code: 'RESOURCE_NOT_FOUND',
          message: 'User data not found',
          status: 404,
        });

      return reply.status(200).send(user);
    },
  );
}
