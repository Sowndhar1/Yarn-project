import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send order confirmation email to the customer
 * @param {Object} order - The order object containing details
 * @param {string} customerEmail - The customer's email address
 */
export const sendOrderConfirmationEmail = async (order, customerEmail) => {
    try {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const itemsList = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productSnapshot?.name || 'Product'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity} kg</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Shivam yarn agencies" <${process.env.EMAIL_FROM || 'orders@yarnbiz.in'}>`,
            to: customerEmail,
            subject: `Order Confirmation - #${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4f46e5;">Shivam yarn agencies</h1>
                        <p style="font-size: 1.2em; font-weight: bold;">Order Confirmed!</p>
                    </div>
                    
                    <p>Hello,</p>
                    <p>Thank you for your order! Your order has been successfully placed and is being processed.</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h2 style="font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 0;">Order Summary</h2>
                        <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                        <p><strong>Date:</strong> ${orderDate}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="text-align: left; padding: 10px;">Item</th>
                                <th style="text-align: left; padding: 10px;">Qty</th>
                                <th style="text-align: left; padding: 10px;">Price</th>
                                <th style="text-align: left; padding: 10px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Subtotal:</td>
                                <td style="padding: 10px; font-weight: bold;">₹${order.subtotal.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px;">GST:</td>
                                <td style="padding: 10px;">₹${(order.gstAmount || 0).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px;">Shipping:</td>
                                <td style="padding: 10px;">₹${(order.shippingCost || 0).toLocaleString()}</td>
                            </tr>
                            ${order.discountAmount > 0 ? `
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px; color: #dc2626;">Discount:</td>
                                <td style="padding: 10px; color: #dc2626;">-₹${order.discountAmount.toLocaleString()}</td>
                            </tr>` : ''}
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 20px 10px 10px; font-weight: bold; font-size: 1.1em;">Total Amount:</td>
                                <td style="padding: 20px 10px 10px; font-weight: bold; color: #4f46e5; font-size: 1.4em;">₹${order.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="margin-bottom: 20px;">
                        <h2 style="font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 5px;">Shipping Address</h2>
                        <p style="margin: 0;">${order.shippingAddress.street}</p>
                        <p style="margin: 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>
                        <p style="margin: 0;">Phone: ${order.shippingAddress.phone}</p>
                    </div>
                    
                    <p style="text-align: center; font-size: 0.9em; color: #666; margin-top: 30px;">
                        If you have any questions, please contact us at <a href="mailto:sowndharsv2006@gmail.com" style="color: #4f46e5;">sowndharsv2006@gmail.com</a>.
                    </p>
                    <p style="text-align: center; font-size: 0.8em; color: #999;">
                        &copy; ${new Date().getFullYear()} Shivam yarn agencies. All rights reserved.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);

        // Return preview URL if using Ethereal
        if (info.host === 'smtp.ethereal.email') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send OTP for verification
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit code
 * @param {string} userName - User name
 */
export const sendOTPEmail = async (email, otp, userName = 'Valued Customer') => {
    try {
        const mailOptions = {
            from: `"Shivam yarn agencies" <${process.env.EMAIL_FROM || 'orders@yarnbiz.in'}>`,
            to: email,
            subject: `Verification Code: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Shivam yarn agencies</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Secure Verification System</p>
                    </div>
                    
                    <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
                    <p style="font-size: 14px; color: #4b5563;">To complete your authentication, please use the following one-time password (OTP). This code is sensitive and should not be shared.</p>
                    
                    <div style="background-color: #f5f3ff; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 12px;">${otp}</span>
                        <p style="font-size: 11px; color: #9ca3af; margin-top: 15px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Expires in 5 minutes</p>
                    </div>
                    
                    <p style="font-size: 13px; color: #6b7280; text-align: center;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                    
                    <div style="border-top: 1px solid #f3f4f6; margin-top: 40px; pt-30px; text-align: center;">
                        <p style="font-size: 11px; color: #9ca3af; margin-top: 20px;">
                            &copy; ${new Date().getFullYear()} Shivam yarn agencies. Professional Textile Solutions.
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent to', email, ':', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};
