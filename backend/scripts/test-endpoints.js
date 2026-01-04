// Native fetch is available in Node.js 18+


const BASE_URL = 'http://localhost:4000';

async function testEndpoints() {
    console.log('🧪 Starting Backend Health Check...');
    let passed = true;

    try {
        // Test 1: Health Check (Root)
        console.log('\n--- Testing Root Endpoint (GET /) ---');
        const rootRes = await fetch(`${BASE_URL}/`);
        if (rootRes.status === 200) {
            const data = await rootRes.json();
            console.log('✅ Root endpoint is UP.');
            console.log('   Response:', data.name);
        } else {
            console.error(`❌ Root endpoint failed with status: ${rootRes.status}`);
            passed = false;
        }

        // Test 2: Products Endpoint
        console.log('\n--- Testing Products Endpoint (GET /api/products) ---');
        const productsRes = await fetch(`${BASE_URL}/api/products`);
        if (productsRes.status === 200) {
            console.log('✅ Products endpoint is accessible.');
        } else {
            console.error(`❌ Products endpoint failed with status: ${productsRes.status}`);
            passed = false;
        }

        // Test 3: Register Endpoint
        console.log('\n--- Testing Register Endpoint (POST /api/auth/register) ---');
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: uniqueEmail,
                password: 'password123'
            })
        });
        if (registerRes.status === 201) {
            console.log('✅ Register endpoint is UP.');
        } else {
            console.error(`❌ Register endpoint failed with status: ${registerRes.status}`);
            passed = false;
        }

    } catch (error) {
        console.error('\n❌ connection failed! Is the backend server running?');
        console.error('Error details:', error.message);
        passed = false;
    }

    console.log('\n-----------------------------');
    if (passed) {
        console.log('🎉 All status checks passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some checks passed, but errors were found.');
        process.exit(1);
    }
}

testEndpoints();
