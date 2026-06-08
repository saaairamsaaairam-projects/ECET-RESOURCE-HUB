const { createClient } = require('@supabase/supabase-js');
const url = 'https://jzahoijywicbyxcarucd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YWhvaWp5d2ljYnl4Y2FydWNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU1NDQ0MCwiZXhwIjoyMDg2MTMwNDQwfQ.DTAfY2UoJCViAx1ISzzkWdUpgjfx6IYaWUysjJid1Qg';
const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
(async () => {
  const email = 'verify-login+' + Date.now() + '@example.com';
  const password = 'TestPass123!';
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { test: 'true' }
  });
  if (error) {
    console.error('CREATE_USER_ERROR', error);
    process.exit(1);
  }
  console.log(JSON.stringify({ email, password, userId: data.user?.id }, null, 2));
})();
