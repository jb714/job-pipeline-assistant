'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@/lib/types';

interface JobTableProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function JobTable({ jobs, onJobClick }: JobTableProps) {
  const [sortBy, setSortBy] = useState<'match_score' | 'created_at'>('match_score');

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'match_score') {
      return b.match_score - a.match_score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-gray-500';
      case 'interested':
        return 'bg-blue-500';
      case 'applied':
        return 'bg-green-500';
      case 'interviewing':
        return 'bg-purple-500';
      case 'rejected':
        return 'bg-red-500';
      case 'offer':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground text-lg">
          No jobs yet. Click "Fetch New Jobs" to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSortBy('match_score')}
            >
              Score {sortBy === 'match_score' && '↓'}
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSortBy('created_at')}
            >
              Added {sortBy === 'created_at' && '↓'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.map((job) => (
            <TableRow
              key={job.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onJobClick(job)}
            >
              <TableCell>
                <Badge className={getScoreColor(job.match_score)}>
                  {job.match_score}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{job.company}</TableCell>
              <TableCell>{job.role}</TableCell>
              <TableCell>
                {job.remote ? (
                  <Badge variant="outline">Remote</Badge>
                ) : (
                  job.location || 'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(job.status)} variant="outline">
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(job.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
