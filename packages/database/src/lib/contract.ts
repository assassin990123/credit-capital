import { ethers } from 'ethers';

import { BALANCER_VAULT } from '../abi';

import config from './config';
import logger from './logger';
import provider from './provider';

const contract: ethers.Contract = (() => {
  try {
    return new ethers.Contract(config.VAULT_ADDRESS, BALANCER_VAULT, provider);
  } catch (ex) {
    logger.error(
      'Error occurred when creating contract handle.',
      `Reason: ${ex.message}`
    );
  }

  return null;
})();

export const getPoolTokens = async (poolId: string = config.VAULT_POOLID) => {
  if (contract) {
    return await contract.getPoolTokens(poolId);
  }
  logger.error('Contact handle not available, returning empty');
  return [];
};
