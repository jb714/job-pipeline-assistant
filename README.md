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

### Day 5 Complete ✅
- ✅ **Settings Page**: Manage job preferences, skills, and application materials
- ✅ **Onboarding Flow**: 4-step wizard for first-time users
- ✅ **Toast Notifications**: Real-time success/error notifications with Sonner
- ✅ **Keyboard Shortcuts**: Cmd/Ctrl + G (generate), E (export), O (open job)
- ✅ **Error Handling**: Graceful error messages throughout the app
- ✅ **Empty States**: Helpful messages when no data exists
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Mode Support**: Full dark mode theme support

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

## Usage Guide

### First Time Setup

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Complete onboarding** (automatically shown on first visit):
   - Step 1: Welcome and overview
   - Step 2: Define target roles, location, and salary preferences
   - Step 3: Add required skills, nice-to-haves, and deal-breakers
   - Step 4: Upload your master resume and cover letter template

3. **Fetch jobs**:
   - Click "Fetch New Jobs" button
   - Jobs are automatically scraped, filtered, and scored
   - View results in the dashboard table

### Daily Workflow

1. **Review new jobs**: Check your dashboard for newly scraped jobs
2. **Click any job** to see full details
3. **Generate materials**: Click "Generate Resume & Cover Letter" button
4. **Edit if needed**: Materials are editable inline
5. **Export PDF**: Click "Export PDF" to save your resume
6. **Copy cover letter**: Click "Copy" to add to clipboard
7. **Update status**: Mark as interested → applied → interviewing → offer
8. **Add notes**: Track your thoughts, follow-ups, etc.

### Keyboard Shortcuts

When viewing a job:
- `Cmd/Ctrl + G` - Generate resume & cover letter
- `Cmd/Ctrl + E` - Export resume to PDF
- `Cmd/Ctrl + O` - Open job posting in new tab
- `Esc` - Close modal

### Settings

Access settings anytime via the "Settings" button:
- Update your target roles and preferences
- Modify required and nice-to-have skills
- Edit deal-breakers
- Update master resume and cover letter template

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

## Features

### Core Functionality
- 🔍 **Automated Job Scraping**: LinkedIn and Indeed integration
- 📊 **Smart Matching**: 0-100 match score based on your skills and preferences
- 🚫 **Deal-breaker Filtering**: Automatically filters unwanted jobs
- ✨ **AI-Powered Generation**: Claude generates tailored resumes and cover letters
- 📄 **PDF Export**: Professional PDF resumes ready to send
- 📝 **Status Tracking**: Track each application from new → offer
- 🗒️ **Notes System**: Add personal notes and follow-ups

### User Experience
- 🎨 **Modern UI**: Clean dashboard with Shadcn components
- 🌙 **Dark Mode**: Full dark mode support
- ⌨️ **Keyboard Shortcuts**: Speed up your workflow
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications**: Real-time success/error feedback
- 🚀 **Onboarding**: Guided 4-step setup for new users

---

**Status**: ✅ MVP Complete! (Days 1-5 done)
**Progress**: 100% of planned tickets complete
**Ready for**: Production use!
