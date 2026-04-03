import z from 'zod';
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

const ErrorCodeEnum = z.enum([
  'AUTH_EMAIL_ALREADY_EXISTS',
  'AUTH_INVALID_CREDENTIALS',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID',
  'BAD_REQUEST',
  'FORBIDDEN',
  'INTERNAL_ERROR',
  'RESOURCE_NOT_FOUND',
  'UNAUTHORIZED',
  'VALIDATION_ERROR',
]);

const AppErrorSchema = z.object({
  code: ErrorCodeEnum,
  message: z.string(),
  status: z.number(),
});

type AppErrorParams = z.infer<typeof AppErrorSchema>;

class AppError extends Error {
  code: z.infer<typeof ErrorCodeEnum>;
  status: number;

  constructor({ code, message, status }: AppErrorParams) {
    super(message);
    this.code = code;
    this.status = status;
  }

  static badRequest(message = 'Invalid data') {
    return new AppError({ status: 400, code: 'BAD_REQUEST', message });
  }

  static unauthorized(message = 'Invalid or expired token') {
    return new AppError({ status: 401, code: 'UNAUTHORIZED', message });
  }

  static forbidden(message = 'Forbidden') {
    return new AppError({ status: 403, code: 'FORBIDDEN', message });
  }

  static notFound(message = 'Resource not found') {
    return new AppError({ status: 404, code: 'RESOURCE_NOT_FOUND', message });
  }

  static emailExists(message = 'Email already in use') {
    return new AppError({ status: 409, code: 'AUTH_EMAIL_ALREADY_EXISTS', message });
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new AppError({ status: 401, code: 'AUTH_INVALID_CREDENTIALS', message });
  }

  static internal(message = 'Something went wrong') {
    return new AppError({ status: 500, code: 'INTERNAL_ERROR', message });
  }
}

function defineErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError)
    return reply.status(error.status).send({
      code: error.code,
      message: error.message,
      status: error.status,
    });

  if (hasZodFastifySchemaValidationErrors(error))
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      status: 400,
    });

  return reply.status(500).send({
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
    status: 500,
  });
}

const ErrorDefaults = {
  400: AppErrorSchema.extend({
    code: z.enum(['BAD_REQUEST', 'VALIDATION_ERROR']),
    message: z.string().default('Invalid request data'),
    status: z.literal(400).default(400),
  }),
  401: AppErrorSchema.extend({
    code: z.enum(['UNAUTHORIZED', 'AUTH_INVALID_CREDENTIALS']),
    message: z.string().default('Invalid or expired token'),
    status: z.literal(401).default(401),
  }),
  403: AppErrorSchema.extend({
    code: z.literal('FORBIDDEN'),
    message: z.string().default('Insufficient Permissions'),
    status: z.literal(403).default(403),
  }),
  404: AppErrorSchema.extend({
    code: z.literal('RESOURCE_NOT_FOUND'),
    message: z.string().default('Resource not found'),
    status: z.literal(404).default(404),
  }),
  409: AppErrorSchema.extend({
    code: z.literal('AUTH_EMAIL_ALREADY_EXISTS'),
    message: z.string().default('Email already in use'),
    status: z.literal(409).default(409),
  }),
  500: AppErrorSchema.extend({
    code: z.literal('INTERNAL_ERROR'),
    message: z.string().default('Something went wrong'),
    status: z.literal(500).default(500),
  }),
};

export { defineErrorHandler, AppError, AppErrorParams, AppErrorSchema, ErrorDefaults };
