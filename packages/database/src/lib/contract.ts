import { ethers } from 'ethers';

import { BALANCER_VAULT } from '../abi';

import config from './config';
import provider from './provider';

const contract = new ethers.Contract(
  config.VAULT_ADDRESS,
  BALANCER_VAULT,
  provider
);

export const getPoolTokens = async () =>
  await contract.getPoolTokens(config.VAULT_POOLID);