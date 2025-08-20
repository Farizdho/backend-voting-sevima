const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/events', require('./events'));

// start
const PORT = 4000;
app.listen(PORT, () => {
  const up = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(up)) fs.mkdirSync(up);
  console.log('API running on http://localhost:' + PORT);
});

const authRoutes = require('./auth');
app.use('/auth', authRoutes);

const voteRoutes = require('./vote');
app.use('/vote', voteRoutes);

const { router: realtimeRoutes } = require('./realtime');
app.use('/realtime', realtimeRoutes);

app.use('/insight', require('./insight'));
