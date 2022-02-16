import { RouteShorthandOptions } from 'fastify';

export const priceQueryStringJson = {
  type: 'object',
  properties: {
    start_date: {
      type: 'string',
      format: 'date',
    },
    end_date: {
      type: 'string',
      format: 'date',
    },
    scale: {
      type: ['number', 'string'],
      default: 'month',
    },
    multi: {
      type: ['boolean', 'number'],
      default: 'false',
    },
  },
};

export const priceSchema: RouteShorthandOptions = {
  schema: {
    querystring: priceQueryStringJson,
  },
};

export const staticSchema: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          uptime: { type: 'number' },
        },
      },
    },
  },
};
