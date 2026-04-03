import type { FastifyTypedInstance } from '../types.ts';
import postsRoutes from '../controllers/posts.controllers.ts';
import commentRoutes from '../controllers/comments.controller.ts';
import authRoutes from '../controllers/auth.controller.ts';
import usersRoutes from '../controllers/users.controller.ts';

export async function routes(app: FastifyTypedInstance) {
  await app.register(authRoutes, { prefix: 'auth' });

  await app.register(async (protectedApp) => {
    // Require authenticated user
    protectedApp.addHook('onRequest', app.authenticate);

    await protectedApp.register(usersRoutes, { prefix: 'api' });
    await protectedApp.register(postsRoutes, { prefix: 'api' });
    await protectedApp.register(commentRoutes, { prefix: 'api' });
  });
}
