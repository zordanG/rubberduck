import z from 'zod';

export const CommentsSchema = z.object({
    content: z.string(),
    is_best_answer: z.boolean().default(false),
    upvotes: z.int().default(0),
    downvotes: z.int().default(0),
    post_id: z.string(),
    user_id: z.string(),
})

export const CommentsSchemaDb = CommentsSchema.extend({
    id: z.uuid(),
    created_at: z.date(),
    updated_at: z.date(),
})