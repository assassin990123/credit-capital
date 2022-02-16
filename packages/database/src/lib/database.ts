import { createClient } from '@supabase/supabase-js';

import config from './config';

const supabase = createClient(
  config.SUPABASE_SERVICE_URL,
  config.SUPABASE_SERVICE_KEY
);

export const insertRow = async (row) =>
  await supabase.from('prices').upsert(row, {
    returning: 'minimal',
    count: 'exact',
    ignoreDuplicates: true,
  });

export const getLastRow = async () =>
  await supabase
    .from('prices')
    .select('prices')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

export const getRows = (filters) => {
  console.log('getRows', filters);
  return supabase
    .from('prices')
    .select('*')
    .gte('created_at', filters.start_date)
    .lte('created_at', filters.end_date)
    .order('created_at', { ascending: false }); //desc
};

export const getRow = async (filters) => {
  return await getRows(filters).limit(1).maybeSingle();
};

export default supabase;
