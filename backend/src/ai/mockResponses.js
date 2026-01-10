/**
 * AI Mock Responses
 * 
 * Why: Provides realistic mock responses for AI endpoints when AI_MODE='mock'.
 * This allows development and demos without calling OpenAI API, saving costs and
 * enabling offline development.
 * 
 * Mock Strategy:
 * - Responses match the exact structure expected by the service layer
 * - Data is realistic and representative of real AI outputs
 * - All responses go through the same normalization pipeline as live responses
 * - No breaking changes to frontend - identical response shapes
 */

/**
 * Mock response for resume match analysis
 * @param {string} jobTitle - Job title for personalization
 * @param {string} company - Company name for personalization
 * @returns {Object} Mock resume match analysis
 */
export function getMockResumeMatch(jobTitle = 'Software Engineer', company = 'TechCorp') {
  return {
    matchScore: 75,
    strengths: [
      `Strong experience with JavaScript, Node.js, and React aligns well with ${company}'s tech stack`,
      'Demonstrated ability to build scalable web applications with 3+ years of professional experience',
      'Experience with cloud platforms (AWS) matches the job requirements',
      'Strong problem-solving skills evidenced by successful project deliveries',
      'Familiarity with agile development methodologies mentioned in the job description'
    ],
    gaps: [
      'Job requires 5+ years of experience, but candidate has 3 years',
      'Limited experience with TypeScript, which is preferred in the role',
      'No demonstrated experience with microservices architecture',
      'Missing experience with containerization (Docker/Kubernetes)',
      'Less experience with automated testing frameworks than desired'
    ],
    suggestions: [
      'Highlight any TypeScript learning or side projects in your resume',
      'Emphasize experience with distributed systems or scalable architectures',
      'Add metrics and quantifiable results to your project descriptions',
      'Consider obtaining AWS certification to strengthen cloud credentials',
      'Include any testing experience, even if from personal projects'
    ],
    summary: `Your resume shows a solid 75% match with the ${jobTitle} role at ${company}. Your core technical skills in JavaScript, Node.js, and React are strong matches. The main gaps are in years of experience and some specific technologies like TypeScript and microservices. Focus on highlighting transferable skills and any relevant side projects to strengthen your application.`
  };
}

/**
 * Mock response for interview preparation tips
 * @param {string} jobTitle - Job title for personalization
 * @param {string} company - Company name for personalization
 * @returns {Object} Mock interview preparation tips
 */
export function getMockInterviewPrep(jobTitle = 'Software Engineer', company = 'TechCorp') {
  return {
    likelyQuestions: [
      'Tell me about a challenging technical problem you solved and how you approached it',
      'How do you handle working in an agile development environment?',
      'Describe your experience with building scalable web applications',
      'How do you ensure code quality in your projects?',
      'Tell me about a time you had to learn a new technology quickly for a project',
      'How do you collaborate with cross-functional teams?',
      'What is your experience with cloud platforms like AWS?'
    ],
    technicalTopics: [
      'JavaScript ES6+ features and modern syntax',
      'React hooks, state management, and component architecture',
      'Node.js event loop, async/await patterns, and error handling',
      'RESTful API design principles and best practices',
      'Database design and query optimization'
    ],
    talkingPoints: [
      'Your experience building and deploying production web applications',
      'Specific projects where you improved performance or user experience',
      'Your ability to work independently and as part of a team',
      'Any contributions to open source or side projects that demonstrate passion',
      'Your approach to continuous learning and staying current with technology'
    ],
    preparationSteps: [
      'Review the company\'s tech stack and recent projects mentioned on their website',
      'Prepare 2-3 detailed STAR (Situation, Task, Action, Result) stories from your experience',
      'Practice explaining your technical projects clearly to both technical and non-technical audiences',
      'Research common interview questions for this role and prepare concise answers',
      'Prepare thoughtful questions about the team, technology stack, and growth opportunities',
      'Review your resume and be ready to discuss any project or experience in detail',
      'Practice coding problems related to algorithms and data structures if this is a technical role'
    ],
    questionsToAsk: [
      'What does success look like for this role in the first 90 days?',
      'Can you tell me about the team structure and how engineering collaborates with other departments?',
      'What are the biggest technical challenges the team is currently facing?',
      'How does the company support professional development and learning?',
      'What is the code review and deployment process like?'
    ],
    summary: `For the ${jobTitle} position at ${company}, focus on preparing detailed examples of your technical projects, especially those involving JavaScript, Node.js, and React. Be ready to discuss your problem-solving approach and how you've contributed to scalable applications. Research the company's recent work and prepare thoughtful questions that show genuine interest.`
  };
}

/**
 * Mock response for resume improvement suggestions
 * @param {Array<string>} originalBullets - Original resume bullets (for context)
 * @param {string} jobTitle - Job title for personalization
 * @returns {Object} Mock resume improvement suggestions
 */
export function getMockResumeImprovement(originalBullets = [], jobTitle = 'Software Engineer') {
  const improvedBullets = originalBullets.length > 0
    ? originalBullets.map((bullet, index) => {
        // Enhance each bullet with better action verbs and metrics
        if (bullet.toLowerCase().includes('developed') || bullet.toLowerCase().includes('built')) {
          return `Engineered and deployed scalable web applications using React and Node.js, serving 10,000+ daily active users and improving page load times by 40%`;
        }
        if (bullet.toLowerCase().includes('worked') || bullet.toLowerCase().includes('collaborated')) {
          return `Collaborated with cross-functional teams of 5+ developers to deliver high-quality software solutions using agile methodologies, reducing deployment time by 30%`;
        }
        if (bullet.toLowerCase().includes('maintained') || bullet.toLowerCase().includes('managed')) {
          return `Maintained and optimized production systems, implementing automated testing that increased code coverage to 85% and reduced bug reports by 25%`;
        }
        return `Delivered impactful ${jobTitle.toLowerCase()} solutions that improved system performance and user experience through modern web technologies`;
      })
    : [
        'Engineered scalable full-stack web applications using React, Node.js, and MongoDB, serving 10,000+ daily active users',
        'Led development of RESTful APIs and microservices architecture, reducing API response time by 40%',
        'Implemented automated testing and CI/CD pipelines, increasing deployment frequency by 3x and reducing production bugs by 30%'
      ];

  const improvements = originalBullets.length > 0
    ? originalBullets.map((bullet, index) => {
        return `Enhanced bullet ${index + 1} by adding quantifiable metrics, stronger action verbs, and specific technologies relevant to the ${jobTitle} role`;
      })
    : [
        'Added specific metrics (10,000+ users) to demonstrate scale and impact',
        'Included technical keywords (RESTful APIs, microservices) relevant to the role',
        'Emphasized results and improvements (40% reduction, 3x increase) to show value'
      ];

  return {
    improvedBullets,
    improvements,
    keywords: [
      'JavaScript',
      'Node.js',
      'React',
      'RESTful API',
      'Microservices',
      'Scalable',
      'Agile',
      'CI/CD',
      'Automated Testing',
      'Cloud Platforms'
    ],
    summary: `Improved resume bullets by incorporating quantifiable metrics, relevant technical keywords, and stronger action verbs. Each bullet now emphasizes impact and results while maintaining authenticity. The improvements better align with ${jobTitle} role requirements and highlight transferable skills.`
  };
}

