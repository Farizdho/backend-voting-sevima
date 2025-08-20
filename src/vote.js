const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./mw');
const { distanceInMeters } = require('./geo');
const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    cb(
      null,
      `selfie_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
    );
  },
});
const upload = multer({ storage });

router.post(
  '/:eventId',
  requireAuth,
  upload.single('selfie'),
  async (req, res) => {
    const eventId = Number(req.params.eventId);
    const { candidateId, gpsLat, gpsLng } = req.body;

    if (!candidateId || !gpsLat || !gpsLng) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // cek waktu
    const now = new Date();
    if (now < event.startTime || now > event.endTime) {
      return res.status(400).json({ error: 'Event not active' });
    }

    // cek radius 50m
    const dist = distanceInMeters(
      Number(gpsLat),
      Number(gpsLng),
      event.locationLat,
      event.locationLng
    );
    if (dist > 5000000) {
      return res.status(400).json({
        error: 'Outside allowed radius (50m)',
        distance: Math.round(dist),
      });
    }

    // simpan selfie jika ada
    const selfieUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const vote = await prisma.vote.create({
        data: {
          eventId,
          userId: req.user.uid,
          candidateId: Number(candidateId),
          gpsLat: Number(gpsLat),
          gpsLng: Number(gpsLng),
          selfieUrl,
        },
      });
      const { broadcast } = require('./realtime');
      res.json({ ok: true, voteId: vote.id, selfieUrl });
      await broadcast(eventId);
    } catch (e) {
      if (e.code === 'P2002') {
        // unique constraint
        return res
          .status(400)
          .json({ error: 'You already voted for this event' });
      }
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/:eventId/results', async (req, res) => {
  const eventId = Number(req.params.eventId);
  const candidates = await prisma.candidate.findMany({ where: { eventId } });
  const counts = await prisma.vote.groupBy({
    by: ['candidateId'],
    where: { eventId },
    _count: { candidateId: true },
  });

  const map = Object.fromEntries(
    counts.map((c) => [c.candidateId, c._count.candidateId])
  );
  const result = candidates.map((c) => ({
    candidateId: c.id,
    name: c.name,
    votes: map[c.id] || 0,
  }));
  res.json(result);
});

module.exports = router;
