import type { FastifyTypedInstance } from '../types.ts';
import postsRoutes from '../controllers/posts.controllers.ts';
import commentRoutes from '../controllers/comments.controller.ts';
import usersRoutes from '../controllers/users.controller.ts';

export async function routes(app: FastifyTypedInstance) {
  await app.register(usersRoutes, { prefix: 'api' });
  await app.register(postsRoutes, { prefix: 'api' });
  await app.register(commentRoutes, { prefix: 'api' });
}
