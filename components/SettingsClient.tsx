'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { saveUserProfileAction } from '@/app/actions';
import type { UserProfile } from '@/lib/types';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface SettingsClientProps {
  initialProfile: UserProfile | null;
}

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [targetRoles, setTargetRoles] = useState(
    initialProfile?.target_roles.join(', ') || ''
  );
  const [requiredSkills, setRequiredSkills] = useState(
    initialProfile?.required_skills.join(', ') || ''
  );
  const [niceToHaveSkills, setNiceToHaveSkills] = useState(
    initialProfile?.nice_to_have_skills.join(', ') || ''
  );
  const [locationPrefs, setLocationPrefs] = useState(
    initialProfile?.location_prefs.join(', ') || ''
  );
  const [salaryMin, setSalaryMin] = useState(
    initialProfile?.salary_min?.toString() || ''
  );
  const [dealBreakers, setDealBreakers] = useState(
    initialProfile?.deal_breakers.join(', ') || ''
  );
  const [masterResume, setMasterResume] = useState(
    initialProfile?.master_resume || ''
  );
  const [coverLetterTemplate, setCoverLetterTemplate] = useState(
    initialProfile?.cover_letter_template || ''
  );
  const [enabledSources, setEnabledSources] = useState<string[]>(
    initialProfile?.enabled_sources || ['linkedin', 'indeed', 'remoteok', 'hackernews']
  );

  const toggleSource = (source: string) => {
    setEnabledSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const result = await saveUserProfileAction({
      target_roles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
      required_skills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      nice_to_have_skills: niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean),
      location_prefs: locationPrefs.split(',').map((s) => s.trim()).filter(Boolean),
      salary_min: salaryMin ? parseInt(salaryMin) : undefined,
      deal_breakers: dealBreakers.split(',').map((s) => s.trim()).filter(Boolean),
      enabled_sources: enabledSources as any,
      master_resume: masterResume,
      cover_letter_template: coverLetterTemplate,
    });

    setSaving(false);

    if (result.success) {
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      router.refresh();
    } else {
      setMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your job search preferences and profile
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                : 'bg-primary/10 border border-primary/20 text-primary'
            }`}
          >
            {message}
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Job Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                Define what you're looking for in your next role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Roles
                  <span className="text-muted-foreground ml-2 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <Textarea
                  value={targetRoles}
                  onChange={(e) => setTargetRoles(e.target.value)}
                  placeholder="Senior Software Engineer, Staff Engineer, Lead Engineer"
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Location Preferences
                  <span className="text-muted-foreground ml-2 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <Textarea
                  value={locationPrefs}
                  onChange={(e) => setLocationPrefs(e.target.value)}
                  placeholder="Remote, San Francisco, New York"
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Salary
                  <span className="text-muted-foreground ml-2 font-normal">
                    (annual in USD, optional)
                  </span>
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Skills to match against job descriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Required Skills
                  <span className="text-muted-foreground ml-2 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <Textarea
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, PostgreSQL"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Jobs matching these skills will score higher
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nice-to-Have Skills
                  <span className="text-muted-foreground ml-2 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <Textarea
                  value={niceToHaveSkills}
                  onChange={(e) => setNiceToHaveSkills(e.target.value)}
                  placeholder="Python, AWS, Docker, GraphQL"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional skills that would be a bonus
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Deal Breakers */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Breakers</CardTitle>
              <CardDescription>
                Keywords that will automatically filter out jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={dealBreakers}
                onChange={(e) => setDealBreakers(e.target.value)}
                placeholder="agency, crypto, web3, no remote"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jobs containing these keywords will be automatically filtered out
              </p>
            </CardContent>
          </Card>

          {/* Job Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Job Sources</CardTitle>
              <CardDescription>
                Select which sites to scrape for jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { value: 'linkedin', label: 'LinkedIn', description: 'Professional network (browser-based, slower)' },
                  { value: 'indeed', label: 'Indeed', description: 'Job aggregator (may have stale listings)' },
                  { value: 'remoteok', label: 'RemoteOK', description: 'Remote-first tech jobs (fast, fresh)' },
                  { value: 'hackernews', label: 'HackerNews Who\'s Hiring', description: 'Monthly thread, high-quality startups' },
                ].map((source) => (
                  <label key={source.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabledSources.includes(source.value)}
                      onChange={() => toggleSource(source.value)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{source.label}</div>
                      <div className="text-sm text-muted-foreground">{source.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Recommended: Enable RemoteOK and HackerNews for freshest tech jobs
              </p>
            </CardContent>
          </Card>

          {/* Master Resume */}
          <Card>
            <CardHeader>
              <CardTitle>Master Resume</CardTitle>
              <CardDescription>
                Your complete resume with all experience (used to generate tailored resumes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={masterResume}
                onChange={(e) => setMasterResume(e.target.value)}
                placeholder="# Your Name&#10;Senior Software Engineer&#10;&#10;## Experience&#10;..."
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Write in Markdown format - this will be used to generate tailored resumes
              </p>
            </CardContent>
          </Card>

          {/* Cover Letter Template */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Template</CardTitle>
              <CardDescription>
                Your base cover letter (will be customized for each job)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={coverLetterTemplate}
                onChange={(e) => setCoverLetterTemplate(e.target.value)}
                placeholder="Dear Hiring Manager,&#10;&#10;I'm excited to apply for [ROLE] at [COMPANY]...&#10;&#10;Best regards,&#10;Your Name"
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This template will be customized for each specific job application
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
