import type { Job } from '@/lib/types';

/**
 * Scrape RemoteOK using their public API
 * API Docs: https://remoteok.com/api
 */
export async function scrapeRemoteOK(
  searchTerm: string,
  maxJobs: number = 20
): Promise<Partial<Job>[]> {
  console.log(`Scraping RemoteOK for: "${searchTerm}"`);

  try {
    // RemoteOK API - public, no auth needed
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'JobPipelineAssistant/1.0',
      },
    });

    if (!response.ok) {
      console.error(`RemoteOK API returned status: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // First item is metadata, skip it
    const jobs = data.slice(1);

    // Filter by search term and limit results
    const searchLower = searchTerm.toLowerCase();
    const filteredJobs = jobs
      .filter((job: any) => {
        const title = (job.position || '').toLowerCase();
        const description = (job.description || '').toLowerCase();
        const tags = (job.tags || []).join(' ').toLowerCase();

        return (
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          tags.includes(searchLower)
        );
      })
      .slice(0, maxJobs);

    console.log(`Found ${filteredJobs.length} jobs on RemoteOK`);

    // Convert to our Job format
    const parsedJobs: Partial<Job>[] = filteredJobs.map((job: any) => {
      // Parse salary if available
      let salaryMin: number | undefined;
      let salaryMax: number | undefined;

      if (job.salary_min && job.salary_max) {
        salaryMin = parseInt(job.salary_min);
        salaryMax = parseInt(job.salary_max);
      }

      return {
        source: 'remoteok',
        company: job.company || 'Unknown Company',
        role: job.position || 'Unknown Role',
        location: job.location || 'Remote',
        remote: true, // RemoteOK is all remote
        salary_min: salaryMin,
        salary_max: salaryMax,
        posted_date: job.date
          ? new Date(job.date).toISOString()
          : new Date().toISOString(),
        job_url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        description: cleanDescription(job.description || ''),
        required_skills: [],
        nice_to_have_skills: [],
        match_score: 0,
        status: 'new',
      };
    });

    return parsedJobs;
  } catch (error) {
    console.error('Error scraping RemoteOK:', error);
    return [];
  }
}

/**
 * Clean HTML description
 */
function cleanDescription(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
