// Core data types for Job Pipeline Assistant

export type JobStatus =
  | 'new'
  | 'interested'
  | 'skipped'
  | 'applied'
  | 'interviewing'
  | 'rejected'
  | 'offer';

export type JobSource =
  | 'linkedin'
  | 'indeed'
  | 'remoteok'
  | 'hackernews'
  | 'manual';

export type CompanySize =
  | 'startup'
  | 'scaleup'
  | 'enterprise';

export interface Job {
  id: string;
  source: JobSource;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
  posted_date?: string;
  job_url: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  match_score: number;
  status: JobStatus;
  notes?: string;
  generated_resume_path?: string;
  generated_cover_letter?: string;
  date_applied?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  target_roles: string[];
  required_skills: string[];
  nice_to_have_skills: string[];
  location_prefs: string[];
  salary_min?: number;
  company_size_prefs?: CompanySize[];
  deal_breakers: string[];
  enabled_sources?: JobSource[];
  master_resume: string;
  cover_letter_template: string;
  updated_at: string;
}

export interface ApplicationHistory {
  id: string;
  job_id: string;
  old_status?: JobStatus;
  new_status: JobStatus;
  date: string;
  notes?: string;
}

export interface WeeklyStats {
  appliedThisWeek: number;
  totalApplied: number;
  responseRate: string;
  interviewsScheduled: number;
  offers: number;
}

export interface JobFilters {
  status?: JobStatus;
  minMatchScore?: number;
  source?: JobSource;
  remote?: boolean;
}

// Database row types (for SQLite)
export interface JobRow {
  id: string;
  source: string;
  company: string;
  role: string;
  location: string;
  remote: number; // SQLite stores boolean as 0 or 1
  salary_min: number | null;
  salary_max: number | null;
  posted_date: string | null;
  job_url: string;
  description: string;
  required_skills: string; // JSON array stored as string
  nice_to_have_skills: string; // JSON array stored as string
  match_score: number;
  status: string;
  notes: string | null;
  generated_resume_path: string | null;
  generated_cover_letter: string | null;
  date_applied: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  target_roles: string; // JSON array
  required_skills: string; // JSON array
  nice_to_have_skills: string; // JSON array
  location_prefs: string; // JSON array
  salary_min: number | null;
  company_size_prefs: string | null; // JSON array
  deal_breakers: string; // JSON array
  enabled_sources: string | null; // JSON array
  master_resume: string;
  cover_letter_template: string;
  updated_at: string;
}
