import z from 'zod';
import { UserSchema } from './users.model.ts';

const Password = z.string().min(8);
const Email = z.email();

const SignUpSchema = z.object({
  email: Email,
  password: Password,
  username: z.string(),
  provider: z.enum(['credentials']),
});

const LoginSchema = z.object({
  email: Email,
  password: Password,
});

const SessionSchema = z.object({
  user_id: z.uuid(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

const SessionSchemaDb = SessionSchema.extend({
  id: z.uuid(),
  expires_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

const RefreshTokenSchema = z.object({
  session_id: z.uuid(),
});

const ChangePasswordSchema = z.object({
  old_password: Password,
  new_password: Password,
});

const ResetPasswordRequestSchema = z.object({
  email: Email,
});

const ResetPasswordConfirmSchema = z.object({
  token: z.string(),
  new_password: Password,
});

const RefreshTokenSchemaDb = RefreshTokenSchema.extend({
  id: z.uuid(),
  token: z.string(),
  expires_at: z.date(),
  created_at: z.date(),
  revoked: z.boolean().default(false),
});

const AuthResponseSchema = z.object({
  accessToken: z.string(),

  expiresIn: z.number(), // seconds
  tokenType: z.literal('Bearer'),

  user: UserSchema.pick({
    id: true,
    username: true,
    email: true,
    avatar_url: true,
  }),
});

export {
  SignUpSchema,
  LoginSchema,
  SessionSchema,
  SessionSchemaDb,
  RefreshTokenSchema,
  RefreshTokenSchemaDb,
  AuthResponseSchema,
  ChangePasswordSchema,
  ResetPasswordRequestSchema,
  ResetPasswordConfirmSchema,
};
