import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type {
  Job,
  JobRow,
  UserProfile,
  UserProfileRow,
  ApplicationHistory,
  JobFilters,
} from './types';

// Get database path from environment or use default
const DB_PATH = process.env.DATABASE_PATH || './database/jobs.db';

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Better performance for concurrent access
  }
  return db;
}

// Initialize database tables
export function initDatabase(): void {
  const db = getDatabase();

  // Create jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT,
      remote INTEGER DEFAULT 0,
      salary_min INTEGER,
      salary_max INTEGER,
      posted_date TEXT,
      job_url TEXT UNIQUE,
      description TEXT,
      required_skills TEXT,
      nice_to_have_skills TEXT,
      match_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      notes TEXT,
      generated_resume_path TEXT,
      generated_cover_letter TEXT,
      date_applied TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      target_roles TEXT,
      required_skills TEXT,
      nice_to_have_skills TEXT,
      location_prefs TEXT,
      salary_min INTEGER,
      company_size_prefs TEXT,
      deal_breakers TEXT,
      master_resume TEXT,
      cover_letter_template TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create application_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS application_history (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    )
  `);

  console.log('Database initialized successfully');
}

// Helper: Convert JobRow to Job
function rowToJob(row: JobRow): Job {
  return {
    ...row,
    remote: row.remote === 1,
    required_skills: row.required_skills ? JSON.parse(row.required_skills) : [],
    nice_to_have_skills: row.nice_to_have_skills ? JSON.parse(row.nice_to_have_skills) : [],
    salary_min: row.salary_min ?? undefined,
    salary_max: row.salary_max ?? undefined,
    posted_date: row.posted_date ?? undefined,
    notes: row.notes ?? undefined,
    generated_resume_path: row.generated_resume_path ?? undefined,
    generated_cover_letter: row.generated_cover_letter ?? undefined,
    date_applied: row.date_applied ?? undefined,
  };
}

// Helper: Convert Job to values for insert/update
function jobToRow(job: Partial<Job>): Partial<JobRow> {
  return {
    ...job,
    remote: job.remote !== undefined ? (job.remote ? 1 : 0) : undefined,
    required_skills: job.required_skills ? JSON.stringify(job.required_skills) : undefined,
    nice_to_have_skills: job.nice_to_have_skills ? JSON.stringify(job.nice_to_have_skills) : undefined,
  };
}

// Helper: Convert UserProfileRow to UserProfile
function rowToUserProfile(row: UserProfileRow): UserProfile {
  return {
    ...row,
    target_roles: JSON.parse(row.target_roles),
    required_skills: JSON.parse(row.required_skills),
    nice_to_have_skills: JSON.parse(row.nice_to_have_skills),
    location_prefs: JSON.parse(row.location_prefs),
    company_size_prefs: row.company_size_prefs ? JSON.parse(row.company_size_prefs) : undefined,
    deal_breakers: JSON.parse(row.deal_breakers),
    enabled_sources: row.enabled_sources ? JSON.parse(row.enabled_sources) : undefined,
    salary_min: row.salary_min ?? undefined,
  };
}

// ========== JOB CRUD FUNCTIONS ==========

export function insertJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): string {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  const jobRow = jobToRow({ ...job, id, created_at: now, updated_at: now });

  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, source, company, role, location, remote, salary_min, salary_max,
      posted_date, job_url, description, required_skills, nice_to_have_skills,
      match_score, status, notes, created_at, updated_at
    ) VALUES (
      @id, @source, @company, @role, @location, @remote, @salary_min, @salary_max,
      @posted_date, @job_url, @description, @required_skills, @nice_to_have_skills,
      @match_score, @status, @notes, @created_at, @updated_at
    )
  `);

  // Ensure all required fields are present, even if null
  const params = {
    id,
    source: jobRow.source,
    company: jobRow.company,
    role: jobRow.role,
    location: jobRow.location,
    remote: jobRow.remote,
    salary_min: jobRow.salary_min ?? null,
    salary_max: jobRow.salary_max ?? null,
    posted_date: jobRow.posted_date ?? null,
    job_url: jobRow.job_url,
    description: jobRow.description,
    required_skills: jobRow.required_skills,
    nice_to_have_skills: jobRow.nice_to_have_skills,
    match_score: jobRow.match_score ?? 0,
    status: jobRow.status ?? 'new',
    notes: jobRow.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  stmt.run(params);
  return id;
}

export function getJobById(id: string): Job | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
  const row = stmt.get(id) as JobRow | undefined;
  return row ? rowToJob(row) : null;
}

export function getAllJobs(filters?: JobFilters): Job[] {
  const db = getDatabase();

  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.minMatchScore) {
    query += ' AND match_score >= ?';
    params.push(filters.minMatchScore);
  }

  if (filters?.source) {
    query += ' AND source = ?';
    params.push(filters.source);
  }

  if (filters?.remote !== undefined) {
    query += ' AND remote = ?';
    params.push(filters.remote ? 1 : 0);
  }

  query += ' ORDER BY match_score DESC, created_at DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as JobRow[];
  return rows.map(rowToJob);
}

export function updateJobStatus(id: string, status: string, notes?: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Get old status for history
  const job = getJobById(id);
  if (!job) throw new Error(`Job ${id} not found`);

  // Update job
  const stmt = db.prepare(`
    UPDATE jobs
    SET status = ?, notes = COALESCE(?, notes), updated_at = ?
    WHERE id = ?
  `);
  stmt.run(status, notes, now, id);

  // Add to history
  const historyStmt = db.prepare(`
    INSERT INTO application_history (id, job_id, old_status, new_status, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  historyStmt.run(uuidv4(), id, job.status, status, now, notes);

  // Set date_applied if moving to 'applied' status
  if (status === 'applied' && !job.date_applied) {
    const appliedStmt = db.prepare('UPDATE jobs SET date_applied = ? WHERE id = ?');
    appliedStmt.run(now, id);
  }
}

export function updateJob(id: string, updates: Partial<Job>): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const jobRow = jobToRow({ ...updates, updated_at: now });
  const fields = Object.keys(jobRow).filter(k => k !== 'id');

  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const stmt = db.prepare(`UPDATE jobs SET ${setClause} WHERE id = @id`);

  stmt.run({ ...jobRow, id });
}

export function deleteJob(id: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  stmt.run(id);
}

// ========== USER PROFILE CRUD FUNCTIONS ==========

export function getUserProfile(): UserProfile | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM user_profile LIMIT 1');
  const row = stmt.get() as UserProfileRow | undefined;
  return row ? rowToUserProfile(row) : null;
}

export function saveUserProfile(profile: Omit<UserProfile, 'id' | 'updated_at'>): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Check if profile exists
  const existing = getUserProfile();

  const profileRow = {
    id: existing?.id || uuidv4(),
    target_roles: JSON.stringify(profile.target_roles),
    required_skills: JSON.stringify(profile.required_skills),
    nice_to_have_skills: JSON.stringify(profile.nice_to_have_skills),
    location_prefs: JSON.stringify(profile.location_prefs),
    salary_min: profile.salary_min ?? null,
    company_size_prefs: profile.company_size_prefs ? JSON.stringify(profile.company_size_prefs) : null,
    deal_breakers: JSON.stringify(profile.deal_breakers),
    enabled_sources: profile.enabled_sources ? JSON.stringify(profile.enabled_sources) : null,
    master_resume: profile.master_resume,
    cover_letter_template: profile.cover_letter_template,
    updated_at: now,
  };

  if (existing) {
    // Update existing profile
    const stmt = db.prepare(`
      UPDATE user_profile SET
        target_roles = ?, required_skills = ?, nice_to_have_skills = ?,
        location_prefs = ?, salary_min = ?, company_size_prefs = ?,
        deal_breakers = ?, enabled_sources = ?, master_resume = ?, cover_letter_template = ?,
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      profileRow.target_roles,
      profileRow.required_skills,
      profileRow.nice_to_have_skills,
      profileRow.location_prefs,
      profileRow.salary_min,
      profileRow.company_size_prefs,
      profileRow.deal_breakers,
      profileRow.enabled_sources,
      profileRow.master_resume,
      profileRow.cover_letter_template,
      profileRow.updated_at,
      profileRow.id
    );
  } else {
    // Insert new profile
    const stmt = db.prepare(`
      INSERT INTO user_profile (
        id, target_roles, required_skills, nice_to_have_skills,
        location_prefs, salary_min, company_size_prefs, deal_breakers, enabled_sources,
        master_resume, cover_letter_template, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      profileRow.id,
      profileRow.target_roles,
      profileRow.required_skills,
      profileRow.nice_to_have_skills,
      profileRow.location_prefs,
      profileRow.salary_min,
      profileRow.company_size_prefs,
      profileRow.deal_breakers,
      profileRow.enabled_sources,
      profileRow.master_resume,
      profileRow.cover_letter_template,
      profileRow.updated_at
    );
  }
}

// ========== APPLICATION HISTORY ==========

export function getApplicationHistory(jobId: string): ApplicationHistory[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM application_history WHERE job_id = ? ORDER BY date DESC');
  return stmt.all(jobId) as ApplicationHistory[];
}

// Close database connection (call on app shutdown)
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
