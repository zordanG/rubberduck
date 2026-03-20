import z from 'zod';

export const PostsSchema = z.object({
    id: z.uuid().optional(),
    title: z.string().max(255),
    slug: z.string()    ,
    language: z.string().max(50),
    code: z.string(),
    description: z.nullish(z.string()),
    view_count: z.int().default(0),
    is_resolved: z.boolean().default(false),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
    user_id: z.string()
})

export const PaginationPosts = z.object({
    limit: z.coerce.number(),
    page: z.coerce.number()
})

type PaginationPosts = z.infer<typeof PaginationPosts>
