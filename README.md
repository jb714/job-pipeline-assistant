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

## Day 1 Success Criteria ✅

- ✅ Next.js project running (`npm run dev`)
- ✅ SQLite database created with tables
- ✅ Can insert/fetch jobs from database
- ✅ Claude API integration working
- ✅ Can generate test resume and cover letter

## Next Steps (Day 2-5)

- **Day 2**: Web scraping (Puppeteer for LinkedIn/Indeed)
- **Day 3**: Job filtering, ranking, and AI generation workflows
- **Day 4**: PDF export + Dashboard UI
- **Day 5**: Settings page, polish, testing

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

**Status**: Day 1 Complete ✅
**Next**: Day 2 - Web Scraping
