import { ethers } from 'ethers';

import config from './config';
import { getPoolTokens } from './contract';
import { insertRow } from './database';
import { getTokenByContract } from './utils';

export const bootstrap = async () => {
  const fetchStartTime = new Date();
  try {
    const poolTokens = await getPoolTokens();
    const [token1, token2] = poolTokens.tokens.map((token) =>
      getTokenByContract(token, config.CHAIN_ID)
    );

    const [balance1, balance2] = [
      ethers.utils.formatUnits(poolTokens['balances'][0], token1.decimals),
      ethers.utils.formatUnits(poolTokens['balances'][1], token2.decimals),
    ];

    const prices = [
      {
        type: [token1.symbol, token2.symbol].join('/'),
        value: parseFloat(balance1) / parseFloat(balance2),
      },
      {
        type: [token2.symbol, token1.symbol].join('/'),
        value: parseFloat(balance2) / parseFloat(balance1),
      },
    ];

    const result = {
      [token1.symbol.toLowerCase() + '_balance']: balance1,
      [token2.symbol.toLowerCase() + '_balance']: balance2,
      prices,
      fetch_start_time: fetchStartTime,
      fetch_end_time: new Date(),
    };

    console.log('RESULT', result);

    await insertRow(result);
  } catch (ex) {
    console.log();
  }
};
