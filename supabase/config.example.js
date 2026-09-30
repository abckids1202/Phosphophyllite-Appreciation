// Copy this file to supabase/config.js and fill in the public project values.
// Load it before app.js in the HTML pages when you are ready to enable syncing.
window.PHOS_SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY',
  // Supply these after authentication to enable pending submissions and reactions.
  accessToken: 'SIGNED_IN_ACCESS_TOKEN',
  userId: 'SIGNED_IN_USER_UUID',
};
