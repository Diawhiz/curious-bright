import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding public domain & open source academic books...');

  // Create a default system admin user if not exists
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@curiousbright.org' },
    update: {},
    create: {
      email: 'admin@curiousbright.org',
      passwordHash: '$2a$10$wT8K5FvN4z3k7ZzY1jJ1eO1q5G1e5z5z5z5z5z5z5z5z5z5z5z5z', // hashed placeholder
      name: 'CuriousBright Library',
      schoolName: 'Open Academic Foundation',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const openSourceBooks = [
    {
      title: 'Relativity: The Special and General Theory',
      description: 'The foundational text by Albert Einstein introducing the special and general theory of relativity in an accessible mathematical framework for scholars and physics enthusiasts.',
      fileUrl: 'https://arxiv.org/pdf/physics/0504179.pdf',
      academicLevel: 'COLLEGE' as const,
      license: 'Public Domain',
      status: 'APPROVED' as const,
    },
    {
      title: 'Structure and Interpretation of Computer Programs (SICP)',
      description: 'The world-renowned computer science textbook by Harold Abelson and Gerald Jay Sussman. Explores functional programming, abstraction, and computer system design.',
      fileUrl: 'https://raw.githubusercontent.com/sarabander/sicp-pdf/master/sicp.pdf',
      academicLevel: 'COLLEGE' as const,
      license: 'CC-BY-SA-4.0',
      status: 'APPROVED' as const,
    },
    {
      title: 'OpenStax Calculus Volume 1',
      description: 'Comprehensive open-source textbook covering single-variable calculus, limits, derivatives, integration, and applications in physical sciences.',
      fileUrl: 'https://d3bxy9euw4e147.cloudfront.net/oscms-prodcms/media/documents/CalculusVolume1-OP.pdf',
      academicLevel: 'COLLEGE' as const,
      license: 'CC-BY-4.0',
      status: 'APPROVED' as const,
    },
    {
      title: 'The First Six Books of the Elements of Euclid',
      description: 'Oliver Byrne’s legendary 1847 edition of Euclid’s Elements, using colored diagrams and symbols instead of letters for geometric proofs.',
      fileUrl: 'https://archive.org/download/firstsixbooksbef00eucl/firstsixbooksbef00eucl.pdf',
      academicLevel: 'HIGH_SCHOOL' as const,
      license: 'Public Domain',
      status: 'APPROVED' as const,
    },
    {
      title: 'Think Python: How to Think Like a Computer Scientist',
      description: 'An open-source introduction to Python programming, algorithms, and computational thinking by Allen B. Downey.',
      fileUrl: 'https://greenteapress.com/thinkpython2/thinkpython2.pdf',
      academicLevel: 'HIGH_SCHOOL' as const,
      license: 'CC-BY-NC-3.0',
      status: 'APPROVED' as const,
    },
    {
      title: 'Principles of Economics',
      description: 'Alfred Marshall’s classic foundational treatise on microeconomics, supply and demand, and market equilibrium.',
      fileUrl: 'https://www.gutenberg.org/files/65306/65306-pdf.pdf',
      academicLevel: 'GRADUATE' as const,
      license: 'Public Domain',
      status: 'APPROVED' as const,
    },
  ];

  for (const book of openSourceBooks) {
    const existing = await prisma.submission.findFirst({
      where: { title: book.title },
    });

    if (!existing) {
      await prisma.submission.create({
        data: {
          ...book,
          userId: adminUser.id,
        },
      });
      console.log(`Seeded: ${book.title}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
