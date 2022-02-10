import Token from '../types/token';

import { NETWORK } from './network';

export const TOKENS: Token[] = [
  {
    symbol: 'CAPL',
    decimals: 18,
    contracts: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]: '0xe6264813D43Ef97cCE76E66be873040eBe9be09A',
    },
  },
  {
    symbol: 'BAL',
    decimals: 18,
    contracts: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]: '0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7',
    },
  },
  {
    symbol: 'USDC',
    decimals: 6,
    contracts: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]: '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115',
    },
  },
  {
    symbol: 'WETH',
    decimals: 18,
    contracts: {
      [NETWORK.POLYGON]: '',
      [NETWORK.KOVAN]: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    },
  },
];
