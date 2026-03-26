import z from 'zod'

export const PaginationPosts = z.object({
  limit: z.coerce.number(),
  page: z.coerce.number(),
});

type PaginationPosts = z.infer<typeof PaginationPosts>;