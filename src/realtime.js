const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const clients = new Map(); // eventId -> Set(res)

router.get('/subscribe/:eventId', (req, res) => {
  const eventId = Number(req.params.eventId);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  if (!clients.has(eventId)) clients.set(eventId, new Set());
  clients.get(eventId).add(res);

  req.on('close', () => {
    clients.get(eventId)?.delete(res);
  });
});

async function broadcast(eventId) {
  const counts = await prisma.vote.groupBy({
    by: ['candidateId'],
    where: { eventId },
    _count: { candidateId: true },
  });
  const payload = JSON.stringify(counts);
  clients.get(eventId)?.forEach((res) => {
    res.write(`event: update\ndata: ${payload}\n\n`);
  });
}

module.exports = { router, broadcast };
