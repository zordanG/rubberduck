import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { defineErrorHandler } from '../utils/app-error.ts';

export default fp(async function (app: FastifyInstance) {
  app.setErrorHandler(defineErrorHandler);
});
