#!/usr/bin/env node

const http = require('http');

const testData = JSON.stringify({
  prompt: "serene natural landscape, peaceful zen garden, flowing water, lush greenery, meditation space, tranquil atmosphere",
  stylePrompt: "wellness, peaceful, calming, nature photography, high quality, serene, beautiful lighting",
  negativePrompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature",
  steps: 35,
  guidance: 8.0,
  aspectRatio: "1:1",
  numberOfImages: 1
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing Sogni API integration...');
console.log('📡 Sending request to http://localhost:3002/api/generate');
console.log('📝 Prompt:', JSON.parse(testData).prompt);

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
        console.log('✅ API Test Successful!');
        console.log('🖼️  Generated image URLs:', response.imageUrls);
        console.log('📊 Response:', JSON.stringify(response, null, 2));
      } else {
        console.log('❌ API Test Failed!');
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

req.write(testData);
req.end();
