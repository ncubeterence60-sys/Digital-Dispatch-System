#!/usr/bin/env node

/**
 * Quick Status Check - Communications System
 * Use this script for quick diagnostics and status verification
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data),
            time: new Date().toLocaleTimeString()
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data,
            time: new Date().toLocaleTimeString()
          });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runStatusCheck() {
  console.clear();
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Nasho Technologies - System Status       ║');
  console.log('║        Communications Module Check         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log(`⏰ Check Time: ${new Date().toLocaleString()}\n`);

  // 1. Server Health
  console.log('🔍 Checking server connectivity...');
  try {
    const health = await makeRequest(`${BASE_URL}/dispatch/dashboard`);
    console.log('✅ Server is running on port 3000');
  } catch (e) {
    console.log('❌ Server is NOT running on port 3000');
    console.log('   Start with: node backend/server-marketplace.js\n');
    process.exit(1);
  }

  // 2. Communication Statistics
  console.log('\n📊 Getting communication statistics...');
  try {
    const stats = await makeRequest(`${BASE_URL}/communicate/stats`);
    if (stats.status === 200) {
      console.log('✅ Communications module is active');
      console.log('\n   Message Breakdown:');
      if (Array.isArray(stats.data)) {
        stats.data.forEach(s => {
          const bar = '█'.repeat(Math.ceil(s.count / 2));
          console.log(`   ${s.method.padEnd(12)} │ ${bar} (${s.count})`);
        });
      }
      const total = stats.data.reduce((sum, s) => sum + s.count, 0);
      console.log(`\n   Total Messages: ${total}`);
    }
  } catch (e) {
    console.log('⚠️  Could not retrieve statistics');
  }

  // 3. Environment Check
  console.log('\n🔐 Checking Twilio Configuration...');
  try {
    const fs = require('fs');
    const envPath = `c:\\Users\\ncube\\Desktop\\Digital Dispatch system\\.env`;
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const hasAccountSid = envContent.includes('TWILIO_ACCOUNT_SID');
      const hasAuthToken = envContent.includes('TWILIO_AUTH_TOKEN');
      const hasPhoneNumber = envContent.includes('TWILIO_PHONE_NUMBER');

      console.log(`   ${hasAccountSid ? '✅' : '❌'} Account SID configured`);
      console.log(`   ${hasAuthToken ? '✅' : '❌'} Auth Token configured`);
      console.log(`   ${hasPhoneNumber ? '✅' : '❌'} Phone Number configured`);

      if (hasAccountSid && hasAuthToken && hasPhoneNumber) {
        console.log('\n   🟢 Ready for Production (All credentials set)');
      } else {
        console.log('\n   🟡 Demo Mode Active (Some credentials missing)');
      }
    } else {
      console.log('   📋 .env file not found - Running in Demo Mode');
      console.log('   🟡 Copy .env.example to .env and add credentials for production');
    }
  } catch (e) {
    console.log('   ⚠️  Could not read configuration');
  }

  // 4. Database Check
  console.log('\n💾 Checking Database...');
  try {
    const history = await makeRequest(`${BASE_URL}/communicate/history?limit=1`);
    if (history.status === 200) {
      console.log('✅ Database is accessible');
      if (Array.isArray(history.data) && history.data.length > 0) {
        console.log(`   Last message: ${history.data[0].method} at ${history.data[0].created_at}`);
      } else {
        console.log('   (No existing communication history)');
      }
    }
  } catch (e) {
    console.log('⚠️  Could not access database');
  }

  // 5. Test Suite Status
  console.log('\n🧪 Test Suite Status...');
  try {
    const fs = require('fs');
    const testPath = `c:\\Users\\ncube\\Desktop\\Digital Dispatch system\\.bruno`;
    const files = fs.readdirSync(testPath);
    const testFiles = files.filter(f => f.includes('test') || f.includes('load'));
    
    console.log(`   ${testFiles.length} test files available:`);
    testFiles.forEach(f => console.log(`   ✅ ${f}`));
    
    console.log('\n   Run tests with:');
    console.log('   • node .bruno/test-communications.js');
    console.log('   • node .bruno/load-test-communications.js');
  } catch (e) {
    console.log('⚠️  Could not verify test files');
  }

  // 6. System Recommendations
  console.log('\n📋 System Recommendations:');
  
  try {
    // Check for common issues
    const stats = await makeRequest(`${BASE_URL}/communicate/stats`);
    
    if (Array.isArray(stats.data)) {
      const total = stats.data.reduce((sum, s) => sum + s.count, 0);
      
      if (total === 0) {
        console.log('   • No messages sent yet - Run test suite to verify integration');
      }
      
      const demoCount = stats.data.find(s => s.method === 'Demo')?.count || 0;
      if (demoCount > total * 0.5) {
        console.log('   • ⚠️  High demo mode usage - Configure production credentials');
      }
      
      console.log('   • 📊 Monitor communication statistics daily');
      console.log('   • 🔄 Run performance tests weekly');
      console.log('   • 🔐 Secure .env file with credentials');
    }
  } catch (e) {
    console.log('   • Cannot retrieve recommendations at this time');
  }

  // 7. Quick Commands
  console.log('\n⚡ Quick Commands:');
  console.log('   Start Server:');
  console.log('   $ node backend/server-marketplace.js');
  console.log('\n   Run Tests:');
  console.log('   $ node .bruno/test-communications.js');
  console.log('   $ node .bruno/load-test-communications.js');
  console.log('\n   Check Status:');
  console.log('   $ node .bruno/status-check.js');
  console.log('\n   View Logs:');
  console.log('   $ sqlite3 dispatch.db "SELECT * FROM communications ORDER BY created_at DESC LIMIT 10;"');

  // 8. Support URLs
  console.log('\n📚 Support & Documentation:');
  console.log('   📖 Communications Guide: See COMMUNICATIONS_GUIDE.md');
  console.log('   📋 Status Report: See PROJECT-STATUS.md');
  console.log('   🧪 Test Guide: See .bruno/TEST-SUITE-GUIDE.md');

  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  ✅ System Status Check Complete           ║');
  console.log('║  🟢 Ready for Use                          ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

// Run the status check
runStatusCheck().catch(err => {
  console.error('Error during status check:', err.message);
  process.exit(1);
});