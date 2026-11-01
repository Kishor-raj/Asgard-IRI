const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('../src/config/db');
const { ensureAdminUser, ensureAllRoleUsers } = require('../src/utils/seedAdmin');

async function runSeeds() {
  console.log('==============================================');
  console.log('         ASGARD-IRI Database Seeder');
  console.log('==============================================\n');

  const seedsDir = path.join(__dirname, '../seeds');
  if (fs.existsSync(seedsDir)) {
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`[Seeds] Found ${seedFiles.length} seed file(s). Executing...`);
    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      try {
        await pool.query(sql);
        console.log(`  ✓ Seeded: ${file}`);
      } catch (err) {
        console.warn(`  ! Notice on seed ${file}: ${err.message}`);
      }
    }
  }

  console.log('\n[Role Credentials] Syncing all role credentials from .env to database...');
  const syncedUsers = await ensureAllRoleUsers();
  if (syncedUsers && syncedUsers.length > 0) {
    console.log(`  ✓ Successfully synced ${syncedUsers.length} role account(s) to database:`);
    for (const u of syncedUsers) {
      console.log(`    - [${u.role.padEnd(22)}] ${u.email.padEnd(32)} (${u.full_name}) -> status: ${u.status}`);
    }
  }

  console.log('\n==============================================');
  console.log('✓ Seeding completed successfully!');
  console.log('==============================================\n');
}

runSeeds()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[Fatal Error] Seeding failed:', err);
    pool.end();
    process.exit(1);
  });
