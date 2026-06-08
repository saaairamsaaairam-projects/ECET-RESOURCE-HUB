const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const [key, ...rest] = trimmed.split('=');
  process.env[key] = rest.join('=');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const email = `test-admin-${Date.now()}@example.com`;
  const password = 'TestAdmin123!';

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    console.error('CREATE_USER_ERR', createErr);
    process.exit(1);
  }

  const userId = created.user.id;
  const { error: adminErr } = await supabase.from('admins').upsert({ user_id: userId }, { onConflict: 'user_id' });

  if (adminErr) {
    console.error('ADMINS_UPSERT_ERR', adminErr);
    process.exit(1);
  }

  console.log(JSON.stringify({ email, password, userId }, null, 2));
})();
