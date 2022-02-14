import dotenv from 'dotenv';

import { NETWORK, VAULT_CONFIG } from '../constants';

import { getPoolIdByNetwork } from './utils';

let config: any = {};

const parsed = dotenv.config()?.parsed;

if (parsed && typeof parsed !== 'undefined') {
  config = { ...config, ...parsed };
}

// load local env
const allowed = [
  'INFURA',
  'SUPABASE_SERVICE_URL',
  'SUPABASE_SERVICE_KEY',
  'BALANCERVAULT_NETWORK',
  'BALANCERVAULT_POOL',
];
Object.keys(process.env).forEach((env) => {
  if (allowed.includes(env)) {
    config[env] = process.env[env];
  }
});

// load computed values
const CHAIN_ID = NETWORK[
  config.BALANCERVAULT_NETWORK?.toUpperCase()
] as unknown;
const VAULT_ADDRESS = VAULT_CONFIG[CHAIN_ID as number].vault;
const VAULT_POOLID = getPoolIdByNetwork(
  config.BALANCERVAULT_POOL,
  CHAIN_ID as number
);

config = { ...config, CHAIN_ID, VAULT_ADDRESS, VAULT_POOLID };

export default config as any;
