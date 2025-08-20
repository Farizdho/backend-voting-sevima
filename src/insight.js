const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/:eventId/insight', async (req, res) => {
  const eventId = Number(req.params.eventId);

  // Ambil semua vote dengan detail user & kandidat
  const votes = await prisma.vote.findMany({
    where: { eventId },
    include: { user: true, candidate: true },
  });

  if (votes.length === 0) {
    return res.json({ insight: 'Belum ada data untuk dianalisa.' });
  }

  // Hitung suara per kandidat
  const countByCandidate = {};
  votes.forEach((v) => {
    countByCandidate[v.candidate.name] =
      (countByCandidate[v.candidate.name] || 0) + 1;
  });

  // Hitung berdasarkan fakultas
  const countByFaculty = {};
  votes.forEach((v) => {
    if (v.user.faculty) {
      countByFaculty[v.user.faculty] =
        (countByFaculty[v.user.faculty] || 0) + 1;
    }
  });

  // Hitung berdasarkan angkatan (4 digit pertama studentId)
  const countByYear = {};
  votes.forEach((v) => {
    const year = v.user.studentId?.substring(0, 4) || 'Unknown';
    countByYear[year] = (countByYear[year] || 0) + 1;
  });

  // Hitung distribusi waktu
  const countByHour = {};
  votes.forEach((v) => {
    const hour = new Date(v.createdAt).getHours();
    countByHour[hour] = (countByHour[hour] || 0) + 1;
  });

  // Insight sederhana
  let winner = Object.entries(countByCandidate).sort((a, b) => b[1] - a[1])[0];
  let insight = `Kandidat ${winner[0]} unggul dengan ${winner[1]} suara.\n`;

  // Fakultas terbanyak
  const topFaculty = Object.entries(countByFaculty).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topFaculty) {
    insight += `Didukung kuat oleh fakultas ${topFaculty[0]}.\n`;
  }

  // Angkatan terbanyak
  const topYear = Object.entries(countByYear).sort((a, b) => b[1] - a[1])[0];
  if (topYear) {
    insight += `Mayoritas pemilih berasal dari angkatan ${topYear[0]}.\n`;
  }

  // Waktu voting ramai
  const topHour = Object.entries(countByHour).sort((a, b) => b[1] - a[1])[0];
  if (topHour) {
    insight += `Jam voting paling ramai: sekitar pukul ${topHour[0]}:00.\n`;
  }

  res.json({ insight });
});

module.exports = router;
