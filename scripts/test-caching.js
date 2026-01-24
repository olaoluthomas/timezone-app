const http = require('http');

function makeRequest(callNumber) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    http.get('http://localhost:3001/api/timezone', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const parsed = JSON.parse(data);
        resolve({
          callNumber,
          cached: parsed.cached,
          city: parsed.city,
          responseTime
        });
      });
    }).on('error', reject);
  });
}

async function testCaching() {
  console.log('Testing Caching Performance\n' + '='.repeat(50));

  // Make 3 requests
  for (let i = 1; i <= 3; i++) {
    const result = await makeRequest(i);
    console.log(`Call ${result.callNumber}: ${result.cached ? 'CACHED' : 'UNCACHED'} - ${result.city} - ${result.responseTime}ms`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log('\n' + '='.repeat(50));
  console.log('✓ Caching verification complete!');
  process.exit(0);
}

testCaching();
