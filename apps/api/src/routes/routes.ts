import type { FastifyTypedInstance } from '../types.ts';
import usersRoutes from './users.ts';

export async function routes(app: FastifyTypedInstance) {
  await app.register(usersRoutes, { prefix: 'api' });
}
