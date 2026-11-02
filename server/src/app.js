const path        = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });


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

const app = express();

// Trust reverse proxy (required for Render/Heroku to properly handle HTTPS & secure cookies)
app.set('trust proxy', 1);

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const configuredClientUrl = (process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
const allowedOrigins = [
  'https://asgard-iri.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  configuredClientUrl,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelPreview = /^https:\/\/asgard-iri(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
    if (isExplicitlyAllowed || isVercelPreview || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session store — persists sessions in PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
const cookieSecure = isProduction || cookieSameSite === 'none';

app.use(session({
  store: new pgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'asgard-iri-secure-session-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
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
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth',          authRoutes);
app.use('/auth',                 authRoutes);
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
app.use('/api/v1/payments',      require('./routes/payment.routes'));
app.use('/api/v1/partners',      require('./routes/partner.routes'));
app.use('/api/v1/consultancy',   require('./routes/consultancy.routes'));
app.use('/api/v1/contact',       require('./routes/contact.routes'));
app.use('/api/v1/search',        require('./routes/search.routes'));
app.use('/api/v1/my',            require('./routes/my.routes'));
app.use('/api/v1/home',          require('./routes/home.routes'));
app.use('/api/v1/admin',         require('./routes/admin.routes'));
app.use('/api/v1/settings',      require('./routes/settings.routes'));

// Root endpoint & fallback OAuth redirect handler if root URL is used as callback
app.get('/', (req, res, next) => {
  if (req.query.code) {
    return passport.authenticate('google', {
      failureRedirect: `${authRoutes.getClientUrl()}/login?error=oauth_failed`,
      session: true,
    })(req, res, () => {
      authRoutes.createSessionAndRedirect(req, req.user, res);
    });
  }
  res.json({ status: 'ok', name: 'ASGARD-IRI API', ts: new Date() });
});

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
