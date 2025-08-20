#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/models',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🧪 Testing Sogni AI Models API...');
console.log('📡 Sending request to http://localhost:3002/api/models');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      if (res.statusCode === 200) {
        console.log('✅ Models API Test Successful!');
        console.log(`📊 Total models available: ${response.totalCount}`);
        console.log(`🎯 Recommended models: ${response.models.recommended.length}`);
        
        console.log('\n🎨 Available Models:');
        response.models.all.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name} (${model.id})`);
          console.log(`   Category: ${model.category}`);
          console.log(`   Recommended: ${model.recommended ? '✅' : '❌'}`);
          console.log(`   Description: ${model.description}`);
          console.log('');
        });
      } else {
        console.log('❌ Models API Test Failed!');
        console.log('📊 Error response:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('❌ Failed to parse JSON response');
      console.log('📊 Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('💡 Make sure the Sogni API is running on port 3002');
  console.log('💡 Run: npm run dev (in the sogni-api directory)');
});

req.end();
