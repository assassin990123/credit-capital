import { BAL_WETH_POOL, CAPL_USDC_POOL, WETH_USDC_POOL } from './strings';

import { NETWORK } from './network';

export const POOLS = [
  {
    symbol: WETH_USDC_POOL,
    id: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]:
        '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004',
    },
  },
  {
    symbol: BAL_WETH_POOL,
    id: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]:
        '0x61d5dc44849c9c87b0856a2a311536205c96c7fd000200000000000000000000',
    },
  },
  {
    symbol: CAPL_USDC_POOL,
    id: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]:
        '0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624',
    },
  },
];
