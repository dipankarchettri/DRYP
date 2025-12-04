// tests/api.test.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🚀 Starting API tests...\n');

  let testUserToken = null;
  let testUserId = null;
  const testEmail = `testuser_${Date.now()}@example.com`;

  // Test 1: Health Check
  try {
    console.log('🧪 1. Testing Health Check endpoint...');
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.status !== 200) throw new Error(`Status code: ${response.status}`);
    const data = await response.json();
    if (data.status !== 'ok') throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
    console.log('✅ Health Check: Passed\n');
  } catch (error) {
    console.error('❌ Health Check: Failed -', error.message, '\n');
  }

  // Test 2: User Registration
  try {
    console.log('🧪 2. Testing User Registration...');
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'password123',
      }),
    });
    if (response.status !== 200) throw new Error(`Status code: ${response.status}`);
    const data = await response.json();
    if (!data.token || !data.user._id) throw new Error('Token or user ID not received');
    testUserToken = data.token;
    testUserId = data.user._id;
    console.log('✅ User Registration: Passed\n');
  } catch (error) {
    console.error('❌ User Registration: Failed -', error.message, '\n');
  }

  // Test 3: Get Products (Unauthenticated)
  try {
    console.log('🧪 3. Testing Get Products...');
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (response.status !== 200) throw new Error(`Status code: ${response.status}`);
    const data = await response.json();
    console.log(`✅ Get Products: Passed (Received ${data.length} products)\n`);
  } catch (error) {
    console.error('❌ Get Products: Failed -', error.message, '\n');
  }
  
  // Test 4: Wishlist actions (Authenticated)
  if (testUserToken) {
    // Assuming there's at least one product to test with
    const testProductId = '60d5ecb5c9a7b3a0b4e5d3a5'; // Replace with a real product ID from your test DB if needed

    try {
        console.log('🧪 4a. Testing Add to Wishlist...');
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${testProductId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${testUserToken}` },
        });
        if (response.status !== 201) throw new Error(`Status code: ${response.status}`);
        console.log('✅ Add to Wishlist: Passed\n');
    } catch(error) {
        console.error('❌ Add to Wishlist: Failed -', error.message, '\n');
    }

    try {
        console.log('🧪 4b. Testing Remove from Wishlist...');
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${testProductId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${testUserToken}` },
        });
        if (response.status !== 200) throw new Error(`Status code: ${response.status}`);
        console.log('✅ Remove from Wishlist: Passed\n');
    } catch(error) {
        console.error('❌ Remove from Wishlist: Failed -', error.message, '\n');
    }
  }


  console.log('🏁 All tests complete.');
}

runTests();
