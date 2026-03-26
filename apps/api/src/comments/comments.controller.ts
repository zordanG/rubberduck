import { request } from "node:http";
import { FastifyTypedInstance } from "../types.ts";
import { CommentsSchemaDb, CommentsSchema } from "./comments.model.ts";
import { z } from 'zod'
import { prisma } from "@repo/database";

export default async function route(app: FastifyTypedInstance) {
    app.post('/comments', {
        schema: {
            tags: ['Comments'],
            description: 'Create Comments',
            body: CommentsSchema,
            response: {
                201: CommentsSchemaDb,
                500: z.object({
                    error: z.string
                }),
            },
        },
    }, async (request, reply) => {
        const { content, is_best_answer, post_id, user_id, upvotes, downvotes } = request.body
        const comment = await prisma.comments.create({
            data: {
                content,
                is_best_answer,
                post_id,
                user_id,
                upvotes,
                downvotes
            }
        })

        return reply.status(201).send(comment)
    })
}