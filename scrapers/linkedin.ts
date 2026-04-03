import { Page } from 'puppeteer';
import type { Job } from '../lib/types';
import { randomDelay, waitForSelector } from './browser';

interface LinkedInJobListing {
  title: string;
  company: string;
  location: string;
  url: string;
}

/**
 * Scrape LinkedIn jobs search results
 * Note: LinkedIn requires authentication for most searches, so this is a simplified version
 * that works with public job search results
 */
export async function scrapeLinkedIn(
  page: Page,
  searchTerm: string = 'Senior Software Engineer',
  location: string = 'Remote',
  maxJobs: number = 20
): Promise<Partial<Job>[]> {
  console.log(`🔍 Scraping LinkedIn for: ${searchTerm} in ${location}`);

  const jobs: Partial<Job>[] = [];

  try {
    // Build search URL
    const encodedSearch = encodeURIComponent(searchTerm);
    const encodedLocation = encodeURIComponent(location);
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodedSearch}&location=${encodedLocation}&f_TPR=r86400`; // Last 24 hours

    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for job listings to load
    const hasJobs = await waitForSelector(page, '.jobs-search__results-list', 15000);

    if (!hasJobs) {
      console.log('⚠️  No job listings found on LinkedIn');
      return jobs;
    }

    // Random delay to mimic human behavior
    await randomDelay(1000, 2000);

    // Extract job card data
    const jobListings = await page.evaluate(() => {
      const listings: LinkedInJobListing[] = [];
      const jobCards = document.querySelectorAll('.base-card');

      jobCards.forEach((card) => {
        try {
          const titleElement = card.querySelector('.base-search-card__title');
          const companyElement = card.querySelector('.base-search-card__subtitle');
          const locationElement = card.querySelector('.job-search-card__location');
          const linkElement = card.querySelector('a.base-card__full-link');

          if (titleElement && companyElement && linkElement) {
            listings.push({
              title: titleElement.textContent?.trim() || '',
              company: companyElement.textContent?.trim() || '',
              location: locationElement?.textContent?.trim() || 'Not specified',
              url: (linkElement as HTMLAnchorElement).href || '',
            });
          }
        } catch (err) {
          console.error('Error parsing job card:', err);
        }
      });

      return listings;
    });

    console.log(`Found ${jobListings.length} job listings on LinkedIn`);

    // Limit to maxJobs
    const limitedListings = jobListings.slice(0, maxJobs);

    // For each job, try to get more details
    for (let i = 0; i < limitedListings.length; i++) {
      const listing = limitedListings[i];

      console.log(`📄 Processing ${i + 1}/${limitedListings.length}: ${listing.title} at ${listing.company}`);

      try {
        // Visit job detail page
        await page.goto(listing.url, { waitUntil: 'networkidle2', timeout: 20000 });
        await randomDelay(1500, 3000);

        // Extract full job description
        const jobDetails = await page.evaluate(() => {
          const descriptionElement = document.querySelector('.show-more-less-html__markup');
          return {
            description: descriptionElement?.textContent?.trim() || 'No description available',
          };
        });

        // Parse location for remote status
        const isRemote = /remote/i.test(listing.location);

        // Create job object
        const job: Partial<Job> = {
          source: 'linkedin',
          company: listing.company,
          role: listing.title,
          location: listing.location,
          remote: isRemote,
          job_url: listing.url,
          description: jobDetails.description,
          posted_date: new Date().toISOString(), // LinkedIn doesn't always show exact dates
          required_skills: [],
          nice_to_have_skills: [],
          match_score: 0, // Will be calculated later
          status: 'new',
        };

        jobs.push(job);

        // Add delay between requests to be respectful
        if (i < limitedListings.length - 1) {
          await randomDelay(2000, 4000);
        }
      } catch (error) {
        console.error(`Error fetching details for ${listing.title}:`, error);
        // Add the job anyway with limited info
        jobs.push({
          source: 'linkedin',
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

    console.log(`✅ Successfully scraped ${jobs.length} jobs from LinkedIn`);
  } catch (error) {
    console.error('❌ Error scraping LinkedIn:', error);
  }

  return jobs;
}
