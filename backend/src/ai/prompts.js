/**
 * AI Prompt Templates
 * 
 * Why: Centralized, reusable prompt templates for consistent AI interactions.
 * Well-designed prompts are critical for quality AI outputs:
 * - Clear instructions produce focused responses
 * - Structured format requests ensure parseable JSON
 * - Context inclusion improves relevance
 * - Examples guide the AI's response style
 * 
 * Prompt Design Principles:
 * 1. Be specific: Clear instructions reduce ambiguity
 * 2. Provide context: Include relevant user data and job details
 * 3. Request structure: Ask for JSON format for easy parsing
 * 4. Set boundaries: Define what to include/exclude
 * 5. Use examples: Show desired output format when helpful
 */

/**
 * Resume vs Job Description Matching Prompt
 * 
 * Why: Analyzes how well a user's resume matches a job description.
 * This prompt:
 * - Compares resume summary with job requirements
 * - Identifies strengths and gaps
 * - Provides a match score (0-100)
 * - Suggests improvements
 * 
 * Prompt Design:
 * - Clear role definition ("You are a career advisor")
 * - Structured output request (JSON format)
 * - Specific scoring criteria (0-100 scale)
 * - Actionable suggestions (not just analysis)
 */
export function getResumeMatchPrompt(resumeSummary, jobDescription, jobTitle, company) {
  return `You are a professional career advisor specializing in resume optimization and job matching.

Your task is to analyze how well a candidate's resume matches a specific job description and provide actionable feedback.

RESUME SUMMARY:
${resumeSummary || 'No resume summary provided.'}

JOB DETAILS:
- Company: ${company}
- Position: ${jobTitle}
- Job Description: ${jobDescription}

Please analyze the match and provide your response in the following JSON format:
{
  "matchScore": <number between 0-100>,
  "strengths": [<array of 3-5 key strengths that match the job>],
  "gaps": [<array of 3-5 key gaps or missing qualifications>],
  "suggestions": [<array of 3-5 actionable suggestions to improve the match>],
  "summary": "<brief 2-3 sentence summary of the overall match>"
}

Guidelines:
- Match score: 0-100 (0 = no match, 100 = perfect match)
- Be specific: Reference actual skills, experiences, or qualifications
- Be constructive: Frame gaps as opportunities for improvement
- Be actionable: Suggestions should be specific and implementable
- Focus on relevance: Prioritize skills/experiences most relevant to this role

Provide your response as valid JSON only, no additional text.`;
}

/**
 * Interview Preparation Tips Prompt
 * 
 * Why: Generates personalized interview preparation tips based on job role.
 * This prompt:
 * - Analyzes job requirements
 * - Generates role-specific questions
 * - Provides preparation strategies
 * - Suggests talking points from resume
 * 
 * Prompt Design:
 * - Role-specific focus (tailored to job title)
 * - Structured output (categories of tips)
 * - Actionable advice (not generic tips)
 * - Resume integration (connect resume to job requirements)
 */
export function getInterviewPrepPrompt(resumeSummary, jobDescription, jobTitle, company) {
  return `You are an expert interview coach specializing in technical and professional interviews.

Your task is to provide personalized interview preparation tips for a candidate applying to a specific role.

CANDIDATE BACKGROUND:
${resumeSummary || 'No resume summary provided.'}

JOB DETAILS:
- Company: ${company}
- Position: ${jobTitle}
- Job Description: ${jobDescription}

Please provide comprehensive interview preparation guidance in the following JSON format:
{
  "likelyQuestions": [<array of 5-7 questions likely to be asked for this role>],
  "technicalTopics": [<array of 3-5 technical topics/concepts to review>],
  "talkingPoints": [<array of 3-5 key points from their resume to emphasize>],
  "preparationSteps": [<array of 5-7 actionable preparation steps>],
  "questionsToAsk": [<array of 3-5 thoughtful questions to ask the interviewer>],
  "summary": "<brief 2-3 sentence overview of preparation strategy>"
}

Guidelines:
- Be specific: Questions should be relevant to this exact role and company
- Be practical: Preparation steps should be actionable
- Be personalized: Connect resume experience to job requirements
- Be comprehensive: Cover technical, behavioral, and role-specific aspects
- Be strategic: Help candidate stand out with unique talking points

Provide your response as valid JSON only, no additional text.`;
}

/**
 * Resume Improvement Suggestions Prompt
 * 
 * Why: Provides specific suggestions to improve resume bullets based on job description.
 * This prompt:
 * - Analyzes current resume bullets
 * - Compares with job requirements
 * - Suggests improved wording
 * - Maintains authenticity while highlighting relevance
 */
export function getResumeImprovementPrompt(resumeBullets, jobDescription, jobTitle) {
  return `You are a professional resume writer specializing in optimizing resume content for specific job applications.

Your task is to improve resume bullet points to better match a job description while maintaining authenticity.

CURRENT RESUME BULLETS:
${resumeBullets}

TARGET JOB:
- Position: ${jobTitle}
- Job Description: ${jobDescription}

Please provide improved resume bullets in the following JSON format:
{
  "improvedBullets": [<array of improved bullet points, one per original bullet>],
  "improvements": [<array explaining what was changed and why for each bullet>],
  "keywords": [<array of important keywords from job description to incorporate>],
  "summary": "<brief explanation of overall improvements made>"
}

Guidelines:
- Maintain truth: Only improve wording, don't add false experiences
- Use action verbs: Start bullets with strong action verbs
- Quantify results: Add numbers/metrics where possible
- Match keywords: Incorporate relevant keywords from job description naturally
- Be concise: Keep bullets to 1-2 lines each
- Show impact: Emphasize results and achievements

Provide your response as valid JSON only, no additional text.`;
}

