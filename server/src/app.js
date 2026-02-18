const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const { apiLimiter } = require('./middleware/rateLimiter');
const { globalErrorHandler } = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');

// ─── Route Modules ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

app.set('trust proxy', 1);

// ─── Security Middleware ───────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS — allows the frontend origin defined in .env
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Sanitize user input to prevent NoSQL injection (e.g. { $gt: '' } attacks)
app.use(mongoSanitize());

// ─── General Middleware ────────────────────────────────────────────────────────

// Parse JSON bodies (limit prevents large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies (for refresh token)
app.use(cookieParser());

// Compress responses
app.use(compression());

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
