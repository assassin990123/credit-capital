// import { Server, IncomingMessage, ServerResponse } from 'http';

import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';

import config from './config';
import { getLastRow } from './database';

const server: FastifyInstance = Fastify({});

const opts: RouteShorthandOptions = {
  schema: {
    // response: {
    //   200: {
    //     type: 'object',
    //     properties: {
    //       pong: {
    //         type: 'string',
    //       },
    //       status: { type: 'string' },
    //       uptime: { type: 'number' },
    //     },
    //   },
    // },
  },
};

server.get('/ping', opts, async () => ({ pong: 'it worked!' }));
server.get('/health', opts, async () => ({
  status: 'ok',
  uptime: process.uptime(),
}));
server.get('/price', opts, async () => {
  const result = await getLastRow();
  if (result && result.error === null) {
    return result.data?.prices;
  }
});

export const startServer = async (onServerStarted: CallableFunction) => {
  try {
    await server.listen(config.PORT);
    const address = server.server.address();
    console.log('START', 'Server started', address);
    onServerStarted();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
