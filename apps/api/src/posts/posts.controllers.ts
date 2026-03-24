import { FastifyTypedInstance } from "../types.ts";
import { PaginationPosts, PostsSchema, PostsSchemaDb } from "./posts.model.ts";
import z from "zod";
import { prisma } from "@repo/database";
import { request } from "node:http";

export default async function routes(app: FastifyTypedInstance){
    app.get('/posts', {
        schema: {
            tags: ['Posts'],
            description: 'List Posts',
            querystring: PaginationPosts,
            response: {
                200: z.array(PostsSchema)
            }
        },
    }, async (request, reply) => {
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

    // get para listagem única /posts/:id
    app.get('/posts/:id', {
        schema: {
            tags: ['Posts'],
            description: 'Get Post for id',
            response: {
                200: PostsSchemaDb
            }
        },
    }, async (request, reply) => {
        try {
        const { id }= request.params as {id: string}

        const post = await prisma.posts.findUnique({
            where: { id: id},
        })
        if(!post) {
            throw new Error('Post não encontrado')
        }
        return reply.status(200).send(post)
        } catch (erro){
            console.log(erro)
        }
    })

    app.post('/posts', {
        schema: {
            tags: ['Posts'],
            description: 'Create Post',
            body: PostsSchema,
            response: {
                201: PostsSchemaDb,
            },
        }
    }, async (request, reply) => {
        console.log('cheguei aqui')
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
        console.log(`Post criado, ${newPost.id}`)
        return reply.status(201).send(newPost)
        } catch (erro) {
            console.log(erro)
        }
    })
}