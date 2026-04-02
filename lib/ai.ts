import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Generate a tailored resume for a specific job
 */
export async function generateTailoredResume(
  masterResume: string,
  jobDescription: string
): Promise<string> {
  const prompt = `You are helping a senior software engineer tailor their resume for a specific job.

MASTER RESUME:
${masterResume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
- Highlight experience most relevant to this role
- Match keywords from job description naturally (don't keyword-stuff)
- Keep to 1-2 pages
- Maintain factual accuracy - don't invent experience
- Prioritize accomplishments that align with required skills
- Use action verbs and quantify impact where possible
- Output as clean markdown (will be converted to PDF)

OUTPUT FORMAT:
# [Your Name]
[Contact info]

## Summary
[2-3 sentence summary emphasizing relevant experience]

## Experience
[List jobs with tailored bullet points]

## Skills
[Relevant technical skills, emphasizing job description matches]

## Education
[Degrees, certifications]`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error generating resume:', error);
    throw new Error('Failed to generate tailored resume');
  }
}

/**
 * Generate a tailored cover letter for a specific job
 */
export async function generateCoverLetter(
  coverLetterTemplate: string,
  jobDescription: string,
  company: string,
  role: string
): Promise<string> {
  const prompt = `You are helping a senior software engineer write a tailored cover letter.

MASTER COVER LETTER TEMPLATE:
${coverLetterTemplate}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${company}
ROLE: ${role}

INSTRUCTIONS:
- Use the template as a guide, but customize for THIS specific role
- Keep the user's authentic voice and personal story
- Explain why this specific role/company is a fit (not generic reasons)
- Mention 1-2 specific things from the job description or company mission
- 3-4 paragraphs, max 300 words
- Professional but personable tone
- End with clear call to action (e.g., "I'd love to discuss...")

OUTPUT:
[Cover letter text, ready to paste into application]`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate tailored cover letter');
  }
}

/**
 * Test Claude API connection
 */
export async function testClaudeAPI(): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "Hello! Claude API is working correctly." and nothing else.',
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return 'API connected but unexpected response format';
  } catch (error) {
    console.error('Error testing Claude API:', error);
    throw new Error('Failed to connect to Claude API. Check your ANTHROPIC_API_KEY in .env');
  }
}
