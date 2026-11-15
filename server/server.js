const app = require('./src/app');
const { ensureAdminUser } = require('./src/utils/seedAdmin');
const { verifyConnection } = require('./src/utils/mailer');
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`ASGARD-IRI server running on port ${PORT}`);
  try {
    const admin = await ensureAdminUser();
    if (admin) {
      console.log(`[Role Sync] All role credentials verified in database (${admin.syncedCount || 1} roles synced; Primary Admin: ${admin.email})`);
    }
  } catch (err) {
    console.warn(`[Admin] Could not auto-sync admin on startup: ${err.message}`);
  }

  try {
    const smtpStatus = await verifyConnection();
    if (smtpStatus.success) {
      console.log(`[Mailer] SMTP connection verified successfully (Ready to send automated emails via ${process.env.SMTP_USER})`);
    } else {
      console.warn(`[Mailer] SMTP configuration notice: ${smtpStatus.error}`);
    }
  } catch (err) {
    console.warn(`[Mailer] SMTP verification failed on startup: ${err.message}`);
  }
});

