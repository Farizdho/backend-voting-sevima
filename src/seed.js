require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // hash password123
  const pwd = await bcrypt.hash('password123', 10);

  // === USERS ===
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        studentId: 'ADM001',
        email: 'admin@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Budi Santoso',
        studentId: '1001',
        email: '1001@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Sari Wulandari',
        studentId: '1002',
        email: '1002@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Ayu Lestari',
        studentId: '1003',
        email: '1003@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Rizki Pratama',
        studentId: '1004',
        email: '1004@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Lina Anggraini',
        studentId: '1005',
        email: '1005@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Dwi Haryanto',
        studentId: '1006',
        email: '1006@uni.ac.id',
        passwordHash: pwd,
      },
      {
        name: 'Maya Putri',
        studentId: '1007',
        email: '1007@uni.ac.id',
        passwordHash: pwd,
      },
    ],
    skipDuplicates: true,
  });

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@uni.ac.id' },
  });

  // === EVENTS ===
  const event1 = await prisma.event.create({
    data: {
      title: 'Pemilihan Ketua BEM 2025',
      description: 'Voting ketua BEM periode 2025/2026',
      startTime: new Date(Date.now() - 60 * 60 * 1000), // mulai 1 jam lalu
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // selesai 5 jam lagi
      locationLat: -6.2,
      locationLng: 106.816666,
      createdBy: admin.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Pemilihan Ketua UKM Musik',
      description: 'Voting ketua UKM Musik 2025',
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      locationLat: -6.201,
      locationLng: 106.817,
      createdBy: admin.id,
    },
  });

  // === CANDIDATES ===
  const candidates = await prisma.candidate.createMany({
    data: [
      // Event 1
      {
        eventId: event1.id,
        name: 'Kandidat A - Andi Wijaya',
        photoUrl: 'https://via.placeholder.com/150',
      },
      {
        eventId: event1.id,
        name: 'Kandidat B - Dewi Lestari',
        photoUrl: 'https://via.placeholder.com/150',
      },
      {
        eventId: event1.id,
        name: 'Kandidat C - Fajar Nugroho',
        photoUrl: 'https://via.placeholder.com/150',
      },

      // Event 2
      {
        eventId: event2.id,
        name: 'Kandidat D - Rani Kusuma',
        photoUrl: 'https://via.placeholder.com/150',
      },
      {
        eventId: event2.id,
        name: 'Kandidat E - Bayu Saputra',
        photoUrl: 'https://via.placeholder.com/150',
      },
    ],
  });

  // ambil kandidat id buat bikin vote dummy
  const allCandidates = await prisma.candidate.findMany();
  const [c1, c2, c3, c4, c5] = allCandidates;

  // ambil user voter
  const allUsers = await prisma.user.findMany();
  const u2 = allUsers.find((u) => u.studentId === '1001');
  const u3 = allUsers.find((u) => u.studentId === '1002');
  const u4 = allUsers.find((u) => u.studentId === '1003');
  const u5 = allUsers.find((u) => u.studentId === '1004');
  const u6 = allUsers.find((u) => u.studentId === '1005');
  const u7 = allUsers.find((u) => u.studentId === '1006');
  const u8 = allUsers.find((u) => u.studentId === '1007');

  // === VOTES ===
  await prisma.vote.createMany({
    data: [
      {
        eventId: event1.id,
        userId: u2.id,
        candidateId: c1.id,
        gpsLat: -6.20001,
        gpsLng: 106.81665,
        selfieUrl: 'https://picsum.photos/200',
      },
      {
        eventId: event1.id,
        userId: u3.id,
        candidateId: c2.id,
        gpsLat: -6.20002,
        gpsLng: 106.81666,
        selfieUrl: 'https://picsum.photos/201',
      },
      {
        eventId: event1.id,
        userId: u4.id,
        candidateId: c2.id,
        gpsLat: -6.200015,
        gpsLng: 106.81667,
        selfieUrl: 'https://picsum.photos/202',
      },
      {
        eventId: event1.id,
        userId: u5.id,
        candidateId: c3.id,
        gpsLat: -6.200012,
        gpsLng: 106.816675,
        selfieUrl: 'https://picsum.photos/203',
      },
      {
        eventId: event1.id,
        userId: u6.id,
        candidateId: c1.id,
        gpsLat: -6.200013,
        gpsLng: 106.816685,
        selfieUrl: 'https://picsum.photos/204',
      },

      {
        eventId: event2.id,
        userId: u7.id,
        candidateId: c4.id,
        gpsLat: -6.20101,
        gpsLng: 106.817005,
        selfieUrl: 'https://picsum.photos/205',
      },
      {
        eventId: event2.id,
        userId: u8.id,
        candidateId: c5.id,
        gpsLat: -6.201015,
        gpsLng: 106.81701,
        selfieUrl: 'https://picsum.photos/206',
      },
    ],
  });

  console.log('✅ Dummy data inserted!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
