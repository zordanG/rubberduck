import type { FastifyTypedInstance } from "../types.ts";
import z from "zod";
import { prisma } from "@repo/database";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.date().optional().nullable(),
});

export default async function routes(app: FastifyTypedInstance) {
  app.get(
    "/users",
    {
      schema: {
        tags: ["Users"],
        description: "List Users",
        response: {
          200: z.array(UserSchema),
        },
      },
    },
    async (_, reply) => {
      try {
        const user = await prisma.user.findMany();
        return reply.status(200).send(user);
      } catch (err) {
        reply.status(500).send(err);
      }
    },
  );

  app.post(
    "/users",
    {
      schema: {
        tags: ["Users"],
        description: "Create User",
        body: UserSchema.pick({ name: true, email: true }),
        response: {
          201: UserSchema,
        },
      },
    },
    async (req, reply) => {
      try {
        const newUser = await prisma.user.create({
          data: {
            email: req.body.email,
            name: req.body.name,
          },
        });
        return reply.status(201).send(newUser);
      } catch (err) {
        console.log(err);
        reply.status(500).send(err);
      }
    },
  );
}
