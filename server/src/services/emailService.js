const nodemailer = require('nodemailer');
const env = require('../config/env');

class EmailService {
  parseTemplate(str, context = {}) {
    if (!str) return '';
    const replacements = {
      name: context.customerName || context.name || 'Customer',
      customerName: context.customerName || context.name || 'Customer',
      status: context.status || 'SUCCESS',
      id: context.id || context.executionId || context.ticketId || 'EXEC-9941',
      ticketId: context.ticketId || context.id || 'TICK-8842',
      urgency: context.urgency || 'HIGH',
      sentiment: context.sentiment || 'URGENT / CRITICAL',
      ...context
    };

    return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      if (replacements[key] !== undefined && replacements[key] !== null) {
        return String(replacements[key]);
      }
      return match;
    });
  }

  async sendEmail(config = {}, context = {}) {
    const recipient = config.to || config.recipient || 'chandana.chandu.06.11@gmail.com';
    const rawSubject = config.subject || 'Agentflow_AI Workflow Execution Digest';
    const rawBodyText = config.template || config.body || config.message || 'Hello {{name}},\n\nYour automated workflow completed with status {{status}}.\nUrgency Level: {{urgency}}.\nTicket ID: {{ticketId}}.';

    const subject = this.parseTemplate(rawSubject, context);
    const bodyText = this.parseTemplate(rawBodyText, context);

    const emailUser = process.env.EMAIL_USER || env.emailUser;
    const emailPass = process.env.EMAIL_PASS || env.emailPass;

    if (emailUser && emailPass && emailPass !== 'your_16_char_app_password_here') {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

        const mailOptions = {
          from: `"Agentflow AI Engine" <${emailUser}>`,
          to: recipient,
          subject: subject,
          text: bodyText,
          html: `<div style="font-family: sans-serif; padding: 24px; background: #0a0d14; color: #f8fafc; border-radius: 16px;">
            <h2 style="color: #6366f1; margin-top: 0;">⚡ Agentflow_AI Execution Notice</h2>
            <p style="font-size: 14px;"><strong>Recipient:</strong> ${recipient}</p>
            <p style="font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 16px 0;" />
            <div style="background: #121723; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 13px; color: #e2e8f0; white-space: pre-wrap;">${bodyText}</div>
            <p style="font-size: 11px; color: #64748b; margin-top: 20px;">Automated delivery powered by Agentflow_AI Engine.</p>
          </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer EmailService] Email dispatched successfully to ${recipient} | MessageId: ${info.messageId}`);
        return {
          status: 'success',
          delivered: true,
          method: 'Gmail Nodemailer SMTP',
          recipient,
          subject,
          parsedBody: bodyText,
          messageId: info.messageId,
          deliveredAt: new Date().toISOString()
        };
      } catch (err) {
        console.error(`[Nodemailer EmailService Error] Email delivery failed to ${recipient}:`, err.message);
        return {
          status: 'failed',
          delivered: false,
          error: err.message,
          recipient,
          subject,
          failedAt: new Date().toISOString()
        };
      }
    }

    console.log(`[Email Action Log] Simulated Gmail delivery to ${recipient} (Subject: "${subject}")`);
    return {
      status: 'success',
      delivered: false,
      method: 'Mock Log Fallback',
      recipient,
      subject,
      parsedBody: bodyText,
      deliveredAt: new Date().toISOString(),
      note: 'Configure valid EMAIL_USER and EMAIL_PASS (App Password) in server/.env for live Gmail delivery.'
    };
  }
}

module.exports = new EmailService();
