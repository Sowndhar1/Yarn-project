import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paise (e.g., ₹100 = 10000 paise)
 * @param {string} receipt - Unique receipt ID (usually order number)
 * @returns {Promise<Object>} - Razorpay order object
 */
export const createRazorpayOrder = async (amount, receipt) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // convert to paise and ensure it's an integer
            currency: "INR",
            receipt: receipt,
        };

        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if verification succeeds
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        return expectedSignature === signature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
};
