const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function testArchiveFunctions() {
  console.log('🧪 Testing photo archiving API functionality...\n');
  
  try {
    // Test 1: Get storage info
    console.log('📊 Test 1: Getting storage info via API');
    try {
      const storageResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/archive/storage-info',
        method: 'GET'
      });
      
      const response = JSON.parse(storageResponse.data);
      const storageInfo = response.data;
      console.log(`✅ Storage size: ${storageInfo.sizeFormatted}`);
      console.log(`✅ Total files: ${storageInfo.totalFiles}`);
      console.log(`✅ Total folders: ${storageInfo.folders}\n`);
    } catch (error) {
      console.log(`❌ Storage info error: ${error.message}\n`);
    }
    
    // Test 2: Archive by application ID
    console.log('📦 Test 2: Archiving application via API');
    try {
      const appResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/archive/application/25',
        method: 'GET'
      });
      
      console.log(`✅ Application archive created successfully (status: ${appResponse.statusCode})`);
      console.log(`✅ Content-Type: ${appResponse.headers['content-type']}`);
      console.log(`✅ Content-Disposition: ${appResponse.headers['content-disposition']}\n`);
    } catch (error) {
      console.log(`❌ Application archive error: ${error.message}\n`);
    }
    
    // Test 3: Archive by date range
    console.log('📅 Test 3: Archiving by date range via API');
    try {
      const dateResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/archive/date-range?dateFrom=2024-01-01&dateTo=2025-12-31',
        method: 'GET'
      });
      
      console.log(`✅ Date range archive created successfully (status: ${dateResponse.statusCode})`);
      console.log(`✅ Content-Type: ${dateResponse.headers['content-type']}`);
      console.log(`✅ Content-Disposition: ${dateResponse.headers['content-disposition']}\n`);
    } catch (error) {
      console.log(`❌ Date range archive error: ${error.message}\n`);
    }
    
    console.log('🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

testArchiveFunctions();