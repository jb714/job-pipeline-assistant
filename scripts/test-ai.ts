import { testClaudeAPI, generateTailoredResume, generateCoverLetter } from '../lib/ai';
import { getUserProfile, getJobById, getAllJobs } from '../lib/db';

async function main() {
  console.log('🧪 Testing Claude API Integration\n');

  // Test 1: Basic API connectivity
  console.log('1. Testing API connection...');
  try {
    const result = await testClaudeAPI();
    console.log('✅ API Response:', result);
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('\n⚠️  Make sure you have set ANTHROPIC_API_KEY in your .env file');
    process.exit(1);
  }

  // Test 2: Get user profile and a job
  console.log('\n2. Loading user profile and test job...');
  const profile = getUserProfile();
  if (!profile) {
    console.log('❌ No user profile found. Run "npm run db:seed" first.');
    process.exit(1);
  }
  console.log('✅ User profile loaded');

  const jobs = getAllJobs();
  if (jobs.length === 0) {
    console.log('❌ No jobs found. Run "npm run db:seed" first.');
    process.exit(1);
  }
  const testJob = jobs[0];
  console.log(`✅ Test job: ${testJob.company} - ${testJob.role}`);

  // Test 3: Generate resume
  console.log('\n3. Generating tailored resume...');
  try {
    const resume = await generateTailoredResume(profile.master_resume, testJob.description);
    console.log('✅ Resume generated successfully!');
    console.log('\n--- GENERATED RESUME ---');
    console.log(resume);
    console.log('--- END RESUME ---\n');
  } catch (error) {
    console.error('❌ Resume generation failed:', error);
  }

  // Test 4: Generate cover letter
  console.log('4. Generating tailored cover letter...');
  try {
    const coverLetter = await generateCoverLetter(
      profile.cover_letter_template,
      testJob.description,
      testJob.company,
      testJob.role
    );
    console.log('✅ Cover letter generated successfully!');
    console.log('\n--- GENERATED COVER LETTER ---');
    console.log(coverLetter);
    console.log('--- END COVER LETTER ---\n');
  } catch (error) {
    console.error('❌ Cover letter generation failed:', error);
  }

  console.log('✅ All tests completed!\n');
}

main().catch(console.error);
