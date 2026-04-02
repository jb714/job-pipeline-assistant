import { initDatabase, insertJob, saveUserProfile, getAllJobs } from '../lib/db';
import type { Job } from '../lib/types';

// Initialize database
console.log('Initializing database...');
initDatabase();

// Seed user profile
console.log('Seeding user profile...');
saveUserProfile({
  target_roles: ['Senior Software Engineer', 'Staff Engineer', 'Full Stack Engineer'],
  required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  nice_to_have_skills: ['Python', 'AWS', 'Docker', 'System Design', 'Next.js'],
  location_prefs: ['Remote', 'SF Bay Area', 'NYC'],
  salary_min: 150000,
  company_size_prefs: ['startup', 'scaleup'],
  deal_breakers: ['agency', 'crypto', 'no remote'],
  master_resume: `# Justin Bell
Senior Software Engineer

## Summary
Experienced full-stack engineer with 10+ years building scalable web applications.

## Experience
- Senior Software Engineer at TechCo (2020-2026)
- Software Engineer at StartupXYZ (2016-2020)

## Skills
React, TypeScript, Node.js, PostgreSQL, AWS, Docker
`,
  cover_letter_template: `Dear Hiring Manager at [COMPANY],

I'm excited to apply for the [ROLE] position. [WHY_EXCITED]

With my background in full-stack development and system design, I believe I'd be a great fit for your team.

Looking forward to discussing this opportunity.

Best regards,
Justin Bell`,
});

// Seed fake jobs
console.log('Seeding jobs...');

const fakeJobs: Omit<Job, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    source: 'linkedin',
    company: 'Stripe',
    role: 'Senior Software Engineer',
    location: 'Remote (SF)',
    remote: true,
    salary_min: 180000,
    salary_max: 250000,
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    job_url: 'https://stripe.com/jobs/senior-swe-12345',
    description: `Stripe is looking for a Senior Software Engineer to join our Payments team.

You'll work on building reliable, scalable payment infrastructure that processes billions of dollars.

Requirements:
- 5+ years of software engineering experience
- Strong experience with TypeScript, React, and Node.js
- Experience with distributed systems and databases
- System design skills

Nice to have:
- Experience with payment systems
- AWS/GCP experience
- PostgreSQL expertise`,
    required_skills: ['TypeScript', 'React', 'Node.js', 'System Design'],
    nice_to_have_skills: ['PostgreSQL', 'AWS'],
    match_score: 95,
    status: 'new',
  },
  {
    source: 'linkedin',
    company: 'Notion',
    role: 'Staff Engineer',
    location: 'Hybrid (SF)',
    remote: false,
    salary_min: 200000,
    salary_max: 280000,
    posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    job_url: 'https://notion.so/careers/staff-engineer-67890',
    description: `Join Notion as a Staff Engineer to help shape the future of productivity tools.

You'll lead technical initiatives and mentor engineers while building features used by millions.

Requirements:
- 8+ years of engineering experience
- Deep expertise in TypeScript and React
- Experience leading large projects
- Strong system design skills

Tech stack: TypeScript, React, PostgreSQL, AWS`,
    required_skills: ['TypeScript', 'React', 'PostgreSQL', 'System Design'],
    nice_to_have_skills: ['AWS'],
    match_score: 82,
    status: 'new',
  },
  {
    source: 'indeed',
    company: 'Vercel',
    role: 'Senior Full Stack Engineer',
    location: 'Remote',
    remote: true,
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    job_url: 'https://vercel.com/careers/senior-fullstack',
    description: `Vercel is hiring a Senior Full Stack Engineer to work on Next.js and our deployment platform.

You'll build features that empower developers worldwide to ship faster.

Requirements:
- Strong TypeScript and React experience
- Next.js knowledge (highly preferred)
- Node.js backend experience
- Understanding of web performance

We use: Next.js, React, TypeScript, Node.js, PostgreSQL`,
    required_skills: ['Next.js', 'React', 'TypeScript', 'Node.js'],
    nice_to_have_skills: ['PostgreSQL'],
    match_score: 90,
    status: 'new',
  },
  {
    source: 'linkedin',
    company: 'CryptoStartup',
    role: 'Senior Software Engineer',
    location: 'Remote',
    remote: true,
    salary_min: 160000,
    salary_max: 220000,
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_url: 'https://cryptostartup.com/jobs/senior-swe',
    description: `Join our crypto startup building the future of decentralized finance.

Requirements:
- Full-stack experience with React and Node.js
- Interest in cryptocurrency and blockchain
- TypeScript required

Tech: React, TypeScript, Node.js, Solidity`,
    required_skills: ['React', 'TypeScript', 'Node.js'],
    nice_to_have_skills: [],
    match_score: 60, // Lower score due to crypto (deal-breaker)
    status: 'new',
  },
  {
    source: 'manual',
    company: 'Linear',
    role: 'Senior Software Engineer',
    location: 'Remote',
    remote: true,
    salary_min: 170000,
    salary_max: 230000,
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    job_url: 'https://linear.app/careers/senior-engineer',
    description: `Linear is looking for a Senior Software Engineer to help build the best issue tracking tool.

You'll work on performance, real-time collaboration, and delightful UX.

Requirements:
- 5+ years experience
- TypeScript and React expertise
- GraphQL experience
- Passion for great product design

Stack: TypeScript, React, GraphQL, PostgreSQL`,
    required_skills: ['TypeScript', 'React', 'PostgreSQL'],
    nice_to_have_skills: [],
    match_score: 88,
    status: 'interested',
  },
];

fakeJobs.forEach((job) => {
  const id = insertJob(job);
  console.log(`✓ Created job: ${job.company} - ${job.role} (ID: ${id})`);
});

// Verify
const allJobs = getAllJobs();
console.log(`\nTotal jobs in database: ${allJobs.length}`);

console.log('\n✅ Database seeded successfully!');
console.log('\nRun "npm run dev" and visit http://localhost:3000 to see your jobs.');
