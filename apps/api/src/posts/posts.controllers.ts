import { FastifyTypedInstance } from "../types.ts";
import { PostsSchema, PostsSchemaDb } from "./posts.model.ts";
import { PaginationPosts } from "../utils/pagination.model.ts"
import z, { int } from "zod";
import { prisma } from "@repo/database";
import { meta } from "zod/v4/core";

export default async function routes(app: FastifyTypedInstance) {
    app.post(
    "/posts",
    {
      schema: {
        tags: ["Posts"],
        description: "Create Post",
        body: PostsSchema.omit({
          view_count: true,
          is_resolved: true,
        }),
        response: {
          201: PostsSchemaDb,
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { title, slug, language, code, description, user_id } = request.body
        const newPost = await prisma.posts.create({
          data: {
            title: title,
            slug: slug,
            language: language,
            code: code,
            description: description,
            user_id: user_id,
          },
        });

        return reply.status(201).send(newPost);
      } catch (erro) {
        return reply.status(500).send({ error: "Server error" });
      }
    },
  );

  app.get(
    "/posts",
    {
      schema: {
        tags: ["Posts"],
        description: "List Posts",
        querystring: PaginationPosts,
        response: {
          200: z.object({
            itens: z.array(PostsSchemaDb),
            totalItens: z.int(),
            totalPages: z.int()
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit, page } = request.query;

        const [listPosts, postTotal ] = await prisma.$transaction([
          prisma.posts.findMany({
          take: limit,
          skip: (page - 1) * limit,
          }),
          prisma.posts.count()
        ]) 

        return reply.status(200).send({itens: listPosts, totalItens: postTotal, totalPages: Math.ceil((postTotal/limit))});
      } catch (error) {
        return reply.status(500).send({ error: "Server error" });
      }
    },
  );

  // get para listagem única /posts/:id
  app.get(
    "/posts/:id",
    {
      schema: {
        tags: ["Posts"],
        description: "Get Post for id",
        params: PostsSchemaDb.pick({ id: true }),
        response: {
          200: PostsSchemaDb,
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const post = await prisma.posts.findUnique({
          where: { id: id },
        });
        if (!post) {
          return reply.status(404).send({ message: "Posts not found" });
        }
        return reply.status(200).send(post);
      } catch (error) {
        return reply.status(500).send({ error: "Server error" });
      }
    },
  );
}