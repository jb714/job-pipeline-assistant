'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { JobTable } from '@/components/JobTable';
import { JobDetailModal } from '@/components/JobDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchNewJobs } from '@/app/actions';
import type { Job } from '@/lib/types';
import { Loader2, RefreshCw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardClientProps {
  initialJobs: Job[];
}

export function DashboardClient({ initialJobs }: DashboardClientProps) {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState('');

  const jobs = initialJobs;

  const handleFetchJobs = async () => {
    setStatusMessage('Fetching jobs...');
    startTransition(async () => {
      const result = await fetchNewJobs();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setStatusMessage('');
      router.refresh();
    });
  };

  // Calculate stats
  const stats = {
    total: jobs.length,
    newJobs: jobs.filter((j) => j.status === 'new').length,
    interested: jobs.filter((j) => j.status === 'interested').length,
    applied: jobs.filter((j) => j.status === 'applied').length,
    interviewing: jobs.filter((j) => j.status === 'interviewing').length,
    avgScore:
      jobs.length > 0
        ? Math.round(jobs.reduce((sum, j) => sum + j.match_score, 0) / jobs.length)
        : 0,
  };

  const statCards = [
    { title: 'Total Jobs', value: stats.total, color: 'text-blue-600' },
    { title: 'New', value: stats.newJobs, color: 'text-gray-600' },
    { title: 'Interested', value: stats.interested, color: 'text-yellow-600' },
    { title: 'Applied', value: stats.applied, color: 'text-green-600' },
    { title: 'Interviewing', value: stats.interviewing, color: 'text-purple-600' },
    { title: 'Avg Match Score', value: `${stats.avgScore}%`, color: 'text-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Job Pipeline Assistant</h1>
              <p className="text-muted-foreground">Find, filter, and apply faster</p>
            </div>
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="outline" size="lg" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button
                onClick={handleFetchJobs}
                disabled={isPending}
                size="lg"
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching Jobs...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Fetch New Jobs
                  </>
                )}
              </Button>
            </div>
          </div>
          {statusMessage && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          )}
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Table */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">All Jobs</h2>
          <JobTable jobs={jobs} onJobClick={setSelectedJob} />
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(open) => {
            if (!open) setSelectedJob(null);
            // Refresh to get updated job data
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
