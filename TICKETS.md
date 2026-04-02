# Job Pipeline Assistant - Build Tickets

**Timeline:** April 1-5, 2026 (5 days)
**Daily Commitment:** 4-6 hours
**Goal:** Shippable MVP that sources, filters, tailors, and tracks job applications

---

## Pre-Build Setup (Before April 1)

- [ ] **SETUP-1:** Get Claude API key from console.anthropic.com
- [ ] **SETUP-2:** Prepare master resume (PDF/TXT with all experience)
- [ ] **SETUP-3:** Prepare cover letter template (with placeholders: [COMPANY], [ROLE], [WHY_EXCITED])
- [ ] **SETUP-4:** Define target roles (e.g., "Senior Software Engineer", "Staff Engineer")
- [ ] **SETUP-5:** List required skills (e.g., React, TypeScript, Node.js, PostgreSQL)
- [ ] **SETUP-6:** List nice-to-have skills (e.g., Python, AWS, Docker)
- [ ] **SETUP-7:** Define deal-breakers (e.g., "agency", "crypto", "no remote")
- [ ] **SETUP-8:** Confirm Node.js v18+ installed (`node --version`)

---

## Day 1: Project Setup + Data Model (4-6 hours)

### Infrastructure (2 hours)
- [ ] **D1-1:** Initialize Next.js 14 project with TypeScript
  ```bash
  npx create-next-app@latest job-pipeline-assistant
  # Choose: TypeScript, Tailwind, App Router, no src/ directory
  ```
- [ ] **D1-2:** Install dependencies
  ```bash
  npm install better-sqlite3 @anthropic-ai/sdk
  npm install --save-dev @types/better-sqlite3
  npm install shadcn-ui # or use `npx shadcn-ui@latest init`
  ```
- [ ] **D1-3:** Set up `.env` file
  ```
  ANTHROPIC_API_KEY=your_key_here
  DATABASE_PATH=./database/jobs.db
  ```
- [ ] **D1-4:** Create `.env.example` (template for other users)
- [ ] **D1-5:** Add `.gitignore` entries (database/, generated-resumes/, .env)

### Database Setup (2 hours)
- [ ] **D1-6:** Create `lib/db.ts` - SQLite setup with better-sqlite3
- [ ] **D1-7:** Define database schema (SQL in comments)
  ```sql
  CREATE TABLE jobs (...)
  CREATE TABLE user_profile (...)
  CREATE TABLE application_history (...)
  ```
- [ ] **D1-8:** Write `initDatabase()` function (creates tables if not exist)
- [ ] **D1-9:** Write CRUD functions for jobs
  - `insertJob(job: Job): string` (returns job ID)
  - `getJobById(id: string): Job | null`
  - `getAllJobs(filters?: JobFilters): Job[]`
  - `updateJobStatus(id: string, status: string): void`
  - `deleteJob(id: string): void`
- [ ] **D1-10:** Write CRUD functions for user_profile
  - `getUserProfile(): UserProfile | null`
  - `saveUserProfile(profile: UserProfile): void`
- [ ] **D1-11:** Create `lib/types.ts` - TypeScript interfaces (Job, UserProfile, etc.)

### Testing Database (1 hour)
- [ ] **D1-12:** Create `scripts/seed-db.ts` - seed with 5 fake jobs for testing
- [ ] **D1-13:** Run seed script, verify data in SQLite (`sqlite3 database/jobs.db`, `SELECT * FROM jobs;`)
- [ ] **D1-14:** Test CRUD functions (insert, fetch, update, delete)

### Claude API Test (1 hour)
- [ ] **D1-15:** Create `lib/ai.ts` - Claude API integration
- [ ] **D1-16:** Write `testClaudeAPI()` function - simple "Hello world" test
- [ ] **D1-17:** Write `generateTailoredResume(masterResume, jobDescription)` stub
- [ ] **D1-18:** Test generating one resume (use fake job description, verify output quality)

**Day 1 Success Criteria:**
- ✅ Next.js project running (`npm run dev`)
- ✅ SQLite database created with tables
- ✅ Can insert/fetch jobs from database
- ✅ Claude API working (generated at least one test resume)

---

## Day 2: Web Scraping (4-6 hours)

### Puppeteer Setup (1 hour)
- [ ] **D2-1:** Install Puppeteer
  ```bash
  npm install puppeteer
  npm install --save-dev @types/puppeteer
  ```
- [ ] **D2-2:** Create `scrapers/index.ts` - main scraper orchestrator
- [ ] **D2-3:** Write `launchBrowser()` helper (launches headless Chrome)
- [ ] **D2-4:** Test launching browser, navigating to google.com, taking screenshot

### LinkedIn Scraper (2-3 hours)
- [ ] **D2-5:** Create `scrapers/linkedin.ts`
- [ ] **D2-6:** Write `scrapeLinkedIn(searchTerm, location)` function
  - Navigate to `https://www.linkedin.com/jobs/search/?keywords={searchTerm}&location={location}`
  - Extract job cards (selector: `.jobs-search__results-list li`)
  - For each card, extract:
    - Job title (`.base-search-card__title`)
    - Company name (`.base-search-card__subtitle`)
    - Location (`.job-search-card__location`)
    - Job URL (`a[href]`)
  - Return array of partial Job objects
- [ ] **D2-7:** Write `scrapeJobDetails(jobUrl)` - visit detail page, scrape full description
- [ ] **D2-8:** Add delays (2-5 seconds between requests to avoid rate limiting)
- [ ] **D2-9:** Handle pagination (scrape 2-3 pages max, ~50 jobs total)
- [ ] **D2-10:** Test scraper, verify it returns valid job data
- [ ] **D2-11:** Handle errors gracefully (timeout, missing elements, etc.)

### Indeed Scraper (Optional, 1-2 hours)
- [ ] **D2-12:** Create `scrapers/indeed.ts` (similar to LinkedIn)
- [ ] **D2-13:** Adapt selectors for Indeed's HTML structure
- [ ] **D2-14:** Test Indeed scraper

### Deduplication (1 hour)
- [ ] **D2-15:** Write `deduplicateJobs(newJobs, existingJobs)` in `lib/filters.ts`
  - Compare by company name + role title (fuzzy match)
  - Return only new jobs not already in database
- [ ] **D2-16:** Test deduplication logic

### Integration (1 hour)
- [ ] **D2-17:** Write `runScrapers()` in `scrapers/index.ts`
  - Runs LinkedIn + Indeed scrapers
  - Deduplicates results
  - Saves to database
- [ ] **D2-18:** Create `scripts/scrape.ts` - CLI script to run scrapers manually
  ```bash
  npm run scrape
  ```
- [ ] **D2-19:** Test end-to-end: Run scraper, check database has new jobs

**Day 2 Success Criteria:**
- ✅ Can scrape 20-50 jobs from LinkedIn (and optionally Indeed)
- ✅ Jobs saved to database with full descriptions
- ✅ Deduplication prevents duplicate entries
- ✅ Can run scraper via `npm run scrape`

---

## Day 3: Filtering, Ranking, AI Generation (4-5 hours)

### Job Filtering & Ranking (2 hours)
- [ ] **D3-1:** Create `lib/filters.ts`
- [ ] **D3-2:** Write `calculateMatchScore(job, userProfile)` function
  - +10 per required skill match (max 50 points)
  - +5 per nice-to-have skill match (max 25 points)
  - +15 if seniority matches (e.g., "senior" in title)
  - +10 if location matches
  - Cap at 100
- [ ] **D3-3:** Write `filterDealBreakers(job, userProfile)` function
  - Returns false if job contains any deal-breaker keywords
- [ ] **D3-4:** Write `extractSkills(jobDescription)` function
  - Simple keyword extraction (regex for common tech skills)
  - OR use Claude API to extract skills (slower but smarter)
- [ ] **D3-5:** Test match score calculation with real job data

### Ranking Integration (1 hour)
- [ ] **D3-6:** Update `runScrapers()` to calculate match scores after scraping
- [ ] **D3-7:** Update `getAllJobs()` to sort by match score by default
- [ ] **D3-8:** Test: Run scraper, verify jobs are ranked correctly in database

### AI Resume Generation (2 hours)
- [ ] **D3-9:** Complete `generateTailoredResume(masterResume, jobDescription)` in `lib/ai.ts`
  - Build prompt (see ADR for template)
  - Call Claude API (`claude-3-5-sonnet-20241022`)
  - Parse response (markdown resume)
  - Return markdown string
- [ ] **D3-10:** Write `generateCoverLetter(template, jobDescription, company, role)`
  - Build prompt with template + job-specific details
  - Call Claude API
  - Return cover letter text
- [ ] **D3-11:** Test with 2-3 real job descriptions, verify output quality
- [ ] **D3-12:** Adjust prompts if output is too generic or too verbose

**Day 3 Success Criteria:**
- ✅ Jobs are ranked by match score (90+ = excellent, 70-89 = good, etc.)
- ✅ Can generate tailored resume for any job (Claude API working)
- ✅ Can generate tailored cover letter for any job
- ✅ Generated materials are high quality (minimal editing needed)

---

## Day 4: PDF Export + Dashboard UI (6-8 hours)

### PDF Export (2 hours)
- [ ] **D4-1:** Install markdown-to-PDF dependencies
  ```bash
  npm install marked puppeteer
  ```
- [ ] **D4-2:** Create `lib/pdf.ts`
- [ ] **D4-3:** Write `convertMarkdownToHTML(markdown)` function (using `marked`)
- [ ] **D4-4:** Create `public/resume-template.css` - professional resume styling
- [ ] **D4-5:** Write `exportResumeToPDF(markdown, outputPath)` function
  - Convert markdown to HTML
  - Apply CSS styling
  - Use Puppeteer to render HTML to PDF
  - Save to `generated-resumes/[job-id].pdf`
- [ ] **D4-6:** Test PDF export, verify output looks professional

### Dashboard UI - Setup (1 hour)
- [ ] **D4-7:** Install Shadcn UI components
  ```bash
  npx shadcn-ui@latest add button table card modal select
  ```
- [ ] **D4-8:** Set up Tailwind config (if not done in Day 1)
- [ ] **D4-9:** Create basic layout in `app/layout.tsx` (header, main content area)

### Dashboard UI - Main View (3-4 hours)
- [ ] **D4-10:** Create `app/page.tsx` - main dashboard
- [ ] **D4-11:** Add stats display component (`components/StatsDisplay.tsx`)
  - Total applications (X/100)
  - Applications this week
  - Response rate
  - Interviews scheduled
- [ ] **D4-12:** Add job listings table (`components/JobTable.tsx`)
  - Columns: Match score, Company, Role, Location, Salary, Posted date, Status
  - Color-coded match scores (green 90+, yellow 70-89, orange 50-69)
  - Sortable by match score, date, company
  - Filterable by status (New, Interested, Applied, etc.)
- [ ] **D4-13:** Add "Fetch New Jobs" button (triggers scraper)
  - Use Next.js Server Action or API route
  - Shows loading state while scraping
  - Refreshes table when complete
- [ ] **D4-14:** Add status filter tabs (All, New, Interested, Applied, Interviewing)
- [ ] **D4-15:** Make table rows clickable (opens job detail modal)

### Dashboard UI - Job Detail Modal (2 hours)
- [ ] **D4-16:** Create `components/JobDetailModal.tsx`
- [ ] **D4-17:** Display job details:
  - Company, role, location, salary, posted date
  - Full job description (scrollable)
  - Match score breakdown (which skills matched?)
  - Application materials section
- [ ] **D4-18:** Add "Generate Resume & Cover Letter" button
  - Calls AI generation functions
  - Shows loading state
  - Displays generated materials when ready
- [ ] **D4-19:** Add material preview/edit
  - Show resume markdown in text area (editable)
  - Show cover letter in text area (editable)
  - "Download Resume PDF" button
  - "Copy Cover Letter" button (copies to clipboard)
- [ ] **D4-20:** Add status dropdown (New → Interested → Applied, etc.)
- [ ] **D4-21:** Add notes field (free text, user can add comments)
- [ ] **D4-22:** Add "Open Job Posting" button (opens job URL in new tab)

**Day 4 Success Criteria:**
- ✅ Dashboard shows all scraped jobs in table
- ✅ Can click "Fetch New Jobs" to run scraper
- ✅ Can click job to open detail modal
- ✅ Can generate resume + cover letter from modal
- ✅ Can download resume as PDF
- ✅ Can update job status and add notes

---

## Day 5: Settings, Polish, Testing (6-8 hours)

### Settings Page (2 hours)
- [ ] **D5-1:** Create `app/settings/page.tsx`
- [ ] **D5-2:** Build form for user profile:
  - Target roles (text input, comma-separated)
  - Required skills (text input, comma-separated)
  - Nice-to-have skills (text input, comma-separated)
  - Location preferences (text input, comma-separated)
  - Salary minimum (number input)
  - Deal-breakers (text input, comma-separated)
  - Master resume (textarea or file upload)
  - Cover letter template (textarea)
- [ ] **D5-3:** Wire up form to save to database (`saveUserProfile()`)
- [ ] **D5-4:** Load existing profile on page load (if exists)
- [ ] **D5-5:** Add "Save Settings" button with success/error feedback

### Initial Onboarding (1 hour)
- [ ] **D5-6:** Create `app/onboarding/page.tsx` (same form as settings, but wizard-style)
- [ ] **D5-7:** Redirect to onboarding if user_profile doesn't exist in database
- [ ] **D5-8:** After onboarding, redirect to main dashboard

### Polish & UX Improvements (2-3 hours)
- [ ] **D5-9:** Add loading states (spinners, skeleton screens)
- [ ] **D5-10:** Add error handling UI (toast notifications for errors)
- [ ] **D5-11:** Add empty states ("No jobs yet - click 'Fetch New Jobs'")
- [ ] **D5-12:** Make table responsive (mobile-friendly, though desktop is primary)
- [ ] **D5-13:** Add keyboard shortcuts (Esc to close modal, etc.)
- [ ] **D5-14:** Add "Quick Add" feature (manually enter job URL or description)
- [ ] **D5-15:** Improve CSS/styling (make it look professional, not just functional)

### Testing & Bug Fixes (2-3 hours)
- [ ] **D5-16:** End-to-end manual test:
  1. Fresh database → onboarding → scrape → review jobs → generate materials → download PDF → update status
- [ ] **D5-17:** Test edge cases:
  - Job with no salary listed
  - Job with very short/long description
  - Scraper fails (no results)
  - Claude API fails (timeout, rate limit)
- [ ] **D5-18:** Fix any bugs found during testing
- [ ] **D5-19:** Test on Safari, Chrome, Firefox (if time permits)

### Documentation (1 hour)
- [ ] **D5-20:** Create `README.md`
  - Project description
  - Setup instructions
  - How to run (`npm install`, `npm run dev`, `npm run scrape`)
  - How to configure (`.env` setup)
  - Usage guide (onboarding → scraping → applying)
- [ ] **D5-21:** Add code comments to complex functions
- [ ] **D5-22:** Create `CHANGELOG.md` (v1.0.0 - MVP features)

### Deployment Prep (Optional, 30 min)
- [ ] **D5-23:** Add scripts to `package.json`:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "scrape": "ts-node scripts/scrape.ts",
    "db:setup": "ts-node scripts/init-db.ts"
  }
  ```
- [ ] **D5-24:** Test `npm run build` (ensure production build works)

**Day 5 Success Criteria:**
- ✅ Settings page works (can update profile)
- ✅ Onboarding flow works for new users
- ✅ No major bugs in happy path
- ✅ UI looks professional and is easy to use
- ✅ README documents how to set up and use
- ✅ Ready to use on April 6+

---

## Post-MVP (Days 6-30: Usage & Iteration)

### Week 1 Usage (April 6-12)
- [ ] **PM-1:** Run scraper daily, review 10-20 new jobs
- [ ] **PM-2:** Apply to 20-25 jobs (goal: 3-4/day)
- [ ] **PM-3:** Track time spent per application (measure savings)
- [ ] **PM-4:** Note any friction points or bugs

### Week 2-4 Usage (April 13-30)
- [ ] **PM-5:** Continue daily scraping + 3-4 applications/day
- [ ] **PM-6:** Update job statuses as you hear back from recruiters
- [ ] **PM-7:** Reach 100 applications by April 30
- [ ] **PM-8:** Calculate actual time saved vs. manual process

### Iteration (As Needed)
- [ ] **ITER-1:** Fix critical bugs (anything blocking applications)
- [ ] **ITER-2:** Improve AI prompts if quality is low
- [ ] **ITER-3:** Add new scrapers (Indeed, RemoteOK, etc.) if LinkedIn isn't enough
- [ ] **ITER-4:** Enhance filtering (better match score algorithm)
- [ ] **ITER-5:** Add cron job for daily auto-scraping (if manual trigger is annoying)

---

## V2 Features (Post-April, If Tool Is Successful)

- [ ] **V2-1:** Email integration (track recruiter responses)
- [ ] **V2-2:** Calendar integration (auto-mark as Interviewing when interview scheduled)
- [ ] **V2-3:** Chrome extension (one-click save job from any site)
- [ ] **V2-4:** Deploy to Vercel (cloud-hosted, access from anywhere)
- [ ] **V2-5:** Advanced analytics (which keywords correlate with responses?)
- [ ] **V2-6:** Networking features (LinkedIn connection scraping, referral tracking)
- [ ] **V2-7:** Interview prep integration (auto-generate interview questions)
- [ ] **V2-8:** Multi-user support (if others want to use it)

---

## Time Estimates

| Day | Tasks | Estimated Time | Focus |
|-----|-------|----------------|-------|
| **Day 1** | D1-1 to D1-18 | 4-6 hours | Setup, database, AI test |
| **Day 2** | D2-1 to D2-19 | 4-6 hours | Web scraping |
| **Day 3** | D3-1 to D3-12 | 4-5 hours | Filtering, ranking, AI generation |
| **Day 4** | D4-1 to D4-22 | 6-8 hours | PDF export, dashboard UI |
| **Day 5** | D5-1 to D5-24 | 6-8 hours | Settings, polish, testing |
| **Total** | 74 tickets | **24-33 hours** | **Shippable MVP** |

---

## Daily Commitment

**Recommended schedule (alongside interview prep):**

**Morning (9am-12pm): Interview Prep**
- 1 hour: System design study
- 1 hour: LeetCode
- 1 hour: Break / coffee / walk

**Afternoon (1pm-5pm or 6pm): Portfolio Build**
- 4-5 hours: Work through day's tickets
- Track progress in this file (check off completed tickets)

**Evening (6pm-9pm): Life Domains**
- GECK (music, Spanish)
- Approaches
- Workout
- Foundation (prayer/meditation)

---

## Notes

- **Tickets are guidelines, not gospel** - adjust as you learn
- **Mark tickets complete as you go** - use checkboxes or strikethrough
- **If stuck on a ticket >1 hour** - skip it, mark as "needs help", move on
- **Don't let perfect be the enemy of done** - MVP = good enough, polish later
- **Ship on Day 5 even if not 100% complete** - 80% working is shippable

---

**Ready to build? Let's go! 🚀**

**Start:** April 1, 2026
**Ship:** April 5, 2026
**Use:** April 6-30, 2026 (100 applications!)
