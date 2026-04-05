import { getAllJobs } from '@/lib/db';
import { DashboardClient } from '@/components/DashboardClient';

export default function Home() {
  const jobs = getAllJobs();

  return <DashboardClient initialJobs={jobs} />;
}
