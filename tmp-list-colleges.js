const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const envText = fs.readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('id,slug,name,placements,fees')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('SUPABASE QUERY ERROR:', error);
      process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
    process.exit(1);
  }
})();
