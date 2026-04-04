import z from 'zod';

const UserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  password: z.string(),
  avatar_url: z.string().optional().nullable(),
  reputation: z.int().default(0),
  provider: z.string(),
  email_verified: z.boolean().default(false),
});

const UserSchemaDb = UserSchema.extend({
  created_at: z.date(),
  update_at: z.date(),
});

export { UserSchema, UserSchemaDb };
