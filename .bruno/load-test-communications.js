#!/usr/bin/env node

/**
 * Communications Performance & Load Test
 * Simulates concurrent WhatsApp, SMS, and notification requests
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let metrics = {
  requests: 0,
  successes: 0,
  failures: 0,
  totalTime: 0,
  avgTime: 0,
  minTime: Infinity,
  maxTime: 0,
  byMethod: {}
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = new URL(options.url);
    const client = url.protocol === 'https:' ? require('https') : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const response = {
            status: res.statusCode,
            body: body ? JSON.parse(body) : null,
            duration
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body,
            duration
          });
        }
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      reject({ error: error.message, duration });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function sendConcurrentRequests(count, method, methodName) {
  const promises = [];
  const testPhones = [
    '0782944287',
    '0771234567', 
    '0721112233',
    '0734445566',
    '0745556677'
  ];

  console.log(`\n📤 Sending ${count} ${methodName} requests concurrently...`);

  for (let i = 0; i < count; i++) {
    const phone = testPhones[i % testPhones.length];
    
    const payload = {
      to_phone: phone,
      message: `Concurrent test message ${i + 1}`,
      to_name: `Test User ${i + 1}`
    };

    promises.push(
      makeRequest({
        url: `${BASE_URL}${method}`,
        method: 'POST'
      }, payload).then(response => {
        return {
          method: methodName,
          success: response.status === 200,
          duration: response.duration,
          status: response.status
        };
      }).catch(error => {
        return {
          method: methodName,
          success: false,
          duration: error.duration || 0,
          error: error.error
        };
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      metrics.requests++;
      if (result.success) {
        metrics.successes++;
      } else {
        metrics.failures++;
      }
      
      metrics.totalTime += result.duration;
      metrics.minTime = Math.min(metrics.minTime, result.duration);
      metrics.maxTime = Math.max(metrics.maxTime, result.duration);
      
      if (!metrics.byMethod[result.method]) {
        metrics.byMethod[result.method] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: 0
        };
      }
      
      metrics.byMethod[result.method].count++;
      metrics.byMethod[result.method].min = Math.min(
        metrics.byMethod[result.method].min,
        result.duration
      );
      metrics.byMethod[result.method].max = Math.max(
        metrics.byMethod[result.method].max,
        result.duration
      );
    });

    const successCount = results.filter(r => r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log(`✅ Completed: ${successCount}/${count} successful`);
    console.log(`⏱️  Average time: ${avgDuration.toFixed(2)}ms`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runPerformanceTests() {
  console.log('\n🚀 Communications Performance & Load Test');
  console.log('=========================================\n');

  // Warm-up request
  console.log('🔄 Warming up...');
  try {
    await makeRequest({
      url: `${BASE_URL}/communicate/whatsapp`,
      method: 'POST'
    }, {
      to_phone: '0782944287',
      message: 'Warmup'
    });
  } catch (e) {
    console.log('Warmup failed - server may not be running');
  }

  // Test 1: 5 sequential WhatsApp requests
  console.log('\n📱 Test 1: Sequential Requests');
  console.log('------------------------------');
  for (let i = 0; i < 5; i++) {
    try {
      const response = await makeRequest({
        url: `${BASE_URL}/communicate/whatsapp`,
        method: 'POST'
      }, {
        to_phone: `078294${String(i).padStart(4, '0')}`,
        message: `Sequential message ${i + 1}`
      });
      console.log(`  Request ${i + 1}: ${response.duration}ms - ${response.status === 200 ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`  Request ${i + 1}: ERROR - ${e.error}`);
    }
  }

  // Test 2: Concurrent WhatsApp (10 requests)
  await sendConcurrentRequests(10, '/communicate/whatsapp', 'WhatsApp');

  // Test 3: Concurrent SMS (10 requests)
  await sendConcurrentRequests(10, '/communicate/sms', 'SMS');

  // Test 4: Concurrent Notifications (15 requests - mixed load)
  await sendConcurrentRequests(15, '/communicate/notify', 'Notification');

  // Test 5: Mixed concurrent requests
  console.log('\n🔀 Test 5: Mixed Concurrent Load (10 each method)');
  console.log('---------------------------------------------');
  const mixedPromises = [
    ...Array(10).fill(0).map((_, i) => 
      makeRequest({
        url: `${BASE_URL}/communicate/whatsapp`,
        method: 'POST'
      }, {
        to_phone: '0782944287',
        message: `Mixed WhatsApp ${i}`
      })
    ),
    ...Array(10).fill(0).map((_, i) => 
      makeRequest({
        url: `${BASE_URL}/communicate/sms`,
        method: 'POST'
      }, {
        to_phone: '0782944287',
        message: `Mixed SMS ${i}`
      })
    ),
    ...Array(10).fill(0).map((_, i) => 
      makeRequest({
        url: `${BASE_URL}/communicate/notify`,
        method: 'POST'
      }, {
        to_phone: '0782944287',
        message: `Mixed Notification ${i}`
      })
    )
  ];

  const startMixed = Date.now();
  try {
    const results = await Promise.all(mixedPromises);
    const mixedDuration = Date.now() - startMixed;
    const mixedSuccess = results.filter(r => r.status === 200).length;
    
    console.log(`✅ ${mixedSuccess}/30 requests successful`);
    console.log(`⏱️  Total time: ${mixedDuration}ms`);
    console.log(`📊 Throughput: ${(30000 / mixedDuration).toFixed(2)} requests/second`);
  } catch (e) {
    console.log(`❌ Mixed test error: ${e.message}`);
  }

  // Calculate final metrics
  metrics.avgTime = metrics.totalTime / metrics.requests;

  // Results Summary
  console.log('\n=========================================');
  console.log('📊 Performance Test Results');
  console.log('=========================================\n');

  console.log('Overall Metrics:');
  console.log(`  Total Requests: ${metrics.requests}`);
  console.log(`  Successful: ${metrics.successes} (${((metrics.successes / metrics.requests) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${metrics.failures}`);
  console.log(`  Average Response Time: ${metrics.avgTime.toFixed(2)}ms`);
  console.log(`  Min Response Time: ${metrics.minTime}ms`);
  console.log(`  Max Response Time: ${metrics.maxTime}ms`);
  console.log(`  Total Time: ${metrics.totalTime}ms`);

  console.log('\nBy Method:');
  Object.entries(metrics.byMethod).forEach(([method, stats]) => {
    const avg = stats.count > 0 ? (stats.count * stats.avg / stats.count) : 0;
    console.log(`  ${method}:`);
    console.log(`    Requests: ${stats.count}`);
    console.log(`    Min: ${stats.min}ms, Max: ${stats.max}ms`);
  });

  console.log('\n=========================================');
  console.log('✅ Performance test completed!');
  console.log('=========================================\n');

  if (metrics.avgTime < 100) {
    console.log('🎯 Excellent performance! System handles load well.\n');
  } else if (metrics.avgTime < 500) {
    console.log('✅ Good performance. Suitable for production.\n');
  } else {
    console.log('⚠️  Response times are high. May need optimization.\n');
  }
}

// Run the performance tests
runPerformanceTests().catch(console.error);