// ESM
import '@repo/env';
import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { routes } from './routes/routes.ts';
import { fastifyRedis } from '@fastify/redis';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import cookie from '@fastify/cookie';
import errorHandlerPlugin from './plugins/error.plugin.ts';
import authPlugin from './plugins/auth.plugin.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

const allowedOrigins = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : ['http://localhost:3000'];

// Zod - Validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Inspector API',
      description: 'API for capturing and inspecting requests',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

// Cors
app.register(fastifyCors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
});

// Redis
app.register(fastifyRedis, {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASS,
  port: Number(process.env.REDIS_PORT || 6379), // Redis port
  family: 4, // 4 (IPv4) or 6 (IPv6)
});

// Cookies and JWT
app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  hook: 'onRequest',
});

app.register(authPlugin);

// Error Handler
app.register(errorHandlerPlugin);

// Routes
app.register(routes);

// Start server
app.listen({ port: 3001, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
