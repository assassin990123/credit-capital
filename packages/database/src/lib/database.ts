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

export default supabase;
