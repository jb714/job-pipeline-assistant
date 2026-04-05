import type { Job } from '@/lib/types';

/**
 * Scrape HackerNews "Who's Hiring?" monthly thread
 * Uses the official HN API (Algolia)
 */
export async function scrapeHackerNews(
  searchTerm: string,
  maxJobs: number = 20
): Promise<Partial<Job>[]> {
  console.log(`Scraping HackerNews Who's Hiring for: "${searchTerm}"`);

  try {
    // First, find the latest "Who is hiring?" post
    const searchResponse = await fetch(
      'https://hn.algolia.com/api/v1/search?query=who%20is%20hiring&tags=story'
    );

    if (!searchResponse.ok) {
      console.error(`HN API returned status: ${searchResponse.status}`);
      return [];
    }

    const searchData = await searchResponse.json();

    // Find the most recent "Who is hiring?" post (usually from beginning of month)
    // Look for the official post by filtering for ones that start with "Ask HN: Who is hiring?"
    const hiringPost = searchData.hits.find((hit: any) =>
      /^ask\s+hn:\s+who\s+is\s+hiring/i.test(hit.title)
    );

    if (!hiringPost) {
      console.log('No recent "Who is hiring?" post found');
      return [];
    }

    console.log(`Found hiring thread: "${hiringPost.title}"`);

    // Get all comments from the hiring post
    const commentsResponse = await fetch(
      `https://hn.algolia.com/api/v1/items/${hiringPost.objectID}`
    );

    if (!commentsResponse.ok) {
      console.error(`HN API returned status: ${commentsResponse.ok}`);
      return [];
    }

    const postData = await commentsResponse.json();
    const comments = postData.children || [];

    console.log(`Found ${comments.length} job postings in thread`);

    // Filter comments by search term
    const searchLower = searchTerm.toLowerCase();
    const filteredComments = comments
      .filter((comment: any) => {
        const text = (comment.text || '').toLowerCase();
        return text.includes(searchLower);
      })
      .slice(0, maxJobs);

    console.log(`Filtered to ${filteredComments.length} matching jobs`);

    // Parse comments into job objects
    const parsedJobs: Partial<Job>[] = filteredComments.map((comment: any) => {
      const text = comment.text || '';
      const parsed = parseHNJobPost(text);

      return {
        source: 'hackernews',
        company: parsed.company,
        role: parsed.role,
        location: parsed.location,
        remote: parsed.remote,
        salary_min: parsed.salaryMin,
        salary_max: parsed.salaryMax,
        posted_date: new Date(comment.created_at).toISOString(),
        job_url: `https://news.ycombinator.com/item?id=${comment.id}`,
        description: cleanHtmlText(text),
        required_skills: [],
        nice_to_have_skills: [],
        match_score: 0,
        status: 'new',
      };
    });

    return parsedJobs;
  } catch (error) {
    console.error('Error scraping HackerNews:', error);
    return [];
  }
}

/**
 * Parse a HackerNews job posting comment
 * These are free-form text, so we do our best to extract structure
 */
function parseHNJobPost(text: string): {
  company: string;
  role: string;
  location: string;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
} {
  const cleanText = cleanHtmlText(text);

  // Extract company (usually in first line or after "Company:")
  let company = 'Unknown Company';
  const companyMatch =
    cleanText.match(/^([A-Z][A-Za-z0-9\s&.]+?)(?:\s*\||:|\n)/m) ||
    cleanText.match(/Company:\s*([^\n|]+)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Extract role (look for common job titles)
  let role = 'Software Engineer';
  const rolePatterns = [
    /(?:role|position|title):\s*([^\n|]+)/i,
    /(Senior|Staff|Lead|Principal)?\s*(Software|Full[- ]?Stack|Frontend|Backend|DevOps|Data)\s*(Engineer|Developer)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      role = match[1]?.trim() || match[0]?.trim();
      break;
    }
  }

  // Extract location
  let location = 'Unknown';
  let remote = false;

  const locationMatch =
    cleanText.match(/Location:\s*([^\n|]+)/i) ||
    cleanText.match(/\|\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?)\s*\|/);

  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  // Check for remote
  if (/remote/i.test(cleanText)) {
    remote = true;
    if (location === 'Unknown') {
      location = 'Remote';
    }
  }

  // Extract salary (look for $XXXk or $XXX,XXX patterns)
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;

  const salaryMatch =
    cleanText.match(/\$(\d+)k?\s*-\s*\$?(\d+)k/i) ||
    cleanText.match(/\$(\d{3}),?(\d{3})/);

  if (salaryMatch) {
    const min = parseInt(salaryMatch[1]);
    const max = parseInt(salaryMatch[2]);

    // Convert k notation (e.g., 150k -> 150000)
    salaryMin = min < 1000 ? min * 1000 : min;
    salaryMax = max < 1000 ? max * 1000 : max;
  }

  return {
    company,
    role,
    location,
    remote,
    salaryMin,
    salaryMax,
  };
}

/**
 * Clean HTML and convert to plain text
 */
function cleanHtmlText(html: string): string {
  // Remove HTML tags but preserve line breaks
  let text = html
    .replace(/<p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&#x2F;/g, '/')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}
