'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { saveUserProfileAction } from '@/app/actions';
import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome!',
    description: 'Let\'s set up your job search preferences',
    fields: ['intro'],
  },
  {
    title: 'What are you looking for?',
    description: 'Define your target roles and preferences',
    fields: ['targetRoles', 'locationPrefs', 'salaryMin'],
  },
  {
    title: 'Your Skills',
    description: 'Help us match you with the right opportunities',
    fields: ['requiredSkills', 'niceToHaveSkills', 'dealBreakers'],
  },
  {
    title: 'Your Materials',
    description: 'Add your resume and cover letter template',
    fields: ['masterResume', 'coverLetterTemplate'],
  },
];

export function OnboardingClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [targetRoles, setTargetRoles] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState('');
  const [locationPrefs, setLocationPrefs] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [dealBreakers, setDealBreakers] = useState('');
  const [masterResume, setMasterResume] = useState('');
  const [coverLetterTemplate, setCoverLetterTemplate] = useState('');

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);

    const result = await saveUserProfileAction({
      target_roles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
      required_skills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      nice_to_have_skills: niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean),
      location_prefs: locationPrefs.split(',').map((s) => s.trim()).filter(Boolean),
      salary_min: salaryMin ? parseInt(salaryMin) : undefined,
      deal_breakers: dealBreakers.split(',').map((s) => s.trim()).filter(Boolean),
      master_resume: masterResume,
      cover_letter_template: coverLetterTemplate,
    });

    setSaving(false);

    if (result.success) {
      router.push('/');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Job Pipeline Assistant</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                This tool will help you automate your job search by scraping job boards,
                filtering opportunities, and generating tailored application materials.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔍 Find Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Automatically scrape LinkedIn and Indeed for relevant opportunities
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Smart Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Match jobs based on your skills, preferences, and deal-breakers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✨ AI-Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate tailored resumes and cover letters with Claude AI
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What roles are you targeting?
                <span className="text-muted-foreground ml-2 font-normal">
                  (comma-separated)
                </span>
              </label>
              <Textarea
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="Senior Software Engineer, Staff Engineer, Lead Engineer"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Where would you like to work?
                <span className="text-muted-foreground ml-2 font-normal">
                  (comma-separated)
                </span>
              </label>
              <Textarea
                value={locationPrefs}
                onChange={(e) => setLocationPrefs(e.target.value)}
                placeholder="Remote, San Francisco, New York"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Minimum Salary (optional)
                <span className="text-muted-foreground ml-2 font-normal">
                  (annual in USD)
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What skills are required for your ideal role?
                <span className="text-muted-foreground ml-2 font-normal">
                  (comma-separated)
                </span>
              </label>
              <Textarea
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, PostgreSQL"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jobs matching these skills will score higher
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Nice-to-have skills (optional)
                <span className="text-muted-foreground ml-2 font-normal">
                  (comma-separated)
                </span>
              </label>
              <Textarea
                value={niceToHaveSkills}
                onChange={(e) => setNiceToHaveSkills(e.target.value)}
                placeholder="Python, AWS, Docker, GraphQL"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Deal-breakers (optional)
                <span className="text-muted-foreground ml-2 font-normal">
                  (comma-separated)
                </span>
              </label>
              <Textarea
                value={dealBreakers}
                onChange={(e) => setDealBreakers(e.target.value)}
                placeholder="agency, crypto, web3, no remote"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jobs with these keywords will be automatically filtered out
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Master Resume
                <span className="text-muted-foreground ml-2 font-normal">
                  (Markdown format)
                </span>
              </label>
              <Textarea
                value={masterResume}
                onChange={(e) => setMasterResume(e.target.value)}
                placeholder="# Your Name&#10;Senior Software Engineer&#10;&#10;## Experience&#10;### Company Name | Role | Dates&#10;- Achievement 1&#10;- Achievement 2"
                className="min-h-[250px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be used to generate tailored resumes for each job
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cover Letter Template
              </label>
              <Textarea
                value={coverLetterTemplate}
                onChange={(e) => setCoverLetterTemplate(e.target.value)}
                placeholder="Dear Hiring Manager,&#10;&#10;I'm excited to apply for [ROLE] at [COMPANY]. With my background in...&#10;&#10;Best regards,&#10;Your Name"
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This template will be customized for each application
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-base">
              {STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>

              {currentStep === STEPS.length - 1 ? (
                <Button onClick={handleFinish} disabled={saving} size="lg">
                  {saving ? 'Saving...' : 'Get Started'}
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg">
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
