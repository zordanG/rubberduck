import { FastifyTypedInstance } from '../types.ts';
import { CommentsSchemaDb, CommentsSchema } from '../models/comments.model.ts';
import { PaginationComments } from '../utils/pagination.model.ts';
import z from 'zod';
import { prisma } from '@repo/database';

export default async function route(app: FastifyTypedInstance) {
  app.post(
    '/comments',
    {
      schema: {
        tags: ['Comments'],
        description: 'Create Comments',
        body: CommentsSchema.omit({
          upvotes: true,
          downvotes: true,
        }),
        response: {
          201: CommentsSchemaDb,
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { content, is_best_answer, post_id, user_id } = request.body;
      const comment = await prisma.comments.create({
        data: {
          content,
          is_best_answer,
          post_id,
          user_id,
        },
      });
      if (!comment) {
        return reply.status(500).send({ error: 'Server error' });
      }

      return reply.status(201).send(comment);
    },
  );

  app.get(
    '/comments',
    {
      schema: {
        tags: ['Comments'],
        description: 'List Posts',
        querystring: PaginationComments,
        response: {
          200: z.array(CommentsSchemaDb),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { limit, page, post_id } = request.query as any;

      const comments = await prisma.comments.findMany({
        // puxar comentario daquele post
        where: post_id ? { post_id } : undefined,
        take: limit,
        skip: (page - 1) * limit,
        include: { user: { select: { username: true } } },
        orderBy: [{ is_best_answer: 'desc' }, { created_at: 'desc' }],
      });

      if (!comments) {
        return reply.status(500).send({ error: 'Server error' });
      }

      return reply.status(200).send(comments);
    },
  );

  app.get(
    '/comments/:id',
    {
      schema: {
        tags: ['Comments'],
        description: 'Get Comment for id',
        params: CommentsSchemaDb.pick({
          id: true,
        }),
        response: {
          200: CommentsSchemaDb,
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const comment = await prisma.comments.findUnique({
        where: {
          id: id,
        },
      });

      if (!comment) {
        return reply.status(500).send({ error: 'Server error' });
      }

      return reply.status(200).send(comment);
    },
  );

  app.patch(
    '/comments/:id/upvote',
    {
      schema: {
        tags: ['Comments'],
        description: 'Upvote comment',
        params: CommentsSchemaDb.pick({ id: true }),
        response: {
          200: CommentsSchemaDb,
          500: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const comment = await prisma.comments.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      });
      if (!comment) return reply.status(500).send({ error: 'Server error' });
      return reply.status(200).send(comment);
    },
  );

  app.patch(
    '/comments/:id/downvote',
    {
      schema: {
        tags: ['Comments'],
        description: 'Downvote comment',
        params: CommentsSchemaDb.pick({ id: true }),
        response: {
          200: CommentsSchemaDb,
          500: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const comment = await prisma.comments.update({
        where: { id },
        data: { downvotes: { increment: 1 } },
      });
      if (!comment) return reply.status(500).send({ error: 'Server error' });
      return reply.status(200).send(comment);
    },
  );

  app.patch(
    '/comments/:id/best-answer',
    {
      schema: {
        tags: ['Comments'],
        description: 'Mark comment as best answer',
        params: CommentsSchemaDb.pick({ id: true }),
        response: {
          200: CommentsSchemaDb,
          500: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const comment = await prisma.comments.findUnique({ where: { id } });
      if (!comment) return reply.status(500).send({ error: 'Server error' });

      await prisma.$transaction([
        prisma.comments.updateMany({
          where: { post_id: comment.post_id },
          data: { is_best_answer: false },
        }),
        prisma.comments.update({
          where: { id },
          data: { is_best_answer: true },
        }),
      ]);

      const updatedComment = await prisma.comments.findUnique({
        where: { id },
        include: { user: { select: { username: true } } },
      });
      if (!updatedComment) return reply.status(500).send({ error: 'Server error' });
      return reply.status(200).send(updatedComment);
    },
  );
}
