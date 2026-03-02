import { sendOrderConfirmationEmail } from '../src/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const mockOrder = {
    orderNumber: 'YRN202402241234',
    createdAt: new Date(),
    paymentMethod: 'online',
    subtotal: 1000,
    discountAmount: 100,
    totalAmount: 900,
    shippingAddress: {
        street: '123 Test St',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641001',
        phone: '9876543210'
    },
    items: [
        {
            productSnapshot: { name: 'Test Yarn' },
            quantity: 2,
            price: 500
        }
    ]
};

async function testEmail() {
    console.log('Testing order confirmation email...');

    // Replace with a real email to test actual delivery if SMTP is configured
    const testRecipient = process.env.EMAIL_USER || 'test@example.com';

    const result = await sendOrderConfirmationEmail(mockOrder, testRecipient);

    if (result.success) {
        console.log('✅ Email test successful!');
        console.log('Message ID:', result.messageId);
    } else {
        console.error('❌ Email test failed:', result.error);
    }
}

testEmail();
