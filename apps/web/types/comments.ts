import { CommentsSchema, CommentsSchemaDb } from '@api/src/models/comments.model';
import z from 'zod';

export type CreateCommentPayload = z.infer<typeof CommentsSchema>;
export type Comment = z.infer<typeof CommentsSchemaDb>;