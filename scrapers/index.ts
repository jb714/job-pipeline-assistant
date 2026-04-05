import { launchBrowser, createPage } from './browser';
import { scrapeLinkedIn } from './linkedin';
import { scrapeIndeed } from './indeed';
import { scrapeRemoteOK } from './remoteok';
import { scrapeHackerNews } from './hackernews';
import { getUserProfile, getAllJobs, insertJob } from '../lib/db';
import {
  deduplicateJobs,
  calculateMatchScore,
  filterDealBreakers,
  extractSkills,
  checkSalaryRequirement,
} from '../lib/filters';
import type { Job } from '../lib/types';

export type JobSource = 'linkedin' | 'indeed' | 'remoteok' | 'hackernews';

interface ScraperOptions {
  searchTerm?: string;
  location?: string;
  maxJobsPerSource?: number;
  sources?: JobSource[];
}

/**
 * Main scraper orchestrator
 * Runs all scrapers, deduplicates, filters, and saves to database
 */
export async function runScrapers(options: ScraperOptions = {}): Promise<{
  scraped: number;
  duplicates: number;
  filtered: number;
  saved: number;
}> {
  const {
    searchTerm = 'Senior Software Engineer',
    location = 'Remote',
    maxJobsPerSource = 20,
    sources = ['linkedin', 'indeed', 'remoteok', 'hackernews'],
  } = options;

  console.log('\n🚀 Starting job scraper...\n');
  console.log(`Search: "${searchTerm}" in "${location}"`);
  console.log(`Max jobs per source: ${maxJobsPerSource}`);
  console.log(`Sources: ${sources.join(', ')}`);
  console.log('');

  let browser;
  const allScrapedJobs: Partial<Job>[] = [];

  try {
    // Get user profile for filtering
    const userProfile = getUserProfile();
    if (!userProfile) {
      console.error('❌ No user profile found. Run "npm run db:seed" first.');
      return { scraped: 0, duplicates: 0, filtered: 0, saved: 0 };
    }

    // Run API-based scrapers first (faster, no browser needed)
    if (sources.includes('remoteok')) {
      console.log('\n--- RemoteOK Scraper ---');
      const remoteOKJobs = await scrapeRemoteOK(searchTerm, maxJobsPerSource);
      allScrapedJobs.push(...remoteOKJobs);
    }

    if (sources.includes('hackernews')) {
      console.log('\n--- HackerNews Who\'s Hiring Scraper ---');
      const hackerNewsJobs = await scrapeHackerNews(searchTerm, maxJobsPerSource);
      allScrapedJobs.push(...hackerNewsJobs);
    }

    // Only launch browser if we need browser-based scrapers
    const needsBrowser = sources.includes('linkedin') || sources.includes('indeed');

    if (needsBrowser) {
      console.log('\n🌐 Launching browser...');
      browser = await launchBrowser();

      // Run LinkedIn scraper
      if (sources.includes('linkedin')) {
        console.log('\n--- LinkedIn Scraper ---');
        const page = await createPage(browser);
        const linkedInJobs = await scrapeLinkedIn(page, searchTerm, location, maxJobsPerSource);
        allScrapedJobs.push(...linkedInJobs);
        await page.close();
      }

      // Run Indeed scraper
      if (sources.includes('indeed')) {
        console.log('\n--- Indeed Scraper ---');
        const page = await createPage(browser);
        const indeedJobs = await scrapeIndeed(page, searchTerm, location, maxJobsPerSource);
        allScrapedJobs.push(...indeedJobs);
        await page.close();
      }
    }

    console.log(`\n📊 Total jobs scraped: ${allScrapedJobs.length}`);

    // Get existing jobs from database
    const existingJobs = getAllJobs();

    // Deduplicate
    console.log('\n🔍 Deduplicating jobs...');
    const uniqueJobs = deduplicateJobs(allScrapedJobs, existingJobs);
    const duplicateCount = allScrapedJobs.length - uniqueJobs.length;
    console.log(`   Duplicates removed: ${duplicateCount}`);
    console.log(`   Unique new jobs: ${uniqueJobs.length}`);

    // Filter and score jobs
    console.log('\n🎯 Filtering and scoring jobs...');
    const filteredJobs: Partial<Job>[] = [];

    for (const job of uniqueJobs) {
      // Check deal-breakers
      if (!filterDealBreakers(job, userProfile)) {
        console.log(`   ❌ Filtered out (deal-breaker): ${job.company} - ${job.role}`);
        continue;
      }

      // Check salary requirement
      if (!checkSalaryRequirement(job, userProfile)) {
        console.log(`   ❌ Filtered out (salary): ${job.company} - ${job.role}`);
        continue;
      }

      // Extract skills
      if (job.description) {
        const skills = extractSkills(job.description);
        job.required_skills = skills.required;
        job.nice_to_have_skills = skills.niceToHave;
      }

      // Calculate match score
      job.match_score = calculateMatchScore(job, userProfile);

      filteredJobs.push(job);
    }

    const filteredOutCount = uniqueJobs.length - filteredJobs.length;
    console.log(`   Jobs filtered out: ${filteredOutCount}`);
    console.log(`   Jobs to save: ${filteredJobs.length}`);

    // Save to database
    console.log('\n💾 Saving jobs to database...');
    let savedCount = 0;

    for (const job of filteredJobs) {
      try {
        // Ensure required fields are present
        if (!job.company || !job.role || !job.job_url || !job.description) {
          console.log(`   ⚠️  Skipping incomplete job: ${job.company} - ${job.role}`);
          continue;
        }

        const id = insertJob(job as Omit<Job, 'id' | 'created_at' | 'updated_at'>);
        console.log(`   ✅ Saved: ${job.company} - ${job.role} (Score: ${job.match_score})`);
        savedCount++;
      } catch (error) {
        console.error(`   ❌ Error saving job ${job.company} - ${job.role}:`, error);
      }
    }

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Total scraped: ${allScrapedJobs.length}`);
    console.log(`   Duplicates: ${duplicateCount}`);
    console.log(`   Filtered out: ${filteredOutCount}`);
    console.log(`   Saved to database: ${savedCount}\n`);

    return {
      scraped: allScrapedJobs.length,
      duplicates: duplicateCount,
      filtered: filteredOutCount,
      saved: savedCount,
    };
  } catch (error) {
    console.error('❌ Error running scrapers:', error);
    throw error;
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
      console.log('🌐 Browser closed');
    }
  }
}
