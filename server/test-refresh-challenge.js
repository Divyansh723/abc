// Quick test script to refresh challenge progress
// Usage: node test-refresh-challenge.js YOUR_AUTH_TOKEN

const token = process.argv[2];

if (!token) {
  console.log('Usage: node test-refresh-challenge.js YOUR_AUTH_TOKEN');
  console.log('\nTo get your token:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Application/Storage > Local Storage');
  console.log('3. Find "habitforge_token" or check Network tab for Authorization header');
  process.exit(1);
}

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/challenge-refresh/refresh-progress',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
