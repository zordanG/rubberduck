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
const publicRoutes = new Set(["/auth/login", "/auth/logout"]);
const publicPrefixes = ["/docs"];

// jwt
app.register(fjwt, { secret: jwtSecretKey });

app.addHook("preHandler", (req: FastifyRequest, _res, next) => {
  req.jwt = app.jwt;
  return next();
});
// cookies
app.register(fCookie, {
  secret: cookieSecretKey,
  hook: "onRequest",
});

// Decorator de autenticação — verifica JWT vindo do cookie
app.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const signedToken = request.cookies.access_token;
    if (!signedToken) {
      return reply.status(401).send({ message: "Não autenticado" });
    }
    try {
      const unsigned = request.unsignCookie(signedToken);
      const token = unsigned.valid ? unsigned.value : signedToken;
      const decoded = app.jwt.verify<{
        id: string;
        email: string;
        name: string;
      }>(token!);
      request.user = decoded;
    } catch (_err) {
      return reply.status(401).send({ message: "Token inválido ou expirado" });
    }
  },
);

app.addHook("onRequest", async (request, reply) => {
  const path = request.raw.url?.split("?")[0] ?? "";

  if (
    request.method === "OPTIONS" ||
    publicRoutes.has(path) ||
    publicPrefixes.some((p) => path.startsWith(p))
  ) {
    return;
  }

  return app.authenticate(request, reply);
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
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    withCredentials: true,
  },
});

// Cors
app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});

// Routes
app.register(routes);

// Start server
const PORT = Number(process.env.PORT) || 3001;
app.listen({ port: PORT, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log("Docs available at /docs");
});
