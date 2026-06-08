const https = require('https');
const urls = [
  'https://jzahoijywicbyxcarucd.supabase.co/storage/v1/object/public/college-images/5732cfca-bfb5-4928-9381-7ab658614af9.png',
  'https://jzahoijywicbyxcarucd.supabase.co/storage/v1/object/public/college-images/b0f936e8-a481-470d-aab8-79eaf0d369cd.jpeg',
  'https://jzahoijywicbyxcarucd.supabase.co/storage/v1/object/public/college-images/92f43774-0d09-4fff-a551-78103d90f17d.jpeg'
];

function head(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      console.log(url, 'STATUS', res.statusCode, 'CONTENT-TYPE', res.headers['content-type']);
      resolve();
    }).on('error', (err) => {
      console.log(url, 'ERR', err.message);
      resolve();
    });
  });
}

(async () => {
  for (const url of urls) await head(url);
})();
