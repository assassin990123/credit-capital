import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_SERVICE_URL,
  process.env.SUPABASE_SERVICE_KEY
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

export default supabase;
