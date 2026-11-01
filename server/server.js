const app = require('./src/app');
const { ensureAdminUser } = require('./src/utils/seedAdmin');
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
});

