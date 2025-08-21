// Simple test script for the new Sogni AI implementation
// Run with: node test-sogni.js
// Requires Node.js 18+ for native fetch support

async function testSogniAPI() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('🧪 Testing Sogni AI API...\n');

  try {
    // Test 1: Generate Image
    console.log('1️⃣ Testing image generation...');
    const generateResponse = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A person doing yoga at sunrise, peaceful, wellness, digital art',
        numberOfImages: 1,
        steps: 20,
        guidance: 7.5,
        sizePreset: 'square_hd',
        tokenType: 'spark'
      }),
    });

    if (generateResponse.ok) {
      const data = await generateResponse.json();
      console.log('✅ Image generation successful:', data.success);
      console.log('   Project ID:', data.projectId);
      console.log('   Images:', data.imageUrls?.length || 0);
      if (data.fallback) {
        console.log('   ⚠️ Using fallback service');
      }
    } else {
      const error = await generateResponse.text();
      console.log('❌ Image generation failed:', error);
    }

  } catch (error) {
    console.log('❌ Image generation error:', error.message);
  }

  try {
    // Test 2: Get Models
    console.log('\n2️⃣ Testing models endpoint...');
    const modelsResponse = await fetch(`${baseUrl}/api/models`);

    if (modelsResponse.ok) {
      const data = await modelsResponse.json();
      console.log('✅ Models endpoint successful');
      console.log('   Total models:', data.totalModels);
      console.log('   Recommended model:', data.recommendedModel?.name);
    } else {
      const error = await modelsResponse.text();
      console.log('❌ Models endpoint failed:', error);
    }

  } catch (error) {
    console.log('❌ Models endpoint error:', error.message);
  }

  try {
    // Test 3: Get Account Info
    console.log('\n3️⃣ Testing account endpoint...');
    const accountResponse = await fetch(`${baseUrl}/api/account`);

    if (accountResponse.ok) {
      const data = await accountResponse.json();
      console.log('✅ Account endpoint successful');
      console.log('   Has balance:', data.hasBalance);
      if (data.balance) {
        console.log('   SOGNI tokens:', data.balance.sogni);
        console.log('   SPARK tokens:', data.balance.spark);
      }
    } else {
      const error = await accountResponse.text();
      console.log('❌ Account endpoint failed:', error);
    }

  } catch (error) {
    console.log('❌ Account endpoint error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testSogniAPI().catch(console.error);
