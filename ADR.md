# Architecture Decision Record (ADR) - Job Pipeline Assistant

**Project:** Job Pipeline Assistant
**Date:** March 31, 2026
**Status:** Proposed
**Deciders:** Justin Bell

---

## Context

We are building a personal job application automation tool to support a high-volume job search (100 applications in April 2026). The tool needs to:
- Scrape job listings from multiple sources (LinkedIn, Indeed, etc.)
- Filter and rank jobs based on user criteria
- Generate tailored resumes and cover letters using AI
- Track application status and provide analytics
- Be built in 3-5 days by a single developer
- Run locally (no deployment infrastructure)
- Maintain ethical scraping practices (no ToS violations)

This ADR documents the key architectural decisions and their rationale.

---

## Decision 1: Frontend Framework

### Chosen: **Next.js 14 (App Router) + React + TypeScript**

### Alternatives Considered:
1. **Vanilla HTML/CSS/JS** - Fastest to build, but harder to maintain
2. **Vite + React** - Fast dev experience, but Next.js offers more out-of-the-box
3. **SvelteKit** - Great DX, but less familiar to developer
4. **Remix** - Good SSR story, but overkill for local-only app

### Rationale:
- **Next.js is familiar** - Developer has recent experience (GameRelish, OOTMIMITW planning)
- **Server Actions** - Easy to trigger scraping jobs from UI without separate API
- **TypeScript** - Type safety reduces bugs during fast iteration
- **Fast setup** - `create-next-app` gets you running in minutes
- **Good for portfolio** - Shows modern React/Next.js skills for interviews
- **Tailwind CSS integration** - Rapid styling without context switching

### Tradeoffs:
- **Pro:** Familiar, fast, good DX, portfolio-worthy
- **Con:** Slightly heavier than needed for simple CRUD app (but worth it for speed)

---

## Decision 2: Data Storage

### Chosen: **SQLite (via `better-sqlite3`)**

### Alternatives Considered:
1. **JSON files** - Simplest, no dependencies, but harder to query
2. **PostgreSQL** - More powerful, but requires Docker/server setup
3. **IndexedDB** - Browser-based, but harder to work with from Node.js scrapers
4. **In-memory (no persistence)** - Fast, but lose data on restart

### Rationale:
- **Local-first** - No cloud dependency, all data stays on your machine
- **Structured queries** - Easy to filter jobs by status, match score, date
- **Single file** - Entire database is one `.db` file (easy to backup)
- **Fast** - SQLite is very performant for local apps
- **Node.js integration** - `better-sqlite3` is synchronous, easy to use in Next.js Server Actions
- **Overkill protection** - If we used PostgreSQL, we'd need Docker setup (adds complexity for 3-5 day build)

### Schema:
```sql
-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- "linkedin", "indeed", "manual"
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN DEFAULT 0,
  salary_min INTEGER,
  salary_max INTEGER,
  posted_date TEXT,
  job_url TEXT UNIQUE,
  description TEXT,
  required_skills TEXT, -- JSON array as string
  nice_to_have_skills TEXT, -- JSON array as string
  match_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new', -- new, interested, skipped, applied, interviewing, rejected, offer
  notes TEXT,
  generated_resume_path TEXT,
  generated_cover_letter TEXT,
  date_applied TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User profile (single row)
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  target_roles TEXT, -- JSON array
  required_skills TEXT, -- JSON array
  nice_to_have_skills TEXT, -- JSON array
  location_prefs TEXT, -- JSON array
  salary_min INTEGER,
  company_size_prefs TEXT, -- JSON array
  deal_breakers TEXT, -- JSON array
  master_resume TEXT,
  cover_letter_template TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Application history (optional, for audit trail)
CREATE TABLE application_history (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  date TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

### Tradeoffs:
- **Pro:** Fast, simple, local, structured queries, easy backup
- **Con:** JSON arrays stored as strings (not ideal, but fine for MVP)
- **Alternative:** Could use Prisma ORM for type-safe queries, but adds complexity

---

## Decision 3: Web Scraping Framework

### Chosen: **Puppeteer (headless Chrome)**

### Alternatives Considered:
1. **Playwright** - More modern, better docs, but less familiar
2. **Cheerio** - Lightweight HTML parsing, but can't handle JS-rendered pages
3. **Selenium** - Older, more verbose API
4. **Custom fetch + HTML parsing** - Simple, but LinkedIn/Indeed use JS rendering

### Rationale:
- **JavaScript rendering** - LinkedIn and Indeed render jobs dynamically (need headless browser)
- **Developer familiarity** - Puppeteer is well-known, good docs, easy to debug
- **Cookie/session handling** - Can save login session to scrape more listings
- **Screenshot debugging** - Can take screenshots of pages if scraper breaks
- **NPM ecosystem** - Good integration with Node.js/Next.js

### Scraping Strategy:
1. **LinkedIn:**
   - Navigate to `https://www.linkedin.com/jobs/search/?keywords=Senior%20Software%20Engineer&location=Remote`
   - Extract job cards (title, company, location, URL)
   - Visit each job detail page, scrape full description
   - Handle pagination (scrape 2-3 pages max per run to avoid rate limits)

2. **Indeed:**
   - Similar flow to LinkedIn
   - Navigate to search results, extract cards, visit detail pages

3. **Rate limiting:**
   - Add 2-5 second delays between requests
   - Don't scrape more than 20-30 jobs per session
   - Run daily (not multiple times per hour)

### Ethical Scraping Practices:
- **Respect robots.txt** - Check if scraping is disallowed (most job boards allow personal use)
- **Slow requests** - Don't overload servers
- **User-Agent** - Use realistic User-Agent string
- **No bypassing auth** - If site requires login, use your real account (don't create fake ones)
- **Personal use only** - Not redistributing data, not commercial use

### Tradeoffs:
- **Pro:** Handles JS rendering, familiar API, good for debugging
- **Con:** Heavier than Cheerio (but necessary for modern job boards)
- **Risk:** Scrapers may break if sites change layout (mitigation: use semantic selectors, have fallback to manual entry)

---

## Decision 4: AI for Resume/Cover Letter Generation

### Chosen: **Claude API (Anthropic) - `claude-3-5-sonnet-20241022`**

### Alternatives Considered:
1. **GPT-4 (OpenAI)** - Good quality, but developer prefers Claude
2. **GPT-3.5-turbo** - Cheaper, but lower quality for nuanced writing
3. **Llama 3 (local)** - Free, but requires GPU, slower, less polished output
4. **Template-based (no AI)** - Fast, but not truly tailored

### Rationale:
- **High quality** - Claude Sonnet produces natural, tailored writing
- **Developer preference** - Already familiar with Claude (using it for this conversation!)
- **Context window** - Can fit full resume + job description + instructions in one prompt
- **Cost-effective** - ~$3 per million input tokens, ~$15 per million output tokens
  - Estimate: 100 applications × 2 API calls (resume + cover letter) × ~2000 tokens output = 400K tokens = ~$6 total
- **Fast enough** - 2-5 seconds per generation (acceptable for this use case)

### Prompt Strategy:

**Resume Tailoring:**
```typescript
const resumePrompt = `You are helping a senior software engineer tailor their resume for a specific job.

MASTER RESUME:
${masterResume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
- Highlight experience most relevant to this role
- Match keywords from job description naturally (don't keyword-stuff)
- Keep to 1-2 pages
- Maintain factual accuracy - don't invent experience
- Prioritize accomplishments that align with required skills
- Use action verbs and quantify impact where possible
- Output as clean markdown (will be converted to PDF)

OUTPUT FORMAT:
# [Your Name]
[Contact info]

## Summary
[2-3 sentence summary emphasizing relevant experience]

## Experience
[List jobs with tailored bullet points]

## Skills
[Relevant technical skills, emphasizing job description matches]

## Education
[Degrees, certifications]
`
```

**Cover Letter:**
```typescript
const coverLetterPrompt = `You are helping a senior software engineer write a tailored cover letter.

MASTER COVER LETTER TEMPLATE:
${coverLetterTemplate}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${company}
ROLE: ${role}

INSTRUCTIONS:
- Use the template as a guide, but customize for THIS specific role
- Keep the user's authentic voice and personal story
- Explain why this specific role/company is a fit (not generic reasons)
- Mention 1-2 specific things from the job description or company mission
- 3-4 paragraphs, max 300 words
- Professional but personable tone
- End with clear call to action (e.g., "I'd love to discuss...")

OUTPUT:
[Cover letter text, ready to paste into application]
`
```

### Tradeoffs:
- **Pro:** High-quality output, fast, cost-effective, developer familiarity
- **Con:** Requires API key + billing, external dependency (if API is down, can't generate)
- **Mitigation:** Cache generated materials in DB, so if API fails temporarily, you still have past work

---

## Decision 5: Resume PDF Export

### Chosen: **Markdown → PDF via `markdown-pdf` or Puppeteer**

### Alternatives Considered:
1. **Docx generation (via `docx` library)** - Word format, but many ATS prefer PDF
2. **HTML → PDF (via Puppeteer)** - Flexible, good styling control
3. **LaTeX → PDF** - Beautiful output, but overkill and slow
4. **Manual copy-paste** - User copies markdown to Google Docs, exports PDF (too manual)

### Rationale:
- **Markdown as intermediate format** - Claude outputs markdown, easy to edit if needed
- **PDF is standard** - Most job applications accept/prefer PDF
- **Puppeteer already in stack** - Can render HTML (converted from markdown) to PDF
- **Styling control** - Can use CSS to make resume look professional

### Flow:
1. Claude API generates resume in markdown
2. Convert markdown to HTML (via `marked` or `remark`)
3. Apply CSS styling (clean, professional resume template)
4. Use Puppeteer to render HTML to PDF (`page.pdf()`)
5. Save PDF to `/generated-resumes/[job-id].pdf`
6. User downloads PDF, uploads to job application

### Tradeoffs:
- **Pro:** Automated, professional-looking output, user just downloads + uploads
- **Con:** Requires styling/CSS work to make resumes look good (not just raw markdown → PDF)
- **Alternative:** If styling is hard, fallback to just providing markdown and user pastes into Google Docs

---

## Decision 6: Deployment & Infrastructure

### Chosen: **Local-only (no deployment)**

### Alternatives Considered:
1. **Vercel deployment** - Easy to deploy Next.js, but scraping from serverless functions is tricky (timeouts, IP bans)
2. **Docker container** - Portable, but adds setup complexity
3. **Electron app** - Native desktop app, but overkill for 3-5 day build
4. **Chrome extension** - Useful, but different architecture (V2 feature)

### Rationale:
- **Fast to build** - No deployment config, no CI/CD, just `npm run dev`
- **Scraping-friendly** - Easier to scrape from local machine (stable IP, no serverless timeouts)
- **Privacy** - All data stays local (no cloud database, no tracking)
- **Single user** - Only you need access, no multi-user auth needed
- **Good enough** - You just need it to work on your laptop for April

### How to Run:
```bash
# Clone repo
git clone https://github.com/yourusername/job-pipeline-assistant
cd job-pipeline-assistant

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env to add ANTHROPIC_API_KEY

# Initialize database
npm run db:setup

# Run app
npm run dev
# Open http://localhost:3000

# Run scraper (manual trigger)
npm run scrape
# OR click "Fetch New Jobs" button in UI
```

### Tradeoffs:
- **Pro:** Simple, fast, private, no hosting costs
- **Con:** Only accessible from your laptop (not phone), but that's fine for job applications (you're applying from desktop anyway)
- **V2:** Could Dockerize for portability, or deploy to Vercel with scraping as a cron job

---

## Decision 7: Daily Scraping Schedule

### Chosen: **Manual trigger ("Fetch New Jobs" button) for MVP**

### Alternatives Considered:
1. **Cron job (daily auto-scrape)** - Convenient, but adds complexity
2. **GitHub Actions (cloud-based cron)** - Requires deployment + secrets management
3. **On-demand only** - User runs `npm run scrape` from terminal

### Rationale:
- **Simplicity** - Button click is easy to implement (Next.js Server Action)
- **Control** - You decide when to scrape (e.g., once in morning, not multiple times)
- **Avoid rate limits** - Manual trigger prevents accidental over-scraping
- **MVP focus** - Cron job is nice-to-have, not essential

### V2 Enhancement:
- Add `node-schedule` or `node-cron` to auto-run scraper daily at 8am
- Store last scrape timestamp, prevent scraping more than once per 12 hours

### Tradeoffs:
- **Pro:** Simple, no background processes, full control
- **Con:** User has to remember to click button (but it's part of daily routine anyway)

---

## Decision 8: Application Status Tracking

### Chosen: **Manual status updates (user marks as "Applied", "Interviewing", etc.)**

### Alternatives Considered:
1. **Email parsing** - Auto-detect responses from recruiters, update status automatically
2. **Calendar integration** - Auto-mark as "Interviewing" when calendar event is created
3. **Browser extension** - Detect when you're on a job board and prompt to update status

### Rationale:
- **Simplicity** - Manual updates are easy to implement (dropdown in UI)
- **Accuracy** - User knows best what the true status is
- **MVP focus** - Email parsing / calendar integration is complex, save for V2

### UI Flow:
1. User applies to a job (manually, via job board)
2. Returns to dashboard, clicks on that job
3. Changes status dropdown from "Interested" → "Applied"
4. Optionally adds notes ("Applied via referral from Alex")
5. System timestamps the update

### V2 Enhancement:
- Email integration: Parse recruiter responses, auto-suggest status changes
- Gmail API: "Detected a response from Stripe recruiter - mark as Interviewing?"

### Tradeoffs:
- **Pro:** Simple, accurate, no external integrations
- **Con:** Requires user to manually update (but takes <10 seconds per job)

---

## Decision 9: Code Organization

### Chosen: **Next.js App Router structure**

### Directory Structure:
```
job-pipeline-assistant/
├── app/
│   ├── page.tsx                 # Dashboard (main view)
│   ├── job/[id]/page.tsx        # Job detail page
│   ├── settings/page.tsx        # User profile setup
│   ├── api/
│   │   ├── scrape/route.ts      # Manual scrape endpoint (if not using Server Action)
│   │   └── generate/route.ts    # Resume/cover letter generation
│   └── layout.tsx               # Root layout
├── components/
│   ├── JobCard.tsx              # Job listing card component
│   ├── JobTable.tsx             # Job listings table
│   ├── StatsDisplay.tsx         # Weekly stats component
│   ├── JobDetailModal.tsx       # Job detail view
│   └── ui/                      # Shadcn components (Button, Modal, etc.)
├── lib/
│   ├── db.ts                    # SQLite database setup + queries
│   ├── scraper.ts               # Puppeteer scraping logic
│   ├── ai.ts                    # Claude API integration
│   ├── pdf.ts                   # Markdown → PDF export
│   ├── filters.ts               # Match score calculation, deal-breaker filtering
│   └── types.ts                 # TypeScript interfaces (Job, UserProfile, etc.)
├── scrapers/
│   ├── linkedin.ts              # LinkedIn-specific scraper
│   ├── indeed.ts                # Indeed-specific scraper
│   └── index.ts                 # Orchestrates all scrapers
├── public/
│   └── resume-template.css      # CSS for resume PDF styling
├── database/
│   └── jobs.db                  # SQLite database file (gitignored)
├── generated-resumes/           # PDF outputs (gitignored)
├── .env                         # API keys (gitignored)
├── .env.example                 # Template for .env
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── PRD.md                       # This document
└── ADR.md                       # This document
```

### Rationale:
- **Separation of concerns** - UI (components) vs. data (lib) vs. business logic (scrapers)
- **Next.js conventions** - App Router uses `app/` directory for pages
- **TypeScript everywhere** - `.ts` and `.tsx` for type safety
- **Gitignore sensitive data** - Database, generated files, API keys not committed

---

## Decision 10: Error Handling & Resilience

### Chosen: **Graceful degradation + user notifications**

### Strategies:

**1. Scraper Failures:**
- If LinkedIn scraper fails (site changed, rate limited), log error, notify user
- Continue with other scrapers (Indeed, etc.)
- User can manually add jobs via "Quick Add" as fallback

**2. API Failures (Claude):**
- If Claude API is down or rate-limited, cache error and show user
- User can manually write resume/cover letter as fallback
- Retry failed generations later (store queue of pending generations)

**3. Invalid Data:**
- If job description is malformed or missing, mark job as "needs review"
- User can manually edit job details before applying

**4. Database Errors:**
- If SQLite file is corrupted, auto-backup before every run (copy `jobs.db` to `jobs.backup.db`)
- User can restore from backup if needed

### User-Facing Error Messages:
- **Scraper failed:** "Couldn't fetch jobs from LinkedIn. Try again in 10 minutes, or use Quick Add to manually enter jobs."
- **Claude API failed:** "Resume generation failed. You can manually tailor your resume for now, and retry later."
- **Database error:** "Database error detected. Restoring from backup..."

### Logging:
- Use `console.log` for development
- For production (if deployed), use `winston` or `pino` for structured logging
- Log scraper runs, API calls, errors to help debug

### Tradeoffs:
- **Pro:** Resilient to failures, user isn't blocked
- **Con:** Adds code complexity (error handling logic)
- **Mitigation:** Keep error handling simple in MVP, improve in V2 if issues arise

---

## Decision 11: Testing Strategy

### Chosen: **Manual testing for MVP, automated tests in V2**

### Rationale:
- **Time constraint** - 3-5 days to build, can't spend 1-2 days writing tests
- **Exploratory use case** - You're the only user, can manually verify everything works
- **Rapid iteration** - Easier to change code without updating tests during fast iteration

### Manual Testing Checklist:
- [ ] Scraper runs and saves jobs to database
- [ ] Jobs display in dashboard with correct match scores
- [ ] Filtering by status works (New, Interested, Applied, etc.)
- [ ] Resume generation produces good output
- [ ] Cover letter generation produces good output
- [ ] PDF export works and looks professional
- [ ] Status updates save correctly
- [ ] Stats display accurate numbers (applications count, response rate)
- [ ] No crashes or major bugs in happy path

### V2 Testing (if tool is successful):
- **Unit tests** - Test match score calculation, filtering logic
- **Integration tests** - Test scraper → database → UI flow
- **E2E tests** - Playwright tests for full user journey
- **Snapshot tests** - Ensure UI doesn't regress

### Tradeoffs:
- **Pro:** Ship faster, no test maintenance burden during rapid iteration
- **Con:** Risk of bugs slipping through (but low risk with single user)
- **Mitigation:** You're technical, can debug issues quickly

---

## Decision 12: Security & Privacy

### Chosen: **Local-only, no external data sharing**

### Practices:

**1. API Keys:**
- Store Claude API key in `.env` (never commit to Git)
- Use `.env.example` as template for other users (if open-sourced)

**2. Job Data:**
- All scraped data stays in local SQLite database
- No cloud backups (unless you manually export)
- Database file is gitignored

**3. Generated Materials:**
- Resumes and cover letters stored locally (`/generated-resumes/`)
- No uploads to third-party services (unless you choose to)

**4. Scraping Ethics:**
- Use your real LinkedIn/Indeed account (don't create fake accounts)
- Don't share or sell scraped data
- Personal use only (not commercial redistribution)

**5. Code Security:**
- No SQL injection (using parameterized queries with `better-sqlite3`)
- No XSS (Next.js escapes output by default)
- No CSRF (local-only app, no public endpoints)

### Tradeoffs:
- **Pro:** Maximum privacy, no cloud dependency, no attack surface
- **Con:** No backup if laptop dies (mitigation: manually back up `.db` file to external drive)

---

## Decision 13: Future Extensibility

### V2 Features (If Tool Is Successful):

**1. Cloud Sync:**
- Deploy to Vercel, use Supabase for database
- Access from multiple devices
- Real-time sync between desktop and mobile

**2. Email Integration:**
- Parse recruiter responses via Gmail API
- Auto-update job status when you get replies
- Suggest next actions ("Schedule interview for this role?")

**3. Advanced Analytics:**
- Which types of roles get most responses?
- Which keywords correlate with success?
- Time-to-response distribution
- A/B test different resume styles

**4. Chrome Extension:**
- One-click save job from LinkedIn/Indeed
- Overlay match score on job listings
- Quick-apply with pre-filled data

**5. Networking Features:**
- Scrape mutual connections on LinkedIn
- Suggest who to reach out to for referrals
- Track referral status

**6. Interview Prep Integration:**
- Auto-generate interview questions based on job description
- Link to LeetCode problems matching company interview style
- Track interview performance (rating, questions asked, feedback)

**7. Multi-User / SaaS:**
- If other job seekers want it, offer as $10-20/month SaaS
- User accounts, payment (Stripe), cloud database
- Templates for different roles (frontend, backend, full-stack, etc.)

### Architecture Choices That Enable V2:
- **TypeScript** - Easy to refactor when adding features
- **Modular code** - Scrapers, AI, DB logic separated (can swap implementations)
- **SQLite → PostgreSQL migration path** - If moving to cloud, Prisma makes this easy
- **Next.js** - Already supports deployment to Vercel, easy to add API routes

---

## Non-Functional Requirements

### Performance:
- **Scraping:** 20-30 jobs in 2-5 minutes (acceptable for daily batch)
- **Dashboard load:** <1 second (local SQLite is fast)
- **Resume generation:** 2-5 seconds per job (Claude API latency)
- **PDF export:** 1-2 seconds per resume

### Reliability:
- **Uptime:** Local app, always available when laptop is on
- **Data integrity:** SQLite ACID guarantees, auto-backup before writes
- **Error recovery:** Graceful degradation, fallback to manual entry

### Usability:
- **Learning curve:** <10 minutes to understand dashboard
- **Daily workflow:** <30 minutes/day for 3-4 applications
- **Mobile-friendly:** Not required for MVP (desktop-only)

### Maintainability:
- **Code quality:** TypeScript + ESLint for consistency
- **Documentation:** PRD + ADR + inline code comments
- **Extensibility:** Modular architecture allows adding scrapers, AI models, etc.

---

## Open Questions & Future Decisions

### To Be Decided During Build:

1. **Which scraper to build first?**
   - Leaning: LinkedIn (largest job board for tech roles)
   - Fallback: Indeed if LinkedIn is too hard to scrape

2. **How to handle LinkedIn login?**
   - Option A: Scrape public search (no login required, but fewer results)
   - Option B: Login once, save cookies, reuse session (more results, but requires manual login)
   - Decision: Try Option A first, fall back to Option B if needed

3. **Should we extract salary from descriptions?**
   - Many job posts mention salary in description even if not in structured field
   - Use regex or Claude to extract salary ranges
   - Decision: V2 feature, skip for MVP

4. **How to handle job posts without descriptions?**
   - Some listings are just title + company (click to see full description)
   - Option A: Skip these jobs
   - Option B: Visit detail page for every job (slower but more complete)
   - Decision: Option B (visit detail page for complete data)

5. **Should we deduplicate by URL or by company+role?**
   - Same job might appear on LinkedIn and Indeed with different URLs
   - Option A: Dedupe by URL (simple, but allows duplicates across sites)
   - Option B: Dedupe by company + role + location (better, but might miss subtle differences)
   - Decision: Option B (fuzzy match on company + role)

---

## Summary of Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js 14 + React + TypeScript | Familiar, fast, portfolio-worthy |
| **Data Storage** | SQLite (local) | Simple, fast, private, structured queries |
| **Scraping** | Puppeteer (headless Chrome) | Handles JS rendering, familiar API |
| **AI** | Claude API (Sonnet 3.5) | High quality, cost-effective, developer preference |
| **PDF Export** | Markdown → HTML → PDF (via Puppeteer) | Automated, professional output |
| **Deployment** | Local-only (no deployment) | Fast to build, privacy-first, scraping-friendly |
| **Scraping Schedule** | Manual trigger (button click) | Simple, controlled, avoids rate limits |
| **Status Tracking** | Manual user updates | Accurate, simple, no complex integrations |
| **Testing** | Manual for MVP | Ship faster, automate in V2 if needed |
| **Security** | Local-only, no cloud | Maximum privacy, no external dependencies |

---

## Conclusion

This architecture prioritizes **speed to value** (ship in 3-5 days), **ethical practices** (no ToS violations), and **quality applications** (tailored, not spammy). By keeping the MVP simple (local-only, manual triggers, SQLite) and focusing on core features (scrape, filter, generate, track), we can deliver a useful tool quickly.

The modular design allows for future extensibility (cloud sync, email integration, Chrome extension) if the tool proves valuable beyond April 2026.

**Next Steps:**
1. Review this ADR alongside PRD
2. Decide on any open questions (LinkedIn login strategy, deduplication logic)
3. Begin Day 1 build (Next.js setup, SQLite schema, Claude API test)

---

**Document Version:** 1.0
**Date:** March 31, 2026
**Status:** Proposed
**Deciders:** Justin Bell
**Review Date:** After MVP completion (April 5, 2026)
