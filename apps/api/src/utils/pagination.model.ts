import z from 'zod';

export const PaginationPosts = z.object({
  limit: z.coerce.number().default(5),
  page: z.coerce.number().default(1),
});

type PaginationPosts = z.infer<typeof PaginationPosts>;
