import { NETWORK } from './network';

export const VAULT_CONFIG: Record<NETWORK, { chainId: number; vault: string }> =
  {
    [NETWORK.MAINNET]: {
      chainId: NETWORK.MAINNET, //1
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
    [NETWORK.KOVAN]: {
      chainId: NETWORK.KOVAN, //42
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
    [NETWORK.GOERLI]: {
      chainId: NETWORK.GOERLI, //5
      vault: '0x65748E8287Ce4B9E6D83EE853431958851550311',
    },
    [NETWORK.POLYGON]: {
      chainId: NETWORK.POLYGON, //137
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
    [NETWORK.ARBITRUM]: {
      chainId: NETWORK.ARBITRUM, //42161
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
  };
