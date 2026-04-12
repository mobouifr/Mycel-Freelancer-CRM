// =============================================================================
// PRISMA SEED — Freelancer CRM Demo Data
// =============================================================================
// Usage: npx prisma db seed
// Safe to run multiple times (uses upsert everywhere)
// =============================================================================

import { PrismaClient, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Stable UUIDs — so upsert always finds existing records
// ---------------------------------------------------------------------------
const IDS = {
    user: '00000000-0000-4000-a000-000000000001',
    clientA: '00000000-0000-4000-a000-000000000010',
    clientB: '00000000-0000-4000-a000-000000000011',
    projectActive: '00000000-0000-4000-a000-000000000020',
    projectCompleted: '00000000-0000-4000-a000-000000000021',
};

async function main() {
    console.log('\n🌱 Seeding Freelancer CRM database...\n');

    // -------------------------------------------------------------------------
    // 1. Demo User
    // -------------------------------------------------------------------------
    const hashedPassword = await bcrypt.hash('Demo1234!', 12);

    const user = await prisma.user.upsert({
        where: { id: IDS.user },
        update: { email: 'demo@crm.com', name: 'Demo User', password: hashedPassword },
        create: {
            id: IDS.user,
            email: 'demo@crm.com',
            name: 'Demo User',
            password: hashedPassword,
        },
    });
    console.log(`  ✔ User:     ${user.name} (${user.email})`);

    // -------------------------------------------------------------------------
    // 2. Clients
    // -------------------------------------------------------------------------
    const clientA = await prisma.client.upsert({
        where: { id: IDS.clientA },
        update: {},
        create: {
            id: IDS.clientA,
            name: 'Acme Corp',
            email: 'contact@acme.com',
            phone: '+1-555-0100',
            company: 'Acme Corporation',
            notes: 'Long-term client, prefers email communication.',
            userId: user.id,
        },
    });

    const clientB = await prisma.client.upsert({
        where: { id: IDS.clientB },
        update: {},
        create: {
            id: IDS.clientB,
            name: 'Bright Ideas LLC',
            email: 'hello@brightideas.io',
            phone: '+1-555-0200',
            company: 'Bright Ideas LLC',
            notes: 'Startup, fast turnaround expected.',
            userId: user.id,
        },
    });
    console.log(`  ✔ Clients:  ${clientA.name}, ${clientB.name}`);

    // -------------------------------------------------------------------------
    // 3. Projects
    // -------------------------------------------------------------------------
    const projectActive = await prisma.project.upsert({
        where: { id: IDS.projectActive },
        update: {},
        create: {
            id: IDS.projectActive,
            title: 'E-Commerce Website Redesign',
            description: 'Full redesign of the Acme Corp online store with new branding.',
            status: ProjectStatus.ACTIVE,
            budget: 15000.0,
            deadline: new Date('2026-06-30'),
            userId: user.id,
            clientId: clientA.id,
        },
    });

    const projectCompleted = await prisma.project.upsert({
        where: { id: IDS.projectCompleted },
        update: {},
        create: {
            id: IDS.projectCompleted,
            title: 'Brand Identity Package',
            description: 'Logo, color palette, and brand guidelines for Bright Ideas.',
            status: ProjectStatus.COMPLETED,
            budget: 5000.0,
            deadline: new Date('2026-01-15'),
            userId: user.id,
            clientId: clientB.id,
        },
    });
    console.log(`  ✔ Projects: ${projectActive.title} (ACTIVE)`);
    console.log(`              ${projectCompleted.title} (COMPLETED)`);

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log('\n' + '═'.repeat(50));
    console.log('  🎉 SEED COMPLETE');
    console.log('═'.repeat(50));
    console.log(`  Users:     1`);
    console.log(`  Clients:   2`);
    console.log(`  Projects:  2 (1 ACTIVE, 1 COMPLETED)`);
    console.log('═'.repeat(50));
    console.log(`\n  🔑 LOGIN CREDENTIALS`);
    console.log(`     Email:    demo@crm.com`);
    console.log(`     Password: Demo1234!\n`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('\n❌ Seed failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
