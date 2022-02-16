import test from 'ava';

import { initConfig } from './config';

test('config returns minimal values', (t) => {
  const minimalKeys = ['PORT', 'CHAIN_ID', 'VAULT_ADDRESS', 'VAULT_POOLID'];
  const config = initConfig();
  const configKeys = Object.keys(config);

  t.is(config.PORT, '8000');
  t.truthy(minimalKeys.every((r) => configKeys.indexOf(r) >= 0));
});
