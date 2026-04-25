import { PrismaClient, ProjectStatus, ProjectPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'montassir@gmail.com';
  
  // 1. Ensure User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await bcrypt.hash('password123', 12);
    user = await prisma.user.create({
      data: {
        email,
        username: 'Montassir',
        name: 'Montassir Bouifraden',
        passwordHash,
        xp: 1450,
        level: 5,
      },
    });
    console.log(`Created user ${email}`);
  } else {
    user = await prisma.user.update({
        where: { email },
        data: { xp: 1450, level: 5 }
    });
    console.log(`Found user ${email}`);
  }

  const userId = user.id;

  // Clear existing mock data for this user to avoid duplicates if run multiple times
  await prisma.client.deleteMany({ where: { userId } });
  await prisma.note.deleteMany({ where: { userId } });
  await prisma.event.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.userAchievement.deleteMany({ where: { userId } });
  await prisma.userBadge.deleteMany({ where: { userId } });

  console.log('Cleared existing data for user.');

  // 3. Setup Dates
  const today = new Date('2026-04-25');
  const addDays = (days: number) => new Date(today.getTime() + days * 86400000);
  const subDays = (days: number) => new Date(today.getTime() - days * 86400000);

  // 2. Add Clients
  const clients = await Promise.all([
    prisma.client.create({ data: { userId, name: 'Acme Corp', company: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 555 0192', notes: 'Very strict on deadlines.', createdAt: subDays(120) } }),
    prisma.client.create({ data: { userId, name: 'Globex', company: 'Globex Inc', email: 'admin@globex.tld', phone: '+44 20 7946 0958', createdAt: subDays(85) } }),
    prisma.client.create({ data: { userId, name: 'Soylent', company: 'Soylent Nutrition', email: 'hello@soylent.com', phone: '+1 555 0188', notes: 'Green project ongoing.', createdAt: subDays(50) } }),
    prisma.client.create({ data: { userId, name: 'Stark Ind.', company: 'Stark Industries', email: 'p.potts@stark.com', phone: '+1 555 0111', createdAt: subDays(15) } }),
    prisma.client.create({ data: { userId, name: 'Initech', company: 'Initech Software', email: 'bill@initech.com', notes: 'Requires TPS reports weekly.', createdAt: subDays(2) } }),
  ]);

  console.log(`Created ${clients.length} clients.`);

  // Add historical ghost projects specifically to populate the Heatmap widely with varying intensities
  const heatmapGhostProjects = [];
  const numClusters = 40; // Number of active periods/bursts
  let taskId = 1000;
  
  for (let i = 0; i < numClusters; i++) {
    const rDays = Math.floor(Math.random() * 300) + 1; 
    
    // Randomize intensity to get varied colors (1 to 5 projects per cluster)
    // Remember each project triggers 2 dates: createdAt and updatedAt
    const burstSize = Math.floor(Math.random() * 5) + 1; 
    
    for (let j = 0; j < burstSize; j++) {
      // Put them on the exact same days to stack the count
      const isSameDay = Math.random() > 0.3; // 70% chance to happen on exactly the same day 
      const dayOffsetCreate = isSameDay ? 0 : Math.floor(Math.random() * 2);
      const dayOffsetComplete = isSameDay ? 0 : Math.floor(Math.random() * 2);

      heatmapGhostProjects.push({
        userId,
        clientId: clients[Math.floor(Math.random() * clients.length)].id,
        title: `Task #${taskId++}`,
        status: ProjectStatus.COMPLETED,
        priority: ProjectPriority.LOW,
        budget: 150 + Math.random() * 500,
        createdAt: subDays(rDays + dayOffsetCreate + 2),
        updatedAt: subDays(rDays + dayOffsetComplete), // acts as completion date
      });
    }
  }
  await prisma.project.createMany({ data: heatmapGhostProjects });
  console.log(`Created ${heatmapGhostProjects.length} historical ghost projects for heatmap.`);

  // 3. Add Projects
  const projects = await Promise.all([
    prisma.project.create({ data: { userId, clientId: clients[0].id, title: 'E-commerce Redesign', status: ProjectStatus.ACTIVE, priority: ProjectPriority.HIGH, budget: 12500.00, deadline: addDays(15), description: 'Complete overhaul of the Acme storefront using React.', createdAt: subDays(12) } }),
    prisma.project.create({ data: { userId, clientId: clients[1].id, title: 'Server Migration', status: ProjectStatus.ACTIVE, priority: ProjectPriority.MEDIUM, budget: 8000.00, deadline: addDays(5), description: 'Migrate on-prem servers to AWS.', createdAt: subDays(5) } }),
    prisma.project.create({ data: { userId, clientId: clients[2].id, title: 'Landing Page', status: ProjectStatus.COMPLETED, priority: ProjectPriority.LOW, budget: 2000.00, deadline: subDays(10), description: 'Soylent Green promotional landing page.', createdAt: subDays(30), updatedAt: subDays(12) } }),
    prisma.project.create({ data: { userId, clientId: clients[3].id, title: 'Security Audit', status: ProjectStatus.ACTIVE, priority: ProjectPriority.HIGH, budget: 25000.00, deadline: addDays(30), description: 'Full penetration testing and compliance audit.', createdAt: subDays(2) } }),
    prisma.project.create({ data: { userId, clientId: clients[4].id, title: 'Legacy API Support', status: ProjectStatus.PAUSED, priority: ProjectPriority.LOW, budget: 5000.00, deadline: addDays(60), createdAt: subDays(1) } }),
    prisma.project.create({ data: { userId, clientId: clients[0].id, title: 'Mobile App MVP', status: ProjectStatus.ACTIVE, priority: ProjectPriority.MEDIUM, budget: 18000.00, deadline: addDays(45), createdAt: subDays(0) } }),
  ]);

  console.log(`Created ${projects.length} projects.`);

  // 4. Add Notes
  await prisma.note.createMany({
    data: [
      { userId, title: 'Meeting Prep - Acme', content: "- Ask about payment terms\n- Confirm new brand colors\n- Finalize Q3 milestones", tags: ['meeting', 'acme'], color: 'blue', pinned: true },
      { userId, title: 'Tech Stack Ideas', content: "Consider moving the next project to Next.js for better SEO. Also look into TRPC.", tags: ['dev', 'ideas'], color: 'green', pinned: false },
      { userId, title: 'Invoice Follow-up', content: "Initech hasn't paid the last invoice. Need to loop in Bill Lumbergh tomorrow.", tags: ['billing'], color: 'red', pinned: true },
      { userId, title: 'AWS Architectures', content: "Multi-AZ setup with RDS Aurora, Elasticache for Redis, and standard ALB for load balancing.", tags: ['globex', 'devops'], color: 'yellow', pinned: false },
    ]
  });

  // 5. Add Events
  await prisma.event.createMany({
    data: [
      { userId, title: 'Acme Kickoff', date: '2026-04-25', time: '10:00', endTime: '11:00', eventType: 'meeting', priority: 'high', clientTag: clients[0].name, projectTag: projects[0].title },
      { userId, title: 'Globex Sync', date: '2026-04-25', time: '14:30', endTime: '15:00', eventType: 'call', priority: 'medium', clientTag: clients[1].name },
      { userId, title: 'Deadline: Server Migration', date: '2026-04-30', time: '17:00', eventType: 'deadline', priority: 'high', projectTag: projects[1].title },
      { userId, title: 'Pen Test Review', date: '2026-04-28', time: '13:00', endTime: '14:30', eventType: 'meeting', priority: 'high', clientTag: clients[3].name, projectTag: projects[3].title },
      { userId, title: 'Initech TPS Review', date: '2026-04-26', time: '09:00', endTime: '09:30', eventType: 'call', priority: 'low', clientTag: clients[4].name },
    ]
  });

  // 6. Add Notifications
  await prisma.notification.createMany({
    data: [
      { userId, title: 'Payment Overdue', message: 'Initech Invoice #0042 is overdue by 5 days.', type: 'warning', read: false },
      { userId, title: 'Project Update', message: 'Soylent Landing Page was marked as COMPLETED.', type: 'success', read: true },
      { userId, title: 'New Message', message: 'Tony Stark left a comment on Security Audit.', type: 'info', read: false },
      { userId, title: 'System Alert', message: 'Your weekly database backup was successful.', type: 'info', read: true },
    ]
  });

  // 7. Add Achievements & Badges
  await prisma.userAchievement.createMany({
    data: [
      { userId, type: 'FIRST_CLIENT', name: 'First Client' },
      { userId, type: 'FIVE_PROJECTS', name: 'High Five' },
      { userId, type: 'INCOME_10K', name: 'Rainmaker' },
    ]
  });

  await prisma.userBadge.createMany({
    data: [
      { userId, type: 'EARLY_BIRD', name: 'Early Bird' },
      { userId, type: 'TASK_MASTER', name: 'Task Master' },
    ]
  });

  console.log('Mock data seeded successfully for screenshots!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
