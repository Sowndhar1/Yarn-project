import { createRazorpayOrder } from '../src/services/paymentService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRazorpay() {
    console.log('Testing Razorpay order creation...');

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id') {
        console.error('❌ Razorpay logic skipped: RAZORPAY_KEY_ID not configured in .env');
        return;
    }

    const result = await createRazorpayOrder(500.50, 'TEST_RECEIPT_001');

    if (result.success) {
        console.log('✅ Razorpay order creation successful!');
        console.log('Order ID:', result.order.id);
    } else {
        console.error('❌ Razorpay test failed:', result.error);
    }
}

testRazorpay();
