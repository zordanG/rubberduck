// ESM
import '@repo/env';
import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { routes } from './routes/routes.ts'
import { fastifyRedis } from '@fastify/redis'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Zod - Validation
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Inspector API',
      description: 'API for capturing and inspecting requests',
      version: '1.0.0',
    }
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

// Cors
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
})

// Redis
app.register(fastifyRedis, {
  host: '127.0.0.1',
  password: process.env.REDIS_PASS,
  port: Number(process.env.REDIS_PORT || 6379), // Redis port
  family: 4   // 4 (IPv4) or 6 (IPv6)
})

// Routes
app.register(routes)

// Start server
app.listen({ port: 3001, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  // console.log("Docs available at /docs")
})