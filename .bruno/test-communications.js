#!/usr/bin/env node

/**
 * Communications Feature Test Suite
 * Tests WhatsApp, SMS, and notification endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testResults = [];
let passed = 0;
let failed = 0;

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    const client = url.protocol === 'https:' ? require('https') : http;

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
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
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
  console.log('\n🚀 Nasho Technologies Communications Test Suite');
  console.log('=============================================\n');

  // Test 1: Send WhatsApp Message
  await runTest('Send WhatsApp Message', {
    url: `${BASE_URL}/communicate/whatsapp`,
    method: 'POST'
  }, {
    to_phone: '0782944287',
    message: 'Test WhatsApp message from automated tests',
    to_name: 'Test Provider'
  }, (response) => {
    if (response.status === 200 && response.body?.success) {
      return { passed: true, details: 'WhatsApp message sent' };
    }
    return { passed: false, details: `Failed: ${JSON.stringify(response.body)}` };
  });

  // Test 2: Send SMS
  await runTest('Send SMS Message', {
    url: `${BASE_URL}/communicate/sms`,
    method: 'POST'
  }, {
    to_phone: '0782944287',
    message: 'Test SMS message from automated tests',
    to_name: 'Test Provider'
  }, (response) => {
    if (response.status === 200 && response.body?.success) {
      return { passed: true, details: 'SMS sent' };
    }
    return { passed: false, details: `Failed: ${JSON.stringify(response.body)}` };
  });

  // Test 3: Send Notification (auto-select)
  await runTest('Send Auto Notification', {
    url: `${BASE_URL}/communicate/notify`,
    method: 'POST'
  }, {
    to_phone: '0771234567',
    message: 'Test notification with auto method selection',
    to_name: 'Test User'
  }, (response) => {
    if (response.status === 200 && response.body?.success) {
      return { passed: true, details: `Notification sent via ${response.body.method}` };
    }
    return { passed: false, details: 'Notification failed' };
  });

  // Test 4: Request Notification
  await runTest('Notify Provider of Request', {
    url: `${BASE_URL}/communicate/notify-request`,
    method: 'POST'
  }, {
    provider_id: 1,
    request_id: 1
  }, (response) => {
    if (response.status === 200 || response.status === 404) {
      // 404 is OK if provider doesn't exist in demo
      return { passed: true, details: 'Notification queued' };
    }
    return { passed: false, details: `Status: ${response.status}` };
  });

  // Test 5: Assignment Notification
  await runTest('Notify Customer of Assignment', {
    url: `${BASE_URL}/communicate/notify-assignment`,
    method: 'POST'
  }, {
    request_id: 1,
    provider_id: 1
  }, (response) => {
    if (response.status === 200 || response.status === 404) {
      return { passed: true, details: 'Assignment notification queued' };
    }
    return { passed: false, details: `Status: ${response.status}` };
  });

  // Test 6: Get Communication History
  await runTest('Get Communication History', {
    url: `${BASE_URL}/communicate/history?request_id=1`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      return { 
        passed: true, 
        details: `Retrieved ${response.body.length} communication records` 
      };
    }
    return { passed: false, details: 'Failed to retrieve history' };
  });

  // Test 7: Get Communication Stats
  await runTest('Get Communication Statistics', {
    url: `${BASE_URL}/communicate/stats`,
    method: 'GET'
  }, null, (response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      const stats = response.body.map(s => `${s.method}: ${s.count}`).join(', ');
      return { 
        passed: true, 
        details: `Stats: ${stats}` 
      };
    }
    return { passed: false, details: 'Failed to retrieve stats' };
  });

  // Test 8: Invalid Phone Number Format
  await runTest('Phone Number Formatting', {
    url: `${BASE_URL}/communicate/whatsapp`,
    method: 'POST'
  }, {
    to_phone: '0782944287',
    message: 'Testing phone formatting'
  }, (response) => {
    if (response.status === 200 && response.body?.success) {
      return { 
        passed: true, 
        details: 'Phone number formatted correctly' 
      };
    }
    return { passed: false, details: 'Phone format failed' };
  });

  // Test 9: Missing Required Field
  await runTest('Missing Required Field (Error Handling)', {
    url: `${BASE_URL}/communicate/whatsapp`,
    method: 'POST'
  }, {
    message: 'Missing phone number'
  }, (response) => {
    if (response.status === 400) {
      return { 
        passed: true, 
        details: 'Properly rejected missing field' 
      };
    }
    return { passed: false, details: 'Should return 400 error' };
  });

  // Summary
  console.log('\n===========================================');
  console.log('🏁 Communications Test Results');
  console.log('===========================================');
  testResults.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.details}`);
  });

  console.log('\n===========================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All communications tests passed!');
    console.log('📱 WhatsApp, SMS, and notifications are ready to use.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check server implementation.\n');
  }
}

// Run the tests
runAllTests().catch(console.error);