import { createClient } from '@supabase/supabase-js';

import config from './config';
import logger from './logger';

const supabase = (() => {
  try {
    return createClient(
      config.SUPABASE_SERVICE_URL,
      config.SUPABASE_SERVICE_KEY
    );
  } catch (ex) {
    logger.error('Failed to create supabase client', `Reason: ${ex.message}`);
  }

  return null;
})();

export const insertRow = async (row) => {
  if (supabase) {
    return await supabase
      .from('prices')
      .upsert(row, {
        returning: 'minimal',
        count: 'exact',
        ignoreDuplicates: true,
      })
      .throwOnError();
  }

  return null;
};

export default supabase;
