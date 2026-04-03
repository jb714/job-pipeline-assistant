import type { Job, UserProfile } from './types';

/**
 * Calculate match score for a job based on user profile
 * Score: 0-100
 */
export function calculateMatchScore(job: Partial<Job>, userProfile: UserProfile): number {
  let score = 0;
  const description = job.description?.toLowerCase() || '';
  const title = job.role?.toLowerCase() || '';

  // Required skills: +10 per match (max 50 points)
  const requiredMatches = userProfile.required_skills.filter(skill =>
    description.includes(skill.toLowerCase()) || title.includes(skill.toLowerCase())
  );
  score += Math.min(requiredMatches.length * 10, 50);

  // Nice-to-have skills: +5 per match (max 25 points)
  const niceToHaveMatches = userProfile.nice_to_have_skills.filter(skill =>
    description.includes(skill.toLowerCase()) || title.includes(skill.toLowerCase())
  );
  score += Math.min(niceToHaveMatches.length * 5, 25);

  // Seniority match: +15 if "senior" or "staff" in title and user wants senior roles
  const hasSeniorTitle = /senior|staff|lead|principal/i.test(title);
  const wantsSeniorRole = userProfile.target_roles.some(role =>
    /senior|staff|lead|principal/i.test(role.toLowerCase())
  );
  if (hasSeniorTitle && wantsSeniorRole) {
    score += 15;
  }

  // Location match: +10 if matches preferences
  const locationMatch = userProfile.location_prefs.some(pref => {
    const prefLower = pref.toLowerCase();
    const locationLower = job.location?.toLowerCase() || '';
    return (
      locationLower.includes(prefLower) ||
      (prefLower === 'remote' && job.remote)
    );
  });
  if (locationMatch) {
    score += 10;
  }

  return Math.min(100, score); // Cap at 100
}

/**
 * Check if job matches any deal-breakers
 * Returns true if job is OK, false if it should be filtered out
 */
export function filterDealBreakers(job: Partial<Job>, userProfile: UserProfile): boolean {
  const description = job.description?.toLowerCase() || '';
  const company = job.company?.toLowerCase() || '';
  const title = job.role?.toLowerCase() || '';

  // Check if any deal-breaker is present
  const hasDealBreaker = userProfile.deal_breakers.some(dealBreaker => {
    const dealBreakerLower = dealBreaker.toLowerCase();
    return (
      description.includes(dealBreakerLower) ||
      company.includes(dealBreakerLower) ||
      title.includes(dealBreakerLower)
    );
  });

  return !hasDealBreaker; // Return true if NO deal-breakers found
}

/**
 * Extract skills from job description
 * Simple keyword-based extraction
 */
export function extractSkills(description: string): {
  required: string[];
  niceToHave: string[];
} {
  const descriptionLower = description.toLowerCase();

  // Common tech skills to look for
  const commonSkills = [
    'react', 'vue', 'angular', 'svelte',
    'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++',
    'node.js', 'express', 'fastify', 'nest.js',
    'next.js', 'remix', 'gatsby',
    'postgresql', 'mysql', 'mongodb', 'redis',
    'aws', 'gcp', 'azure',
    'docker', 'kubernetes', 'terraform',
    'graphql', 'rest', 'grpc',
    'system design', 'distributed systems',
    'ci/cd', 'git', 'github',
  ];

  const foundSkills = commonSkills.filter(skill =>
    descriptionLower.includes(skill.toLowerCase())
  );

  // Simple heuristic: if mentioned in "required" section, it's required
  const requiredSection = description.match(/required.*?(?=nice|preferred|bonus|$)/is)?.[0] || '';
  const requiredSkills = foundSkills.filter(skill =>
    requiredSection.toLowerCase().includes(skill.toLowerCase())
  );

  const niceToHaveSkills = foundSkills.filter(skill =>
    !requiredSkills.includes(skill)
  );

  return {
    required: requiredSkills,
    niceToHave: niceToHaveSkills,
  };
}

/**
 * Deduplicate jobs by URL or by company + role combination
 */
export function deduplicateJobs(
  newJobs: Partial<Job>[],
  existingJobs: Job[]
): Partial<Job>[] {
  const existingUrls = new Set(existingJobs.map(j => j.job_url));
  const existingKeys = new Set(
    existingJobs.map(j => `${j.company.toLowerCase()}|||${j.role.toLowerCase()}`)
  );

  return newJobs.filter(job => {
    // Filter by URL
    if (job.job_url && existingUrls.has(job.job_url)) {
      return false;
    }

    // Filter by company + role combination
    const key = `${job.company?.toLowerCase()}|||${job.role?.toLowerCase()}`;
    if (existingKeys.has(key)) {
      return false;
    }

    return true;
  });
}

/**
 * Check if salary meets minimum requirement
 */
export function checkSalaryRequirement(
  job: Partial<Job>,
  userProfile: UserProfile
): boolean {
  if (!userProfile.salary_min) return true; // No requirement
  if (!job.salary_min && !job.salary_max) return true; // No salary info, can't filter

  const jobMaxSalary = job.salary_max || job.salary_min || 0;
  return jobMaxSalary >= userProfile.salary_min;
}
