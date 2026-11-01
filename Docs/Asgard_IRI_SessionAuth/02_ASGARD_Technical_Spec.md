# ASGARD-IRI — Technical Specification
> Version 2.0 | October 2026  
> Stack: React.js · Express.js · PostgreSQL  
> This file defines HOW to build. Apply every pattern here before writing any feature code.

---

## PACKAGE VERSIONS (Install Exactly These)

### Server (`server/package.json`)
```json
{
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.12.0",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.3.1",
    "express-validator": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "express-session": "^1.18.0",
    "connect-pg-simple": "^10.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.14",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### Client (`client/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1",
    "axios": "^1.7.2",
    "react-helmet-async": "^2.0.5",
    "react-hot-toast": "^2.4.1",
    "@heroicons/react": "^2.1.4"
  },
  "devDependencies": {
    "vite": "^5.3.4",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19"
  }
}
```

---

## ENVIRONMENT VARIABLES

### `server/.env` (copy from `.env.example` and fill values)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://asgard_user:your_password@localhost:5432/asgard_db
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Session
SESSION_SECRET=minimum_32_character_random_string_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@asgard-iri.org
SMTP_PASS=your_smtp_app_password

# App
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@asgard-iri.org

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=ASGARD-IRI
```

---

## PHASE 0 — CORE INFRASTRUCTURE CODE

### Database Pool (`server/src/config/db.js`)
```js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
  process.exit(-1);
});

module.exports = pool;
```

**Query rules (enforce always):**
```js
// ✅ CORRECT — parameterised
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND status = $2',
  [email, 'active']
);

// ❌ WRONG — never interpolate values into SQL strings
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Transaction pattern:**
```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows } = await client.query('INSERT INTO ... VALUES ($1) RETURNING id', [value]);
  await client.query('UPDATE ... SET ... WHERE id = $1', [rows[0].id]);
  await client.query('COMMIT');
  return rows[0];
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

---

### Async Handler (`server/src/utils/asyncHandler.js`)
Wrap every controller function with this — eliminates try/catch repetition.
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```

Usage:
```js
const asyncHandler = require('../utils/asyncHandler');

exports.getOpportunities = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM opportunities WHERE status = $1', ['open']);
  res.json({ success: true, data: rows });
});
```

---

### Error Handler (`server/src/middleware/error.middleware.js`)
```js
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  const status  = err.status  || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ success: false, error: message });
};

module.exports = { errorHandler };
```

---

### App Entry (`server/src/app.js`)
```js
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const session     = require('express-session');
const pgSession   = require('connect-pg-simple')(session);
const passport    = require('./config/passport');
const pool        = require('./config/db');
const path        = require('path');
require('dotenv').config();

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session store — persists sessions in PostgreSQL
app.use(session({
  store: new pgSession({ pool, tableName: 'user_sessions' }),
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

// Passport (required for OAuth — uses session internally)
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting on auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,
  message: { success: false, error: 'Too many attempts. Try again in 15 minutes.' }
});
app.use('/api/v1/auth', authLimiter);

// Routes — Phase 0: scaffold all, controllers added per phase
app.use('/api/v1/auth',          require('./routes/auth.routes'));
app.use('/api/v1/researchers',   require('./routes/researcher.routes'));
app.use('/api/v1/research',      require('./routes/research.routes'));
app.use('/api/v1/journals',      require('./routes/journal.routes'));
app.use('/api/v1/publications',  require('./routes/publication.routes'));
app.use('/api/v1/conferences',   require('./routes/conference.routes'));
app.use('/api/v1/academy',       require('./routes/academy.routes'));
app.use('/api/v1/opportunities', require('./routes/opportunity.routes'));
app.use('/api/v1/innovation',    require('./routes/innovation.routes'));
app.use('/api/v1/news',          require('./routes/news.routes'));
app.use('/api/v1/events',        require('./routes/news.routes'));
app.use('/api/v1/gallery',       require('./routes/news.routes'));
app.use('/api/v1/certificates',  require('./routes/certificate.routes'));
app.use('/api/v1/consultancy',   require('./routes/consultancy.routes'));
app.use('/api/v1/contact',       require('./routes/contact.routes'));
app.use('/api/v1/search',        require('./routes/search.routes'));
app.use('/api/v1/my',            require('./routes/my.routes'));
app.use('/api/v1/admin',         require('./routes/admin.routes'));
app.use('/api/v1/settings',      require('./routes/settings.routes'));

// Health check
app.get('/api/v1/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, error: 'Route not found.' })
);

// Global error handler — MUST be last
const { errorHandler } = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;
```

---

### Slug Utility (`server/src/utils/slugify.js`)
```js
const pool = require('../config/db');

const slugify = (text) =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Ensures uniqueness by appending -2, -3 etc.
const uniqueSlug = async (table, baseText) => {
  const base = slugify(baseText);
  let slug = base;
  let counter = 2;
  while (true) {
    const { rows } = await pool.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
    if (rows.length === 0) return slug;
    slug = `${base}-${counter++}`;
  }
};

module.exports = { slugify, uniqueSlug };
```

---

### Audit Logger (`server/src/utils/audit.js`)
Call after every admin create / update / delete / approve / reject action.
```js
const pool = require('../config/db');

const logAction = async ({ userId, action, entityType, entityId, req }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, entityType, entityId || null, req?.ip || null]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
    // Never throw — audit failure must not break the main operation
  }
};

module.exports = { logAction };
```

---

### Mailer (`server/src/utils/mailer.js`)
```js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"ASGARD-IRI" <${process.env.SMTP_USER}>`,
    to, subject, html,
  });
};

module.exports = { sendMail };
```

**Email triggers by phase:**

| Phase | Trigger | Recipient | Subject |
|---|---|---|---|
| 1 | New user registered | Admin | `New User Pending Approval – {name}` |
| 1 | User approved | User | `Your ASGARD-IRI Account is Approved` |
| 1 | User rejected | User | `ASGARD-IRI Account Application Update` |
| 1 | Password reset | User | `Reset Your ASGARD-IRI Password` |
| 1 | New opportunity application | HR Admin | `New Application – {opportunity title}` |
| 2 | Application status changed | Applicant | `Your Application Status Has Been Updated` |
| 2 | New conference registration | Conference Admin | `New Registration – {conference name}` |
| 2 | New academy registration | Academy Admin | `New Enrolment – {programme name}` |
| 4 | New consultation request | Admin | `New Consultation Request – {name}` |

---

## PHASE 1 — AUTH & VALIDATION PATTERNS

### Auth Middleware (`server/src/middleware/auth.middleware.js`)
```js
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  if (!req.session?.userId)
    return res.status(401).json({ success: false, error: 'Not authenticated.' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, status FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, error: 'Session invalid.' });

    req.user = rows[0]; // { id, email, full_name, role, status }
    next();
  } catch {
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
};

module.exports = { authenticate };
```

### Role Guard (`server/src/middleware/role.middleware.js`)
```js
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ success: false, error: 'Forbidden: insufficient role.' });
  next();
};

module.exports = { authorise };
```

**Admin roles that access the full admin panel:**
```js
const ADMIN_ROLES = ['super_admin', 'foundation_admin'];
const CONTENT_ROLES = [...ADMIN_ROLES, 'content_editor', 'research_admin'];
// Use these constants in route files — never hardcode role strings in controllers
```

### Validation Middleware (`server/src/middleware/validate.middleware.js`)
```js
const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed.',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { handleValidation };
```

### Validation Rules Reference
```js
const { body } = require('express-validator');

// Register
const validateRegister = [
  body('fullName').trim().notEmpty().isLength({ max: 200 }).withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').isIn([
    'researcher','author','reviewer','participant_applicant','trainer_mentor',
    'content_editor','journal_editor','conference_admin','academy_admin',
    'publication_editor','technology_lab_admin','innovation_admin','careers_hr_admin'
    // NOTE: super_admin and foundation_admin are NOT in this list
  ]).withMessage('Invalid role selected.'),
];

// Opportunity application
const validateApplication = [
  body('coverLetter').trim().notEmpty().isLength({ max: 5000 }).withMessage('Cover letter required.'),
  // resume comes as file via multer — not validated here
];

// Contact form
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('subject').trim().notEmpty().isLength({ max: 200 }).withMessage('Subject required.'),
  body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message required.'),
];
```

**Field validation rules (apply consistently):**

| Field Type | Rule |
|---|---|
| Email | `isEmail()` + `normalizeEmail()` |
| Password | `isLength({ min: 8 })` |
| Name / Title | `trim()` + `notEmpty()` + `isLength({ max: 200 })` |
| Long text / description | `trim()` + `notEmpty()` + `isLength({ max: 5000 })` |
| Optional URL | `.optional({ nullable: true }).isURL()` |
| Enum field | `isIn([...allowedValues])` |
| Date | `isISO8601()` |
| Integer | `isInt({ min: 0 })` |
| File | Validated in multer `fileFilter` — not here |

---

### Auth Controller Flow (`server/src/controllers/auth.controller.js`)

**Register:**
```
1. Run validateRegister + handleValidation
2. Check email not in users table → 409 if exists
3. bcryptjs.hash(password, 12)
4. INSERT INTO users → status: 'pending'
5. sendMail to ADMIN_EMAIL: new pending user
6. Respond 201: { message: "Registration successful. Awaiting admin approval." }
```

**Login:**
```
1. Find user by email
2. If not found → 401 "Invalid credentials" (same message — never reveal which)
3. If oauth_provider is set (OAuth-only account) → 401 "Please sign in with Google or LinkedIn."
4. bcryptjs.compare(password, hash)
5. If no match → 401 "Invalid credentials"
6. If status = 'pending' → 403 "Account pending admin approval."
7. If status = 'rejected' → 403 "Account application unsuccessful. Contact support."
8. req.session.regenerate() to prevent session fixation
9. Set req.session.userId = user.id and req.session.role = user.role
10. req.session.save()
11. Respond 200: { user: { id, email, fullName, role } }
    (Session cookie set automatically by express-session — no token in response body)
```

**Admin Approve:**
```
1. authenticate + authorise('super_admin', 'foundation_admin')
2. UPDATE users SET status = 'active' WHERE id = $1
3. sendMail to user: account approved
4. logAction({ action: 'APPROVE_USER', entityType: 'user', entityId: id })
5. Respond 200: { message: "User approved." }
```

---

### File Upload Middleware (`server/src/middleware/upload.middleware.js`)
```js
const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  allowedMime.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only PDF and image files (JPG, PNG, WebP) are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
});

module.exports = upload;
```

File URL stored in DB: `/uploads/filename.pdf`  
Frontend builds full URL: `` `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${url}` ``

---

## PHASE 1 — STANDARD API RESPONSE FORMAT

Every endpoint must return one of these shapes. No exceptions.

```js
// Success — single object
res.status(200).json({ success: true, data: { ...object } });

// Success — list with pagination
res.status(200).json({
  success: true,
  data: rows,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
});

// Success — no data (create / delete / update)
res.status(201).json({ success: true, message: 'Resource created successfully.' });

// Error
res.status(404).json({ success: false, error: 'Opportunity not found.' });

// Validation error (from handleValidation middleware)
res.status(400).json({
  success: false,
  error: 'Validation failed.',
  details: [{ field: 'email', message: 'Valid email required.' }]
});
```

**HTTP Status Codes:**

| Code | Use |
|---|---|
| 200 | Successful GET / PUT / PATCH |
| 201 | Successful POST (resource created) |
| 400 | Bad request / validation error |
| 401 | No or invalid token |
| 403 | Valid token but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Unhandled server error (caught by errorHandler) |

---

### Pagination Pattern (use in every list endpoint)
```js
const page   = Math.max(1, parseInt(req.query.page)  || 1);
const limit  = Math.min(100, parseInt(req.query.limit) || 20);
const offset = (page - 1) * limit;

const { rows } = await pool.query(
  `SELECT * FROM opportunities
   WHERE status = 'open' AND ($1::text IS NULL OR category = $1)
   ORDER BY deadline ASC NULLS LAST
   LIMIT $2 OFFSET $3`,
  [req.query.category || null, limit, offset]
);
const { rows: countRows } = await pool.query(
  `SELECT COUNT(*) FROM opportunities
   WHERE status = 'open' AND ($1::text IS NULL OR category = $1)`,
  [req.query.category || null]
);
const total = parseInt(countRows[0].count);

res.json({
  success: true, data: rows,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
});
```

---

## PHASE 1 — FRONTEND PATTERNS

### Axios Instance (`client/src/services/api.js`)
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required: sends the session cookie on every request
});

// No Authorization header interceptor needed — cookie is sent automatically

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### AuthContext (`client/src/context/AuthContext.jsx`)
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if a valid session exists server-side
    api.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null)) // 401 means no active session — that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    // Session cookie is already set by the server response — just update UI state
    setUser(userData);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    // Server destroys session; clear UI state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Protected Route (`client/src/routes/ProtectedRoute.jsx`)
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
```

### Service Layer Pattern (`client/src/services/opportunity.service.js`)
Every module has its own service file. Never call `api` directly from a page component.
```js
import api from './api';

export const getOpportunities = (params) =>
  api.get('/opportunities', { params }).then(r => r.data);

export const getOpportunityBySlug = (slug) =>
  api.get(`/opportunities/${slug}`).then(r => r.data);

export const applyToOpportunity = (id, formData) =>
  api.post(`/opportunities/${id}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);

export const getMyApplications = () =>
  api.get('/my/applications').then(r => r.data);
```

### useFetch Hook (`client/src/hooks/useFetch.js`)
```js
import { useState, useEffect } from 'react';

const useFetch = (fetchFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then(res => { if (!cancelled) setData(res); })
      .catch(err => { if (!cancelled) setError(err.response?.data?.error || 'Something went wrong.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
};

export default useFetch;
```

### SEO Head Pattern (`client/src/pages/Opportunities/index.jsx`)
```jsx
import { Helmet } from 'react-helmet-async';

// Inside component return:
<Helmet>
  <title>Opportunities – ASGARD-IRI</title>
  <meta name="description"
    content="Explore careers, internships, fellowships and research opportunities at ASGARD-IRI." />
  <meta property="og:title" content="Opportunities – ASGARD-IRI" />
  <meta property="og:url" content="https://asgard-iri.org/opportunities" />
  <link rel="canonical" href="https://asgard-iri.org/opportunities" />
</Helmet>
```

Title pattern: `{Page Name} – ASGARD-IRI`

---

## PHASE 2 — SUBMISSION & REGISTRATION PATTERNS

### Multipart Form Upload (React)
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', title);
  formData.append('abstract', abstract);
  formData.append('authorsText', authorsText);
  formData.append('submissionType', submissionType);
  formData.append('file', fileInput.current.files[0]); // PDF file

  try {
    await applyToOpportunity(id, formData);
    toast.success('Submitted successfully!');
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.error || 'Submission failed.');
  }
};
```

### Dummy Payment Component (Phase 2–4)
Show this component wherever real payment would go:
```jsx
// client/src/components/common/DummyPayment.jsx
import { CreditCardIcon } from '@heroicons/react/24/outline';

const DummyPayment = ({ onConfirm, loading }) => (
  <div className="bg-yellow-50 border border-warning rounded-lg p-6 text-center">
    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CreditCardIcon className="w-6 h-6 text-warning" />
    </div>
    <h3 className="font-semibold text-grey-900 mb-2">Payment Integration Coming Soon</h3>
    <p className="text-grey-600 text-sm mb-4">
      Online payment will be enabled in a future update. Your registration is recorded
      and our team will contact you with payment details.
    </p>
    <button onClick={onConfirm} disabled={loading}
      className="bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg
      hover:bg-navy-dark transition-colors disabled:opacity-50">
      {loading ? 'Processing...' : 'Confirm Registration'}
    </button>
  </div>
);

export default DummyPayment;
```

---

## PHASE 3 — FULL-TEXT SEARCH (PostgreSQL)

Add tsvector columns and GIN indexes to enable full-text search.

### Migration (add to existing tables)
```sql
-- Run as Phase 3 migration
ALTER TABLE research_outputs ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE publications     ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE news             ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE opportunities    ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate vectors
UPDATE research_outputs SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'') || ' ' || coalesce(authors_text,''));
UPDATE publications SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'') || ' ' || coalesce(authors_text,''));
UPDATE news SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''));
UPDATE opportunities SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''));

-- GIN indexes
CREATE INDEX IF NOT EXISTS idx_research_outputs_fts ON research_outputs USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_publications_fts     ON publications     USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_news_fts             ON news             USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_opportunities_fts    ON opportunities    USING GIN(search_vector);
```

### Search Controller
```js
exports.globalSearch = asyncHandler(async (req, res) => {
  const q    = req.query.q?.trim();
  const type = req.query.type || 'all';
  if (!q || q.length < 2)
    return res.status(400).json({ success: false, error: 'Search query too short.' });

  const query = `to_tsquery('english', $1)`;
  const term  = q.split(' ').filter(Boolean).map(w => w + ':*').join(' & ');

  const results = {};

  if (type === 'all' || type === 'outputs') {
    const { rows } = await pool.query(
      `SELECT id, title, authors_text, type, year, slug FROM research_outputs
       WHERE search_vector @@ ${query} ORDER BY ts_rank(search_vector, ${query}) DESC LIMIT 10`,
      [term]
    );
    results.outputs = rows;
  }
  if (type === 'all' || type === 'publications') {
    const { rows } = await pool.query(
      `SELECT id, title, authors_text, type, year, slug FROM publications
       WHERE search_vector @@ ${query} ORDER BY ts_rank(search_vector, ${query}) DESC LIMIT 10`,
      [term]
    );
    results.publications = rows;
  }
  // Repeat for news, opportunities, researchers...

  res.json({ success: true, data: results, query: q });
});
```

---

## PHASE 4 — CONSULTANCY WORKFLOW

### Multi-step Form State (React)
```jsx
const STEPS = ['Contact', 'Service', 'Project Brief', 'Review'];
const [step, setStep] = useState(0);
const [form, setForm] = useState({
  name: '', organisation: '', email: '', phone: '',
  serviceType: '',
  projectDescription: '', budgetRange: '', preferredTimeline: ''
});

const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
const prev = () => setStep(s => Math.max(s - 1, 0));
```

---

## PHASE 5 — RAZORPAY INTEGRATION

### Backend Flow
```js
// POST /payments/create-order
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', entityType, entityId } = req.body;
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency, receipt: `rcpt_${entityType}_${entityId}_${Date.now()}`
  });
  res.json({ success: true, data: { orderId: order.id, amount, currency } });
});

// POST /payments/verify
const crypto = require('crypto');
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest('hex');

  if (expectedSig !== razorpay_signature)
    return res.status(400).json({ success: false, error: 'Payment verification failed.' });

  // Update payment_status on the registration record
  // INSERT into payments table
  res.json({ success: true, message: 'Payment verified.' });
});
```

### Phase 5 New Environment Variables
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## SECURITY CHECKLIST (Apply from Phase 0)

- [x] `helmet()` mounted before all routes
- [x] CORS `origin` locked to `CLIENT_URL` only
- [x] Rate limiter on `/auth/login` + `/auth/register` (20 req / 15 min)
- [x] All passwords hashed with `bcryptjs` (saltRounds = 12)
- [x] Sessions stored in PostgreSQL via `connect-pg-simple`; session cookie is `httpOnly`, `secure` in production, `sameSite: lax`, max-age 7 days; `SESSION_SECRET` is at least 32 random characters
- [x] Every query uses parameterised `$1, $2` — no string interpolation ever
- [x] File uploads: MIME type validated in multer `fileFilter`; size capped at 5 MB
- [x] `express-validator` on all POST / PUT endpoints; run `handleValidation` before controllers
- [x] Admin routes guarded with both `authenticate` and `authorise(...adminRoles)`
- [x] `.env` never committed; `.env.example` committed with keys only (no values)
- [x] `audit_logs` written after every admin action
- [x] Private routes (`/admin`, `/dashboard`, `/api`) in `robots.txt` as `Disallow`
- [x] All PostgreSQL backups automated (daily minimum)
- [x] `npm audit` run in CI; critical vulnerabilities block deployment
