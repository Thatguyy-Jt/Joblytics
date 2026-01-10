import aiService from '../services/ai.service.js';

/**
 * AI Controller
 * 
 * Why: Handles HTTP requests and responses for AI operations.
 * Controllers are thin - they only handle HTTP concerns (extract data, format responses).
 * All AI logic is handled in the AI service.
 * 
 * Responsibilities:
 * - Extract data from HTTP requests (body)
 * - Extract userId from req.user (set by auth middleware)
 * - Call AI service for processing
 * - Format and send HTTP responses
 * - Handle HTTP-specific errors
 * 
 * AI Operations:
 * - Resume match analysis: Compares user's resume with job description
 * - Interview prep: Generates personalized interview preparation tips
 * - Resume improvement: Suggests improvements to resume bullets
 */
class AIController {
  /**
   * Analyze resume match with job description
   * POST /api/ai/resume-match
   */
  async analyzeResumeMatch(req, res) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:27',message:'analyzeResumeMatch entry',data:{hasUser:!!req.user,hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    try {
      const userId = req.user._id.toString();
      const { jobDescription, jobTitle, company } = req.body;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:33',message:'before service call',data:{userId,hasJobDesc:!!jobDescription},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const analysis = await aiService.analyzeResumeMatch(userId, {
        jobDescription,
        jobTitle,
        company,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:42',message:'service call success',data:{hasAnalysis:!!analysis,hasMatchScore:!!analysis?.matchScore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:45',message:'before res.json',data:{headersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      res.status(200).json({
        success: true,
        data: { analysis },
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:51',message:'after res.json',data:{headersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:54',message:'catch block',data:{errorName:error?.name,errorMessage:error?.message,errorStatusCode:error?.statusCode,errorStatus:error?.status,headersSent:res.headersSent,errorStack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Enhanced error logging
      console.error('=== AI Controller Error ===');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('Error StatusCode:', error.statusCode);
      console.error('Error Status:', error.status);
      console.error('Full Error Object:', error);
      console.error('Response Headers Sent:', res.headersSent);
      console.error('========================');
      
      const statusCode = error.statusCode || 500;
      // Check if response already sent
      if (res.headersSent) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai.controller.js:70',message:'response already sent',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        console.error('Cannot send error response - headers already sent');
        return;
      }
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to analyze resume match',
      });
    }
  }

  /**
   * Get interview preparation tips
   * POST /api/ai/interview-prep
   */
  async getInterviewPrep(req, res) {
    try {
      const userId = req.user._id.toString();
      const { jobDescription, jobTitle, company } = req.body;

      const tips = await aiService.getInterviewPrepTips(userId, {
        jobDescription,
        jobTitle,
        company,
      });

      res.status(200).json({
        success: true,
        data: { tips },
      });
    } catch (error) {
      console.error('AI Controller Error (interview-prep):', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate interview preparation tips',
      });
    }
  }

  /**
   * Get resume improvement suggestions
   * POST /api/ai/resume-improvement
   */
  async getResumeImprovement(req, res) {
    try {
      const userId = req.user._id.toString();
      const { resumeBullets, jobDescription, jobTitle } = req.body;

      const improvements = await aiService.getResumeImprovements(userId, {
        resumeBullets,
        jobDescription,
        jobTitle,
      });

      res.status(200).json({
        success: true,
        data: { improvements },
      });
    } catch (error) {
      console.error('AI Controller Error (resume-improvement):', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate resume improvements',
      });
    }
  }
}

export default new AIController();

