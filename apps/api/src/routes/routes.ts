import type { FastifyTypedInstance } from "../types.ts";
import usersRoutes from "./users.ts";
import { authController } from "../auth/auth.controller.ts";

export async function routes(app: FastifyTypedInstance) {
  await app.register(authController, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "api" });
}
