require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('=== AGENTFLOW EMAIL DISPATCH TEST ===');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '••••••••' : '(not set)'}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Agentflow AI" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'Agentflow Test Email',
    text: 'This is an automated test email from Agentflow_AI to verify Gmail SMTP delivery.',
    html: `<div style="font-family: sans-serif; padding: 20px; background: #0a0d14; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #6366f1;">⚡ Agentflow_AI Test Email</h2>
      <p>Gmail SMTP delivery test completed successfully.</p>
      <p style="font-size: 11px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
    </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\nEMAIL_SENT_SUCCESS');
    console.log(`MessageId: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    process.exit(0);
  } catch (error) {
    console.error('\nEMAIL_SEND_ERROR');
    console.error(error);
    process.exit(1);
  }
}

sendTestEmail();
