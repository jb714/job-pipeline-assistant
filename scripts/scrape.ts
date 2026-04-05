import { runScrapers } from '../scrapers';

/**
 * Run job scrapers from command line
 *
 * Usage:
 *   npm run scrape
 *   npm run scrape -- --search="Staff Engineer" --location="San Francisco"
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  let searchTerm = 'Senior Software Engineer';
  let location = 'Remote';
  let maxJobsPerSource = 10; // Lower default to be respectful

  for (const arg of args) {
    if (arg.startsWith('--search=')) {
      searchTerm = arg.split('=')[1];
    } else if (arg.startsWith('--location=')) {
      location = arg.split('=')[1];
    } else if (arg.startsWith('--max=')) {
      maxJobsPerSource = parseInt(arg.split('=')[1]);
    }
  }

  console.log('╔════════════════════════════════════════╗');
  console.log('║   Job Pipeline Assistant - Scraper     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  try {
    const results = await runScrapers({
      searchTerm,
      location,
      maxJobsPerSource,
      sources: ['linkedin', 'indeed', 'remoteok', 'hackernews'],
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║            Summary                     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`  Scraped:    ${results.scraped} jobs`);
    console.log(`  Duplicates: ${results.duplicates} jobs`);
    console.log(`  Filtered:   ${results.filtered} jobs`);
    console.log(`  Saved:      ${results.saved} jobs`);
    console.log('');
    console.log('✅ Done! Run "npm run dev" to view jobs in the dashboard.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  }
}

main();
