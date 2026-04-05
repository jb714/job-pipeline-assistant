import { getAllJobs, getUserProfile } from '@/lib/db';
import { DashboardClient } from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default function Home() {
  // Check if user profile exists, redirect to onboarding if not
  const userProfile = getUserProfile();
  if (!userProfile) {
    redirect('/onboarding');
  }

  const jobs = getAllJobs();

  return <DashboardClient initialJobs={jobs} />;
}
