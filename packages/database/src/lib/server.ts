import Fastify, { FastifyInstance } from 'fastify';

import { priceSchema, staticSchema } from '../models/schemas';

import config from './config';
import { getLastRow, getRow, getRows } from './database';
import { hasQuery, parseQueryToFilter } from './utils';

const server: FastifyInstance = Fastify({});

server.get('/', staticSchema, async () => ({ status: 'ok' }));
server.get('/health', staticSchema, async () => ({
  status: 'ok',
  uptime: process.uptime(),
}));

server.get('/price', priceSchema, async (request) => {
  if (hasQuery(request)) {
    console.log(request.query);
    const query: { multi?: number; start_date?: string; end_date?: string } =
      request.query;
    const filters = parseQueryToFilter(query);

    if (query.multi) return await getRows(filters).then((res) => res.data);

    return await getRow(filters);
  } else {
    const result = await getLastRow();
    if (result && result.error === null) {
      return result.data;
    }
  }

  return { prices: [] };
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
