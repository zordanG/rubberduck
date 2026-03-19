// ESM
import "dotenv/config";
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { routes } from "./routes/routes.ts";
import dotenv from "dotenv";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import { FastifyRequest } from "fastify";

dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET || "default_secret_key";
const cookieSecretKey =
  process.env.COOKIE_SECRET || "default_cookie_secret_key";

if (!jwtSecretKey || !cookieSecretKey) {
  console.error(
    "Failed to load environment variables: JWT_SECRET or COOKIE_SECRET is not set",
  );
  process.exit(1);
}

const app = fastify().withTypeProvider<ZodTypeProvider>();

// jwt
app.register(fjwt, { secret: jwtSecretKey });

app.addHook("preHandler", (req: FastifyRequest, _res, next) => {
  req.jwt = app.jwt;
  return next();
});
// cookies
app.register(fCookie, {
  secret: cookieSecretKey,
  hook: "preHandler",
});

// Zod - Validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Inspector API",
      description: "API for capturing and inspecting requests",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

// Cors
app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});

// Routes
app.register(routes);

// Start server
app.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log("Docs available at /docs");
});
