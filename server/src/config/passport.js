const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

const findOrCreateOAuthUser = async (provider, oauthId, email, fullName, avatarUrl) => {
  // 1. Look up by provider + oauthId
  const { rows: existing } = await pool.query(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
    [provider, oauthId]
  );
  if (existing.length) return existing[0];

  // 2. Look up by email — link OAuth to existing password account
  const { rows: byEmail } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (byEmail.length) {
    await pool.query(
      'UPDATE users SET oauth_provider=$1, oauth_id=$2, avatar_url=$3 WHERE id=$4',
      [provider, oauthId, avatarUrl, byEmail[0].id]
    );
    return byEmail[0];
  }

  // 3. Create new user — auto-approved
  const { rows: created } = await pool.query(
    `INSERT INTO users
       (email, full_name, role, status, oauth_provider, oauth_id, avatar_url, password_hash)
     VALUES ($1, $2, 'participant_applicant', 'active', $3, $4, $5, '')
     RETURNING *`,
    [email, fullName, provider, oauthId, avatarUrl]
  );
  return created[0];
};

const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

const resolveGoogleCallbackUrl = () => {
  const explicit = (process.env.GOOGLE_CALLBACK_URL || '').trim();
  if (explicit) {
    if (explicit.includes('/callback')) {
      return explicit;
    }
    return `${explicit.replace(/\/+$/, '')}/api/v1/auth/google/callback`;
  }

  const backendUrl = (process.env.BACKEND_URL || '').trim();
  if (backendUrl) {
    return `${backendUrl.replace(/\/+$/, '')}/api/v1/auth/google/callback`;
  }

  const port = process.env.PORT || 5000;
  return process.env.NODE_ENV === 'production'
    ? 'https://asgard-iri.onrender.com/api/v1/auth/google/callback'
    : `http://localhost:${port}/api/v1/auth/google/callback`;
};

const googleCallbackUrl = resolveGoogleCallbackUrl();

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(
          'google',
          profile.id,
          profile.emails?.[0]?.value,
          profile.displayName,
          profile.photos?.[0]?.value || null
        );
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0] || false);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
