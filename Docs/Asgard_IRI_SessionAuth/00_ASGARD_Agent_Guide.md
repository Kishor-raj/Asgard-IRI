# ASGARD-IRI — Agent Execution Guide
> Version 2.0 | October 2026  
> READ THIS FILE FIRST before reading any other file in this set.  
> This file tells you WHO you are, WHAT files to read, in what ORDER to build, and HOW to verify each step.

---

## YOUR ROLE

You are a senior full-stack developer building the ASGARD International Foundation for Research and Innovation (ASGARD-IRI) website from scratch.

You will receive instructions one phase at a time. Do not jump ahead. Do not skip steps. Do not guess missing values — this document and the three supporting files define everything you need.

---

## THE THREE DOCUMENTS YOU MUST READ

Read all three before writing a single line of code. They form one unified specification.

| File | What It Defines |
|---|---|
| `01_ASGARD_Master_Blueprint.md` | WHAT to build: confirmed decisions, database schema, folder structure, all API routes, phase-by-phase feature checklists |
| `02_ASGARD_Technical_Spec.md` | HOW to build it: exact packages, env vars, code patterns, auth flow, validation, error handling, search, payment |
| `03_ASGARD_Design_Tokens.md` | HOW IT LOOKS: colors, Tailwind config, typography, every reusable component with full JSX code |

---

## CRITICAL RULES (Never Break These)

1. **Never interpolate variables into SQL strings.** Always use parameterised queries (`$1`, `$2`).
2. **Never guess a package version.** Use exact versions from `02_ASGARD_Technical_Spec.md`.
3. **Never use a color not in the palette.** All colors come from `03_ASGARD_Design_Tokens.md`.
4. **Never skip the `asyncHandler` wrapper** on controller functions.
5. **Never expose `super_admin` or `foundation_admin` roles** in the public registration dropdown.
6. **Never build journal workflow logic.** Journals are external hyperlinks only.
7. **Never implement real payment or certificate logic in Phases 0–4.** Use the dummy UI components defined in `03_ASGARD_Design_Tokens.md`.
8. **Never add Public School to the navbar** unless the `site_settings` flag `public_school_active` is `true`.
9. **Always run `handleValidation` middleware** before every controller on POST/PUT routes.
10. **Always write an audit log** after every admin create / update / delete / approve / reject action.

---

## BUILD ORDER (One Phase at a Time)

Execute each phase fully and verify its checklist before moving to the next.

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

Do not start Phase 1 until Phase 0 is verified.  
Do not start Phase 2 until Phase 1 is verified.  
And so on.

---

## PHASE 0 — ENVIRONMENT & FOUNDATION

**Goal:** A fully wired skeleton. No features. Just working infrastructure.

### Step-by-step execution order

#### Step 0.1 — Create Monorepo Structure
Create the folder structure exactly as defined in `01_ASGARD_Master_Blueprint.md` under "PROJECT FOLDER STRUCTURE".

```
asgard-iri/
├── client/
├── server/
├── uploads/          ← create empty folder, add .gitkeep
├── .env.example      ← copy all keys from 02_ASGARD_Technical_Spec.md, no values
├── .gitignore
└── README.md
```

`.gitignore` must include:
```
node_modules/
.env
uploads/*
!uploads/.gitkeep
dist/
build/
*.log
```

---

#### Step 0.2 — Server Setup

1. `cd server && npm init -y`
2. Install all server dependencies from `02_ASGARD_Technical_Spec.md` — exact versions.
3. Create `server/src/app.js` — copy the full Express app scaffold from `02_ASGARD_Technical_Spec.md` (Phase 0 section).
4. Create `server/src/config/db.js` — copy the pg.Pool config from `02_ASGARD_Technical_Spec.md`.
5. Create all utility files:
   - `server/src/utils/asyncHandler.js`
   - `server/src/utils/slugify.js`
   - `server/src/utils/mailer.js`
   - `server/src/utils/audit.js`
6. Create all middleware files (empty stubs for now, full code added in Phase 1):
   - `server/src/middleware/auth.middleware.js`
   - `server/src/middleware/role.middleware.js`
   - `server/src/middleware/upload.middleware.js`
   - `server/src/middleware/validate.middleware.js`
   - `server/src/middleware/error.middleware.js` ← implement fully now (needed from Phase 0)
7. Scaffold all route files (each exports an empty `express.Router()`):
   - One file per module listed in `01_ASGARD_Master_Blueprint.md` under API Routes.
8. Create `server/server.js` entry point:
```js
const app  = require('./src/app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ASGARD-IRI server running on port ${PORT}`));
```
9. Add to `server/package.json` scripts:
```json
"scripts": {
  "dev":   "nodemon server.js",
  "start": "node server.js"
}
```

---

#### Step 0.3 — Database Setup

1. Create PostgreSQL database: `asgard_db`
2. Create PostgreSQL user: `asgard_user` with a strong password
3. Grant all privileges on `asgard_db` to `asgard_user`
4. Write migration files under `server/migrations/` — one file per table group, numbered:

```
001_create_users.sql
002_create_researcher_profiles.sql
003_create_research.sql
004_create_journals.sql
005_create_publications.sql
006_create_conferences.sql
007_create_academy.sql
008_create_certificates.sql
009_create_opportunities.sql
010_create_innovation.sql
011_create_news_events.sql
012_create_admin_utility.sql
013_create_consultancy.sql
```

Use the schema definitions from `01_ASGARD_Master_Blueprint.md` under "DATABASE SCHEMA". Every table must include `created_at` and `updated_at` columns.

5. Run all migrations in order:
```bash
for f in server/migrations/*.sql; do psql -U asgard_user -d asgard_db -f "$f"; done
```

6. Write and run seed files under `server/seeds/`:

`01_roles_and_admins.sql`:
```sql
-- Insert super_admin and foundation_admin directly (never via public registration)
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES
  ('superadmin@asgard-iri.org', '<bcrypt_hash_of_SecurePass123!>', 'Super Admin', 'super_admin', 'active'),
  ('admin@asgard-iri.org',      '<bcrypt_hash_of_SecurePass123!>', 'Foundation Admin', 'foundation_admin', 'active');
```

`02_research_areas.sql`:
```sql
INSERT INTO research_areas (name, slug, description) VALUES
  ('Artificial Intelligence', 'artificial-intelligence', 'AI and machine learning research'),
  ('Bioinformatics', 'bioinformatics', 'Computational approaches to biological data'),
  ('Environmental Science', 'environmental-science', 'Climate, ecology and sustainability research'),
  ('Data Science', 'data-science', 'Statistical and computational data analysis'),
  ('Public Health', 'public-health', 'Epidemiology and community health research'),
  ('Education Technology', 'education-technology', 'Technology-enhanced learning research');
```

`03_site_settings.sql`:
```sql
INSERT INTO site_settings (key, value) VALUES
  ('public_school_active', 'false'),
  ('maintenance_mode',     'false'),
  ('site_tagline',         'Building institutional credibility through research, publication, education and collaboration.');
```

7. Verify all tables exist:
```bash
psql -U asgard_user -d asgard_db -c "\dt"
```

---

#### Step 0.4 — Client Setup

1. `cd client && npm create vite@latest . -- --template react`
2. Install all client dependencies from `02_ASGARD_Technical_Spec.md` — exact versions.
3. Install and configure Tailwind:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
4. Replace `tailwind.config.js` with the full config from `03_ASGARD_Design_Tokens.md`.
5. Replace `src/index.css` with `globals.css` content from `03_ASGARD_Design_Tokens.md`.
6. Add Google Fonts `<link>` tags to `index.html` from `03_ASGARD_Design_Tokens.md`.
7. Create `client/src/services/api.js` — copy Axios instance from `02_ASGARD_Technical_Spec.md`.
8. Create `client/src/context/AuthContext.jsx` — copy from `02_ASGARD_Technical_Spec.md`.
9. Create `client/src/routes/ProtectedRoute.jsx` — copy from `02_ASGARD_Technical_Spec.md`.

---

#### Step 0.5 — Build All Reusable Components

Build every component from `03_ASGARD_Design_Tokens.md` in this order:

**Layout components** (build first — used by all pages):
- `Navbar.jsx` — full implementation with mobile hamburger
- `Footer.jsx` — full implementation with all link groups
- `PageLayout.jsx`
- `AdminLayout.jsx` — full sidebar implementation
- `AuthLayout.jsx`

**Common components:**
- `Button.jsx` — all 5 variants (primary, secondary, outline, ghost, danger)
- `Card.jsx` — standard and featured variants
- `Badge.jsx` — all status variants
- `Loader.jsx` — fullPage and inline variants
- `SkeletonCard.jsx`
- `EmptyState.jsx`
- `Pagination.jsx`
- `Modal.jsx` (build as a focus-trapped overlay with Escape-key close)

**Form primitives:**
- `Input.jsx`
- `Select.jsx`
- `Textarea.jsx`
- `FileUpload.jsx`

**Placeholder components (needed from Phase 1):**
- `DummyPayment.jsx` — copy from `03_ASGARD_Design_Tokens.md`

---

#### Step 0.6 — Scaffold All Pages as Placeholders

Create every page file listed in the folder structure with a minimal placeholder:

```jsx
// Example: client/src/pages/Research/index.jsx
export default function ResearchPage() {
  return <div className="p-8 text-navy font-display text-2xl">Research — Coming in Phase 1</div>;
}
```

Configure React Router in `client/src/routes/index.jsx` with all routes mapped to their placeholder pages. Mount the router in `App.jsx` with `AuthProvider` and `HelmetProvider` wrapping everything.

---

#### Step 0.7 — Setup Toast Notifications

Add `<Toaster />` from `react-hot-toast` to `App.jsx` using the config from `03_ASGARD_Design_Tokens.md`.

---

#### ✅ Phase 0 Verification Checklist

Before moving to Phase 1, confirm every item:

- [x] `GET http://localhost:5000/api/v1/health` returns `{ "status": "ok" }`
- [x] All 13 migration SQL files ran without errors
- [x] `\dt` in psql shows all tables: users, sessions, researcher_profiles, research_areas, research_projects, research_outputs, journals, publications, conferences, conference_submissions, conference_registrations, academy_programs, academy_registrations, certificates, opportunities, opportunity_applications, innovation_programs, innovation_applications, mentors, news, events, gallery, contact_enquiries, newsletter_subscribers, site_settings, audit_logs, consultancy_requests, password_reset_tokens
- [x] Seed data present: 2 admin users, 6 research areas, 3 site_settings rows
- [x] React app loads at `http://localhost:5173` with no console errors
- [x] Tailwind custom classes work: `bg-navy`, `text-gold`, `bg-grey-50`
- [x] Navbar renders with ASGARD navy background and all nav links
- [x] Footer renders correctly
- [x] All reusable components render without errors (test each in a temp page)
- [x] React Router: navigating to `/about`, `/research`, `/contact` shows placeholder pages
- [x] No TypeScript errors, no ESLint critical errors

---

## PHASE 1 — MVP PUBLIC LAUNCH

**Goal:** All public pages live, auth system with admin approval, full Opportunities module, researcher self-registration, basic admin CMS.

### Step-by-step execution order

#### Step 1.1 — Implement Auth Middleware

Fill in all middleware files with full code from `02_ASGARD_Technical_Spec.md`:
- `auth.middleware.js` — JWT verify → `req.user`
- `role.middleware.js` — `authorise(...roles)` guard
- `validate.middleware.js` — `handleValidation` function
- `upload.middleware.js` — full multer config

---

#### Step 1.2 — Build Auth Controller & Routes

File: `server/src/controllers/auth.controller.js`

Implement these endpoints in this order, following the exact flows in `02_ASGARD_Technical_Spec.md`:

1. `POST /auth/register`
   - Validate with `validateRegister` rules (see Technical Spec)
   - Check duplicate email → 409
   - Hash password with `bcryptjs` (saltRounds: 12)
   - `INSERT INTO users` with `status = 'pending'`
   - Send email to `ADMIN_EMAIL`: new pending user notification
   - Respond 201

2. `POST /auth/login`
   - Find user by email
   - Compare password with `bcryptjs.compare`
   - Check `status` → 403 for pending/rejected
   - Sign access token (1h) + refresh token (7d)
   - Insert refresh token hash into `sessions`
   - Set refresh token as `httpOnly` cookie
   - Respond 200 with `{ accessToken, user }`

3. `POST /auth/logout` 🔒
   - Delete session row matching refresh token
   - Clear cookie
   - Respond 200

4. `POST /auth/forgot-password`
   - Find user by email
   - Generate UUID token, hash it, store in `password_reset_tokens` with 1h expiry
   - Send reset email with link: `${CLIENT_URL}/reset-password?token=<raw_token>`
   - Respond 200 (always — never reveal if email exists)

5. `POST /auth/reset-password`
   - Find valid (unused, non-expired) token in `password_reset_tokens`
   - Hash new password, update `users.password_hash`
   - Mark token as used
   - Respond 200

6. `GET /auth/me` 🔒
   - Return `req.user` data from DB (not just from JWT payload)
   - Respond 200 with user object

---

#### Step 1.3 — Build Public Content Controllers

For each module below, implement the GET endpoints. Follow the standard response format from `02_ASGARD_Technical_Spec.md` (paginated list + single detail). Use parameterised queries from the schema in `01_ASGARD_Master_Blueprint.md`.

| Controller file | Endpoints to implement |
|---|---|
| `research.controller.js` | `GET /research/areas`, `GET /research/projects`, `GET /research/projects/:slug` |
| `journal.controller.js` | `GET /journals`, `GET /journals/:id` |
| `publication.controller.js` | `GET /publications?type=&year=`, `GET /publications/:slug` |
| `conference.controller.js` | `GET /conferences?status=`, `GET /conferences/:slug` |
| `academy.controller.js` | `GET /academy/programs?type=&mode=`, `GET /academy/programs/:slug` |
| `news.controller.js` | `GET /news?type=&page=`, `GET /news/:slug`, `GET /events`, `GET /gallery` |
| `search.controller.js` | `GET /search?q=&type=&page=` — Phase 1: simple ILIKE across titles only |
| `contact.controller.js` | `POST /contact` — validate + INSERT + respond 201 |

Also implement:
- `GET /home/summary` — single endpoint returning: featured research projects (3), featured publications (3), upcoming conferences (2), open opportunities count, latest news (3)

---

#### Step 1.4 — Build Opportunities Module (Full)

This is the most complete module in Phase 1. Build in this order:

**Backend:**
1. `GET /opportunities` — list with filters: `category`, `mode`, `status=open`, paginated
2. `GET /opportunities/:slug` — single opportunity detail
3. `POST /opportunities/:id/apply` 🔒 — validate, `upload.single('resume')`, INSERT application
4. `GET /my/applications` 🔒 — user's own applications with opportunity title joined

**Admin backend:**
5. `GET /admin/opportunities` 🔒🛡 — all listings with status filter
6. `POST /admin/opportunities` 🔒🛡 — create; auto-generate slug with `uniqueSlug`; `logAction`
7. `PUT /admin/opportunities/:id` 🔒🛡 — update; `logAction`
8. `DELETE /admin/opportunities/:id` 🔒🛡 — soft delete (set `status = 'closed'`); `logAction`
9. `GET /admin/applications` 🔒🛡 — all applications with opportunity + user info joined
10. `PATCH /admin/applications/:id/status` 🔒🛡 — update status; send email to applicant; `logAction`

**Frontend pages:**
- `Opportunities/index.jsx` — landing page with category tab bar (Careers, Internships, Fellowships, RA, Student Projects, Volunteering, Editorial, Grants). Each tab filters the listing. Cards show: title, department, location badge, mode badge, deadline badge, "Apply Now" button.
- `Opportunities/OpportunityDetail.jsx` — full detail page: title, inner page header, all fields, Apply Now CTA (requires login)
- `Opportunities/Apply.jsx` — form: cover letter textarea + resume PDF upload + submit. Show `DummyPayment` if fee is indicated. On success: toast + redirect to dashboard.
- `Dashboard/ApplicationsTab.jsx` — table of user's applications: opportunity title, category, applied date, status badge. No actions needed in Phase 1.

**Admin frontend pages:**
- `Admin/Opportunities.jsx` — data table of all listings with Create/Edit/Close actions. Create/Edit uses a slide-over or modal form.
- `Admin/Applications.jsx` — data table of all applications: applicant name, opportunity title, date, status dropdown to update.

---

#### Step 1.5 — Build Researcher Module

**Backend:**
1. `GET /researchers?search=&area=&page=` — public directory, filters by research interests
2. `GET /researchers/:id` — public profile (join with researcher_publications)
3. `PUT /researchers/me` 🔒 + `authorise('researcher')` — update own profile
4. `POST /researchers/me/publications` 🔒 + `authorise('researcher')` — add publication
5. `DELETE /researchers/me/publications/:pubId` 🔒 + `authorise('researcher')` — remove own publication
6. `POST /researchers/:id/collaboration-request` — validate name/email/message, send email to researcher; INSERT into contact_enquiries

**Frontend pages:**
- `Research/index.jsx` — overview page: research areas grid, featured projects list, researchers directory preview (first 8), "View All Researchers" link
- Researcher directory section: searchable grid of researcher cards (photo, name, designation, affiliation, top 3 research interests)
- Researcher public profile page: full bio, ORCID/Scholar/Scopus links, publications list, linked projects, collaboration request form
- `Dashboard/ResearcherTab.jsx` (role-gated: `researcher` only) — edit profile form (designation, affiliation, bio, research interests, ORCID URL, Scholar URL, Scopus URL, CV upload) + publications management (add/remove)

---

#### Step 1.6 — Build All Remaining Public Pages

Build each page as a React component. Each fetches from its API endpoint, shows `SkeletonCard` while loading, `EmptyState` if no data, and uses the `PageLayout` wrapper.

**Page-by-page implementation:**

`Home/index.jsx`:
- Hero section (copy JSX from `03_ASGARD_Design_Tokens.md`)
- Trust strip (copy JSX from `03_ASGARD_Design_Tokens.md`)
- "Our Ecosystem" section: 8 feature cards (Research, Journals, Publications, Conferences, Academy, AI Lab, Innovation Hub, Consultancy) — each with icon, title, one-line description, link
- Featured Research Projects: 3 cards fetched from `/home/summary`
- Impact Metrics strip: static numbers (update to dynamic in Phase 3): Researchers, Publications, Conferences, Programmes
- Latest News: 3 news cards fetched from `/home/summary`
- CTA banner: navy bg, gold text, "Explore Opportunities" button

`About/index.jsx`:
- Inner page header
- Foundation overview (static content — editable via admin CMS)
- Vision & Mission: two-column cards
- Leadership profiles: grid of photo + name + role cards
- Advisory Board: similar grid
- Team section

`Journals/index.jsx`:
- Inner page header
- Grid of journal cards: name, ISSN, description, logo if available, "Visit Journal" button → `external_url` (opens in new tab)
- **Important:** No internal article/submission UI. Links only.

`Publications/index.jsx`:
- Filter bar: type tabs (Books, eBooks, Proceedings, Reports, Monographs)
- Paginated grid of publication cards: cover image, title, authors, year, type badge, "View" link
- Publication detail page: full metadata, abstract, PDF link or DOI link

`Conferences/index.jsx`:
- Status tabs: Upcoming / Ongoing / Past
- Conference cards: title, theme, dates, venue, mode badge, "Learn More" link

`Academy/index.jsx`:
- Type tabs: Courses, FDPs, Workshops, Seminars, Research Methodology, AI & ML, Academic Writing
- Programme cards: title, duration, mode, start date, seats, "Register" button (Phase 2 registers; Phase 1 shows coming-soon toast)

`AITechLab/index.jsx`:
- Lab overview section
- Projects grid
- Capabilities / focus areas section

`InnovationHub/index.jsx`:
- Hub overview
- Programmes list (hackathons, challenges, etc.)
- Mentor preview section (Phase 3 adds full directory)
- Apply button (Phase 3 implements; Phase 1 shows coming-soon toast)

`Consultancy/index.jsx`:
- Service cards: Research, Academic, AI & Technology, Digital Innovation, Institutional, Corporate
- Each card: icon, title, description, "Request a Consultation" button (Phase 4 implements multi-step form; Phase 1 links to contact page)

`News/index.jsx`:
- Type filter tabs: All, News, Announcements, Press Releases, Research Highlights
- Paginated news cards: cover image, type badge, title, date, excerpt, "Read More" link
- News detail page: full article content

`Events/index.jsx`:
- Upcoming / Past toggle
- Event cards: title, date, location, mode badge, external registration link if provided

`Gallery/index.jsx` (tab inside News & Events page):
- Masonry or grid of images/videos from `/gallery`

`Contact/index.jsx`:
- Contact details: address, email, phone, map embed placeholder
- Contact form: name, email, phone, subject, message — validates + POST to `/contact` — success toast

`Policies/`:
- One static React page per policy (Privacy, Terms of Use, Ethics, Peer Review, Open Access, Refund). Static content, no API.

`Verify/index.jsx`:
- Copy placeholder component from `03_ASGARD_Design_Tokens.md`

---

#### Step 1.7 — Auth Pages

`Auth/Login.jsx`:
- `AuthLayout` wrapper
- Email + password inputs
- Submit → POST `/auth/login` → store `accessToken` in localStorage → call `login(token, user)` from `AuthContext` → redirect to `/dashboard`
- Show error toast for pending/rejected status

`Auth/Register.jsx`:
- `AuthLayout` wrapper
- Full name, email, password, confirm password, role selector dropdown
- Role options: Researcher, Author, Reviewer, Participant/Applicant, Trainer/Mentor, Content Editor, Journal Editor, Conference Admin, Academy Admin, Publication Editor, Technology Lab Admin, Innovation Admin, Careers/HR Admin
- Submit → POST `/auth/register` → success page: "Registration submitted. Awaiting admin approval."

`Auth/ForgotPassword.jsx` + `Auth/ResetPassword.jsx`:
- Standard flow using `/auth/forgot-password` and `/auth/reset-password`

---

#### Step 1.8 — Admin CMS (Phase 1 scope)

Build the admin panel pages listed in the Phase 1 section of `01_ASGARD_Master_Blueprint.md`. Each admin page follows this pattern:

```
AdminLayout (sidebar + topbar)
  └── Module page
        ├── Stats / summary cards at top
        ├── Filter bar (search input + dropdowns)
        ├── Data table (using Admin Data Table component from 03_ASGARD_Design_Tokens.md)
        │     └── Each row: data cells + action buttons (Edit / Delete / View)
        └── Create/Edit modal or slide-over form
```

**Build these admin pages in Phase 1:**
- `Admin/Dashboard.jsx` — metric cards: pending users, open opportunities, new enquiries, total researchers
- `Admin/Users.jsx` — pending users tab + all users tab; Approve/Reject buttons; role badge
- `Admin/Research.jsx` — research areas CRUD + projects CRUD
- `Admin/Journals.jsx` — journal entries CRUD (name, ISSN, external URL, description)
- `Admin/Publications.jsx` — publications CRUD
- `Admin/Conferences.jsx` — conferences CRUD
- `Admin/Academy.jsx` — programmes CRUD
- `Admin/Opportunities.jsx` — opportunity listings CRUD (already built in Step 1.4)
- `Admin/Applications.jsx` — application status management (already built in Step 1.4)
- `Admin/News.jsx` — news articles + events CRUD; gallery upload
- `Admin/Settings.jsx` — Phase 1: show `site_tagline` setting only; `public_school_active` added in Phase 4

**For all admin CRUD forms, the fields to include are exactly those defined in the DATABASE SCHEMA in `01_ASGARD_Master_Blueprint.md` for each table.**

---

#### Step 1.9 — SEO, robots.txt, sitemap.xml

**SEO (using `react-helmet-async`):**
Add `<Helmet>` to every page component using the pattern from `02_ASGARD_Technical_Spec.md`. Title pattern: `{Page Name} – ASGARD-IRI`.

**`client/public/robots.txt`:**
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /login
Disallow: /register
Sitemap: https://asgard-iri.org/sitemap.xml
```

**Sitemap** (`client/public/sitemap.xml`): Generate a static XML sitemap covering all 13 main navigation URLs plus key sub-pages. Update this file when new pages are added.

---

#### ✅ Phase 1 Verification Checklist

- [x] `POST /auth/register` creates a user with `status: pending`; admin receives email
- [x] `POST /auth/login` with pending user returns 403 with correct message
- [x] Admin can approve user; approved user can login and receive JWT
- [x] All 13 public pages load data from the API (no hardcoded content)
- [x] Journals page: all cards link to external URLs; no internal journal UI exists
- [x] Opportunities: listing, detail, apply flow all work end-to-end
- [x] Resume file upload stores file in `/uploads/`, URL saved in DB
- [x] Researcher: self-register, profile edit, add publication, public profile page all work
- [x] Admin CMS: can create/edit/delete an opportunity, news article, conference
- [x] Admin user management: Approve and Reject buttons work; emails sent
- [x] Certificate verify page shows the placeholder UI
- [x] Dummy payment component renders correctly (no real payment logic exists)
- [x] Every page has a unique `<title>` tag
- [x] `robots.txt` accessible at `http://localhost:5173/robots.txt`
- [x] All forms show validation errors when submitted empty
- [x] All API errors show a toast notification in the UI
- [x] `audit_logs` table has rows after admin actions


---

## PHASE 2 — SUBMISSIONS, REGISTRATIONS & USER DASHBOARD

**Goal:** Conference paper submission, conference/academy registration with dummy payment, consolidated user dashboard, admin manual certificate upload.

### Step-by-step execution order

#### Step 2.1 — Conference Submission Flow

**Backend — add to `conference.controller.js`:**
1. `POST /conferences/:id/submit` 🔒
   - Validate: title, abstract, authorsText, submissionType required
   - `upload.single('file')` for PDF
   - INSERT into `conference_submissions` with `status: 'submitted'`
   - Respond 201

2. `GET /my/conference-submissions` 🔒
   - SELECT submissions with conference title joined, ordered by submitted_at DESC

3. `GET /admin/conferences/:id/submissions` 🔒🛡
   - List all submissions for a conference with user info joined

4. `PATCH /admin/submissions/:id/status` 🔒🛡
   - Update `status` (accepted/rejected/revision_requested)
   - Send email to submitter with status and reviewer_notes
   - `logAction`

**Frontend:**
- Add "Submit Paper" tab to `ConferenceDetail.jsx` (visible only when `status !== 'past'`)
- Submission form: title, abstract, authors (text), submission type radio (Abstract / Full Paper), PDF upload
- Submission confirmation: success card with submission ID
- `Dashboard/ConferencesTab.jsx`: two sections — "My Submissions" table (title, conference, type, submitted date, status badge) and "My Registrations" table (conference name, date, mode, registered date)

---

#### Step 2.2 — Conference Registration Flow

**Backend — add to `conference.controller.js`:**
1. `POST /conferences/:id/register` 🔒
   - Validate: name, email, affiliation required
   - Check: user not already registered for this conference → 409 if exists
   - INSERT into `conference_registrations` with `payment_status: 'dummy_paid'`
   - Send email to user: registration confirmation
   - Send email to conference admin: new registration
   - Respond 201

2. `GET /my/conference-registrations` 🔒
   - SELECT registrations with conference details joined

3. `GET /admin/conferences/:id/registrations` 🔒🛡
   - Full list with user details; include CSV export endpoint

**Frontend:**
- Add "Register" tab to `ConferenceDetail.jsx`
- Registration form: name (pre-filled from user profile), email, affiliation, designation, mode preference (online/in-person/hybrid)
- After form: show `DummyPayment` component → on confirm: submit registration → success screen
- Admin `Conferences.jsx`: add "View Submissions" and "View Registrations" action per conference row

---

#### Step 2.3 — Academy Registration Flow

**Backend — add to `academy.controller.js`:**
1. `POST /academy/programs/:id/register` 🔒
   - Check: user not already registered → 409 if exists
   - Check: seats available (SELECT COUNT from academy_registrations WHERE program_id = $1 AND status != 'cancelled')
   - INSERT with `payment_status: 'dummy_paid'`, `status: 'applied'`
   - Send confirmation email to user
   - Respond 201

2. `GET /my/academy-registrations` 🔒
   - SELECT with programme details joined

3. `GET /admin/academy/registrations` 🔒🛡 — with programme filter
4. `PATCH /admin/academy/registrations/:id/status` 🔒🛡 — confirm/cancel + email user; `logAction`

**Frontend:**
- `ProgramDetail.jsx`: activate "Register Now" button (was disabled/toast in Phase 1)
- Multi-step: 1. Confirm details → 2. DummyPayment → 3. Success
- `Dashboard/AcademyTab.jsx`: enrolled programmes table with status badge

---

#### Step 2.4 — Certificate Admin Upload

**Backend — `certificate.controller.js`:**
1. `POST /admin/certificates` 🔒🛡
   - Body: `userId`, `issuedForType`, `issuedForId`, `issuedForLabel`, `issuedDate`
   - File: `upload.single('pdf')` for PDF
   - Generate UUID (`uuid` package): `certificate_uid`
   - INSERT into `certificates` with `status: 'placeholder'`
   - `logAction`
   - Respond 201

2. `GET /admin/certificates` 🔒🛡 — list all issued certificates with user info joined
3. `GET /my/certificates` 🔒 — user's own certificates with download URL
4. `GET /certificates/verify/:uid` — if found: return certificate record + "Note: This is a placeholder record. Full verification coming soon." If not found: 404.

**Frontend:**
- `Admin/Certificates.jsx`: table of all certificates + "Issue New Certificate" form (select user, type, label, date, PDF upload)
- `Dashboard/CertificatesTab.jsx`: list of user's certificates with type, label, date, status badge, download PDF button
- Update `Verify/index.jsx`: now makes a real API call; shows placeholder result card if found, "not found" card if 404

---

#### Step 2.5 — Consolidated Dashboard

Ensure `/dashboard` shows all tabs from `03_ASGARD_Design_Tokens.md` Dashboard section:
- Profile tab (already Phase 1)
- Applications tab (already Phase 1)
- Conferences tab (Phase 2 — now active)
- Academy tab (Phase 2 — now active)
- Certificates tab (Phase 2 — now active)
- Researcher Profile tab (role-gated: researcher only)

---

#### ✅ Phase 2 Verification Checklist

- [x] Paper submission: file uploads, status shows in dashboard, admin can accept/reject
- [x] Conference registration: dummy payment flow completes, confirmation email sent
- [x] Academy registration: seat check works, status managed by admin, email sent
- [x] Manual certificate: admin issues, user sees it in dashboard, can download PDF
- [x] `/certificates/verify/:uid` returns placeholder record
- [x] Dashboard shows all 5 tabs (6 for researchers); each tab loads correct data
- [x] CSV export works on admin conference registrations and academy registrations lists

---

## PHASE 3 — RESEARCH REPOSITORY, INNOVATION & ADVANCED SEARCH

**Goal:** Full searchable research repository, innovation hub application flow, full-text PostgreSQL search, admin analytics.

### Step-by-step execution order

#### Step 3.1 — Research Repository

**Backend — add to `research.controller.js`:**
1. `GET /research/outputs?author=&year=&type=&area=&page=`
   - Parameterised filters; paginated; ORDER BY year DESC
2. `GET /research/outputs/:slug` — detail with full metadata
3. Admin CRUD: `POST/PUT/DELETE /admin/research/outputs` with `logAction` on each

**Frontend:**
- `Research/Repository.jsx` — full-text search bar + filter dropdowns (Author, Year from 2000 to now, Type, Research Area). Results grid: title, authors, type badge, year, DOI/PDF button. Pagination.
- `Research/OutputDetail.jsx` — full metadata: title, authors, abstract, type, year, DOI, PDF download, linked project

---

#### Step 3.2 — Researcher Profile Enrichment

**Backend:**
1. `POST /researchers/me/link-output/:outputId` 🔒 + `authorise('researcher')`
   - INSERT into `researcher_output_links` (researcher_id, output_id)
   - Check not already linked → 409 if exists
   - Respond 201

**Frontend:**
- In `Dashboard/ResearcherTab.jsx`: add "Link Repository Output" section — search box that queries `/research/outputs?author=`, shows results, "Link" button per result. Linked outputs appear in a list with "Unlink" option.
- Public researcher profile: now shows linked repository outputs with type badge and DOI/PDF link

---

#### Step 3.3 — Innovation Hub Workflows

**Backend — `innovation.controller.js`:**
1. `GET /innovation/programs?type=` — list active programmes
2. `GET /innovation/programs/:slug` — detail
3. `POST /innovation/programs/:id/apply` 🔒
   - Body: teamName, memberNames, projectTitle, domain
   - File: `upload.single('brief')` for PDF
   - INSERT into `innovation_applications`
   - Respond 201
4. `GET /innovation/mentors` — public mentor directory
5. `GET /my/innovation-applications` 🔒
6. Admin: `GET/POST/PUT/DELETE /admin/innovation/programs/:id` with `logAction`
7. Admin: `GET /admin/innovation/applications` + `PATCH /admin/innovation/applications/:id/status` with email + `logAction`

**Frontend:**
- `InnovationHub/index.jsx` — activate "Apply Now" buttons (were coming-soon in Phase 1)
- `InnovationHub/ProgramDetail.jsx` — programme detail with Apply Now CTA
- `InnovationHub/Apply.jsx` — multi-step form: 1. Team details (team name, member names, domain) → 2. Project brief (title + PDF upload) → 3. Submit
- Mentor directory section on Innovation Hub page: photo, name, designation, organisation, domain tags
- Add Innovation tab to `Dashboard/index.jsx`: user's innovation applications with status badge
- `Admin/InnovationHub.jsx`: programmes CRUD + applications management with status dropdown

---

#### Step 3.4 — Full-Text Search Upgrade

Run the Phase 3 migration from `02_ASGARD_Technical_Spec.md` to add `tsvector` columns and GIN indexes.

Update `search.controller.js`:
- Replace Phase 1 ILIKE search with `tsvector @@ tsquery` search across `research_outputs`, `publications`, `news`, `opportunities`
- Add researcher search by name and research_interests
- Results grouped by type: outputs, publications, news, opportunities, researchers
- Add year range filters: `year_from`, `year_to`

Update `Search/index.jsx`:
- Replace plain results list with tabbed results by type
- Add faceted filter panel: year range slider, type checkboxes, status filter

---

#### Step 3.5 — Admin Reports Dashboard

**Backend — add to `admin.controller.js`:**
`GET /admin/reports/summary` 🔒🛡:
```sql
-- Return all in one response:
SELECT COUNT(*) FROM users GROUP BY role;
SELECT COUNT(*) FROM opportunity_applications GROUP BY status;
SELECT COUNT(*) FROM academy_registrations GROUP BY program_id;
SELECT COUNT(*) FROM research_outputs GROUP BY type;
SELECT COUNT(*) FROM conference_registrations;
SELECT COUNT(*) FROM conference_submissions GROUP BY status;
```

**Frontend:**
- Add "Reports" tab to `Admin/Dashboard.jsx`
- Bar charts or number cards for: users by role, applications by status, registrations by programme, outputs by type
- CSV export button on every admin data table

---

#### ✅ Phase 3 Verification Checklist

- [x] Research Repository loads, filters work, pagination works
- [x] Researcher can link repository outputs to their profile; outputs appear on public profile
- [x] Innovation Hub: apply flow completes with PDF upload; application shows in dashboard
- [x] Mentor directory shows on Innovation Hub page
- [x] Full-text search returns results from multiple content types
- [x] Search results grouped by type with faceted filters
- [x] Admin reports summary endpoint returns all metrics
- [x] Admin dashboard shows report metrics/charts
- [x] CSV export works on all admin list pages

---

## PHASE 4 — CONSULTANCY WORKFLOW & PUBLIC SCHOOL PLACEHOLDER

**Goal:** Consultancy request pipeline, Public School controlled placeholder, admin settings toggle.

### Step-by-step execution order

#### Step 4.1 — Consultancy Multi-Step Form

**Backend — `consultancy.controller.js`:**
1. `POST /consultancy/request`
   - Validate all fields (name, organisation, email, phone, serviceType, projectDescription required)
   - INSERT into `consultancy_requests` with `status: 'new'`
   - Send email to `ADMIN_EMAIL`: new consultation request with all details
   - Respond 201

2. `GET /admin/consultancy/requests` 🔒🛡 — list with filters: status, date range
3. `PATCH /admin/consultancy/requests/:id/status` 🔒🛡 — update status + admin_notes; `logAction`

**Frontend:**
- `Consultancy/index.jsx` — service cards with descriptions (6 service types). "Request a Consultation" CTA on each card links to the multi-step form.
- Multi-step form (3 steps) using the step state pattern from `02_ASGARD_Technical_Spec.md`:
  - Step 1: Contact details (name, organisation, email, phone)
  - Step 2: Service type (radio/card selector) + project description textarea
  - Step 3: Budget range (select) + preferred timeline (select) + review summary
  - On submit: POST to `/consultancy/request` → success confirmation page
- `Admin/Consultancy.jsx`: requests table with status dropdown, notes field, contact history; status badge colour-coded

---

#### Step 4.2 — Public School Placeholder & Settings Toggle

**Backend — add to `settings.controller.js`:**
1. `GET /settings/public-school-active` — public endpoint; reads `site_settings` where key = `public_school_active`; returns `{ active: true/false }`
2. `PUT /admin/settings/public-school-active` 🔒🛡 — UPDATE `site_settings` SET value = $1 WHERE key = 'public_school_active'; `logAction`

**Frontend:**
- `PublicSchool/index.jsx` — copy placeholder component from `03_ASGARD_Design_Tokens.md`
- Route `/public-school` exists in React Router but is NOT in `navLinks` array in `Navbar.jsx`
- In `Navbar.jsx`: on mount, `GET /settings/public-school-active` → if `active: true`, add "Public School" as the last nav item
- `Admin/Settings.jsx` — expand to include: "Public School Visibility" toggle switch → calls `PUT /admin/settings/public-school-active`

---

#### ✅ Phase 4 Verification Checklist

- [x] Consultancy multi-step form completes and admin receives email
- [x] Admin consultancy panel shows requests with status workflow
- [x] `/public-school` route loads placeholder page
- [x] Public School does NOT appear in navbar when `site_settings.public_school_active = false`
- [x] Admin can toggle Public School visibility; navbar updates on next page load
- [x] No accreditation, affiliation or admission claims anywhere on the Public School page

---

## PHASE 5 — PAYMENTS, CERTIFICATE AUTOMATION, PWA & i18n

**Goal:** All dummy placeholders replaced with real systems; Tamil UI; PWA; analytics.

### Step-by-step execution order

#### Step 5.1 — Real Payment Integration (Razorpay)

1. Create `payments` table migration:
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  entity_type VARCHAR NOT NULL, -- conference_registration | academy_registration
  entity_id INT NOT NULL,
  gateway VARCHAR DEFAULT 'razorpay',
  order_id VARCHAR,
  payment_id VARCHAR,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR DEFAULT 'INR',
  status VARCHAR DEFAULT 'created', -- created | paid | failed | refunded
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. Install Razorpay SDK: `npm install razorpay`
3. Add to `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Implement payment controller from `02_ASGARD_Technical_Spec.md` Phase 5 section
5. Load Razorpay script in `client/index.html`: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
6. Replace all `DummyPayment` component usages with a real `PaymentCheckout` component that opens the Razorpay modal
7. On payment success: verify signature → update `payment_status` on registration → issue certificate trigger

---

#### Step 5.2 — Automated Certificate Engine

1. Install: `npm install pdfkit` (or `puppeteer` for HTML-template approach)
2. Create certificate HTML/PDF template with: ASGARD logo, participant name, event/programme name, date, certificate UID, QR code
3. Install QR code generator: `npm install qrcode`
4. Implement `generateCertificate(userId, issuedForType, issuedForId, issuedForLabel)` utility
5. Trigger auto-generation:
   - On conference registration payment verified → generate and issue certificate
   - On academy registration `status` set to `completed` → generate and issue
6. Update `GET /certificates/verify/:uid` to return full verified record without placeholder message
7. Update `Verify/index.jsx`: verification now shows full certificate details with QR confirmation

---

#### Step 5.3 — Tamil i18n

1. Install: `npm install i18next react-i18next`
2. Copy setup from `03_ASGARD_Design_Tokens.md` Phase 5 section
3. Create `client/src/locales/en/translation.json` — extract all UI string literals from priority pages: Home, About, Opportunities, Contact, Academy
4. Create `client/src/locales/ta/translation.json` — Tamil translations for same keys
5. Add language toggle button to `Navbar.jsx` (copy from `03_ASGARD_Design_Tokens.md`)
6. Replace hardcoded strings in priority page components with `t('key')` calls

---

#### Step 5.4 — PWA

1. Install: `npm install -D vite-plugin-pwa`
2. Update `vite.config.js`:
```js
import { VitePWA } from 'vite-plugin-pwa';
export default {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ASGARD-IRI',
        short_name: 'ASGARD',
        theme_color: '#0B1F4B',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
};
```
3. Add PWA icon files: `icon-192.png` and `icon-512.png` to `client/public/`

---

#### Step 5.5 — Analytics

1. Add Google Analytics 4 script to `client/index.html` (or use `react-ga4` package)
2. Add Google Search Console property; submit `sitemap.xml`
3. Run Lighthouse CI on all public pages; fix any Core Web Vitals issues
4. Add "Analytics" tab to Admin Dashboard showing real-time metrics (use GA4 Data API or embed GA4 report)

---

#### ✅ Phase 5 Verification Checklist

- [x] Razorpay payment flow completes end-to-end in test mode
- [x] Payment verified via signature; `payments` table updated
- [x] Certificate PDF auto-generated on successful payment; QR code embedded
- [x] `/verify/:uid` returns full verified certificate details (no placeholder message)
- [x] Tamil language toggle in navbar works; priority pages translated
- [x] PWA installable on mobile (shows "Add to Home Screen")
- [x] Service worker caches static pages for offline reading
- [x] Google Analytics tracking active (verify in GA4 real-time report)
- [x] Lighthouse score: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 95 on all public pages
- [x] Core Web Vitals: LCP < 2.5s, CLS < 0.1 on home page

---

## GLOBAL SECURITY CHECKLIST

Apply from Phase 0. Every item must be true before any phase is considered complete.

- [x] `helmet()` mounted before all routes in `app.js`
- [x] CORS `origin` locked to `CLIENT_URL` only; `credentials: true`
- [x] Rate limiter active on `/auth/login` and `/auth/register`
- [x] All passwords hashed with `bcryptjs` saltRounds = 12
- [x] JWT access tokens: 1h expiry; refresh tokens: 7d expiry as `httpOnly` cookie
- [x] Every SQL query uses `$1, $2` parameterisation — no exceptions
- [x] Multer: MIME type validated (`application/pdf`, `image/*` only); size ≤ 5 MB
- [x] `express-validator` + `handleValidation` on all POST/PUT routes
- [x] Admin routes: both `authenticate` AND `authorise` middleware applied
- [x] `.env` never committed to Git; `.env.example` has keys with no values
- [x] `audit_logs` written after every admin action
- [x] `/admin`, `/dashboard`, `/api` in `robots.txt` Disallow list
- [x] Database backups: daily minimum
- [x] `npm audit` passes with 0 critical vulnerabilities

---

## QUICK REFERENCE — ROLES IN ROUTE GUARDS

```js
// Use these constants in route files — never hardcode strings in controllers
const SUPER_ADMIN    = ['super_admin'];
const FULL_ADMIN     = ['super_admin', 'foundation_admin'];
const RESEARCH_OPS   = ['super_admin', 'foundation_admin', 'research_admin'];
const JOURNAL_OPS    = ['super_admin', 'foundation_admin', 'journal_editor'];
const CONFERENCE_OPS = ['super_admin', 'foundation_admin', 'conference_admin'];
const ACADEMY_OPS    = ['super_admin', 'foundation_admin', 'academy_admin'];
const CONTENT_OPS    = ['super_admin', 'foundation_admin', 'content_editor'];
const HR_OPS         = ['super_admin', 'foundation_admin', 'careers_hr_admin'];
const TECH_OPS       = ['super_admin', 'foundation_admin', 'technology_lab_admin'];
const INNOVATION_OPS = ['super_admin', 'foundation_admin', 'innovation_admin'];
const RESEARCHER     = ['researcher'];
```

---

## IF YOU GET STUCK

1. **Database error:** Re-read the schema in `01_ASGARD_Master_Blueprint.md`. Check column names match exactly. Check the migration file ran without errors.
2. **Auth error (401/403):** Check the JWT secret in `.env` matches the one used to sign. Check the `Authorization: Bearer <token>` header is being sent. Check the role string matches exactly.
3. **File upload error:** Check `uploads/` directory exists and is writable. Check multer `fileFilter` is not rejecting the MIME type. Check `MAX_FILE_SIZE_MB` in `.env`.
4. **CORS error:** Check `CLIENT_URL` in `.env` matches the exact origin of the React dev server including port.
5. **Tailwind class not working:** Check the class is in the `tailwind.config.js` `content` array. Check custom color tokens are spelled correctly (`navy`, `gold`, not `#0B1F4B`).
6. **Email not sending:** Check SMTP credentials in `.env`. For Gmail, use an App Password not the account password. Check `SMTP_PORT` is 587 for TLS.
