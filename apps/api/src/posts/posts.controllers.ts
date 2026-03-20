import { FastifyTypedInstance } from "../types.ts";
import { PaginationPosts, PostsSchema } from "./posts.model.ts";
import z from "zod";
import { prisma } from "@repo/database";

export default async function routes(app: FastifyTypedInstance){
    app.get("/posts", {
        schema: {
            tags: ['Posts'],
            description: 'List Posts',
            querystring: PaginationPosts,
            response: {
                200: z.array(PostsSchema)
            }
        },
    }, async (request,reply) => {
        try {
        const {limit, page} = request.query
        const listPosts = await prisma.posts.findMany({
            take: limit,
            skip: (page-1) * limit
        })
    
        return reply.status(200).send(listPosts)
        } catch (erro) {
            console.log(erro)
        }
    })

    app.post("/posts", {
        schema: {
            tags: ['Posts'],
            description: 'Create Post',
            body: PostsSchema.omit({
                id: true, created_at: true, updated_at: true
            }),
            response: {
                201: PostsSchema,
            },
        }
    }, async (request, reply) => {
        try {
        const {title, slug, language, code, description, user_id} = PostsSchema.parse(request.body)
        const newPost = await prisma.posts.create({
            data: {
                title: title,
                slug: slug,
                language: language,
                code: code,
                description: description,
                user_id: user_id
            }
        })
        
        console.log(`Post criado, ${newPost}`)
        return reply.status(201).send(newPost)
        } catch (erro) {
            console.log(erro)
        }
    })
}