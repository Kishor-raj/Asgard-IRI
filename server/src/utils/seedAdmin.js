const bcrypt = require('bcryptjs');
const pool = require('../config/db');

/**
 * Standard configuration for all system roles.
 * Each role can be configured/overridden via environment variables using the pattern:
 *   <PREFIX>_EMAIL
 *   <PREFIX>_PASSWORD
 *   <PREFIX>_ROLE
 *   <PREFIX>_NAME
 */
const ROLE_DEFINITIONS = [
  // 1. Super Admin (System Administrator)
  {
    prefix: 'ADMIN',
    role: 'super_admin',
    defaultEmail: 'admin@asgard-iri.org',
    defaultPassword: 'AdminPass123!',
    defaultName: 'Super Admin',
    description: 'System Administrator with full access',
  },
  {
    prefix: 'SUPERADMIN',
    role: 'super_admin',
    defaultEmail: 'superadmin@asgard-iri.org',
    defaultPassword: 'SuperAdminPass123!',
    defaultName: 'Super Admin',
    description: 'Full system access and root privileges',
  },
  {
    prefix: 'SUPER_ADMIN',
    role: 'super_admin',
    defaultEmail: 'superadmin@asgard-iri.org',
    defaultPassword: 'SuperAdminPass123!',
    defaultName: 'Super Admin',
    description: 'Full system access and root privileges',
  },

  // 2. Foundation Admin
  {
    prefix: 'FOUNDATION_ADMIN',
    role: 'foundation_admin',
    defaultEmail: 'foundation.admin@asgard-iri.org',
    defaultPassword: 'FoundationAdminPass123!',
    defaultName: 'Foundation Admin',
    description: 'Foundation management and executive CMS privileges',
  },

  // 3. Research Admin
  {
    prefix: 'RESEARCH_ADMIN',
    role: 'research_admin',
    defaultEmail: 'research.admin@asgard-iri.org',
    defaultPassword: 'ResearchAdminPass123!',
    defaultName: 'Research Admin',
    description: 'Research operations and administration',
  },

  // 4. Researcher
  {
    prefix: 'RESEARCHER',
    role: 'researcher',
    defaultEmail: 'researcher@asgard-iri.org',
    defaultPassword: 'ResearcherPass123!',
    defaultName: 'Lead Researcher',
    description: 'Researcher profile and publication management',
  },

  // 5. Author / Contributor
  {
    prefix: 'AUTHOR',
    role: 'author',
    defaultEmail: 'author@asgard-iri.org',
    defaultPassword: 'AuthorPass123!',
    defaultName: 'Contributing Author',
    description: 'Author submissions and publication records',
  },

  // 6. Peer Reviewer
  {
    prefix: 'REVIEWER',
    role: 'reviewer',
    defaultEmail: 'reviewer@asgard-iri.org',
    defaultPassword: 'ReviewerPass123!',
    defaultName: 'Peer Reviewer',
    description: 'Peer reviewer for papers and proposals',
  },

  // 7. Participant / Applicant
  {
    prefix: 'PARTICIPANT_APPLICANT',
    role: 'participant_applicant',
    defaultEmail: 'participant@asgard-iri.org',
    defaultPassword: 'ParticipantPass123!',
    defaultName: 'Participant Applicant',
    description: 'Standard participant and applicant profile',
  },

  // 8. Trainer / Mentor
  {
    prefix: 'TRAINER_MENTOR',
    role: 'trainer_mentor',
    defaultEmail: 'trainer.mentor@asgard-iri.org',
    defaultPassword: 'TrainerMentorPass123!',
    defaultName: 'Trainer Mentor',
    description: 'Trainer and mentor credentials',
  },

  // 9. Content Editor
  {
    prefix: 'CONTENT_EDITOR',
    role: 'content_editor',
    defaultEmail: 'content.editor@asgard-iri.org',
    defaultPassword: 'ContentEditorPass123!',
    defaultName: 'Content Editor',
    description: 'Content management and publishing',
  },

  // 10. Journal Editor
  {
    prefix: 'JOURNAL_EDITOR',
    role: 'journal_editor',
    defaultEmail: 'journal.editor@asgard-iri.org',
    defaultPassword: 'JournalEditorPass123!',
    defaultName: 'Journal Editor',
    description: 'Journal and issue management',
  },

  // 11. Conference Admin
  {
    prefix: 'CONFERENCE_ADMIN',
    role: 'conference_admin',
    defaultEmail: 'conference.admin@asgard-iri.org',
    defaultPassword: 'ConferenceAdminPass123!',
    defaultName: 'Conference Admin',
    description: 'Conference management and paper reviews',
  },

  // 12. Academy Admin
  {
    prefix: 'ACADEMY_ADMIN',
    role: 'academy_admin',
    defaultEmail: 'academy.admin@asgard-iri.org',
    defaultPassword: 'AcademyAdminPass123!',
    defaultName: 'Academy Admin',
    description: 'Academy programs and enrollment management',
  },

  // 13. Publication Editor
  {
    prefix: 'PUBLICATION_EDITOR',
    role: 'publication_editor',
    defaultEmail: 'publication.editor@asgard-iri.org',
    defaultPassword: 'PublicationEditorPass123!',
    defaultName: 'Publication Editor',
    description: 'Book and monograph catalog management',
  },

  // 14. Technology Lab Admin
  {
    prefix: 'TECHNOLOGY_LAB_ADMIN',
    role: 'technology_lab_admin',
    defaultEmail: 'techlab.admin@asgard-iri.org',
    defaultPassword: 'TechLabAdminPass123!',
    defaultName: 'Technology Lab Admin',
    description: 'AI & Technology Lab project management',
  },

  // 15. Innovation Admin
  {
    prefix: 'INNOVATION_ADMIN',
    role: 'innovation_admin',
    defaultEmail: 'innovation.admin@asgard-iri.org',
    defaultPassword: 'InnovationAdminPass123!',
    defaultName: 'Innovation Admin',
    description: 'Innovation hub and hackathon management',
  },

  // 16. Careers / HR Admin
  {
    prefix: 'CAREERS_HR_ADMIN',
    role: 'careers_hr_admin',
    defaultEmail: 'careers.hr@asgard-iri.org',
    defaultPassword: 'CareersHRPass123!',
    defaultName: 'Careers HR Admin',
    description: 'Opportunities and careers management',
  },
];

/**
 * Ensures all role users configured via environment variables exist in the database
 * with active status, proper roles, and bcrypt-hashed passwords.
 *
 * @returns {Promise<Array>} Array of synced user records
 */
async function ensureAllRoleUsers() {
  const configs = [...ROLE_DEFINITIONS];
  const processedPrefixes = new Set(ROLE_DEFINITIONS.map((d) => d.prefix));

  // Dynamically discover any additional custom role configurations in process.env
  for (const envKey of Object.keys(process.env)) {
    const match = envKey.match(/^([A-Z0-9_]+)_ROLE$/);
    if (match) {
      const prefix = match[1];
      if (!processedPrefixes.has(prefix)) {
        processedPrefixes.add(prefix);
        const customRole = process.env[envKey];
        const customEmail = process.env[`${prefix}_EMAIL`];
        const customPassword = process.env[`${prefix}_PASSWORD`];
        const customName = process.env[`${prefix}_NAME`] || prefix.replace(/_/g, ' ');
        if (customRole && customEmail && customPassword) {
          configs.push({
            prefix,
            role: customRole,
            defaultEmail: customEmail,
            defaultPassword: customPassword,
            defaultName: customName,
            description: `${customName} role`,
          });
        }
      }
    }
  }

  const syncedUsers = [];
  const seenEmails = new Set();

  for (const cfg of configs) {
    const rawEmail = process.env[`${cfg.prefix}_EMAIL`] || cfg.defaultEmail;
    if (!rawEmail) continue;

    const email = rawEmail.toLowerCase().trim();
    if (seenEmails.has(email)) continue;

    const password = process.env[`${cfg.prefix}_PASSWORD`] || cfg.defaultPassword;
    const role = process.env[`${cfg.prefix}_ROLE`] || cfg.role;
    const fullName = process.env[`${cfg.prefix}_NAME`] || cfg.defaultName;

    if (!email || !password || !role) {
      continue;
    }

    seenEmails.add(email);

    try {
      // 1. Ensure role exists in roles table
      await pool.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [role, cfg.description || `${fullName} permissions`]
      );

      // 2. Hash password with bcrypt (12 rounds)
      const passwordHash = await bcrypt.hash(password, 12);

      // 3. Upsert role user in users table with active status
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           status = 'active',
           updated_at = NOW()
         RETURNING id, email, full_name, role, status`,
        [email, passwordHash, fullName, role]
      );

      const user = result.rows[0];

      // 4. If role is researcher, ensure a researcher profile exists
      if (role === 'researcher') {
        await pool.query(
          `INSERT INTO researcher_profiles (user_id, designation, affiliation, is_public)
           SELECT $1, 'Senior Researcher', 'ASGARD Research Institute', true
           WHERE NOT EXISTS (SELECT 1 FROM researcher_profiles WHERE user_id = $1)`,
          [user.id]
        );
      }

      syncedUsers.push(user);
    } catch (err) {
      console.warn(`[Role Sync] Failed to sync ${role} (${email}): ${err.message}`);
    }
  }

  return syncedUsers;
}

/**
 * Ensures the primary admin user exists (backwards-compatible with original ensureAdminUser)
 * while also ensuring all role users configured in environment variables are synced.
 *
 * @returns {Promise<Object>} Primary admin user record
 */
async function ensureAdminUser() {
  const syncedUsers = await ensureAllRoleUsers();

  const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'admin@asgard-iri.org').toLowerCase().trim();
  const primaryAdmin =
    syncedUsers.find((u) => u.email === primaryAdminEmail) ||
    syncedUsers.find((u) => u.role === (process.env.ADMIN_ROLE || 'super_admin')) ||
    syncedUsers[0] ||
    null;

  if (primaryAdmin) {
    primaryAdmin.syncedCount = syncedUsers.length;
  }

  return primaryAdmin;
}

module.exports = {
  ensureAdminUser,
  ensureAllRoleUsers,
  ROLE_DEFINITIONS,
};
