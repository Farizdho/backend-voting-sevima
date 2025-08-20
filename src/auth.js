const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier = studentId atau email
  if (!identifier || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const user = await prisma.user.findFirst({
    where: { OR: [{ studentId: identifier }, { email: identifier }] },
  });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ uid: user.id, name: user.name }, JWT_SECRET, {
    expiresIn: '12h',
  });
  res.json({
    token,
    user: { id: user.id, name: user.name, studentId: user.studentId },
  });
});

module.exports = router;
