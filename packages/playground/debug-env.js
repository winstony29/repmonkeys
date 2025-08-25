#!/usr/bin/env node

console.log('🔍 Environment Variable Debug Script');
console.log('======================================');

// Load environment variables
require('dotenv').config();

console.log('\n📁 Current working directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

console.log('\n🔍 Environment Files Check:');
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} exists (${stats.size} bytes, modified: ${stats.mtime.toISOString()})`);
    
    // Read first few lines
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(0, 10);
      console.log(`   Content preview (first 10 lines):`);
      lines.forEach((line, index) => {
        if (line.trim()) {
          console.log(`   ${index + 1}: ${line.includes('=') ? line.split('=')[0] + '=***' : line}`);
        }
      });
    } catch (error) {
      console.log(`   ❌ Error reading file: ${error.message}`);
    }
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});

console.log('\n🔍 Process Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);

const requiredVars = [
  'NEXT_PUBLIC_WELLNESS_NFT_ADDRESS',
  'NEXT_PUBLIC_WELL_TOKEN_ADDRESS',
  'NEXT_PUBLIC_REWARDS_ADDRESS',
  'NEXT_PUBLIC_USER_PROFILE_ADDRESS',
  'NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.slice(0, 10)}...${value.slice(-4)}`);
  } else {
    console.log(`❌ ${varName}: UNDEFINED`);
  }
});

console.log('\n🔍 All NEXT_PUBLIC_ variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`   ${key}: ${value ? (value.length > 20 ? value.slice(0, 10) + '...' + value.slice(-4) : value) : 'UNDEFINED'}`);
  });

console.log('\n🌐 Testing Base Sepolia RPC Connection:');
const https = require('https');

const testRpc = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1
    });

    const options = {
      hostname: 'sepolia.base.org',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

testRpc()
  .then(response => {
    console.log('✅ RPC Response:', response);
    if (response.result === '0x14a33') {
      console.log('✅ Base Sepolia RPC connection successful (Chain ID: 84532)');
    } else {
      console.log('❌ Unexpected chain ID:', response.result);
    }
  })
  .catch(error => {
    console.log('❌ RPC connection failed:', error.message);
  });


