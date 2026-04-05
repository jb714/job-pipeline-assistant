'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Job, JobStatus } from '@/lib/types';
import { generateMaterialsAction, updateJobStatusAction, exportResumePDFAction } from '@/app/actions';
import { ExternalLink, Loader2, Copy, Check, Download } from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailModal({ job, open, onOpenChange }: JobDetailModalProps) {
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [status, setStatus] = useState(job?.status || 'new');
  const [notes, setNotes] = useState(job?.notes || '');
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  if (!job) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateMaterialsAction(
      job.id,
      job.description || '',
      job.company,
      job.role
    );

    if (result.success && result.resume && result.coverLetter) {
      setResume(result.resume);
      setCoverLetter(result.coverLetter);
    }
    setGenerating(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as JobStatus);
    await updateJobStatusAction(job.id, newStatus, notes);
  };

  const handleNotesChange = async () => {
    await updateJobStatusAction(job.id, status, notes);
  };

  const copyToClipboard = async (text: string, type: 'resume' | 'cover') => {
    await navigator.clipboard.writeText(text);
    if (type === 'resume') {
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    } else {
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    const result = await exportResumePDFAction(
      job.id,
      resume || job.generated_resume_path || ''
    );
    setExportingPDF(false);

    if (result.success) {
      alert(`Resume exported successfully!\n\nSaved to: generated-resumes/\n\nCheck your project folder.`);
    } else {
      alert(`Failed to export PDF: ${result.message}`);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl flex flex-wrap items-center gap-3 text-foreground">
            {job.role}
            <Badge className={getScoreColor(job.match_score)}>
              {job.match_score}% match
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {job.company} • {job.remote ? 'Remote' : job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Status</h3>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Job Posting</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(job.job_url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Job Posting
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Job Description</h3>
            <Card className="border-border bg-muted/30">
              <CardContent className="pt-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground max-h-60 overflow-y-auto">
                  {job.description}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Match */}
          {(job.required_skills.length > 0 || job.nice_to_have_skills.length > 0) && (
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Skills Found</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
                {job.nice_to_have_skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Generate Materials */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Application Materials</h3>
            {!resume && !coverLetter && !job.generated_resume_path && (
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with Claude...
                  </>
                ) : (
                  'Generate Resume & Cover Letter'
                )}
              </Button>
            )}

            {(resume || job.generated_resume_path) && (
              <Card className="mb-4 border-border bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex flex-wrap justify-between items-center gap-2 text-foreground">
                    Tailored Resume
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(resume || job.generated_resume_path || '', 'resume')
                        }
                      >
                        {copiedResume ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedResume ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                      >
                        {exportingPDF ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {exportingPDF ? 'Exporting...' : 'Export PDF'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={resume || job.generated_resume_path || ''}
                    onChange={(e) => setResume(e.target.value)}
                    className="min-h-[300px] font-mono text-sm text-foreground"
                  />
                </CardContent>
              </Card>
            )}

            {(coverLetter || job.generated_cover_letter) && (
              <Card className="border-border bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex flex-wrap justify-between items-center gap-2 text-foreground">
                    Cover Letter
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          coverLetter || job.generated_cover_letter || '',
                          'cover'
                        )
                      }
                    >
                      {copiedCoverLetter ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedCoverLetter ? 'Copied!' : 'Copy'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={coverLetter || job.generated_cover_letter || ''}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[200px] font-mono text-sm text-foreground"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesChange}
              placeholder="Add your notes about this job..."
              className="min-h-[100px] text-foreground"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
