import dotenv from 'dotenv';

import { NETWORK, VAULT_CONFIG } from '../constants';
import { ConfigOptions } from '../models/config';

import logger from './logger';
import { redactObj } from './redact';
import { getPoolIdByNetwork } from './utils';

const defaultConfig: ConfigOptions = {
  PORT: 8000,
};

export const initConfig = (defaults = defaultConfig): ConfigOptions => {
  let _config: ConfigOptions = { ...defaults };
  const parsed = dotenv.config()?.parsed;

  if (parsed && typeof parsed !== 'undefined') {
    _config = { ..._config, ...parsed };
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
      _config[env] = process.env[env];
    }
  });
  logger.log('before loading of computed values', redactObj(_config));

  // load computed values
  const CHAIN_ID = NETWORK[
    _config.BALANCERVAULT_NETWORK?.toUpperCase()
  ] as unknown;
  const VAULT_ADDRESS = VAULT_CONFIG[CHAIN_ID as number].vault;
  const VAULT_POOLID = getPoolIdByNetwork(
    _config.BALANCERVAULT_POOL,
    CHAIN_ID as number
  );

  _config = {
    ..._config,
    CHAIN_ID: CHAIN_ID as number,
    VAULT_ADDRESS,
    VAULT_POOLID,
  };

  logger.log('after loading', redactObj(_config));
  return _config;
};

const config = initConfig();

export default config;
