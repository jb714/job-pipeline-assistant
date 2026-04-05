'use server';

import { revalidatePath } from 'next/cache';
import { runScrapers } from '@/scrapers';
import { updateJobStatus, updateJob, getUserProfile, getJobById, saveUserProfile } from '@/lib/db';
import { generateTailoredResume, generateCoverLetter } from '@/lib/ai';
import { exportResumeToPDF, generatePDFFilename } from '@/lib/pdf';
import type { UserProfile } from '@/lib/types';
import path from 'path';

export async function fetchNewJobs(
  searchTerm?: string,
  location?: string
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const results = await runScrapers({
      searchTerm: searchTerm || 'Senior Software Engineer',
      location: location || 'Remote',
      maxJobsPerSource: 10,
      sources: ['linkedin', 'indeed'],
    });

    revalidatePath('/');

    return {
      success: true,
      message: `Successfully scraped ${results.saved} new jobs!`,
      count: results.saved,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      success: false,
      message: 'Failed to fetch jobs. Check console for details.',
    };
  }
}

export async function updateJobStatusAction(
  jobId: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    updateJobStatus(jobId, status, notes);
    revalidatePath('/');
    return { success: true, message: 'Job status updated!' };
  } catch (error) {
    console.error('Error updating job status:', error);
    return { success: false, message: 'Failed to update job status' };
  }
}

export async function generateMaterialsAction(
  jobId: string,
  jobDescription: string,
  company: string,
  role: string
): Promise<{
  success: boolean;
  resume?: string;
  coverLetter?: string;
  message?: string;
}> {
  try {
    const userProfile = getUserProfile();
    if (!userProfile) {
      return {
        success: false,
        message: 'User profile not found. Please set up your profile first.',
      };
    }

    // Generate resume and cover letter in parallel
    const [resume, coverLetter] = await Promise.all([
      generateTailoredResume(userProfile.master_resume, jobDescription),
      generateCoverLetter(
        userProfile.cover_letter_template,
        jobDescription,
        company,
        role
      ),
    ]);

    // Save generated materials to database
    updateJob(jobId, {
      generated_resume_path: resume,
      generated_cover_letter: coverLetter,
    });

    revalidatePath('/');

    return {
      success: true,
      resume,
      coverLetter,
    };
  } catch (error) {
    console.error('Error generating materials:', error);
    return {
      success: false,
      message: 'Failed to generate materials. Check your API key and try again.',
    };
  }
}

export async function exportResumePDFAction(
  jobId: string,
  resumeMarkdown: string
): Promise<{ success: boolean; path?: string; message?: string }> {
  try {
    const job = getJobById(jobId);
    if (!job) {
      return { success: false, message: 'Job not found' };
    }

    const filename = generatePDFFilename(job.company, job.role);
    const outputPath = path.join(process.cwd(), 'generated-resumes', filename);

    await exportResumeToPDF(resumeMarkdown, outputPath);

    // Update job with PDF path
    updateJob(jobId, {
      generated_resume_path: filename,
    });

    revalidatePath('/');

    return {
      success: true,
      path: outputPath,
      message: `Resume exported to ${filename}`,
    };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return {
      success: false,
      message: 'Failed to export PDF',
    };
  }
}

export async function saveUserProfileAction(
  profile: Omit<UserProfile, 'id' | 'updated_at'>
): Promise<{ success: boolean; message?: string }> {
  try {
    saveUserProfile(profile);
    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return {
      success: false,
      message: 'Failed to save profile',
    };
  }
}
