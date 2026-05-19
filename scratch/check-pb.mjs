const PB_URL = 'https://suprima-platform-pb.fly.dev';
const ADMIN_EMAIL = 'chrisklee69@gmail.com';
const ADMIN_PASSWORD = 'aussie1996@@';

async function checkCollections() {
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });

  if (!authRes.ok) {
    console.error('Authentication failed');
    process.exit(1);
  }

  const authData = await authRes.json();
  const token = authData.token;

  const collectionsRes = await fetch(`${PB_URL}/api/collections?perPage=200`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!collectionsRes.ok) {
    console.error('Failed to fetch collections');
    process.exit(1);
  }

  const collectionsData = await collectionsRes.json();
  const names = collectionsData.items.map(c => c.name);
  console.log('Collections in PocketBase:');
  console.log(names.join(', '));
}

checkCollections().catch(console.error);
