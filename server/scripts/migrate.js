const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('../src/config/db');
const { ensureAdminUser, ensureAllRoleUsers } = require('../src/utils/seedAdmin');

async function runMigrations() {
  console.log('==============================================');
  console.log('   ASGARD-IRI Database Migration & Seed Runner');
  console.log('==============================================\n');

  // 1. Run migrations in server/migrations/
  const migrationsDir = path.join(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`[Error] Migrations directory not found at: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`[Migrations] Found ${migrationFiles.length} migration file(s). Applying in order...`);
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    try {
      await pool.query(sql);
      console.log(`  ✓ Applied migration: ${file}`);
    } catch (err) {
      console.error(`  ✗ Error applying migration ${file}:`, err.message);
      throw err;
    }
  }

  // 2. Run seeds in server/seeds/
  const seedsDir = path.join(__dirname, '../seeds');
  if (fs.existsSync(seedsDir)) {
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`\n[Seeds] Found ${seedFiles.length} seed file(s). Applying...`);
    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      try {
        await pool.query(sql);
        console.log(`  ✓ Applied seed: ${file}`);
      } catch (err) {
        console.warn(`  ! Notice on seed ${file}: ${err.message}`);
      }
    }
  }

  // 3. Migrate Role Credentials from .env into Database
  console.log('\n[Role Credentials] Migrating all role credentials from .env to database...');
  const syncedUsers = await ensureAllRoleUsers();
  if (syncedUsers && syncedUsers.length > 0) {
    console.log(`  ✓ Successfully synced ${syncedUsers.length} role account(s) into database:`);
    for (const u of syncedUsers) {
      console.log(`    - [${u.role.padEnd(22)}] ${u.email.padEnd(32)} (${u.full_name}) -> status: ${u.status}`);
    }
  } else {
    console.log('  ! No role credentials configured in .env; skipping role user sync.');
  }

  console.log('\n==============================================');
  console.log('✓ Database migration & setup completed successfully!');
  console.log('==============================================\n');
}

runMigrations()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[Fatal Error] Migration failed:', err);
    pool.end();
    process.exit(1);
  });
