# Product Requirement Document (PRD) - Job Pipeline Assistant

**Project:** Job Pipeline Assistant
**First Customer:** Justin Bell
**Purpose:** Automate job sourcing, filtering, and application preparation to save 30-40 hours during April 2026 job hunt
**Tagline:** Find, filter, and apply faster - without the ToS violations

---

## 1. Overview / Purpose

**Job Pipeline Assistant** is a personal automation tool that aggregates job listings from multiple sources, filters them based on your criteria, and generates tailored resumes and cover letters - all while keeping you in control of the final submission.

**Core Problem It Solves:**
When you're targeting 100 applications in a month while also doing LeetCode, system design study, and portfolio building, the manual job hunt becomes a massive time sink:
- Searching across multiple job boards is repetitive and time-consuming
- Tailoring resumes/cover letters for each role takes 15-20 minutes
- Tracking what you've applied to gets messy
- Quality suffers when you're rushing through applications
- Generic applications get filtered out by ATS systems

**Job Pipeline Assistant** gives you:
- **Automated job aggregation** from LinkedIn, Indeed, and other sources
- **Smart filtering** based on your tech stack, seniority level, and preferences
- **AI-powered tailoring** of resume and cover letter for each role
- **Application tracking** dashboard to manage your pipeline
- **Manual review + submit** to stay within ToS and maintain quality

**Design Philosophy:**
- **You are the first user** - Built to support your April 2026 goal of 100 applications
- **Speed to value** - Ship in 3-5 days, use for 3+ weeks
- **Ethical automation** - Scrape responsibly, never auto-submit
- **Quality over quantity** - Tailored applications that pass ATS and show genuine interest
- **Portfolio-worthy** - Demonstrates full-stack + automation skills for interviews

---

## 2. Target Users

### Primary (v1): You
- 36-year-old senior software engineer (turning 37 July 14, 2026)
- Laid off March 31, 2026, starting intense job hunt April 1
- Target: 100 applications in April while maintaining interview prep + portfolio work
- Needs: Fast job sourcing, high-quality tailored applications, pipeline visibility
- Tech stack preference: React, Next.js, TypeScript, Node.js, full-stack roles
- Seniority: Senior Software Engineer, Staff Engineer, or strong mid-level with growth path

### Secondary (v2+): Other job seekers
- Software engineers doing high-volume job searches
- Anyone frustrated with manual application processes
- People who want tailored applications without spending hours per application

---

## 3. Core Use Cases

### 3.1 Daily Job Sourcing (Morning Routine)
**Flow:**
1. Open Job Pipeline Assistant dashboard
2. Click "Fetch New Jobs" (runs scraper in background)
3. Scraper searches LinkedIn, Indeed, etc. for "Senior Software Engineer" + your filters
4. Results populate in dashboard (10-30 new listings)
5. System auto-ranks based on keyword matching (React, Next.js, system design, etc.)
6. Review top matches, mark as "Interested" or "Skip"
7. **Time:** 10-15 minutes vs. 30-45 minutes manually searching

### 3.2 Application Preparation (Daily)
**Flow:**
1. Select 3-4 "Interested" jobs from dashboard
2. For each job, click "Generate Application Materials"
3. System analyzes job description and generates:
   - Tailored resume (highlights relevant experience, matches keywords)
   - Custom cover letter (your voice, job-specific details)
   - Pre-filled tracking entry (company, role, date, salary range if listed)
4. Review generated materials (edit if needed)
5. Export resume as PDF
6. Copy cover letter text
7. Manually navigate to job board and submit application
8. Mark as "Applied" in dashboard
9. **Time per application:** 5-7 minutes vs. 15-20 minutes manually

### 3.3 Pipeline Management (Weekly Review)
**Flow:**
1. View dashboard with all tracked applications
2. Filter by status: New, Interested, Applied, Interviewing, Rejected, Offer
3. Update statuses as you hear back from companies
4. See weekly stats: applications sent, response rate, interviews scheduled
5. Identify patterns (which types of roles get responses? which don't?)
6. Adjust filters/targeting for next week
7. **Time:** 10-15 minutes weekly

### 3.4 Quick Add (Manual Entry)
**Flow:**
1. Find interesting job on Twitter, company website, or referral
2. Click "Quick Add" in dashboard
3. Paste job URL or description
4. System extracts details and generates materials
5. Apply as usual
6. **Time:** 3-5 minutes

---

## 4. Information Architecture

### 4.1 Job Listing (Core Data Model)

**Each job listing contains:**
- **Source** (LinkedIn, Indeed, company site, etc.)
- **Company name**
- **Role title**
- **Location** (remote, hybrid, on-site + city)
- **Salary range** (if available)
- **Posted date**
- **Job description** (full text)
- **Required skills** (extracted keywords)
- **Application URL**
- **Match score** (0-100, based on your criteria)
- **Status** (New, Interested, Skipped, Applied, Interviewing, Rejected, Offer)
- **Notes** (your comments, interview dates, etc.)
- **Generated resume** (stored as file)
- **Generated cover letter** (stored as text)
- **Date applied**

### 4.2 User Profile (Your Criteria)

**Stored preferences:**
- **Target roles:** Senior Software Engineer, Staff Engineer, Full Stack Engineer
- **Required skills:** React, Next.js, TypeScript, Node.js, PostgreSQL
- **Nice-to-have skills:** Python, AWS, Docker, system design
- **Location preferences:** Remote-first, or SF Bay Area / NYC / Austin
- **Salary minimum:** $150K (or whatever your floor is)
- **Company size:** Startup (<50), Scale-up (50-500), Enterprise (500+), Any
- **Deal-breakers:** No agencies, no crypto (unless exceptional), no pure backend roles
- **Master resume** (your base resume with all experience)
- **Master cover letter template** (your voice/story framework)

### 4.3 Application Tracking

**Status pipeline:**
1. **New** - Scraped, not yet reviewed
2. **Interested** - You marked it for application
3. **Skipped** - Not a fit, hidden from main view
4. **Applied** - You submitted the application
5. **Interviewing** - You have a recruiter screen, phone screen, or onsite scheduled
6. **Rejected** - Explicit rejection or ghosted after 2+ weeks
7. **Offer** - You received an offer

**Weekly stats:**
- Applications sent this week
- Total applications (running count toward 100)
- Response rate (% that led to recruiter contact)
- Interviews scheduled
- Offers received

---

## 5. Feature Set

### ✅ In-Scope for MVP (Ship in 3-5 days)

**Job Sourcing:**
- [ ] Scraper for LinkedIn (search "Senior Software Engineer" + location filters)
- [ ] Scraper for Indeed (same search)
- [ ] Optional: Scraper for RemoteOK, WeWorkRemotely, YCombinator jobs
- [ ] Save listings to local database (SQLite or JSON files)
- [ ] Deduplicate listings (same company + role = one entry)
- [ ] Schedule daily auto-fetch (or manual "Fetch New Jobs" button)

**Job Filtering & Ranking:**
- [ ] Keyword matching (required skills, nice-to-have skills)
- [ ] Match score calculation (0-100 based on description analysis)
- [ ] Auto-flag deal-breakers (agencies, non-remote if you require remote, etc.)
- [ ] Sort by match score, posted date, or salary

**Application Generation:**
- [ ] Resume tailoring (Claude API: highlight relevant experience, match keywords)
- [ ] Cover letter generation (Claude API: use template + job-specific customization)
- [ ] Export tailored resume as PDF
- [ ] Copy cover letter to clipboard
- [ ] Store generated materials with job listing

**Dashboard & Tracking:**
- [ ] Simple web UI (Next.js app running locally)
- [ ] Job listings table (filterable by status, company, match score)
- [ ] Detail view for each job (description, generated materials, notes)
- [ ] Status updates (mark as Applied, Interviewing, Rejected, etc.)
- [ ] Weekly stats display
- [ ] Progress toward 100 applications goal

**Infrastructure:**
- [ ] Next.js + TypeScript + Tailwind (fast UI)
- [ ] SQLite or JSON file storage (local-first, no cloud dependency)
- [ ] Puppeteer or Playwright for scraping (headless browser automation)
- [ ] Claude API integration for resume/cover letter generation
- [ ] Runs locally on your machine (no deployment needed for MVP)

### ❌ Out-of-Scope for MVP

- Auto-submitting applications (you always manually submit)
- Email parsing (tracking responses from recruiters)
- Calendar integration (scheduling interviews)
- Chrome extension (for now, just standalone app)
- Mobile app (desktop-only for MVP)
- Analytics beyond basic stats
- Multi-user support (just you)
- Cloud deployment (local-only is fine)

### 🔮 V2 Considerations (If Useful Beyond April)

- Email integration (track responses, auto-update status when you get replies)
- Chrome extension (one-click apply from job boards)
- ATS keyword optimization (scan your resume vs. job description, suggest improvements)
- Interview prep integration (auto-generate common interview questions for each company)
- Networking features (track referrals, mutual connections via LinkedIn scraping)
- Public SaaS (if other job seekers want it, could be $10-20/month product)

---

## 6. User Flows (Detailed)

### 6.1 Initial Setup (One-Time, 15-20 minutes)

1. Clone repo, run `npm install`
2. Set up `.env` with Claude API key
3. Run setup wizard:
   - Upload your master resume (PDF or paste text)
   - Enter your master cover letter template
   - Define target roles, required skills, location preferences
   - Set deal-breakers and filters
4. Run first scrape: `npm run scrape`
5. Wait 2-5 minutes while scraper fetches initial job listings
6. Open dashboard: `npm run dev` → `localhost:3000`
7. Review initial listings, adjust filters if needed

### 6.2 Daily Job Hunt Routine (20-30 minutes total)

**Morning (10-15 min):**
1. Run `npm run scrape` or click "Fetch New Jobs" in dashboard
2. Review new listings sorted by match score
3. Quickly scan top 10-20 jobs
4. Mark 3-5 as "Interested" (these become your daily application targets)
5. Mark obvious non-fits as "Skipped"

**Afternoon/Evening (10-15 min, 3-4 applications):**
1. Open dashboard, filter to "Interested" status
2. For each job:
   - Click "Generate Application Materials"
   - Review tailored resume (edit if needed)
   - Review cover letter (edit if needed)
   - Export resume as PDF
   - Copy cover letter
   - Navigate to job board, manually submit application
   - Mark as "Applied" in dashboard
   - Add any notes (e.g., "found via referral from Alex")
3. Repeat for 3-4 applications (your daily target to hit 100 in April)

**Weekly (15 min):**
1. Review pipeline stats (applications sent, response rate)
2. Update statuses (move to "Interviewing" or "Rejected" as you hear back)
3. Adjust filters if needed (e.g., expand location if not enough matches)

### 6.3 Application Material Generation (Behind the Scenes)

**Resume Tailoring Prompt (to Claude API):**
```
You are helping a senior software engineer tailor their resume for a specific job.

MASTER RESUME:
{user's full resume}

JOB DESCRIPTION:
{job description text}

INSTRUCTIONS:
- Highlight experience most relevant to this role
- Match keywords from job description (but don't keyword-stuff)
- Keep it to 1-2 pages
- Maintain the user's voice and factual accuracy
- Prioritize accomplishments that align with required skills
- Output as markdown (will be converted to PDF)

OUTPUT:
{tailored resume in markdown}
```

**Cover Letter Generation Prompt:**
```
You are helping a senior software engineer write a tailored cover letter.

MASTER COVER LETTER TEMPLATE:
{user's template with placeholders like [COMPANY], [ROLE], [WHY_EXCITED]}

JOB DESCRIPTION:
{job description text}

COMPANY RESEARCH (if available):
{scraped company info, mission statement, etc.}

INSTRUCTIONS:
- Fill in placeholders with job-specific details
- Keep the user's authentic voice and story
- Explain why this specific role/company is a fit
- Mention 1-2 specific things about the company (from description or research)
- Keep to 3-4 paragraphs, max 300 words
- Don't be generic - make it clear this is tailored to THIS role

OUTPUT:
{tailored cover letter}
```

---

## 7. Technical Requirements

### 7.1 Tech Stack

**Frontend:**
- **Next.js 14** (App Router) - Fast UI, server actions for scraping
- **React** + **TypeScript** - Type safety
- **Tailwind CSS** - Rapid styling
- **Shadcn/ui** - Pre-built components (tables, modals, etc.)

**Backend / Scraping:**
- **Puppeteer** or **Playwright** - Headless browser for job board scraping
- **Cheerio** - HTML parsing (if scraping static pages)
- **Node.js cron** or **node-schedule** - Daily auto-scraping (optional)

**Data Storage:**
- **SQLite** (via `better-sqlite3`) - Local database, no server needed
  - OR **JSON files** (even simpler, good enough for MVP)
- Tables: `jobs`, `user_profile`, `application_history`

**AI Integration:**
- **Claude API** (Anthropic) - Resume and cover letter generation
  - Use `claude-3-5-sonnet-20241022` for quality
  - Or `claude-3-5-haiku-20241022` for speed/cost

**Infrastructure:**
- **Local development only** (no deployment for MVP)
- **Optional:** Dockerize for easy setup on any machine

### 7.2 Data Model

**`jobs` table:**
```typescript
{
  id: string (UUID)
  source: "linkedin" | "indeed" | "remoteok" | "manual"
  company: string
  role: string
  location: string
  remote: boolean
  salary_min?: number
  salary_max?: number
  posted_date: Date
  job_url: string
  description: string (full text)
  required_skills: string[] (extracted keywords)
  nice_to_have_skills: string[]
  match_score: number (0-100)
  status: "new" | "interested" | "skipped" | "applied" | "interviewing" | "rejected" | "offer"
  notes?: string
  generated_resume_path?: string (file path to PDF)
  generated_cover_letter?: string (text)
  date_applied?: Date
  date_updated: Date
  created_at: Date
}
```

**`user_profile` table (single row):**
```typescript
{
  id: string
  target_roles: string[] (e.g., ["Senior Software Engineer", "Staff Engineer"])
  required_skills: string[] (e.g., ["React", "TypeScript", "Node.js"])
  nice_to_have_skills: string[]
  location_prefs: string[] (e.g., ["Remote", "SF Bay Area"])
  salary_min?: number
  company_size_prefs?: string[] (e.g., ["startup", "scaleup"])
  deal_breakers: string[] (e.g., ["agency", "crypto"])
  master_resume: string (full resume text or file path)
  cover_letter_template: string
  updated_at: Date
}
```

**`application_history` table (optional, for stats):**
```typescript
{
  id: string
  job_id: string (foreign key)
  status: string
  date: Date
  notes?: string
}
```

### 7.3 Key Functions

**Job Scraping:**
```typescript
async function scrapeLinkedIn(searchTerm: string, location: string): Promise<Job[]> {
  // Launch Puppeteer
  // Navigate to LinkedIn jobs search
  // Extract job listings (title, company, location, URL)
  // For each listing, visit detail page and scrape full description
  // Return array of Job objects
}

async function scrapeIndeed(searchTerm: string, location: string): Promise<Job[]> {
  // Similar to LinkedIn scraper
}

async function deduplicateJobs(newJobs: Job[], existingJobs: Job[]): Promise<Job[]> {
  // Compare by company + role title
  // Return only truly new jobs
}
```

**Job Filtering & Ranking:**
```typescript
function calculateMatchScore(job: Job, userProfile: UserProfile): number {
  let score = 0

  // Required skills: +10 per match (max 50 points)
  const requiredMatches = userProfile.required_skills.filter(skill =>
    job.description.toLowerCase().includes(skill.toLowerCase())
  )
  score += requiredMatches.length * 10

  // Nice-to-have skills: +5 per match (max 25 points)
  const niceToHaveMatches = userProfile.nice_to_have_skills.filter(skill =>
    job.description.toLowerCase().includes(skill.toLowerCase())
  )
  score += niceToHaveMatches.length * 5

  // Seniority match: +15 if "senior" in title and user wants senior (max 15 points)
  if (userProfile.target_roles.some(role =>
    role.toLowerCase().includes("senior") && job.role.toLowerCase().includes("senior")
  )) {
    score += 15
  }

  // Location match: +10 if matches preferences (max 10 points)
  if (userProfile.location_prefs.some(loc =>
    job.location.includes(loc) || (loc === "Remote" && job.remote)
  )) {
    score += 10
  }

  return Math.min(100, score) // Cap at 100
}

function filterDealBreakers(job: Job, userProfile: UserProfile): boolean {
  // Return false if job matches any deal-breaker
  return !userProfile.deal_breakers.some(dealBreaker =>
    job.description.toLowerCase().includes(dealBreaker.toLowerCase()) ||
    job.company.toLowerCase().includes(dealBreaker.toLowerCase())
  )
}
```

**Application Generation:**
```typescript
async function generateTailoredResume(
  masterResume: string,
  jobDescription: string
): Promise<string> {
  const prompt = `You are helping a senior software engineer tailor their resume...`

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: prompt
    }]
  })

  return response.content[0].text // Markdown resume
}

async function generateCoverLetter(
  template: string,
  jobDescription: string,
  company: string,
  role: string
): Promise<string> {
  const prompt = `You are helping a senior software engineer write a cover letter...`

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: prompt
    }]
  })

  return response.content[0].text
}

async function exportResumeToPDF(markdownResume: string, outputPath: string): Promise<void> {
  // Use a library like `markdown-pdf` or `puppeteer` to convert markdown to PDF
}
```

**Stats & Analytics:**
```typescript
function getWeeklyStats(applications: Job[]): WeeklyStats {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const appliedThisWeek = applications.filter(job =>
    job.status === "applied" && job.date_applied >= oneWeekAgo
  )

  const totalApplied = applications.filter(job => job.status === "applied").length

  const responseRate = applications.filter(job =>
    job.status === "interviewing" || job.status === "offer"
  ).length / totalApplied

  return {
    appliedThisWeek: appliedThisWeek.length,
    totalApplied,
    responseRate: (responseRate * 100).toFixed(1) + "%",
    interviewsScheduled: applications.filter(job => job.status === "interviewing").length,
    offers: applications.filter(job => job.status === "offer").length
  }
}
```

---

## 8. UI/UX Requirements

### 8.1 Dashboard (Main View)

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  Job Pipeline Assistant              [Fetch New Jobs]      │
│                                                             │
│  📊 Stats                                                   │
│  Applied: 37/100  |  This week: 12  |  Response: 8.1%     │
│  Interviewing: 3  |  Offers: 0                            │
├────────────────────────────────────────────────────────────┤
│  Filters: [All] [New] [Interested] [Applied] [Interviewing]│
│  Sort by: [Match Score ▼] [Posted Date] [Company]         │
├────────────────────────────────────────────────────────────┤
│  JOB LISTINGS                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🟢 95  Senior Software Engineer - Stripe               │ │
│  │        Remote (SF) | $180K-$250K | Posted 2d ago      │ │
│  │        React, TypeScript, System Design               │ │
│  │        [Interested] [Skip] [View Details]             │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 🟡 82  Staff Engineer - Notion                         │ │
│  │        Hybrid (SF) | $200K-$280K | Posted 4d ago      │ │
│  │        Full-stack, TypeScript, PostgreSQL             │ │
│  │        [Interested] [Skip] [View Details]             │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 🟢 90  Senior Full Stack - Vercel                      │ │
│  │        Remote | Not listed | Posted 1d ago            │ │
│  │        Next.js, React, Node.js                        │ │
│  │        [Interested] [Skip] [View Details]             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  [Load More]                                               │
└────────────────────────────────────────────────────────────┘
```

**Color coding:**
- 🟢 Green (90-100): Excellent match
- 🟡 Yellow (70-89): Good match
- 🟠 Orange (50-69): Okay match
- 🔴 Red (<50): Poor match (auto-hidden or grayed out)

### 8.2 Job Detail View (Modal or Separate Page)

```
┌────────────────────────────────────────────────────────────┐
│  Senior Software Engineer - Stripe                    [✕]  │
├────────────────────────────────────────────────────────────┤
│  📍 Remote (SF preferred)  💰 $180K-$250K  📅 Posted 2d ago│
│  🔗 https://stripe.com/jobs/12345                          │
│  Match Score: 95/100                                       │
│                                                             │
│  JOB DESCRIPTION                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Stripe is looking for a Senior Software Engineer...   │ │
│  │ [Full description text, scrollable]                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  REQUIRED SKILLS (matched: 4/5)                            │
│  ✓ React  ✓ TypeScript  ✓ System Design  ✗ Go  ✓ APIs    │
│                                                             │
│  APPLICATION MATERIALS                                     │
│  [Generate Resume & Cover Letter]  ← Button               │
│                                                             │
│  (Once generated:)                                         │
│  📄 Tailored Resume [View] [Download PDF] [Edit]           │
│  📝 Cover Letter [View] [Copy to Clipboard] [Edit]         │
│                                                             │
│  NOTES                                                     │
│  [___________________________________________]             │
│                                                             │
│  STATUS                                                    │
│  [New ▼] → Interested | Applied | Interviewing | etc.     │
│                                                             │
│  [Mark as Applied]  [Skip This Job]  [Open Job Posting]   │
└────────────────────────────────────────────────────────────┘
```

### 8.3 Settings / Profile (One-Time Setup)

```
┌────────────────────────────────────────────────────────────┐
│  Settings                                                   │
├────────────────────────────────────────────────────────────┤
│  TARGET ROLES                                              │
│  [Senior Software Engineer]  [Staff Engineer]  [+Add]      │
│                                                             │
│  REQUIRED SKILLS (high priority for matching)              │
│  [React] [TypeScript] [Node.js] [PostgreSQL] [+Add]        │
│                                                             │
│  NICE-TO-HAVE SKILLS                                       │
│  [Python] [AWS] [Docker] [System Design] [+Add]            │
│                                                             │
│  LOCATION PREFERENCES                                      │
│  [Remote] [SF Bay Area] [NYC] [+Add]                       │
│                                                             │
│  SALARY MINIMUM                                            │
│  [$150,000]                                                │
│                                                             │
│  DEAL-BREAKERS (auto-filter these out)                     │
│  [agency] [crypto] [pure backend] [+Add]                   │
│                                                             │
│  MASTER RESUME                                             │
│  [Upload PDF] or [Paste Text Below]                        │
│  [_____________________________]                           │
│                                                             │
│  COVER LETTER TEMPLATE                                     │
│  [_____________________________]                           │
│  Use placeholders: [COMPANY], [ROLE], [WHY_EXCITED]        │
│                                                             │
│  [Save Settings]                                           │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Success Metrics (April 2026)

### Primary Goals:
- [ ] **100 applications submitted** by April 30
- [ ] **Time saved:** 30+ hours vs. manual process (10-15 min/app vs. 20-30 min/app)
- [ ] **Quality maintained:** Response rate >5% (industry average is 2-5%, tailored apps should beat this)
- [ ] **Daily usage:** Use the tool 6+ days/week throughout April
- [ ] **Senior role landed:** At least 3-5 interviews, ideally 1+ offer by end of April or early May

### Product Validation:
- [ ] Tool actually saves time (track time spent on applications)
- [ ] Generated resumes/cover letters are high quality (minimal editing needed)
- [ ] No ToS violations or blocked/banned accounts
- [ ] Dashboard provides useful insights (you adjust strategy based on stats)

### Portfolio Value:
- [ ] Demonstrates full-stack skills (Next.js, TypeScript, API integration)
- [ ] Shows automation/scraping capability (relevant for data engineering roles)
- [ ] Proves product thinking (built a tool to solve real problem)
- [ ] Interview talking point ("I automated my job hunt and landed 100 applications in a month")

---

## 10. Build Plan / Timeline

### Day 1: Setup + Data Model (4 hours)
- [ ] Initialize Next.js + TypeScript project
- [ ] Set up Tailwind CSS + Shadcn/ui
- [ ] Design data model (SQLite tables or JSON schema)
- [ ] Create basic database functions (CRUD for jobs, user profile)
- [ ] Set up Claude API integration (test resume generation)

### Day 2: Scraping (4-6 hours)
- [ ] Build LinkedIn scraper (Puppeteer)
  - Search for jobs
  - Extract listings
  - Visit detail pages for full descriptions
- [ ] Build Indeed scraper (similar flow)
- [ ] Test scrapers, handle edge cases (rate limiting, captchas)
- [ ] Implement deduplication logic
- [ ] Save scraped jobs to database

### Day 3: Filtering + Ranking (3-4 hours)
- [ ] Implement match score calculation
- [ ] Implement deal-breaker filtering
- [ ] Keyword extraction from job descriptions
- [ ] Test ranking algorithm on scraped data
- [ ] Adjust weights if needed

### Day 4: Application Generation (4-5 hours)
- [ ] Build resume tailoring function (Claude API)
- [ ] Build cover letter generation function (Claude API)
- [ ] Markdown to PDF export (for resumes)
- [ ] Test with real job descriptions
- [ ] Iterate on prompts for quality

### Day 5: Dashboard UI (6-8 hours)
- [ ] Build main dashboard (job listings table)
- [ ] Build job detail modal/page
- [ ] Build settings page (user profile setup)
- [ ] Implement status updates (mark as Applied, etc.)
- [ ] Build stats display (progress toward 100, response rate)
- [ ] Add "Fetch New Jobs" button (manual scrape trigger)
- [ ] Polish UI/UX, make it usable

### Day 6 (Optional): Polish + Testing (2-4 hours)
- [ ] End-to-end test (scrape → filter → generate → apply flow)
- [ ] Fix bugs
- [ ] Add README with setup instructions
- [ ] Optional: Daily auto-scrape cron job

**Total: 3-5 days (20-30 hours)**

---

## 11. Design Principles

### 11.1 Core Values

1. **Speed to Value**
   - Ship in 3-5 days, not 3 weeks
   - Use existing tools (Shadcn, Puppeteer) instead of building from scratch
   - Good enough > perfect

2. **Ethical Automation**
   - Scrape responsibly (don't overload servers)
   - Never auto-submit (always human review)
   - Stay within ToS (personal use scraping is generally okay)
   - Quality > quantity (tailored apps, not spam)

3. **Quality Applications**
   - Generated materials should be high-quality, not generic
   - Tailor to each role, not just keyword-stuff
   - Your voice should come through in cover letters
   - Resumes should be factually accurate, just re-ordered/re-emphasized

4. **Privacy-First**
   - All data stored locally (no cloud, no tracking)
   - Your job search is private
   - No third-party integrations unless you explicitly add them

5. **Portfolio-Worthy**
   - This is a demo of your skills, not just a throwaway tool
   - Clean code, good architecture, TypeScript for type safety
   - Could show this to interviewers as evidence of automation/full-stack skills

---

## 12. Open Questions / Decisions Needed

### Technical
- [ ] **SQLite or JSON files for storage?**
  - Leaning: SQLite (more structured, easier to query)
- [ ] **Puppeteer or Playwright for scraping?**
  - Leaning: Puppeteer (more familiar, good docs)
- [ ] **How to handle LinkedIn login/CAPTCHA?**
  - May need to scrape logged-in (save cookies), or use LinkedIn's public search (no login)
  - CAPTCHA: If hit, pause scraping and notify user
- [ ] **How to handle rate limiting?**
  - Add delays between requests (2-5 seconds)
  - Scrape in batches (10-20 jobs at a time, not 100s)

### Product
- [ ] **Should we scrape company info too (Glassdoor ratings, etc.)?**
  - V2 feature, skip for MVP
- [ ] **How to handle sponsored/promoted listings (often not relevant)?**
  - Filter by match score (they'll rank lower)
- [ ] **Should we track time spent per application?**
  - Optional: Add a timer when you click "Generate Materials" to prove time savings

### Scope
- [ ] **How many job boards to scrape?**
  - MVP: LinkedIn + Indeed (covers 80% of jobs)
  - V2: RemoteOK, WeWorkRemotely, YC jobs, Hacker News Who's Hiring
- [ ] **Should we auto-apply via APIs (e.g., Lever, Greenhouse)?**
  - No - too risky, ToS violations, and you lose quality control
  - Stick to manual submission after review

---

## 13. Risks & Mitigations

### Risk 1: Scrapers break due to site changes
**Likelihood:** Medium (job boards update layouts frequently)
**Impact:** High (can't source new jobs)
**Mitigation:**
- Build scrapers to be resilient (use semantic selectors, not brittle XPath)
- Have fallback to manual "Quick Add" if scraper fails
- If scraper breaks, fix within 1 day (or manually search for a few days)

### Risk 2: Account banned for scraping
**Likelihood:** Low (personal use scraping is usually tolerated)
**Impact:** Medium (lose access to LinkedIn/Indeed)
**Mitigation:**
- Scrape slowly (delays between requests)
- Don't scrape 100s of jobs at once
- Use headless mode (less detectable)
- If banned, fall back to manual search + Quick Add

### Risk 3: Generated materials are low quality
**Likelihood:** Low (Claude is good at this)
**Impact:** High (wastes time, hurts application success)
**Mitigation:**
- Always review generated materials before submitting
- Iterate on prompts until quality is high
- Have fallback to manual tailoring if generation fails

### Risk 4: Tool takes longer than 5 days to build
**Likelihood:** Medium (scope creep, unforeseen issues)
**Impact:** Medium (delays your job hunt progress)
**Mitigation:**
- Strict scope control (cut features if running behind)
- MVP is "good enough" - polish later if useful
- If Day 5 hits and it's not done, ship what you have and iterate

### Risk 5: You don't actually use it (back to manual applications)
**Likelihood:** Low (you're motivated, tool solves real problem)
**Impact:** High (wasted 5 days of build time)
**Mitigation:**
- Make it genuinely faster than manual (test early)
- If it's not saving time by Day 3, pivot or simplify
- Commit to using it for at least 2 weeks (give it a fair shot)

---

## 14. Why This Will Work

### Success Factors:
1. **Solves a real, urgent problem** - You need 100 applications in April, manual process is too slow
2. **Clear ROI** - 30+ hours saved = more time for LeetCode/system design/portfolio
3. **Fast build time** - 3-5 days is achievable, doesn't derail your job hunt
4. **Quality maintained** - Tailored apps perform better than generic ones
5. **Portfolio value** - Demonstrates skills you're interviewing for (automation, full-stack, product thinking)
6. **Ethical approach** - No ToS violations, no spam, just smarter workflow

### Comparison to Manual Process:

| Task | Manual Time | With Tool | Savings |
|------|-------------|-----------|---------|
| **Job sourcing** | 30-45 min/day | 10-15 min/day | 15-30 min/day |
| **Resume tailoring** | 10-15 min/app | 2-3 min/app | 8-12 min/app |
| **Cover letter** | 10-15 min/app | 2-3 min/app | 8-12 min/app |
| **Application tracking** | 5 min/app | 1 min/app | 4 min/app |
| **Total per application** | 25-35 min | 5-10 min | **15-25 min saved** |
| **100 applications** | 42-58 hours | 8-17 hours | **25-40 hours saved** |

**Outcome:** 25-40 hours saved in April = 6-10 extra days of LeetCode/system design prep = significantly better prepared for senior-level interviews.

---

## 15. Next Steps

### Pre-Build (Tonight/Tomorrow Morning):
- [ ] Review this PRD - does it capture the vision?
- [ ] Set up development environment (Node.js, npm, etc.)
- [ ] Get Claude API key (if you don't have one)
- [ ] Create master resume + cover letter template (have them ready for input)
- [ ] Decide: SQLite or JSON? Puppeteer or Playwright?

### Day 1 Kickoff (April 1, 2026):
- [ ] Initialize Next.js project
- [ ] Set up data model + database
- [ ] Test Claude API integration (generate one resume to prove it works)
- [ ] Build basic scraper (LinkedIn or Indeed, pick one)

### Commit to Timeline:
- [ ] Days 1-5: Build (4-6 hours/day alongside interview prep)
- [ ] Days 6-30: Use daily (3-4 applications/day = 100 by month-end)
- [ ] Iterate as needed (if something's not working, fix it fast)

---

**Document Version:** 1.0
**Date:** March 31, 2026
**Status:** Ready for Development
**First User:** Justin Bell
**Build Start:** April 1, 2026
**Target Completion:** April 5, 2026
**Success Metric:** 100 applications by April 30, 2026
