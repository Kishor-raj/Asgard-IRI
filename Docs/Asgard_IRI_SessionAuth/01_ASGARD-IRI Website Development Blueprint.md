# ASGARD-IRI Website Development Blueprint

Oct 28, 2026 · @Kishor Raj

## Project Overview & Confirmed Decisions

ASGARD–IRI is a full-scale institutional website for the ASGARD International Foundation for Research and Innovation, built as a React + Express + PostgreSQL monorepo with clearly separated public modules, a role-based admin dashboard, and a scalable architecture for future expansion.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js (SPA) |
| Backend | Express.js (Node.js REST API) |
| Database | PostgreSQL |
| Auth | Server-side session cookie + Role-based access control |
| File Storage | Local/S3-compatible (to be confirmed) |
| Hosting | To be decided later |

### All Confirmed Decisions

| Item | Decision |
| --- | --- |
| Journal Workflow | Skip — hyperlinks to existing journal site only |
| Payment Gateway | Dummy placeholder UI at launch; real integration in Phase 5 |
| Certificate Generation | Dummy placeholder UI at launch; real automation in Phase 5 |
| Researcher Profiles | Self-register and self-manage their own profile |
| User Role Assignment | Self-signup → select role → admin approval |
| Multi-language | English first; Tamil/others in Phase 5 |
| Public School Section | Placeholder page only; no menu item at launch |
| Mobile | Mobile-first responsive design throughout |

## PostgreSQL Database Schema

All tables follow snake\_case naming. Every table has `id SERIAL PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT NOW()`, and `updated_at TIMESTAMPTZ DEFAULT NOW()`.

### Core Auth & Users

```
users (id, email, password_hash, full_name, role, status[pending|active|rejected], profile_photo, bio, created_at, updated_at)
roles (id, name, description)
user_roles (user_id → users, role_id → roles)
user_sessions (sid VARCHAR PRIMARY KEY, sess JSON NOT NULL, expire TIMESTAMPTZ NOT NULL)
-- Note: this table is auto-created by connect-pg-simple on first run; no manual migration needed
```

### Researcher Profiles

```
researcher_profiles (id, user_id → users, designation, affiliation, orcid_url, google_scholar_url, scopus_url, research_interests, biography, cv_url, is_public, created_at, updated_at)
researcher_publications (id, researcher_id → researcher_profiles, title, journal, year, doi_url)
researcher_projects (id, researcher_id → researcher_profiles, project_id → research_projects)
```

### Research

```
research_areas (id, name, slug, description)
research_projects (id, title, slug, abstract, pi_user_id → users, status[active|completed|upcoming], funding_source, start_date, end_date)
research_project_areas (project_id, area_id)
research_outputs (id, project_id → research_projects, type[publication|dataset|report|patent], title, url, year)
```

### Journals

```
journals (id, name, slug, description, issn, external_url, logo_url, is_active)
journal_issues (id, journal_id → journals, volume, issue_number, published_date)
journal_articles (id, issue_id → journal_issues, title, authors_text, abstract, doi_url, pdf_url)
```

### Publications

```
publications (id, type[book|ebook|monograph|proceedings|report|technical|educational], title, slug, authors_text, abstract, isbn, year, cover_url, pdf_url, is_featured)
```

### Conferences

```
conferences (id, title, slug, theme, status[upcoming|ongoing|past], start_date, end_date, venue, mode[online|offline|hybrid], description)
conference_registrations (id, conference_id → conferences, user_id → users, name, email, affiliation, payment_status[dummy], registration_date)
```

### Academy

```
academy_programs (id, type[course|fdp|workshop|seminar|research_methodology|ai_ml|academic_writing], title, slug, description, duration, mode, start_date, end_date, seats, is_active)
academy_registrations (id, program_id → academy_programs, user_id → users, status[applied|confirmed|completed], payment_status[dummy])
certificates (id, user_id → users, issued_for_type[academy|conference|journal], issued_for_id INT, certificate_uid UUID, issued_date, status[placeholder])
```

### Opportunities

```
opportunities (id, category[career|internship|ra|fellowship|student_project|volunteering|editorial|conference|trainer|grant], title, slug, department, location, mode, eligibility, description, responsibilities, required_skills, duration, seats, stipend_info, deadline, status[open|closed], created_at)
opportunity_applications (id, opportunity_id → opportunities, user_id → users, cover_letter, resume_url, status[applied|under_review|shortlisted|selected|rejected], applied_at)
```

### News, Events & Media

```
news (id, type[news|announcement|press_release|research_highlight|conference_report|training_update|award], title, slug, content, author_id → users, published_at, is_featured, cover_image_url)
events (id, title, slug, description, event_date, location, mode, registration_url, cover_image_url)
gallery (id, title, media_url, media_type[image|video], related_type, related_id, uploaded_at)
```

### Admin & Utility

```
contact_enquiries (id, name, email, phone, subject, message, status[new|read|replied], created_at)
newsletter_subscribers (id, email, subscribed_at, is_active)
site_settings (id, key, value, updated_at)
audit_logs (id, user_id → users, action, entity_type, entity_id, ip_address, created_at)
```

## Project Folder Structure

```
asgard-iri/
├── client/                          # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── components/
│   │   │   ├── common/              # Button, Card, Modal, Navbar, Footer
│   │   │   ├── layout/              # PageLayout, AdminLayout, AuthLayout
│   │   │   └── ui/                  # Form inputs, Badges, Loaders
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── About/
│   │   │   ├── Research/
│   │   │   ├── Journals/            # Static pages + external links only
│   │   │   ├── Publications/
│   │   │   ├── Conferences/
│   │   │   ├── Academy/
│   │   │   ├── AITechLab/
│   │   │   ├── InnovationHub/
│   │   │   ├── Consultancy/
│   │   │   ├── Opportunities/
│   │   │   │   ├── Careers/
│   │   │   │   ├── Internships/
│   │   │   │   ├── Fellowships/
│   │   │   │   ├── StudentProjects/
│   │   │   │   └── OpportunityDetail/
│   │   │   ├── News/
│   │   │   ├── Events/
│   │   │   ├── Contact/
│   │   │   ├── Auth/                # Login, Register, ForgotPassword
│   │   │   ├── Dashboard/           # User dashboard
│   │   │   ├── Admin/               # Admin panel pages
│   │   │   ├── Verify/              # Certificate verification placeholder
│   │   │   └── NotFound/
│   │   ├── routes/                  # React Router config
│   │   ├── context/                 # AuthContext, ThemeContext
│   │   ├── hooks/                   # useAuth, useFetch, usePagination
│   │   ├── services/                # Axios API service functions
│   │   ├── store/                   # Redux or Context state (if needed)
│   │   ├── utils/                   # Helpers, formatters, validators
│   │   ├── styles/                  # Global CSS, variables, theme
│   │   └── App.jsx
│   └── package.json
│
├── server/                          # Express.js backend
│   ├── src/
│   │   ├── config/                  # DB config, env, constants
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── researcher.controller.js
│   │   │   ├── research.controller.js
│   │   │   ├── journal.controller.js
│   │   │   ├── publication.controller.js
│   │   │   ├── conference.controller.js
│   │   │   ├── academy.controller.js
│   │   │   ├── opportunity.controller.js
│   │   │   ├── news.controller.js
│   │   │   ├── certificate.controller.js
│   │   │   ├── contact.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # Session authenticate
│   │   │   ├── role.middleware.js    # Role-based guard
│   │   │   ├── upload.middleware.js  # Multer file upload
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/                  # PostgreSQL query functions (pg)
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── researcher.routes.js
│   │   │   ├── research.routes.js
│   │   │   ├── journal.routes.js
│   │   │   ├── publication.routes.js
│   │   │   ├── conference.routes.js
│   │   │   ├── academy.routes.js
│   │   │   ├── opportunity.routes.js
│   │   │   ├── news.routes.js
│   │   │   ├── certificate.routes.js
│   │   │   ├── contact.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/                   # Email, file utils
│   │   └── app.js                   # Express app entry
│   ├── migrations/                  # SQL migration files
│   ├── seeds/                       # Seed data for dev
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## Phase 0 — Setup & Foundation

**Goal:** Environment ready, database initialised, design tokens set, project structure in place before any feature work begins.

### 0.1 Project Initialisation

- Create monorepo with `/client` (React) and `/server` (Express) folders
- Initialise `package.json` for both; set up `.env.example` with all required keys
- Configure ESLint + Prettier for both client and server
- Set up Git with `.gitignore` for node\_modules, .env, build artefacts
- Configure CORS in Express to allow React dev server origin

### 0.2 Database Setup

- Install PostgreSQL locally (or use Docker)
- Create `asgard_db` database and a dedicated DB user
- Write SQL migration files for all tables defined in the schema section above
- Write seed files for roles, sample users, sample opportunities and sample news items
- Run migrations and verify all tables created correctly

### 0.3 Backend Scaffold

- Install core dependencies: `express`, `pg`, `dotenv`, `cors`, `helmet`, `morgan`, `bcryptjs`, `express-session`, `connect-pg-simple`, `multer`, `express-validator`
- Set up `app.js` with middleware stack: helmet, cors, morgan, body-parser, error handler
- Mount all route files under `/api/v1/`
- Test server starts and responds to `GET /api/v1/health`

### 0.4 Frontend Scaffold

- Create React app using Vite
- Install: `react-router-dom`, `axios`, `tailwindcss` (or chosen CSS framework), `react-query` or `swr` for data fetching
- Set up global CSS variables: ASGARD Navy (`#0B1F4B`), Gold (`#C9A84C`), White, Light Grey
- Configure React Router with all top-level routes defined as placeholders
- Create `AuthContext` with login/logout/user state
- Create Axios instance in `/services/api.js` with base URL and `withCredentials: true` for session cookie forwarding

### 0.5 Design System

- Build reusable components: `Button`, `Card`, `Badge`, `Loader`, `Modal`, `Navbar`, `Footer`, `PageLayout`
- Set typography scale: heading sizes, body size, line-height using the chosen sans-serif family
- Establish spacing and border-radius tokens
- Create `AdminLayout` with sidebar navigation for all admin roles

### 0.6 Deliverables Checklist

- [x] Monorepo folder structure created
- [x] PostgreSQL schema migrations run successfully
- [x] Express server starts and `/health` responds
- [x] React app loads with router and global styles
- [x] Design system components built and documented
- [x] .env.example committed with all required keys listed

## Phase 1 — MVP Launch

**Goal:** All public-facing pages live, auth and role system working, researcher self-registration active, admin CMS functional, Opportunities module with apply flow complete.

### 1.1 Authentication & User System

**Backend:**

- `POST /api/v1/auth/register` — signup with role selection; status set to `pending`
- `POST /api/v1/auth/login` — creates server-side session on success; blocked if status is not `active`
- `POST /api/v1/auth/forgot-password` — sends reset email
- `POST /api/v1/auth/reset-password` — validates token, updates password
- Admin endpoints: `GET /api/v1/admin/users/pending` → list pending users; `PATCH /api/v1/admin/users/:id/approve` or `/reject`

**Frontend:**

- Register page: name, email, password, role selector (dropdown of all 15 roles), submit
- Login page; on success the server sets an `httpOnly` session cookie automatically — no token handling in frontend code
- Protected route wrapper checking auth and role
- Admin user management table: pending users → Approve / Reject buttons

### 1.2 OAuth Login (Google & LinkedIn)

**Decision:** Support Google OAuth and LinkedIn OAuth as alternative login methods from Phase 1. Users who sign in via OAuth are auto-approved (no admin approval step needed) because their identity is verified by the provider. Their role defaults to `participant_applicant` and can be changed later by an admin.

**Package:** `passport` + `passport-google-oauth20` + `passport-linkedin-oauth2` + `express-session` + `connect-pg-simple`

```
npm install passport passport-google-oauth20 passport-linkedin-oauth2 express-session connect-pg-simple
```

**New environment variables (add to `.env` and `.env.example`):**

```
# Session
SESSION_SECRET=minimum_32_character_random_string_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/v1/auth/linkedin/callback
```

**Database — add columns to `users` table (new migration `014_oauth_columns.sql`):**

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR,
  ADD COLUMN IF NOT EXISTS oauth_id      VARCHAR,
  ADD COLUMN IF NOT EXISTS avatar_url    VARCHAR;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth
  ON users (oauth_provider, oauth_id)
  WHERE oauth_provider IS NOT NULL;
```

**Backend — `server/src/config/passport.js`:**

```js
const passport         = require('passport');
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const pool             = require('./db');

const findOrCreateOAuthUser = async (provider, oauthId, email, fullName, avatarUrl) => {
  // 1. Look up by provider + oauthId
  const { rows: existing } = await pool.query(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
    [provider, oauthId]
  );
  if (existing.length) return existing[0];

  // 2. Look up by email — link OAuth to existing password account
  const { rows: byEmail } = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
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

passport.use(new GoogleStrategy(
  { clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(
        'google', profile.id,
        profile.emails[0].value,
        profile.displayName,
        profile.photos?.[0]?.value || null
      );
      done(null, user);
    } catch (err) { done(err, null); }
  }
));

passport.use(new LinkedInStrategy(
  { clientID: process.env.LINKEDIN_CLIENT_ID, clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL, scope: ['openid', 'profile', 'email'] },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(
        'linkedin', profile.id,
        profile.emails[0].value,
        profile.displayName,
        profile.photos?.[0]?.value || null
      );
      done(null, user);
    } catch (err) { done(err, null); }
  }
));

// Required for session-based passport — store only the user id in the session
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0] || false);
  } catch (err) { done(err, null); }
});

module.exports = passport;
```

**Backend — OAuth routes (add to `auth.routes.js`):**

```js
const passport = require('../config/passport');

const createSessionAndRedirect = (req, user, res) => {
  // Regenerate session to prevent session fixation
  req.session.regenerate((err) => {
    if (err) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    req.session.userId = user.id;
    req.session.role   = user.role;
    req.session.save((err) => {
      if (err) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    });
  });
};

// Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`
  }),
  (req, res) => createSessionAndRedirect(req, req.user, res)
);

// LinkedIn
router.get('/linkedin',
  passport.authenticate('linkedin')
);
router.get('/linkedin/callback',
  passport.authenticate('linkedin', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`
  }),
  (req, res) => createSessionAndRedirect(req, req.user, res)
);
```

**Mount passport and session in `app.js` (after body-parser lines):**

```js
const session  = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('./config/passport');

app.use(session({
  store: new pgSession({ pool: require('./config/db'), tableName: 'user_sessions' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
app.use(passport.initialize());
app.use(passport.session());
```

**Frontend — OAuth Callback page is no longer needed.** The backend completes the OAuth flow and redirects directly to `/dashboard` after creating the session server-side. The session cookie is set automatically by the browser. Remove any existing `OAuthCallback.jsx` and its route.

Remove from `client/src/routes/index.jsx` (if present):

```jsx
// DELETE this line — no longer needed
// <Route path="/oauth-callback" element={<OAuthCallback />} />
```

**Frontend — OAuth buttons (add to Login and Register pages below the form):**

```jsx
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-grey-200" />
  </div>
  <div className="relative flex justify-center text-xs">
    <span className="bg-white px-3 text-grey-400 font-medium">or continue with</span>
  </div>
</div>
<div className="grid grid-cols-2 gap-3">
  <a href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
    className="flex items-center justify-center gap-2 border border-grey-200 rounded-lg
    px-4 py-2.5 text-sm font-medium text-grey-900 hover:bg-grey-50 transition-colors">
    Google
  </a>
  <a href={`${import.meta.env.VITE_API_BASE_URL}/auth/linkedin`}
    className="flex items-center justify-center gap-2 border border-grey-200 rounded-lg
    px-4 py-2.5 text-sm font-medium text-grey-900 hover:bg-grey-50 transition-colors">
    LinkedIn
  </a>
</div>
```

**Provider setup checklist:**

- Google: [console.cloud.google.com](https://console.cloud.google.com) → New project → Enable Google+ API → Credentials → OAuth 2.0 Client ID → Web → Add redirect URI `http://localhost:5000/api/v1/auth/google/callback`
- LinkedIn: [linkedin.com/developers](https://www.linkedin.com/developers) → Create app → Add product "Sign In with LinkedIn using OpenID Connect" → Auth tab → Add redirect URL `http://localhost:5000/api/v1/auth/linkedin/callback`

**Security rules for OAuth:**

- No token is ever passed via URL or hash — the session cookie is set server-side and sent as an `httpOnly` cookie; it never appears in server logs or frontend code
- OAuth users have `password_hash = ''` — the `/auth/login` endpoint must reject them with: `"Please sign in with Google or LinkedIn."`
- If an OAuth email already exists in `users`, the accounts are merged silently; the user keeps their existing role and approval status
- Add all four OAuth env keys and `SESSION_SECRET` to `.env.example` with empty values before committing

### 1.2 Public Pages

Each page is a React component fetching from its Express endpoint. All pages are responsive and use the ASGARD navy/gold design system.

| Page | Key Content | API Endpoint |
| --- | --- | --- |
| Home | Hero, Trust Strip, Ecosystem cards, Featured sections, Impact Metrics, CTA | `GET /api/v1/home/summary` |
| About | Foundation profile, Vision/Mission, Leadership, Advisory Board, Team | `GET /api/v1/about` |
| Research | Research areas, Projects list, Researcher profiles list | `GET /api/v1/research` |
| Journals | Journal cards with external hyperlinks only | `GET /api/v1/journals` |
| Publications | Books, proceedings, reports catalogue | `GET /api/v1/publications` |
| Conferences | Upcoming/past conference cards, dummy registration CTA | `GET /api/v1/conferences` |
| Academy | Programme listing, dummy registration CTA | `GET /api/v1/academy/programs` |
| AI & Tech Lab | Lab overview, projects, researchers | `GET /api/v1/ai-lab` |
| Innovation Hub | Programmes, hackathons, mentors | `GET /api/v1/innovation-hub` |
| Consultancy | Services list, Request a Consultation form | `GET /api/v1/consultancy` |
| News & Events | News list with filters, event cards, gallery | `GET /api/v1/news`, `GET /api/v1/events` |
| Contact | Contact details, enquiry form | `POST /api/v1/contact` |
| Policies | Static pages: Privacy, Terms, Ethics, Peer Review, etc. | Static React pages |

### 1.3 Opportunities Module (Full)

**Backend:**

- `GET /api/v1/opportunities` — list all open opportunities with filters (category, mode, deadline)
- `GET /api/v1/opportunities/:slug` — single opportunity detail
- `POST /api/v1/opportunities/:id/apply` — authenticated apply with resume upload
- `GET /api/v1/my/applications` — user's own application history
- Admin: `POST/PUT/DELETE /api/v1/admin/opportunities` — manage listings
- Admin: `GET /api/v1/admin/applications` — view and update application status

**Frontend:**

- Opportunities landing page with category tabs: Careers, Internships, Fellowships, RAs, Student Projects, Volunteering, Editorial, Grants
- Searchable/filterable listing cards with deadline badge
- Opportunity detail page: full description, eligibility, Apply Now button
- Application form: cover letter text area, resume upload (PDF), submit
- My Applications dashboard tab: status tracker (Applied → Under Review → Shortlisted → Selected)
- Admin panel: create/edit/close opportunity listings; view and update application statuses

### 1.4 Researcher Profile System

**Backend:**

- `POST /api/v1/researchers/register` — researcher self-signup (role = researcher, status = pending)
- `GET /api/v1/researchers` — public listing
- `GET /api/v1/researchers/:id` — public profile page
- `PUT /api/v1/researchers/me` — authenticated researcher updates own profile
- `POST /api/v1/researchers/me/publications` — add a publication entry

**Frontend:**

- Researcher public directory: searchable cards (name, affiliation, research interests)
- Public profile page: photo, bio, interests, ORCID/Scholar/Scopus links, publications, projects
- Researcher dashboard: edit profile form, add/remove publications, upload CV

### 1.5 Admin CMS (Basic)

- Admin dashboard home with counts: users pending, open opportunities, news articles, contact enquiries
- Manage: About content, Leadership profiles, Research areas, Journal links, Publications, Conference listings, Academy programmes, AI Lab content, Innovation Hub content, News & Events, Gallery
- All admin pages are CRUD: list table → create form → edit form → delete with confirmation
- Role guard: only `super_admin` and `foundation_admin` can access the full CMS

### 1.6 Global Search

- `GET /api/v1/search?q=term&type=all` — searches across research, publications, news, opportunities, researchers
- Frontend: search bar in Navbar → results page grouped by type

### 1.7 Certificate Verification Placeholder

- Page at `/verify` with a text input for Certificate ID
- Submit hits `GET /api/v1/certificates/verify/:uid`
- Response: "Certificate verification is not yet active. This feature is coming soon." — styled placeholder card

### 1.8 Phase 1 Deliverables Checklist

- [x] Google OAuth: clicking "Continue with Google" redirects to Google, returns directly to `/dashboard` with session cookie set — no `/oauth-callback` page involved
- [x] LinkedIn OAuth: same flow works end-to-end via LinkedIn
- [x] OAuth new user: auto-approved, role defaults to `participant_applicant`, appears in admin Users list as `active`
- [x] OAuth existing email: accounts merge silently; user retains their prior role and status
- [x] OAuth user attempting password login receives: "Please sign in with Google or LinkedIn."
- [x] `014_oauth_columns.sql` migration ran; `oauth_provider`, `oauth_id`, `avatar_url` columns exist on `users` table
- [x] All 14 public pages live and responsive
- [x] Auth system: register, login, role selection, admin approval flow
- [x] Researcher self-registration and profile management
- [x] Opportunities module: full listing, detail, apply flow, admin management
- [x] Admin CMS covering all content modules
- [x] Global search functional
- [x] Certificate verification placeholder live
- [x] Journals page: cards with external hyperlinks only
- [x] SEO: unique titles, meta descriptions, Open Graph per page
- [x] Security: HTTPS config, helmet, rate limiting, input validation on all endpoints


## Phase 2 — Submissions, Registration & Participant Modules

**Goal:** Users can submit papers to conferences, register for Academy programmes, and conference/academy admin workflows are active. Payment UI remains dummy. Certificate generation remains a placeholder.

### 2.1 Conference Submission & Registration

**Backend:**

- `POST /api/v1/conferences/:id/submit` — abstract or full-paper submission with file upload
- `GET /api/v1/conferences/:id/submissions` — admin: list all submissions
- `PATCH /api/v1/admin/submissions/:id/status` — admin: accept / reject submission
- `POST /api/v1/conferences/:id/register` — participant registration; payment\_status set to `dummy_paid`
- `GET /api/v1/my/conference-registrations` — user's registrations

**Frontend:**

- Conference detail page gains: Submit Paper tab, Register tab
- Submit Paper form: title, abstract, author list, file upload (PDF), submission type
- Registration form: name, email, affiliation, designation, mode preference; dummy payment step ("Payment will be enabled soon" banner)
- My Dashboard → Conference tab: list of registered conferences and submitted papers with status
- Admin → Conference: submission list with accept/reject action; registrations list with export

### 2.2 Academy Programme Registration

**Backend:**

- `POST /api/v1/academy/programs/:id/register` — learner registration; payment\_status = `dummy_paid`
- `GET /api/v1/my/academy-registrations` — user's programme enrollments
- Admin: `GET /api/v1/admin/academy/registrations` — full list with filters
- Admin: `PATCH /api/v1/admin/academy/registrations/:id/status` — confirm / cancel

**Frontend:**

- Academy programme detail page gains Register Now button
- Dummy payment step with "Payment integration coming soon" notice
- My Dashboard → Academy tab: enrolled programmes, status (Applied / Confirmed / Completed)
- Admin → Academy: participant list per programme, status management, export to CSV

### 2.3 Certificate Placeholder Upgrade

- Admin can manually upload a certificate PDF and assign it to a user + event/programme
- `POST /api/v1/admin/certificates` — create certificate record (user\_id, issued\_for\_type, issued\_for\_id, pdf\_url, certificate\_uid)
- `GET /api/v1/certificates/verify/:uid` — returns certificate record if found; still shows "Automated verification coming in a future update"
- User Dashboard → Certificates tab: list of certificates issued to them with download link

### 2.4 User Dashboard (Consolidated)

Single dashboard at `/dashboard` with tabs:

| Tab | Content |
| --- | --- |
| Profile | Edit personal details, photo upload |
| Applications | Opportunity applications and their statuses |
| Conferences | Registered conferences, submitted papers |
| Academy | Enrolled programmes |
| Certificates | Issued certificates with download |
| Researcher Profile | Only shown if role = researcher |

### 2.5 Phase 2 Deliverables Checklist

- [x] Conference paper submission flow end-to-end
- [x] Conference registration with dummy payment step
- [x] Academy programme registration with dummy payment step
- [x] Admin submission review workflow (accept/reject)
- [x] Admin academy participant management
- [x] Manual certificate upload by admin, user can download
- [x] Consolidated user dashboard with all tabs
- [x] CSV export for admin lists

## Phase 3 — Research Repository, Advanced Search & Innovation Workflows

**Goal:** Full research repository searchable by author/year/topic/type, researcher profiles enriched with publications and projects, Innovation Hub application flow live, and structured opportunity application tracking enhanced.

### 3.1 Research Repository

**Backend:**

- `GET /api/v1/research/outputs?author=&year=&topic=&type=` — filtered, paginated repository
- `GET /api/v1/research/outputs/:id` — single output detail
- Admin: `POST/PUT/DELETE /api/v1/admin/research/outputs` — manage repository entries

**Frontend:**

- Research Repository page: search bar + filters (Author, Year, Type, Research Area)
- Paginated results cards: title, authors, type badge, year, link to PDF/DOI
- Individual output detail page with full metadata

### 3.2 Enriched Researcher Profiles

- Researchers can link their outputs from the repository to their own profile
- `POST /api/v1/researchers/me/link-output/:outputId`
- Public profile page now shows linked repository outputs, linked projects, and collaboration request form
- `POST /api/v1/researchers/:id/collaboration-request` — sends email notification to researcher

### 3.3 Innovation Hub Workflows

**Backend:**

- `GET /api/v1/innovation-hub/programs` — list hackathons, challenges, incubation calls
- `POST /api/v1/innovation-hub/programs/:id/apply` — application with team details, project brief upload
- Admin: manage programmes, review applications, assign mentors
- `GET /api/v1/innovation-hub/mentors` — public mentor directory

**Frontend:**

- Innovation Hub programme pages with Apply Now flow
- Application form: team name, member names, project title, brief (PDF upload), domain
- Application status tracker in user dashboard → Innovation tab
- Admin: applications list per programme with status management

### 3.4 Advanced Global Search Upgrade

- Full-text search using PostgreSQL `tsvector` / `tsquery` across all indexed tables
- Search results page: tabbed by type (Research, Publications, News, Researchers, Opportunities, Programmes)
- Faceted filters per tab: year range, category, status
- `GET /api/v1/search?q=&type=&year_from=&year_to=&page=`

### 3.5 Reporting & Analytics (Admin)

- Admin dashboard metrics: total users by role, total applications by category, total registrations by programme, total research outputs by type
- `GET /api/v1/admin/reports/summary` — JSON summary for dashboard charts
- Export buttons: any admin list → CSV download

### 3.6 Phase 3 Deliverables Checklist

- [x] Research repository live with full-text search and filters
- [x] Researcher profiles linked to repository outputs and projects
- [x] Collaboration request form on researcher profile
- [x] Innovation Hub programme application flow
- [x] Mentor directory on Innovation Hub page
- [x] Advanced global search with full-text PostgreSQL indexing
- [x] Admin reports summary endpoint and dashboard metrics
- [x] CSV export on all admin lists

## Phase 4 — Consultancy Workflow & Public School Placeholder

**Goal:** Consultancy enquiry-to-engagement workflow live; Public School section added as a controlled placeholder with no claims published until officially confirmed.

### 4.1 Consultancy Workflow

**Backend:**

- `POST /api/v1/consultancy/request` — submit a consultation request: name, organisation, email, phone, service type, project description, budget range, preferred timeline
- `GET /api/v1/admin/consultancy/requests` — admin list of all requests with status
- `PATCH /api/v1/admin/consultancy/requests/:id/status` — update status (new → reviewed → in\_discussion → engaged → closed)
- Email notification to admin on new request submission

**Frontend:**

- Consultancy page: service cards (Research, Academic, AI & Technology, Digital Innovation, Institutional, Corporate), each with description and "Request a Consultation" CTA
- Consultation request form: multi-step (1. Contact details → 2. Service type → 3. Project brief → 4. Submit)
- Confirmation page: "Your request has been received. Our team will contact you within 3 business days."
- Admin → Consultancy: requests table with status dropdown, notes field, contact history log

### 4.2 Public School — Controlled Placeholder

- Route `/public-school` exists but is **not added to the main navigation menu**
- Page content: "ASGARD Public School is a planned initiative. Details including admissions, curriculum, faculty and facilities will be published once officially confirmed. Please check back for updates."
- No affiliation, accreditation, approval, recognition, ranking, or admission claims of any kind
- Admin can toggle a `is_active` flag in `site_settings` to enable the section in the menu when officially ready
- `GET /api/v1/settings/public-school-active` — frontend reads this flag on load to show/hide the nav item

### 4.3 Phase 4 Deliverables Checklist

- [x] Consultancy request form live (multi-step)
- [x] Admin consultancy request management with status workflow
- [x] Email notification on new consultation request
- [x] Public School placeholder page at `/public-school`
- [x] Public School hidden from main nav by default
- [x] Admin toggle to enable Public School in nav when ready

## Phase 5 — Real Payment, Certificate Automation, PWA & Internationalisation

**Goal:** Replace all dummy placeholders with real integrations; add Tamil language support; optionally ship a PWA or mobile app; enable advanced analytics.

### 5.1 Real Payment Gateway Integration

- Replace dummy payment step with a real gateway (Razorpay recommended for India; Stripe as alternative)
- Implement `POST /api/v1/payments/create-order` — creates a payment order on the gateway
- Implement `POST /api/v1/payments/verify` — verifies payment signature and updates the registration/application record
- Payment records table: `payments (id, user_id, entity_type, entity_id, gateway, order_id, payment_id, amount, currency, status, created_at)`
- GST/tax invoice generation where legally required
- Admin → Payments: transaction list, refund triggers, export

### 5.2 Automated Certificate Engine

- Trigger-based certificate generation: on conference attendance confirmed, academy programme completed, or reviewer/volunteer role fulfilled
- Certificate PDF generation using a Node.js PDF library (e.g. `pdfkit` or `puppeteer` with HTML template)
- Unique UUID per certificate stored in `certificates` table; QR code embedded linking to `/verify/:uid`
- `GET /api/v1/certificates/verify/:uid` now returns full verified certificate record
- Public verification page shows: participant name, programme/event, date, issuing unit, status — with QR scanner option
- Admin can still manually issue certificates for edge cases

### 5.3 Internationalisation (i18n)

- Add `i18next` + `react-i18next` to the React frontend
- All UI strings moved to `/locales/en/translation.json` and `/locales/ta/translation.json`
- Language selector in navbar (EN | தமிழ்)
- Backend API responses remain in English; only UI labels and static content are translated in Phase 5
- Priority pages for Tamil translation: Home, About, Opportunities, Contact, Academy

### 5.4 PWA / Mobile App (Optional)

- Add `vite-plugin-pwa` to the React app for PWA capabilities
- Service worker for offline caching of static pages
- Web App Manifest with ASGARD branding, icons, theme colour
- Push notification support for new opportunity listings and conference announcements (optional)
- If mobile app is needed: evaluate React Native reusing existing API endpoints

### 5.5 Advanced Analytics

- Integrate Google Analytics 4 or Plausible (privacy-first) on the frontend
- Google Search Console setup and sitemap submission
- Admin analytics dashboard tab: page views, top search queries, application funnel, registration trends
- Core Web Vitals monitoring via Lighthouse CI in the deployment pipeline

### 5.6 Partner Portal

- Dedicated login for partner organisations to view joint projects, shared publications, and collaboration records
- `partners (id, organisation_name, logo_url, website_url, collaboration_type, is_active)`
- Partner portal: read-only view of shared project outputs and upcoming joint events

### 5.7 Phase 5 Deliverables Checklist

- [x] Real payment gateway (Razorpay/Stripe) replacing dummy UI
- [x] Automated certificate generation with QR code
- [x] Certificate verification page fully functional
- [x] Tamil language UI translation for priority pages
- [x] Language selector in navbar
- [x] PWA manifest and service worker
- [x] Google Analytics 4 / Plausible integrated
- [x] Admin analytics dashboard tab
- [x] Partner portal (read-only)
- [x] Core Web Vitals passing at 90+ on Lighthouse

## Express.js API Route Plan

All routes are prefixed `/api/v1/`. Auth-required routes are marked 🔒. Admin-only routes are marked 🔒🛡.

### Auth

| Method | Route | Description |
| --- | --- | --- |
| POST | /auth/register | Sign up with role selection |
| POST | /auth/login | Login, creates server-side session |
| POST | /auth/forgot-password | Send password reset email |
| POST | /auth/reset-password | Reset password with token |
| GET | /auth/me 🔒 | Get current user info |

### Users & Admin

| Method | Route | Description |
| --- | --- | --- |
| GET | /admin/users 🔒🛡 | List all users with filters |
| GET | /admin/users/pending 🔒🛡 | List pending approval users |
| PATCH | /admin/users/:id/approve 🔒🛡 | Approve user |
| PATCH | /admin/users/:id/reject 🔒🛡 | Reject user |
| PUT | /users/me 🔒 | Update own profile |

### Researchers

| Method | Route | Description |
| --- | --- | --- |
| GET | /researchers | Public researcher directory |
| GET | /researchers/:id | Public researcher profile |
| PUT | /researchers/me 🔒 | Update own researcher profile |
| POST | /researchers/me/publications 🔒 | Add publication to own profile |
| DELETE | /researchers/me/publications/:id 🔒 | Remove own publication |
| POST | /researchers/me/link-output/:outputId 🔒 | Link repository output |
| POST | /researchers/:id/collaboration-request | Send collaboration request email |

### Research

| Method | Route | Description |
| --- | --- | --- |
| GET | /research/areas | List research areas |
| GET | /research/projects | List research projects |
| GET | /research/projects/:id | Project detail |
| GET | /research/outputs | Repository with filters |
| GET | /research/outputs/:id | Output detail |
| POST | /admin/research/outputs 🔒🛡 | Create output |
| PUT | /admin/research/outputs/:id 🔒🛡 | Update output |
| DELETE | /admin/research/outputs/:id 🔒🛡 | Delete output |

### Journals

| Method | Route | Description |
| --- | --- | --- |
| GET | /journals | List journals (with external URLs) |
| GET | /journals/:id | Journal detail |
| POST | /admin/journals 🔒🛡 | Create journal entry |
| PUT | /admin/journals/:id 🔒🛡 | Update journal entry |

### Publications

| Method | Route | Description |
| --- | --- | --- |
| GET | /publications | List publications with filters |
| GET | /publications/:id | Publication detail |
| POST | /admin/publications 🔒🛡 | Create publication |
| PUT | /admin/publications/:id 🔒🛡 | Update publication |
| DELETE | /admin/publications/:id 🔒🛡 | Delete publication |

### Conferences

| Method | Route | Description |
| --- | --- | --- |
| GET | /conferences | List all conferences |
| GET | /conferences/:id | Conference detail |
| POST | /conferences/:id/submit 🔒 | Submit paper |
| POST | /conferences/:id/register 🔒 | Register (dummy payment) |
| GET | /my/conference-registrations 🔒 | User's registrations |
| GET | /admin/conferences/:id/submissions 🔒🛡 | Admin: list submissions |
| PATCH | /admin/submissions/:id/status 🔒🛡 | Accept/reject submission |

### Academy

| Method | Route | Description |
| --- | --- | --- |
| GET | /academy/programs | List programmes |
| GET | /academy/programs/:id | Programme detail |
| POST | /academy/programs/:id/register 🔒 | Register (dummy payment) |
| GET | /my/academy-registrations 🔒 | User's enrollments |
| GET | /admin/academy/registrations 🔒🛡 | Admin: all registrations |
| PATCH | /admin/academy/registrations/:id/status 🔒🛡 | Confirm/cancel |

### Opportunities

| Method | Route | Description |
| --- | --- | --- |
| GET | /opportunities | List open opportunities |
| GET | /opportunities/:slug | Opportunity detail |
| POST | /opportunities/:id/apply 🔒 | Submit application |
| GET | /my/applications 🔒 | User's applications |
| GET | /admin/opportunities 🔒🛡 | Admin: all listings |
| POST | /admin/opportunities 🔒🛡 | Create opportunity |
| PUT | /admin/opportunities/:id 🔒🛡 | Update opportunity |
| DELETE | /admin/opportunities/:id 🔒🛡 | Delete opportunity |
| GET | /admin/applications 🔒🛡 | Admin: all applications |
| PATCH | /admin/applications/:id/status 🔒🛡 | Update application status |

### Certificates

| Method | Route | Description |
| --- | --- | --- |
| GET | /certificates/verify/:uid | Public certificate verification |
| GET | /my/certificates 🔒 | User's certificates |
| POST | /admin/certificates 🔒🛡 | Manually issue certificate |

### News, Events & Media

| Method | Route | Description |
| --- | --- | --- |
| GET | /news | List news with type filter |
| GET | /news/:slug | News article detail |
| GET | /events | List events |
| GET | /gallery | List gallery items |
| POST | /admin/news 🔒🛡 | Create news |
| PUT | /admin/news/:id 🔒🛡 | Update news |
| POST | /admin/events 🔒🛡 | Create event |
| POST | /admin/gallery 🔒🛡 | Upload media |

### Consultancy, Contact & Search

| Method | Route | Description |
| --- | --- | --- |
| POST | /consultancy/request | Submit consultation request |
| GET | /admin/consultancy/requests 🔒🛡 | Admin: request list |
| PATCH | /admin/consultancy/requests/:id/status 🔒🛡 | Update status |
| POST | /contact | Submit contact enquiry |
| GET | /search | Global search with filters |
| GET | /home/summary | Home page aggregated data |
| GET | /health | Server health check |

## Security, SEO & Deployment Checklist

### Security

- [ ] HTTPS enforced everywhere (SSL certificate via Let's Encrypt or hosting provider)
- [ ] `helmet` middleware on all Express routes (sets security headers)
- [ ] CORS restricted to known frontend origins only
- [ ] Server-side sessions stored in PostgreSQL (`user_sessions` table via `connect-pg-simple`); session cookie is `httpOnly`, `secure` in production, `sameSite: lax`, max-age 7 days
- [ ] `bcryptjs` with salt rounds ≥ 12 for all password hashing
- [ ] `express-rate-limit` on `/auth/login` and `/auth/register` endpoints
- [ ] `express-validator` validation on all POST/PUT endpoints; reject invalid input early
- [ ] File upload: validate MIME type and file extension server-side; limit size (5MB default)
- [ ] Private admin routes return 401/403 for unauthenticated/unauthorised requests
- [ ] PostgreSQL queries use parameterised statements (never string interpolation)
- [ ] `.env` variables never committed to Git; `.env.example` committed with keys only
- [ ] Audit log written for all admin actions (user, action, entity, timestamp, IP)
- [ ] MFA for Super Admin and Foundation Admin (Phase 2 or earlier)
- [ ] Regular `npm audit` run in CI; critical vulnerabilities block deployment
- [ ] Database backups automated (daily minimum)

### SEO

- [ ] Unique `<title>` and `<meta name="description">` per page
- [ ] Open Graph tags on all public pages (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] XML sitemap generated at `/sitemap.xml` covering all public routes
- [ ] `robots.txt` at root: allow public pages, disallow `/admin`, `/dashboard`, `/api`
- [ ] Canonical URLs set on all pages to avoid duplicate content
- [ ] Semantic HTML: `<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`
- [ ] All images have meaningful `alt` attributes
- [ ] Structured data (JSON-LD): `Organization`, `Event`, `Article`, `Course` schema where applicable
- [ ] URL slugs are lowercase, hyphenated, descriptive (no IDs in public URLs)
- [ ] Google Search Console property added and sitemap submitted post-launch

### Accessibility (WCAG 2.1 AA)

- [ ] Colour contrast ratio ≥ 4.5:1 for all body text (navy on white passes)
- [ ] All interactive elements keyboard-navigable with visible focus ring
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are announced to screen readers via `aria-live`
- [ ] Skip-to-content link at top of every page
- [ ] Language attribute set: `<html lang="en">`

### Performance

- [ ] React bundle code-split by route using `React.lazy` + `Suspense`
- [ ] Images served in WebP format where possible; `loading="lazy"` on below-fold images
- [ ] API responses paginated (default 20 items per page)
- [ ] Express responses compressed with `compression` middleware
- [ ] Static assets served with long-term cache headers
- [ ] Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Deployment Readiness

- [ ] Environment variables set on server for: `DATABASE_URL`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CLIENT_URL`, `PORT`
- [ ] PostgreSQL connection pool configured (`pg.Pool` with max 10 connections)
- [ ] PM2 or equivalent process manager running the Express server with auto-restart
- [ ] Nginx reverse proxy in front of Express (optional but recommended)
- [ ] CI pipeline: lint → test → build → deploy (GitHub Actions or equivalent)
- [ ] `README.md` with setup instructions for new developers: clone, install, migrate, seed, run
- [ ] Admin training document covering: how to manage content, approve users, handle applications, issue certificates
