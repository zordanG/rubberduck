import type { FastifyTypedInstance } from '../types.ts';
import usersRoutes from './users.ts';
import postsRoutes from '../posts/posts.controllers.ts';
import commentRoutes from '../comments/comments.controller.ts';

export async function routes(app: FastifyTypedInstance) {
  await app.register(usersRoutes, { prefix: 'api' });
  await app.register(postsRoutes, { prefix: 'api' });
  await app.register(commentRoutes, { prefix: 'api' });
}
