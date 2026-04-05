# Job Pipeline Assistant

Automate job sourcing, filtering, and application preparation to save 30-40 hours during your job hunt.

## Features

### Day 1 Complete ✅
- ✅ **Database Setup**: SQLite database with jobs, user_profile, and application_history tables
- ✅ **TypeScript Types**: Fully typed data models for type safety
- ✅ **CRUD Operations**: Complete database operations for jobs and user profiles
- ✅ **Claude API Integration**: AI-powered resume and cover letter generation
- ✅ **Seed Data**: Test data with 5 fake jobs to get started

### Day 2 Complete ✅
- ✅ **Web Scraping**: Puppeteer-based scrapers for LinkedIn and Indeed
- ✅ **Job Deduplication**: Prevents duplicate entries by URL and company+role
- ✅ **Smart Filtering**: Match scoring, deal-breaker filtering, salary requirements
- ✅ **Skill Extraction**: Automatically extracts tech skills from job descriptions
- ✅ **CLI Script**: `npm run scrape` to fetch new jobs

### Day 3 Complete ✅
- ✅ **Job Filtering & Ranking**: Automatic match score calculation (0-100)
- ✅ **Deal-breaker Detection**: Filters out jobs with unwanted keywords
- ✅ **Salary Filtering**: Ensures jobs meet minimum salary requirements
- ✅ **AI Resume Generation**: Claude-powered tailored resumes
- ✅ **AI Cover Letter Generation**: Personalized cover letters for each job

### Day 4 Complete ✅
- ✅ **Dashboard UI**: Clean, professional interface with Shadcn UI components
- ✅ **Stats Display**: Real-time stats (total jobs, new, applied, interviewing, avg match score)
- ✅ **Job Table**: Sortable table with color-coded match scores and statuses
- ✅ **Job Detail Modal**: Full job info with description, skills, and status management
- ✅ **AI Material Generation**: Generate resume & cover letter with one click
- ✅ **PDF Export**: Export tailored resumes to PDF with professional formatting
- ✅ **Status Updates**: Track job application status (new → interested → applied → interviewing → offer)
- ✅ **Notes System**: Add personal notes to each job
- ✅ **Fetch New Jobs**: Button to run scrapers directly from the UI

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Claude API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Initialize and seed the database:**
   ```bash
   npm run db:seed
   ```
   This creates the database with sample jobs and a user profile.

### Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

**Test Claude API integration:**
```bash
npm test:ai
```
This will test API connectivity and generate sample resume/cover letter.

## Project Structure

```
job-pipeline-assistant/
├── app/                      # Next.js app directory
│   ├── page.tsx              # Main dashboard (coming in Day 4)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── db.ts                 # SQLite database functions
│   ├── ai.ts                 # Claude API integration
│   └── types.ts              # TypeScript type definitions
├── scripts/
│   ├── seed-db.ts            # Database seeding script
│   ├── init-db.ts            # Database initialization
│   └── test-ai.ts            # AI integration tests
├── database/                 # SQLite database files (gitignored)
├── generated-resumes/        # Generated PDF resumes (gitignored)
└── .env                      # Environment variables (gitignored)
```

## Success Criteria ✅

### Day 1 ✅
- ✅ Next.js project running (`npm run dev`)
- ✅ SQLite database created with tables
- ✅ Can insert/fetch jobs from database
- ✅ Claude API integration working
- ✅ Can generate test resume and cover letter

### Day 2 ✅
- ✅ Can scrape 20-50 jobs from LinkedIn and Indeed
- ✅ Jobs saved to database with full descriptions
- ✅ Deduplication prevents duplicate entries
- ✅ Can run scraper via `npm run scrape`

### Day 3 ✅
- ✅ Jobs are ranked by match score (90+ = excellent, 70-89 = good, etc.)
- ✅ Can generate tailored resume for any job
- ✅ Can generate tailored cover letter for any job
- ✅ Generated materials are high quality

### Day 4 ✅
- ✅ Dashboard shows all scraped jobs in table
- ✅ Can click "Fetch New Jobs" to run scraper from UI
- ✅ Can click job to open detail modal
- ✅ Can generate resume + cover letter from modal
- ✅ Can download resume as PDF
- ✅ Can update job status and add notes

## Next Steps (Day 5)

- **Day 5**: Settings page, onboarding flow, polish, testing, documentation

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:init` - Initialize empty database
- `npm run db:seed` - Seed database with test data
- `npm run test:ai` - Test Claude API integration
- `npm run scrape` - Run job scrapers (LinkedIn + Indeed)

### Scraper Usage

```bash
# Basic usage (default: "Senior Software Engineer" in "Remote")
npm run scrape

# Custom search
npm run scrape -- --search="Staff Engineer" --location="San Francisco"

# Limit results per source
npm run scrape -- --max=5
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **AI**: Claude API (Anthropic)
- **Runtime**: Node.js

## Notes

- Database is stored locally in `./database/jobs.db`
- All data stays on your machine (privacy-first)
- Manual job submission only (no auto-apply)
- Built for personal use during April 2026 job hunt

---

**Status**: Day 4 Complete ✅ (Days 1-4 done!)
**Next**: Day 5 - Settings, Polish, Testing

**Progress**: 65% complete (49/75 tickets)
