import test from 'ava';

import { getPoolTokens } from './contract';

const data = {
  poolId: '0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624',
  expected: {
    tokens: [
      '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115',
      '0xe6264813D43Ef97cCE76E66be873040eBe9be09A',
    ],
  },
};

test('contract getPoolTokens must return tokens from given poolid', async (t) => {
  const poolTokens = await getPoolTokens();
  const tokens = poolTokens.tokens;

  t.truthy(Array.isArray(poolTokens));
  t.truthy(data.expected.tokens.every((t) => tokens.indexOf(t) >= 0));
});
