import z from 'zod';

export const PaginationPosts = z.object({
  limit: z.coerce.number().default(5),
  page: z.coerce.number().default(1),
});

export const PaginationComments = PaginationPosts.extend({
  post_id: z.string().optional(),
});

type PaginationPosts = z.infer<typeof PaginationPosts>;
export type PaginationCommentsType = z.infer<typeof PaginationComments>;
