import { FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import z from "zod";
import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyTypedInstance } from "../types.ts";

export const authController: FastifyPluginAsync = async (
  app: FastifyTypedInstance,
) => {
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        description: "Login User",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { email, password } = req.body;

      // login logic here (e.g., check user credentials, generate JWT token)
      // For demonstration, we will return a dummy token
      const token = "dummy_jwt_token";
      return reply.status(200).send({ token });
    },
  );
};
