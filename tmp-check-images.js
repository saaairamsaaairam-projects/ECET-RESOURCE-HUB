const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map((line) => line.split('=').map((part) => part.trim())));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('colleges').select('id,name,cover_image_url,gallery_images').limit(10);
  console.log('DB_ERR', error);
  console.log('DATA', JSON.stringify(data, null, 2));
})();
