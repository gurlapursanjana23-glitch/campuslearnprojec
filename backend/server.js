const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Trust Render/proxy headers (required for rate limiting behind a reverse proxy)
app.set('trust proxy', 1);

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:19006',
    ].filter(Boolean);

    // Allow all vercel.app, onrender.com, localhost ports and local private IP addresses
    const isVercel = origin.endsWith('.vercel.app');
    const isRender = origin.endsWith('.onrender.com');
    const isLocalhost = origin.includes('localhost:') || origin.includes('127.0.0.1:');
    const isLocalNetwork = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);

    if (allowedOrigins.includes(origin) || isVercel || isRender || isLocalhost || isLocalNetwork) {
      callback(null, true);
    } else {
      console.warn('CORS request allowed in development:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Handle all OPTIONS preflight requests explicitly
app.options('*', cors(corsOptions));

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/results', require('./routes/results'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hod', require('./routes/hod'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/live-classes', require('./routes/liveClasses'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/career', require('./routes/career'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/attendance-extra', require('./routes/attendanceIntelligence'));
app.use('/api/placement', require('./routes/placement'));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CampusLearn API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 CampusLearn API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
