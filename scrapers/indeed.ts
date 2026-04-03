import { Page } from 'puppeteer';
import type { Job } from '../lib/types';
import { randomDelay, waitForSelector } from './browser';

interface IndeedJobListing {
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
}

/**
 * Scrape Indeed jobs search results
 */
export async function scrapeIndeed(
  page: Page,
  searchTerm: string = 'Senior Software Engineer',
  location: string = 'Remote',
  maxJobs: number = 20
): Promise<Partial<Job>[]> {
  console.log(`🔍 Scraping Indeed for: ${searchTerm} in ${location}`);

  const jobs: Partial<Job>[] = [];

  try {
    // Build search URL
    const encodedSearch = encodeURIComponent(searchTerm);
    const encodedLocation = encodeURIComponent(location);
    const url = `https://www.indeed.com/jobs?q=${encodedSearch}&l=${encodedLocation}&fromage=1`; // Last 1 day

    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for job listings to load
    const hasJobs = await waitForSelector(page, '#mosaic-provider-jobcards', 15000);

    if (!hasJobs) {
      console.log('⚠️  No job listings found on Indeed');
      return jobs;
    }

    // Random delay
    await randomDelay(1000, 2000);

    // Extract job card data
    const jobListings = await page.evaluate(() => {
      const listings: IndeedJobListing[] = [];
      const jobCards = document.querySelectorAll('.job_seen_beacon');

      jobCards.forEach((card) => {
        try {
          const titleElement = card.querySelector('h2.jobTitle a span');
          const companyElement = card.querySelector('[data-testid="company-name"]');
          const locationElement = card.querySelector('[data-testid="text-location"]');
          const linkElement = card.querySelector('h2.jobTitle a');
          const salaryElement = card.querySelector('[data-testid="attribute_snippet_testid"]');

          if (titleElement && companyElement && linkElement) {
            const jobKey = (linkElement as HTMLAnchorElement).getAttribute('data-jk') || '';
            const fullUrl = jobKey ? `https://www.indeed.com/viewjob?jk=${jobKey}` : '';

            listings.push({
              title: titleElement.textContent?.trim() || '',
              company: companyElement.textContent?.trim() || '',
              location: locationElement?.textContent?.trim() || 'Not specified',
              url: fullUrl,
              salary: salaryElement?.textContent?.trim() || undefined,
            });
          }
        } catch (err) {
          console.error('Error parsing job card:', err);
        }
      });

      return listings;
    });

    console.log(`Found ${jobListings.length} job listings on Indeed`);

    // Limit to maxJobs
    const limitedListings = jobListings.slice(0, maxJobs);

    // For each job, try to get more details
    for (let i = 0; i < limitedListings.length; i++) {
      const listing = limitedListings[i];

      if (!listing.url) {
        console.log(`⚠️  Skipping job without URL: ${listing.title}`);
        continue;
      }

      console.log(`📄 Processing ${i + 1}/${limitedListings.length}: ${listing.title} at ${listing.company}`);

      try {
        // Visit job detail page
        await page.goto(listing.url, { waitUntil: 'networkidle2', timeout: 20000 });
        await randomDelay(1500, 3000);

        // Extract full job description
        const jobDetails = await page.evaluate(() => {
          const descriptionElement = document.querySelector('#jobDescriptionText');
          return {
            description: descriptionElement?.textContent?.trim() || 'No description available',
          };
        });

        // Parse salary if available
        let salaryMin: number | undefined;
        let salaryMax: number | undefined;

        if (listing.salary) {
          const salaryMatch = listing.salary.match(/\$?([\d,]+)(?:\s*-\s*\$?([\d,]+))?/);
          if (salaryMatch) {
            salaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
            salaryMax = salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, '')) : undefined;
          }
        }

        // Parse location for remote status
        const isRemote = /remote/i.test(listing.location);

        // Create job object
        const job: Partial<Job> = {
          source: 'indeed',
          company: listing.company,
          role: listing.title,
          location: listing.location,
          remote: isRemote,
          salary_min: salaryMin,
          salary_max: salaryMax,
          job_url: listing.url,
          description: jobDetails.description,
          posted_date: new Date().toISOString(),
          required_skills: [],
          nice_to_have_skills: [],
          match_score: 0, // Will be calculated later
          status: 'new',
        };

        jobs.push(job);

        // Add delay between requests
        if (i < limitedListings.length - 1) {
          await randomDelay(2000, 4000);
        }
      } catch (error) {
        console.error(`Error fetching details for ${listing.title}:`, error);
        // Add the job anyway with limited info
        jobs.push({
          source: 'indeed',
          company: listing.company,
          role: listing.title,
          location: listing.location,
          remote: /remote/i.test(listing.location),
          job_url: listing.url,
          description: 'Unable to fetch full description',
          posted_date: new Date().toISOString(),
          required_skills: [],
          nice_to_have_skills: [],
          match_score: 0,
          status: 'new',
        });
      }
    }

    console.log(`✅ Successfully scraped ${jobs.length} jobs from Indeed`);
  } catch (error) {
    console.error('❌ Error scraping Indeed:', error);
  }

  return jobs;
}
