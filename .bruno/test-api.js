#!/usr/bin/env node

/**
 * Nasho Technologies Dispatch System API Test Runner
 * Run this script to validate all API endpoints
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testResults = [];
let passed = 0;
let failed = 0;

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    const client = url.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTest(name, request, data = null, validator = null) {
  console.log(`\n🧪 Testing: ${name}`);
  process.stdout.write('   Running... ');

  try {
    const response = await makeRequest(request, data);

    if (validator) {
      const result = validator(response);
      if (result.passed) {
        console.log('✅ PASSED');
        passed++;
        testResults.push({ name, status: 'PASSED', details: result.details });
      } else {
        console.log('❌ FAILED');
        failed++;
        testResults.push({ name, status: 'FAILED', details: result.details });
      }
    } else {
      // Basic status check
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ PASSED');
        passed++;
        testResults.push({ name, status: 'PASSED', details: `Status: ${response.status}` });
      } else {
        console.log('❌ FAILED');
        failed++;
        testResults.push({ name, status: 'FAILED', details: `Status: ${response.status}` });
      }
    }
  } catch (error) {
    console.log('❌ ERROR');
    failed++;
    testResults.push({ name, status: 'ERROR', details: error.message });
  }
}

async function runAllTests() {
  console.log('🚀 Nasho Technologies Dispatch System API Tests');
  console.log('================================================');

  // Test 1: Login
  await runTest('User Login', {
    url: `${BASE_URL}/login`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    "username": "admin",
    "password": "admin"
  }, (response) => {
    if (response.status === 200 && response.body?.success) {
      return { passed: true, details: 'Login successful' };
    }
    return { passed: false, details: `Login failed: ${JSON.stringify(response.body)}` };
  });

  // Test 2: Get Drivers
  await runTest('Get All Drivers', {
    url: `${BASE_URL}/drivers`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      const driverCount = response.body.length;
      const hasNashoDriver = response.body.some(d => d.phone === '0782944287');
      return {
        passed: true,
        details: `Found ${driverCount} drivers${hasNashoDriver ? ' (including Nasho Driver)' : ''}`
      };
    }
    return { passed: false, details: 'Failed to retrieve drivers' };
  });

  // Test 3: Update Driver Location
  await runTest('Update Driver Location', {
    url: `${BASE_URL}/drivers/7/location`,
    method: 'PUT'
  }, null, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Location update failed: ${response.status}` };
  });

  // Test 4: Update Driver Status
  await runTest('Update Driver Status', {
    url: `${BASE_URL}/drivers/7/status`,
    method: 'PUT'
  }, null, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Status update failed: ${response.status}` };
  });

  // Test 5: Get Trips
  await runTest('Get All Trips', {
    url: `${BASE_URL}/trips`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      return { passed: true, details: `Found ${response.body.length} trips` };
    }
    return { passed: false, details: 'Failed to retrieve trips' };
  });

  // Test 6: Create Trip
  await runTest('Create New Trip', {
    url: `${BASE_URL}/trips`,
    method: 'POST'
  }, {
    pickup_location: "123 Main Street, Bulawayo",
    dropoff_location: "456 Park Road, Bulawayo",
    passenger_name: "Test Passenger",
    passenger_phone: "0771234567",
    driver_id: 7
  }, (response) => {
    if (response.status === 200 && response.body?.trip_id) {
      return { passed: true, details: `Trip created with ID: ${response.body.trip_id}` };
    }
    return { passed: false, details: `Trip creation failed: ${response.status}` };
  });

  // Test 7: Update Trip Status
  await runTest('Update Trip Status', {
    url: `${BASE_URL}/trips/1/status`,
    method: 'PUT'
  }, null, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Trip status update failed: ${response.status}` };
  });

  // Summary
  console.log('\n================================================');
  console.log('🏁 Test Results Summary');
  console.log('================================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
    console.log('\nFailed Tests:');
    testResults.filter(t => t.status !== 'PASSED').forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n💡 Tips:');
  console.log('  - Make sure the backend server is running on port 3000');
  console.log('  - Check server logs for detailed error messages');
  console.log('  - Use Bruno GUI for interactive testing');
  console.log('================================================');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };