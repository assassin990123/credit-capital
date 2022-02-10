import { ethers } from 'ethers';

import config from './config';

const provider = new ethers.providers.JsonRpcProvider(config.INFURA);

export default provider;
