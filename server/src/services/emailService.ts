import nodemailer from 'nodemailer';

export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  resetUrl?: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // If SMTP isn't configured in development, log the URL to console
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('================ EMAIL SERVICE (DEV FALLBACK) ================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    if (options.resetUrl) {
      console.log(`Reset Password URL:\n${options.resetUrl}`);
    }
    console.log('==============================================================');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  } as any);

  const message = {
    from: `${process.env.FROM_NAME || 'HabitTracker'} <${process.env.FROM_EMAIL || 'noreply@habittracker.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent: ${info.messageId}`);
  return true;
};

export default sendEmail;
