const nodemailer = require('nodemailer');

// Create a test transporter using Ethereal for development
// For production, you would use your actual SMTP settings
const createTransporter = async () => {
  // For development/testing, create a test account at Ethereal
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || testAccount.user,
      pass: process.env.EMAIL_PASS || testAccount.pass,
    },
  });

  return transporter;
};

// Send shift completion email
const sendShiftCompletionEmail = async (employee, shift) => {
  try {
    const transporter = await createTransporter();

    // Format duration as hours and minutes
    const formatDuration = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    };

    // Format date
    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    // Format HTML content of email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #3f51b5;">Shift Completed Successfully</h2>
        <p>Hello ${employee.name},</p>
        <p>Your work shift has been completed successfully. Here are the details:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Start Time:</strong> ${formatDate(shift.startTime)}</p>
          <p><strong>End Time:</strong> ${formatDate(shift.endTime)}</p>
          <p><strong>Duration:</strong> ${formatDuration(shift.totalWorkDuration)}</p>
          <p><strong>Break Time:</strong> ${formatDuration(shift.totalBreakDuration)}</p>
        </div>
        
        <p>Thank you for using our Employee Shift Tracker!</p>
        <p>Best regards,<br/>Shift Tracker Team</p>
      </div>
    `;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Shift Tracker" <shifttracker@example.com>',
      to: employee.email,
      subject: "Shift Completed - Employee Shift Tracker",
      html: htmlContent,
    });

    console.log(`Shift completion email sent to ${employee.email}`);
    
    // Log the URL for test emails (for development using Ethereal)
    if (info.messageId && !process.env.EMAIL_USER) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendShiftCompletionEmail
};
