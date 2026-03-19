#!/usr/bin/env node

/**
 * Nasho Technologies Service Marketplace API Test Runner
 * Tests all service types and marketplace functionality
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
    console.log('❌ ERROR:', error.message);
    failed++;
    testResults.push({ name, status: 'ERROR', details: error.message });
  }
}

async function runAllTests() {
  console.log('🚀 Nasho Technologies Service Marketplace API Tests');
  console.log('==================================================');

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

  // Test 2: Get Service Types
  await runTest('Get Service Types', {
    url: `${BASE_URL}/services`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body) && response.body.length >= 5) {
      const services = response.body.map(s => s.name).join(', ');
      return { passed: true, details: `Found services: ${services}` };
    }
    return { passed: false, details: 'Failed to retrieve service types' };
  });

  // Test 3: Get Service Providers
  await runTest('Get Service Providers', {
    url: `${BASE_URL}/providers`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      const providerCount = response.body.length;
      const services = [...new Set(response.body.map(p => p.service_type_name))].join(', ');
      return {
        passed: true,
        details: `Found ${providerCount} providers across: ${services}`
      };
    }
    return { passed: false, details: 'Failed to retrieve providers' };
  });

  // Test 4: Get Providers by Service Type
  await runTest('Get Transport Providers', {
    url: `${BASE_URL}/providers?service_type=Transport`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      return { passed: true, details: `Found ${response.body.length} transport providers` };
    }
    return { passed: false, details: 'Failed to filter transport providers' };
  });

  // Test 5: Get Service Requests
  await runTest('Get Service Requests', {
    url: `${BASE_URL}/requests`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      return { passed: true, details: `Found ${response.body.length} service requests` };
    }
    return { passed: false, details: 'Failed to retrieve service requests' };
  });

  // Test 6: Create Transport Request
  await runTest('Create Transport Request', {
    url: `${BASE_URL}/requests`,
    method: 'POST'
  }, {
    user_name: "Test User",
    user_phone: "0771234567",
    service_type_id: 1,
    description: "Need a ride to the airport",
    pickup_location: "123 Main Street, Bulawayo",
    dropoff_location: "456 Airport Road, Bulawayo"
  }, (response) => {
    if (response.status === 200 && response.body?.request_id) {
      return { passed: true, details: `Transport request created with ID: ${response.body.request_id}` };
    }
    return { passed: false, details: `Transport request creation failed: ${response.status}` };
  });

  // Test 7: Create Delivery Request
  await runTest('Create Delivery Request', {
    url: `${BASE_URL}/requests`,
    method: 'POST'
  }, {
    user_name: "Shop Owner",
    user_phone: "0779876543",
    service_type_id: 2,
    description: "Deliver groceries to customer",
    pickup_location: "Supermarket, Bulawayo CBD",
    dropoff_location: "456 Residential Area, Bulawayo",
    notes: "Fragile items - handle with care"
  }, (response) => {
    if (response.status === 200 && response.body?.request_id) {
      return { passed: true, details: `Delivery request created with ID: ${response.body.request_id}` };
    }
    return { passed: false, details: `Delivery request creation failed: ${response.status}` };
  });

  // Test 8: Update Provider Location
  await runTest('Update Provider Location', {
    url: `${BASE_URL}/providers/1/location`,
    method: 'PUT'
  }, {
    lat: -20.15,
    lng: 28.58
  }, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Location update failed: ${response.status}` };
  });

  // Test 9: Update Provider Status
  await runTest('Update Provider Status', {
    url: `${BASE_URL}/providers/1/status`,
    method: 'PUT'
  }, {
    status: "Available"
  }, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Status update failed: ${response.status}` };
  });

  // Test 10: Update Request Status
  await runTest('Update Request Status', {
    url: `${BASE_URL}/requests/1/status`,
    method: 'PUT'
  }, {
    status: "In Progress"
  }, (response) => {
    if (response.status === 200 && response.body?.message) {
      return { passed: true, details: response.body.message };
    }
    return { passed: false, details: `Request status update failed: ${response.status}` };
  });

  // Summary
  console.log('\n==================================================');
  console.log('🏁 Service Marketplace Test Results Summary');
  console.log('==================================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Service marketplace is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check server implementation.');
  }
}

// Run the tests
runAllTests().catch(console.error);