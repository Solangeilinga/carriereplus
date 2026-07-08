require('dotenv').config();
require('express-async-errors'); // permet d'utiliser async/await sans try/catch dans les controllers

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const offersRoutes = require('./modules/offers/offers.routes');
const applicationsRoutes = require('./modules/applications/applications.routes');
const libraryRoutes = require('./modules/library/library.routes');
const testsRoutes = require('./modules/tests/tests.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const alertsRoutes = require('./modules/alerts/alerts.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Limite generale anti-abus (ajuster selon besoin en production)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'carriere-plus-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route introuvable' }));
app.use(errorHandler);

module.exports = app;
