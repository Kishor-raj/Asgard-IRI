const nodemailer = require('nodemailer');
const path = require('path');

// Ensure environment variables are loaded if mailer is imported standalone
if (!process.env.SMTP_USER) {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

let cachedTransporter = null;
let lastConfigKey = null;

/**
 * Returns a configured nodemailer transporter with sanitized credentials.
 * Recreates the transporter if environment configuration has changed.
 */
const getTransporter = () => {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  const user = (process.env.SMTP_USER || '').trim();
  // Strip spaces if user pasted a 16-character Google App Password with spaces
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const configKey = `${host}:${port}:${secure}:${user}:${pass}`;
  if (cachedTransporter && lastConfigKey === configKey) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  lastConfigKey = configKey;

  return cachedTransporter;
};

/**
 * Verifies SMTP server connectivity and authentication.
 */
const verifyConnection = async () => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return {
      success: false,
      error: 'SMTP credentials missing: SMTP_USER or SMTP_PASS is empty in environment variables.',
    };
  }

  const transporter = getTransporter();
  try {
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Dispatches an email using the configured SMTP transporter.
 */
const sendMail = async ({ to, subject, html, text }) => {
  const user = (process.env.SMTP_USER || '').trim();
  const transporter = getTransporter();

  if (!transporter || !user) {
    console.warn(`[Mailer] Skipping email to "${to}": SMTP_USER or SMTP_PASS is not configured.`);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"ASGARD-IRI" <${user}>`,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });
    return info;
  } catch (err) {
    console.error('Mail delivery error:', err.message);
    if (err.message && (err.message.includes('BadCredentials') || err.message.includes('535'))) {
      console.error(
        '[Mailer Guidance] Gmail rejected SMTP login (535 BadCredentials).\n' +
        '1. Ensure you generated a 16-character Google App Password (https://myaccount.google.com/apppasswords).\n' +
        '2. Verify 2-Step Verification is turned ON for your Google Account.\n' +
        '3. If running via nodemon/server, restart the server so updated .env variables take effect.'
      );
    }
    return null;
  }
};

module.exports = {
  sendMail,
  verifyConnection,
  getTransporter,
};

