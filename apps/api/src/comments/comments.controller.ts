import { FastifyTypedInstance } from "../types.ts";
import { CommentsSchemaDb, CommentsSchema } from "./comments.model.ts";
import { PaginationPosts } from "../utils/pagination.model.ts"
import  z  from 'zod'
import { prisma } from "@repo/database";

export default async function route(app: FastifyTypedInstance) {
    app.post('/comments', {
        schema: {
            tags: ['Comments', ],
            description: 'Create Comments',
            body: CommentsSchema.omit({
                upvotes: true, downvotes: true
            }),
            response: {
                201: CommentsSchemaDb,
                500: z.object({
                    error: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { content, is_best_answer, post_id, user_id } = request.body
        const comment = await prisma.comments.create({
            data: {
                content,
                is_best_answer,
                post_id,
                user_id,
            }
        })
        if(!comment) {
            return reply.status(500).send({error: 'Server error'})
        }

        return reply.status(201).send(comment)
    })

    app.get('/comments', {
        schema: {
            tags: ['Comments'],
            description: 'List Posts',
            querystring: PaginationPosts,
            response: {
                200: z.array(CommentsSchemaDb),
                500: z.object({
                    error: z.string(),
                })
            }
        }
    }, async (request, reply) => {
        const { limit, page } = request.query

        const comments = await prisma.comments.findMany({
            take: limit,
            skip: (page - 1) * limit
        })

        if(!comments) {
            return reply.status(500).send({error: 'Server error'})
        }
            
        return reply.status(200).send(comments)
        }
    )

    app.get('/comments/:id', {
        schema: {
            tags: ['Comments'],
            description: 'Get Comment for id',
            params: CommentsSchemaDb.pick({
                id: true
            }),
            response: {
                200: CommentsSchemaDb,
                500: z.object({
                    error: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { id } = request.params
        const comment = await prisma.comments.findUnique({
            where: {
                id: id
            }
        })

        if(!comment){
            return reply.status(500).send({error: 'Server error'})
        }

        return reply.status(200).send(comment)
    })
}