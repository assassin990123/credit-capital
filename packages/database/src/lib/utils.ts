import fs from 'fs';

import moment from 'moment';

import { POOLS, TOKENS } from '../constants';

export const readFile = (filepath: string): string =>
  fs.readFileSync(filepath).toString('utf-8');

export const getPoolIdByNetwork = (poolName: string, chainId: number) => {
  const pool = POOLS.find((pool) => pool.symbol === poolName);
  return pool?.id[chainId];
};

export const getTokenByContract = (contract: string, chainId) =>
  TOKENS.find((token) => token.contracts[chainId] === contract);

export const formatUTC = (date: moment.Moment) => date.utc().toISOString();
