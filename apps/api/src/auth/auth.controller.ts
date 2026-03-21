import { FastifyPluginAsync } from "fastify";
import z from "zod";
import { FastifyTypedInstance } from "../types.ts";
import { passport } from "./strategies/passport.local.ts";
import { FastifyRequest, FastifyReply } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

const authenticateLocal = async (
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<{ id: string; name: string; email: string }> => {
  const user = await new Promise<{ id: string; name: string; email: string }>(
    (resolve, reject) => {
      const handler = passport.authenticate(
        "local",
        { session: false },
        (err: any, authenticatedUser: any, info: any) => {
          if (err) return reject(err);
          if (!authenticatedUser) {
            return reject({
              statusCode: 401,
              message: info?.message || "Credenciais inválidas",
            });
          }
          resolve(authenticatedUser);
        },
      );

      const raw = req.raw as IncomingMessage & { body?: unknown };
      raw.body = req.body;
      handler(raw, reply.raw as ServerResponse, (err: any) => {
        if (err) reject(err);
      });
    },
  );

  return user;
};

const UserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const authController: FastifyPluginAsync = async (
  app: FastifyTypedInstance,
) => {
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        description:
          "Login com Passport Local — retorna JWT em cookie httpOnly",
        security: [],
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            user: UserResponse,
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      try {
        const user = await authenticateLocal(req, reply);

        const token = req.jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          { expiresIn: "1d" },
        );

        reply.setCookie("access_token", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24,
        });

        return reply.status(200).send({
          message: "Login realizado com sucesso",
          user: { id: user.id, name: user.name, email: user.email },
        });
      } catch (err: any) {
        if (err.statusCode === 401) {
          return reply.status(401).send({ message: err.message });
        }
        throw err;
      }
    },
  );

  app.post(
    "/logout",
    {
      schema: {
        tags: ["Auth"],
        description: "Logout — limpa o cookie de autenticação",
        security: [],
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (_req, reply) => {
      reply.clearCookie("access_token", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return reply.status(200).send({ message: "Logout realizado" });
    },
  );

  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Auth"],
        description: "Retorna o usuário autenticado via cookie",
        response: {
          200: UserResponse,
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      return reply
        .status(200)
        .send(req.user as { id: string; name: string; email: string });
    },
  );
};
