const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Ambil semua event (aktif & arsip)
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { startTime: 'desc' }, // urut dari terbaru
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
    },
  });
  res.json(events);
});

// Ambil detail event + kandidat
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: { candidates: true },
  });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

module.exports = router;
