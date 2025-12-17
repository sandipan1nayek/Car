const axios = require('axios');

// Send email using Resend API
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ Resend API key not configured. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }
    
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Email send error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  driverApplicationSubmitted: (driverName, driverEmail, driverPhone) => ({
    subject: '🚗 New Driver Application Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">New Driver Application</h2>
        <p>Hi Admin,</p>
        <p>A new driver application has been submitted:</p>
        <div style="background: #f7f7f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${driverName}</p>
          <p><strong>Email:</strong> ${driverEmail}</p>
          <p><strong>Phone:</strong> ${driverPhone}</p>
        </div>
        <p>Please review and approve/reject in the Admin Panel.</p>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          This is an automated notification from your ride-sharing app.
        </p>
      </div>
    `
  }),
  
  driverApproved: (driverName) => ({
    subject: '✅ Your Driver Application is Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00D9A3;">Congratulations!</h2>
        <p>Hi ${driverName},</p>
        <p>Your driver application has been <strong>approved</strong>! 🎉</p>
        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>You can now:</strong></p>
          <ul>
            <li>Go online in the Driver Section</li>
            <li>Start accepting ride requests</li>
            <li>Earn money on every trip</li>
          </ul>
        </div>
        <p>Open the app and navigate to your Profile to access the Driver Section.</p>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          Welcome to the driver community!
        </p>
      </div>
    `
  }),
  
  driverRejected: (driverName, reason) => ({
    subject: '❌ Driver Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF3B30;">Application Status Update</h2>
        <p>Hi ${driverName},</p>
        <p>We regret to inform you that your driver application has not been approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You can reapply after addressing any issues mentioned above.</p>
        <p>For questions, please contact our support team.</p>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          Thank you for your interest.
        </p>
      </div>
    `
  }),
  
  newSupportMessage: (customerName, customerEmail, message) => ({
    subject: '💬 New Support Chat from Customer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">New Support Message</h2>
        <p>Hi Manager,</p>
        <p>A new support message has been received:</p>
        <div style="background: #f7f7f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #fff; padding: 10px; border-left: 3px solid #00D9A3;">${message}</p>
        </div>
        <p>Please respond promptly in the Manager Panel.</p>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          This is an automated notification.
        </p>
      </div>
    `
  }),
  
  rideReceipt: (customerName, pickup, dropoff, distance, fare, driverName, driverRating) => ({
    subject: '🚗 Ride Receipt - Your Trip is Complete',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Trip Completed</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for riding with us! Here's your trip summary:</p>
        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Pickup:</strong> ${pickup}</p>
          <p><strong>Drop-off:</strong> ${dropoff}</p>
          <p><strong>Distance:</strong> ${distance} km</p>
          <p><strong>Fare:</strong> $${fare}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p><strong>Driver:</strong> ${driverName} ⭐ ${driverRating}</p>
        </div>
        <p>We hope you enjoyed your ride!</p>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          Thank you for choosing us.
        </p>
      </div>
    `
  })
};

module.exports = { sendEmail, emailTemplates };
