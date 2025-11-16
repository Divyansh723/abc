import { GoogleGenerativeAI } from '@google/generative-ai';
import { Habit, Completion } from '../models/index.js';
import MoodEntry from '../models/MoodEntry.js';
import AIInteractionLog from '../models/AIInteractionLog.js';

class AIService {
  constructor() {
    this.currentModel = null;
    this.availableModels = [
      "gemini-2.0-flash-exp",                    // Primary: Gemini 2.0 Flash Experimental
      "gemini-2.0-flash-thinking-exp",          // Fallback 1: Gemini 2.0 Flash Thinking
      "gemini-2.5-flash-lite",                  // Fallback 2: Gemini 2.5 Flash Lite
      "gemini-2.5-flash-lite-preview-09-2025"  // Fallback 3: Gemini 2.5 Flash Lite Preview
    ];
    this.modelIndex = 0;

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      this.model = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.initializeModel();
  }

  /**
   * Initialize the AI model with comprehensive fallback options
   */
  initializeModel() {
    const modelName = this.availableModels[this.modelIndex];

    try {
      const config = {
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      };

      // Configure JSON response format for Gemini 2.0+ models that support it
      if (modelName.includes('2.0') || modelName.includes('2.5')) {
        // Use JSON mode for newer models but handle parsing gracefully
        config.generationConfig.responseMimeType = "application/json";
      }

      // Adjust parameters for different model tiers
      if (modelName.includes('lite') || modelName.includes('thinking')) {
        // Lighter or specialized models - adjust parameters
        config.generationConfig.maxOutputTokens = 1536;
        config.generationConfig.topK = 30;
      }

      // Higher quality settings for 2.5 models
      if (modelName.includes('2.5')) {
        config.generationConfig.temperature = 0.6;
        config.generationConfig.topP = 0.9;
        config.generationConfig.maxOutputTokens = 3072;
      }

      this.model = this.genAI.getGenerativeModel(config);
      this.currentModel = modelName;

      const modelTier = this.getModelTier(modelName);
      console.log(`✅ Initialized AI service with ${modelName} (${modelTier})`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${modelName}:`, error);
      this.tryNextModel();
    }
  }

  /**
   * Get model tier description for logging
   */
  getModelTier(modelName) {
    if (modelName === 'gemini-2.0-flash-exp') return 'Primary - Gemini 2.0 Flash Experimental';
    if (modelName === 'gemini-2.0-flash-thinking-exp') return 'Fallback 1 - Gemini 2.0 Flash Thinking';
    if (modelName === 'gemini-2.5-flash-lite') return 'Fallback 2 - Gemini 2.5 Flash Lite';
    if (modelName === 'gemini-2.5-flash-lite-preview-09-2025') return 'Fallback 3 - Gemini 2.5 Flash Lite Preview';
    return 'Unknown Model';
  }

  /**
   * Try the next available model if current one fails
   */
  tryNextModel() {
    this.modelIndex++;
    if (this.modelIndex < this.availableModels.length) {
      console.log(`Trying next model: ${this.availableModels[this.modelIndex]}`);
      this.initializeModel();
    } else {
      console.error('All AI models failed to initialize');
      this.model = null;
      this.currentModel = null;
    }
  }

  /**
   * Get current AI model status with tier information
   */
  getModelStatus() {
    return {
      isAvailable: !!this.model,
      currentModel: this.currentModel,
      currentModelTier: this.currentModel ? this.getModelTier(this.currentModel) : null,
      modelIndex: this.modelIndex,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      availableModels: this.availableModels.map((model, index) => ({
        name: model,
        tier: this.getModelTier(model),
        index: index,
        isCurrent: model === this.currentModel
      }))
    };
  }

  /**
   * Make AI request with comprehensive model fallback system
   */
  async makeAIRequest(prompt) {
    if (!this.model) {
      throw new Error('No AI model available - check API key and model initialization');
    }

    const maxRetries = this.availableModels.length;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const modelTier = this.getModelTier(this.currentModel);
        console.log(`🤖 Making AI request with ${this.currentModel} (${modelTier})`);

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ AI request successful with ${this.currentModel}`);
        return text;
      } catch (error) {
        lastError = error;
        const modelTier = this.getModelTier(this.currentModel);
        console.error(`❌ AI request failed with ${this.currentModel} (${modelTier}):`, error.message);

        // Try next model if available
        if (this.modelIndex < this.availableModels.length - 1) {
          console.log(`🔄 Switching to next model (${this.modelIndex + 1}/${this.availableModels.length})...`);
          this.tryNextModel();

          if (!this.model) {
            console.error('❌ Failed to initialize next model, stopping fallback chain');
            break;
          }
        } else {
          console.error('❌ All AI models exhausted, no more fallbacks available');
          break;
        }
      }
    }

    // If we get here, all models failed
    console.error('❌ All AI models failed after trying all fallbacks');
    throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generate personalized habit insights based on comprehensive user data
   */
  async generateHabitInsights(userId) {
    try {
      // Check if AI is properly initialized
      if (!this.genAI || !this.model) {
        return this.getFallbackInsights();
      }

      // Fetch comprehensive user data
      const [habits, completions, moodEntries, xpTransactions] = await Promise.all([
        Habit.find({ userId, active: true }),
        Completion.find({ userId }).sort({ completedAt: -1 }).limit(200),
        MoodEntry.find({ userId }).sort({ date: -1 }).limit(60),
        // Import XPTransaction model if available
        this.getXPTransactions ? this.getXPTransactions(userId) : []
      ]);

      // If no data available, return basic insights
      if (habits.length === 0) {
        return this.getBasicInsights();
      }

      // Prepare comprehensive data for AI analysis
      const comprehensiveData = this.prepareComprehensiveDataForAI(habits, completions, moodEntries, xpTransactions);

      const prompt = `
        YOU ARE HABITFORGE AI COACH - A specialized assistant focused EXCLUSIVELY on habit formation, 
        daily routines, and small lifestyle improvements. You do NOT provide medical, mental health, 
        financial, legal, or relationship advice.
        
        As an AI habit coach, analyze the following comprehensive user data and provide personalized insights:

        ${comprehensiveData}

        Analyze the data for:
        1. HABIT PATTERNS: Consistency, streaks, completion times, category distribution
        2. BEHAVIORAL TRENDS: Weekly/monthly patterns, seasonal changes, habit stacking
        3. MOOD CORRELATIONS: How habits affect wellbeing, energy, and stress levels
        4. PERFORMANCE METRICS: Success rates, improvement trends, plateau periods
        5. GAMIFICATION ENGAGEMENT: XP earning patterns, motivation factors
        6. OPTIMIZATION OPPORTUNITIES: Timing adjustments, habit combinations, difficulty scaling

        Please provide insights in the following JSON format:
        {
          "overallProgress": {
            "summary": "Comprehensive assessment based on all data points",
            "score": 85,
            "trend": "improving|stable|declining",
            "dataQuality": "excellent|good|limited",
            "confidenceLevel": "high|medium|low"
          },
          "keyInsights": [
            {
              "type": "strength|weakness|opportunity|pattern|correlation",
              "title": "Data-driven insight title",
              "description": "Detailed explanation with specific metrics",
              "evidence": "Supporting data points",
              "actionable": true,
              "priority": "high|medium|low",
              "category": "consistency|timing|mood|performance|motivation"
            }
          ],
          "habitRecommendations": [
            {
              "habitId": "habit_id_or_null_for_new",
              "type": "optimize|modify|new|pause|reschedule|combine",
              "title": "Data-backed recommendation",
              "description": "Specific recommendation with reasoning",
              "expectedImpact": "high|medium|low",
              "difficulty": "easy|medium|hard",
              "timeframe": "immediate|1-2weeks|1month",
              "metrics": "How to measure success"
            }
          ],
          "behavioralPatterns": {
            "bestPerformanceDays": ["Monday", "Wednesday"],
            "optimalTimes": ["morning", "evening"],
            "streakFactors": ["factors that help maintain streaks"],
            "riskFactors": ["factors that break streaks"],
            "moodCorrelations": "How habits correlate with mood data"
          },
          "motivationalMessage": "Personalized message based on actual performance data",
          "nextSteps": [
            "Specific actionable step based on data analysis",
            "Another data-driven recommendation"
          ],
          "dataInsights": {
            "totalDataPoints": "number of completions analyzed",
            "analysisTimeframe": "date range of analysis",
            "keyMetrics": "most important metrics discovered"
          }
        }

        SCOPE RESTRICTIONS:
        - Focus ONLY on habit patterns, routines, and lifestyle improvements
        - Do NOT provide medical, mental health, financial, or relationship advice
        - If data suggests concerning patterns (e.g., very low mood consistently), acknowledge it but recommend professional consultation
        - Keep all recommendations within the realm of habit formation and daily routine optimization
        
        IMPORTANT: Base ALL insights on the actual data provided. Reference specific metrics, dates, and patterns found in the user's data. Avoid generic advice - make everything personalized to their actual behavior patterns.
      `;

      const text = await this.makeAIRequest(prompt);

      // Parse JSON response
      try {
        const insights = JSON.parse(text);
        return {
          success: true,
          data: insights,
          generatedAt: new Date(),
          modelUsed: this.currentModel
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return {
          success: false,
          error: 'Failed to parse AI insights',
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('AI Service Error:', error);

      // If it's an API key error, return fallback
      if (error.message && (error.message.includes('API key') || error.message.includes('API_KEY'))) {
        console.warn('Gemini API key issue, returning fallback insights');
        return this.getFallbackInsights();
      }

      // For other errors, also return fallback instead of failing
      console.warn('AI service error, returning fallback insights:', error.message);
      return this.getFallbackInsights();
    }
  }

  /**
   * Generate smart habit suggestions based on comprehensive user data analysis
   */
  async generateHabitSuggestions(userId, userGoals = [], preferences = {}) {
    try {
      // Check if AI is properly initialized
      if (!this.genAI || !this.model) {
        return this.getFallbackHabitSuggestions();
      }

      // Fetch comprehensive user data for analysis
      const [existingHabits, completions, moodEntries] = await Promise.all([
        Habit.find({ userId }),
        Completion.find({ userId }).sort({ completedAt: -1 }).limit(100),
        MoodEntry.find({ userId }).sort({ date: -1 }).limit(30)
      ]);

      // Analyze user's current habit ecosystem
      const habitAnalysis = this.analyzeHabitEcosystem(existingHabits, completions, moodEntries);

      const prompt = `
        YOU ARE HABITFORGE AI COACH - A specialized assistant focused EXCLUSIVELY on habit formation, 
        daily routines, and small lifestyle improvements. You do NOT provide medical, mental health, 
        financial, legal, or relationship advice.
        
        Based on comprehensive analysis of the user's habit data, suggest personalized new habits.

        CURRENT HABIT ECOSYSTEM ANALYSIS:
        ${JSON.stringify(habitAnalysis, null, 2)}

        USER PREFERENCES:
        Goals: ${userGoals.join(', ') || 'General wellness and productivity'}
        Preferences: ${JSON.stringify(preferences)}

        ANALYSIS INSIGHTS:
        - Category gaps: ${habitAnalysis.categoryGaps.join(', ')}
        - Best performance times: ${habitAnalysis.bestTimes.join(', ')}
        - Success patterns: ${habitAnalysis.successPatterns.join(', ')}
        - Improvement opportunities: ${habitAnalysis.improvementAreas.join(', ')}

        Please provide exactly 3-5 data-driven habit suggestions in this exact JSON format (no additional text before or after):
        {
          "suggestions": [
            {
              "name": "Morning Hydration",
              "description": "Drink a glass of water immediately upon waking to kickstart metabolism and improve energy",
              "category": "health",
              "difficulty": "easy",
              "timeCommitment": "1-2 minutes",
              "expectedBenefits": ["Better energy", "Improved metabolism", "Enhanced focus"],
              "startingTips": ["Keep water by bedside", "Use a marked bottle", "Start with half a glass"],
              "frequency": "daily",
              "icon": "💧",
              "color": "#3B82F6",
              "reasoning": "Based on your morning routine success, this complements existing patterns"
            }
          ]
        }

        SCOPE RESTRICTIONS - ONLY SUGGEST HABITS RELATED TO:
        ✅ Daily routines and productivity (morning/evening routines, time management)
        ✅ Basic wellness practices (sleep hygiene, hydration, simple exercise)
        ✅ Habit formation techniques (habit stacking, consistency building)
        ✅ Small lifestyle improvements (organization, mindfulness, reading)
        
        DO NOT SUGGEST HABITS RELATED TO:
        ❌ Medical treatments or health interventions
        ❌ Mental health therapy or clinical practices
        ❌ Financial investments or complex financial planning
        ❌ Relationship dynamics or family therapy
        ❌ Career changes or major life decisions
        
        CRITICAL REQUIREMENTS:
        - Return ONLY valid JSON, no markdown formatting or extra text
        - Base suggestions on actual user data patterns
        - Fill category gaps identified in analysis
        - Suggest optimal timing based on user's successful completion patterns
        - Consider user's consistency patterns and suggest appropriate difficulty levels
        - Each suggestion must have all required fields
        - Use simple, achievable habits that build on existing success patterns
        - ALL suggestions must be within the allowed scope (habits and lifestyle only)
      `;

      const text = await this.makeAIRequest(prompt);

      try {
        // Clean the response text to ensure it's valid JSON
        let cleanedText = text.trim();

        // Remove any markdown code block formatting
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Try to find JSON content if there's extra text
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }

        const suggestions = JSON.parse(cleanedText);

        // Validate the response structure
        if (!suggestions.suggestions || !Array.isArray(suggestions.suggestions)) {
          console.error('Invalid suggestions structure:', suggestions);
          return this.getFallbackHabitSuggestions();
        }

        // Validate each suggestion has required fields
        const validSuggestions = suggestions.suggestions.filter(s =>
          s.name && s.description && s.category && s.difficulty &&
          s.timeCommitment && s.expectedBenefits && s.startingTips &&
          s.frequency && s.icon && s.color && s.reasoning
        );

        if (validSuggestions.length === 0) {
          console.error('No valid suggestions found');
          return this.getFallbackHabitSuggestions();
        }

        return {
          success: true,
          data: validSuggestions,
          generatedAt: new Date(),
          analysisUsed: habitAnalysis,
          modelUsed: this.currentModel
        };
      } catch (parseError) {
        console.error('Failed to parse habit suggestions:', parseError);
        console.error('Raw AI response:', text);

        // Return fallback suggestions instead of error
        return this.getFallbackHabitSuggestions();
      }
    } catch (error) {
      console.error('Habit Suggestions Error:', error);

      // If it's an API key error, return fallback
      if (error.message && (error.message.includes('API key') || error.message.includes('API_KEY'))) {
        console.warn('Gemini API key issue, returning fallback suggestions');
        return this.getFallbackHabitSuggestions();
      }

      // For other errors, also return fallback instead of failing
      console.warn('AI service error, returning fallback suggestions:', error.message);
      return this.getFallbackHabitSuggestions();
    }
  }

  /**
   * Analyze habit patterns and predict optimal timing
   */
  async analyzeHabitPatterns(userId, habitId) {
    try {
      const completions = await Completion.find({ userId, habitId })
        .sort({ completedAt: -1 })
        .limit(100);

      if (completions.length < 3) {
        return {
          success: false,
          error: 'Insufficient data for pattern analysis. Need at least 3 completions.'
        };
      }

      const patternData = this.extractPatternData(completions);

      const prompt = `
        Analyze the following habit completion patterns and provide insights:

        ${JSON.stringify(patternData, null, 2)}

        Provide analysis in JSON format:
        {
          "patterns": {
            "bestDays": ["Monday", "Tuesday"],
            "bestTimes": ["morning", "evening"],
            "consistencyScore": 85,
            "streakPatterns": "description of streak behavior"
          },
          "predictions": {
            "optimalSchedule": "When to do this habit for best results",
            "riskFactors": ["factors that might break streaks"],
            "successFactors": ["factors that help maintain streaks"]
          },
          "recommendations": [
            "Specific actionable recommendation"
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text);
        return {
          success: true,
          data: analysis,
          generatedAt: new Date()
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse pattern analysis'
        };
      }
    } catch (error) {
      console.error('Pattern Analysis Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze patterns'
      };
    }
  }

  /**
   * Generate personalized motivational content based on comprehensive user data
   * WITH AI INTERACTION LOGGING
   */
  async generateMotivationalContent(userId, context = 'daily', requestMetadata = {}) {
    const startTime = Date.now();
    const userChallenge = requestMetadata.challenge || null;
    const userContext = requestMetadata.context || null;

    let logData = {
      userId,
      interactionType: 'motivational_content',
      context,
      requestData: {
        context,
        challenge: userChallenge,
        userContext,
        timestamp: new Date()
      },
      userAgent: requestMetadata.userAgent || null,
      ipAddress: requestMetadata.ipAddress || null
    };

    try {
      // Fetch comprehensive data for personalized motivation
      const [habits, recentCompletions, moodEntries, allCompletions] = await Promise.all([
        Habit.find({ userId, active: true }),
        Completion.find({
          userId,
          completedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }),
        MoodEntry.find({ userId }).sort({ date: -1 }).limit(7),
        Completion.find({ userId }).sort({ completedAt: -1 }).limit(100)
      ]);

      // Analyze user's current state and progress
      const motivationData = this.analyzeMotivationContext(habits, recentCompletions, moodEntries, allCompletions, context);

      const prompt = `
        YOU ARE HABITFORGE AI COACH - A specialized assistant focused EXCLUSIVELY on habit formation, 
        daily routines, and small lifestyle improvements. You do NOT provide medical, mental health, 
        financial, legal, or relationship advice.
        
        Generate highly personalized motivational content based on detailed user analysis:

        USER MOTIVATION CONTEXT:
        ${JSON.stringify(motivationData, null, 2)}

        CURRENT SITUATION:
        - Context: ${context}
        - Today's performance: ${motivationData.todayPerformance}
        - Recent trends: ${motivationData.recentTrends}
        - Emotional state: ${motivationData.emotionalContext}
        - Achievement highlights: ${motivationData.achievements.join(', ')}
        - Areas needing support: ${motivationData.challengeAreas.join(', ')}

        ${userChallenge ? `
        USER'S SPECIFIC QUESTION/CHALLENGE:
        "${userChallenge}"
        
        IMPORTANT: Your response MUST directly address this specific question or challenge. 
        Use the user's data and context to provide a personalized, actionable answer.
        ` : ''}

        ${userContext ? `
        ADDITIONAL CONTEXT PROVIDED BY USER:
        "${userContext}"
        ` : ''}

        CRITICAL: YOU ARE A HABIT & LIFESTYLE COACH ONLY
        
        SCOPE RESTRICTIONS - YOU MUST ONLY PROVIDE ADVICE ON:
        ✅ Habit formation and maintenance
        ✅ Daily routines and productivity
        ✅ Small lifestyle improvements
        ✅ Motivation and consistency strategies
        ✅ Time management and organization
        ✅ Basic wellness practices (sleep hygiene, exercise routines, simple nutrition habits)
        
        PROHIBITED TOPICS - YOU MUST NOT PROVIDE ADVICE ON:
        ❌ Medical conditions, diagnoses, or treatment
        ❌ Mental health disorders or therapy
        ❌ Financial investment or legal matters
        ❌ Relationship counseling or family therapy
        ❌ Career decisions or major life changes
        ❌ Substance abuse or addiction treatment
        
        SAFETY REQUIREMENTS:
        - If the user's question touches on sensitive areas (mental health, medical, etc.), you MUST include a professional consultation disclaimer
        - For mental health concerns, add: "If you're experiencing persistent mood issues, anxiety, or depression, please reach out to a mental health professional."
        - For medical concerns, add: "For health concerns beyond basic wellness habits, please consult with a qualified healthcare professional."
        - For other sensitive topics, add: "For concerns beyond habit formation, please consult with a qualified professional."
        - If a question is completely outside your scope, politely redirect to habit-related topics and suggest professional consultation
        
        Generate motivational content in JSON format:
        {
          "message": "Highly personalized main message based on user's specific situation and data (habit-focused only)",
          "tone": "encouraging|celebratory|supportive|energizing|gentle|empowering",
          "quote": "Relevant inspirational quote that matches their current situation",
          "tips": ["data-driven practical tip 1 (habit-related)", "personalized practical tip 2 (habit-related)"],
          "challenge": "Specific habit-related challenge based on their patterns and current performance",
          "affirmation": "Personal affirmation statement reflecting their habit journey and strengths",
          "celebration": "specific habit achievement or progress to celebrate",
          "encouragement": "targeted encouragement for their current habit challenges",
          "dataInsight": "positive insight derived from their actual habit data",
          "nextMilestone": "next achievable habit milestone based on their progress",
          "disclaimer": "Professional consultation disclaimer if the topic requires it (optional, only include if user's question touches sensitive areas)"
        }

        PERSONALIZATION REQUIREMENTS:
        - Reference specific achievements from their data
        - Address current challenges with empathy and practical solutions
        - Acknowledge their unique patterns and progress
        - Provide context-appropriate motivation (daily check-in vs coaching session)
        - Use their actual performance metrics to craft encouraging messages
        - Suggest realistic next steps based on their current trajectory
        - Celebrate specific streaks, improvements, or consistency patterns
      `;

      const text = await this.makeAIRequest(prompt);

      try {
        const content = JSON.parse(text);
        const responseTime = Date.now() - startTime;

        const result = {
          success: true,
          data: {
            ...content,
            personalizedFor: context,
            basedOnData: {
              habits: habits.length,
              completions: allCompletions.length,
              moodEntries: moodEntries.length,
              analysisDate: new Date()
            }
          },
          generatedAt: new Date()
        };

        // Log successful interaction
        logData.success = true;
        logData.responseTime = responseTime;
        logData.modelUsed = this.currentModel;
        logData.responseData = {
          tone: content.tone,
          hasChallenge: !!content.challenge,
          dataPointsUsed: habits.length + allCompletions.length + moodEntries.length
        };

        await AIInteractionLog.logInteraction(logData);

        return result;
      } catch (parseError) {
        console.error('Failed to parse motivational content:', parseError);

        // Log parsing failure
        logData.success = false;
        logData.errorMessage = 'Failed to parse AI response';
        logData.responseTime = Date.now() - startTime;
        await AIInteractionLog.logInteraction(logData);

        return this.getFallbackMotivationalContent(motivationData);
      }
    } catch (error) {
      console.error('Motivational Content Error:', error);

      // Log error
      logData.success = false;
      logData.errorMessage = error.message || 'Unknown error';
      logData.responseTime = Date.now() - startTime;
      await AIInteractionLog.logInteraction(logData);

      return this.getFallbackMotivationalContent();
    }
  }

  /**
   * Analyze mood-habit correlations
   */
  async analyzeMoodHabitCorrelation(userId) {
    try {
      const moodEntries = await MoodEntry.find({ userId })
        .sort({ date: -1 })
        .limit(60);

      const completions = await Completion.find({ userId })
        .sort({ completedAt: -1 })
        .limit(200);

      if (moodEntries.length < 10 || completions.length < 20) {
        return {
          success: false,
          error: 'Insufficient data for mood-habit correlation analysis'
        };
      }

      const correlationData = this.prepareMoodHabitData(moodEntries, completions);

      const prompt = `
        Analyze the correlation between mood and habit completion:

        ${JSON.stringify(correlationData, null, 2)}

        Provide analysis in JSON format:
        {
          "correlations": [
            {
              "habitName": "Exercise",
              "moodImpact": "positive|negative|neutral",
              "strength": "strong|moderate|weak",
              "description": "How this habit affects mood"
            }
          ],
          "insights": [
            "Key insight about mood-habit relationship"
          ],
          "recommendations": [
            "Actionable recommendation based on correlations"
          ],
          "moodPatterns": {
            "bestMoodDays": ["Monday", "Friday"],
            "challengingDays": ["Wednesday"],
            "moodTrends": "Overall mood trend description"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text);
        return {
          success: true,
          data: analysis,
          generatedAt: new Date()
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse mood-habit correlation'
        };
      }
    } catch (error) {
      console.error('Mood-Habit Correlation Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze mood-habit correlation'
      };
    }
  }

  /**
   * Helper method to prepare comprehensive data for AI analysis
   */
  prepareComprehensiveDataForAI(habits, completions, moodEntries, xpTransactions = []) {
    // Enhanced habit statistics with performance metrics
    const habitStats = habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId.toString() === habit._id.toString());
      const last30Days = habitCompletions.filter(c =>
        new Date(c.completedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      return {
        id: habit._id,
        name: habit.name,
        category: habit.category,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalCompletions: habit.totalCompletions,
        consistencyRate: habit.consistencyRate,
        createdAt: habit.createdAt,
        recentPerformance: {
          last30DaysCompletions: last30Days.length,
          last30DaysRate: Math.round((last30Days.length / 30) * 100),
          averageCompletionTime: this.calculateAverageCompletionTime(habitCompletions),
          bestCompletionDays: this.getBestCompletionDays(habitCompletions),
          completionTimePattern: this.getCompletionTimePattern(habitCompletions)
        }
      };
    });

    // Enhanced completion analysis with patterns
    const completionAnalysis = {
      totalCompletions: completions.length,
      timeRange: {
        earliest: completions[completions.length - 1]?.completedAt,
        latest: completions[0]?.completedAt
      },
      weeklyPatterns: this.analyzeWeeklyPatterns(completions),
      dailyPatterns: this.analyzeDailyPatterns(completions),
      categoryDistribution: this.analyzeCategoryDistribution(completions, habits),
      streakAnalysis: this.analyzeStreakPatterns(habits, completions),
      consistencyTrends: this.analyzeConsistencyTrends(completions)
    };

    // Enhanced mood analysis with correlations
    const moodAnalysis = {
      entries: moodEntries.map(mood => ({
        date: mood.date,
        mood: mood.mood,
        energy: mood.energy,
        stress: mood.stress,
        dayOfWeek: new Date(mood.date).getDay(),
        habitsCompletedThatDay: completions.filter(c =>
          new Date(c.completedAt).toDateString() === new Date(mood.date).toDateString()
        ).length
      })),
      averages: {
        mood: moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length || 0,
        energy: moodEntries.reduce((sum, m) => sum + m.energy, 0) / moodEntries.length || 0,
        stress: moodEntries.reduce((sum, m) => sum + m.stress, 0) / moodEntries.length || 0
      },
      trends: this.analyzeMoodTrends(moodEntries),
      habitCorrelations: this.analyzeMoodHabitCorrelations(moodEntries, completions)
    };

    // Gamification and motivation analysis
    const gamificationAnalysis = {
      xpTransactions: xpTransactions.slice(0, 50),
      motivationPatterns: this.analyzeMotivationPatterns(xpTransactions, completions),
      engagementMetrics: this.calculateEngagementMetrics(completions, habits)
    };

    // Performance benchmarks and goals
    const performanceAnalysis = {
      overallConsistency: habits.reduce((sum, h) => sum + h.consistencyRate, 0) / habits.length || 0,
      categoryBalance: this.analyzeCategoryBalance(habits),
      improvementAreas: this.identifyImprovementAreas(habits, completions),
      successFactors: this.identifySuccessFactors(habits, completions, moodEntries)
    };

    return JSON.stringify({
      userProfile: {
        totalActiveHabits: habits.length,
        accountAge: this.calculateAccountAge(habits),
        experienceLevel: this.determineExperienceLevel(habits, completions)
      },
      habits: habitStats,
      completionAnalysis,
      moodAnalysis,
      gamificationAnalysis,
      performanceAnalysis,
      analysisMetadata: {
        dataPoints: completions.length + moodEntries.length,
        analysisDate: new Date(),
        timeframeAnalyzed: this.calculateAnalysisTimeframe(completions, moodEntries)
      }
    }, null, 2);
  }

  /**
   * Helper method to prepare habit data for AI analysis (legacy support)
   */
  prepareHabitDataForAI(habits, completions, moodEntries) {
    return this.prepareComprehensiveDataForAI(habits, completions, moodEntries);
  }

  /**
   * Extract pattern data from completions
   */
  extractPatternData(completions) {
    const dayPatterns = {};
    const hourPatterns = {};
    const streakData = [];

    completions.forEach(completion => {
      const date = new Date(completion.completedAt);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayPatterns[dayOfWeek] = (dayPatterns[dayOfWeek] || 0) + 1;
      hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;
    });

    return {
      dayPatterns,
      hourPatterns,
      totalCompletions: completions.length,
      dateRange: {
        start: completions[completions.length - 1]?.completedAt,
        end: completions[0]?.completedAt
      }
    };
  }

  /**
   * Prepare mood-habit correlation data
   */
  prepareMoodHabitData(moodEntries, completions) {
    const dailyData = {};

    // Group mood entries by date
    moodEntries.forEach(mood => {
      const dateKey = mood.date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        mood: mood.mood,
        energy: mood.energy,
        stress: mood.stress,
        habits: []
      };
    });

    // Add completions to daily data
    completions.forEach(completion => {
      const dateKey = completion.completedAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].habits.push({
          habitId: completion.habitId,
          completedAt: completion.completedAt
        });
      }
    });

    return dailyData;
  }

  /**
   * Fallback insights when AI is not available
   */
  getFallbackInsights() {
    return {
      success: true,
      data: {
        overallProgress: {
          summary: "Keep building your habits consistently. Every small step counts towards your long-term success.",
          score: 75,
          trend: "stable"
        },
        keyInsights: [
          {
            type: "pattern",
            title: "Consistency is Key",
            description: "Focus on completing your habits daily, even if it's just a small version.",
            actionable: true,
            priority: "high"
          },
          {
            type: "opportunity",
            title: "Track Your Progress",
            description: "Regular tracking helps identify patterns and maintain motivation.",
            actionable: true,
            priority: "medium"
          }
        ],
        habitRecommendations: [
          {
            type: "optimize",
            title: "Start Small",
            description: "Begin with the smallest possible version of your habit to build consistency.",
            expectedImpact: "high",
            difficulty: "easy"
          }
        ],
        motivationalMessage: "You're on the right track! Every habit you complete is a step towards a better you.",
        nextSteps: [
          "Focus on consistency over perfection",
          "Celebrate small wins along the way",
          "Track your progress regularly"
        ]
      },
      generatedAt: new Date()
    };
  }

  /**
   * Basic insights for new users
   */
  getBasicInsights() {
    return {
      success: true,
      data: {
        overallProgress: {
          summary: "Welcome to your habit journey! Start by creating your first habit and building consistency.",
          score: 0,
          trend: "improving"
        },
        keyInsights: [
          {
            type: "opportunity",
            title: "Create Your First Habit",
            description: "Start with one simple habit that you can do consistently every day.",
            actionable: true,
            priority: "high"
          }
        ],
        habitRecommendations: [
          {
            type: "new",
            title: "Start with a Keystone Habit",
            description: "Choose a habit that will naturally lead to other positive behaviors.",
            expectedImpact: "high",
            difficulty: "easy"
          }
        ],
        motivationalMessage: "Every expert was once a beginner. Start your journey today!",
        nextSteps: [
          "Create your first habit",
          "Set a specific time to do it",
          "Start with just 2 minutes a day"
        ]
      },
      generatedAt: new Date()
    };
  }

  // ===== COMPREHENSIVE DATA ANALYSIS HELPER METHODS =====

  calculateAverageCompletionTime(completions) {
    if (completions.length === 0) return null;
    const hours = completions.map(c => new Date(c.completedAt).getHours());
    const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    return Math.round(avgHour);
  }

  getBestCompletionDays(completions) {
    const dayCount = {};
    completions.forEach(c => {
      const day = new Date(c.completedAt).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => days[parseInt(day)]);
  }

  getCompletionTimePattern(completions) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    completions.forEach(c => {
      const hour = new Date(c.completedAt).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
    });

    return Object.entries(timeSlots)
      .sort(([, a], [, b]) => b - a)
      .map(([slot]) => slot);
  }

  analyzeWeeklyPatterns(completions) {
    const weeklyData = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    days.forEach(day => weeklyData[day] = 0);

    completions.forEach(c => {
      const day = days[new Date(c.completedAt).getDay()];
      weeklyData[day]++;
    });

    const sortedDays = Object.entries(weeklyData).sort(([, a], [, b]) => b - a);

    return {
      bestDays: sortedDays.slice(0, 3).map(([day]) => day),
      worstDays: sortedDays.slice(-2).map(([day]) => day),
      weekendVsWeekday: this.compareWeekendVsWeekday(weeklyData)
    };
  }

  compareWeekendVsWeekday(weeklyData) {
    const weekendTotal = weeklyData['Saturday'] + weeklyData['Sunday'];
    const weekdayTotal = Object.entries(weeklyData)
      .filter(([day]) => !['Saturday', 'Sunday'].includes(day))
      .reduce((sum, [, count]) => sum + count, 0);

    return {
      weekendAverage: weekendTotal / 2,
      weekdayAverage: weekdayTotal / 5,
      preference: weekendTotal / 2 > weekdayTotal / 5 ? 'weekend' : 'weekday'
    };
  }

  analyzeDailyPatterns(completions) {
    const hourlyData = {};
    for (let i = 0; i < 24; i++) hourlyData[i] = 0;

    completions.forEach(c => {
      const hour = new Date(c.completedAt).getHours();
      hourlyData[hour]++;
    });

    const peakHours = Object.entries(hourlyData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      peakHours,
      morningActivity: this.sumHourRange(hourlyData, 5, 12),
      afternoonActivity: this.sumHourRange(hourlyData, 12, 17),
      eveningActivity: this.sumHourRange(hourlyData, 17, 22),
      nightActivity: this.sumHourRange(hourlyData, 22, 5)
    };
  }

  sumHourRange(hourlyData, start, end) {
    let sum = 0;
    if (start < end) {
      for (let i = start; i < end; i++) sum += hourlyData[i] || 0;
    } else {
      for (let i = start; i < 24; i++) sum += hourlyData[i] || 0;
      for (let i = 0; i < end; i++) sum += hourlyData[i] || 0;
    }
    return sum;
  }

  analyzeCategoryDistribution(completions, habits) {
    const categoryCount = {};
    const habitCategories = {};

    habits.forEach(h => habitCategories[h._id.toString()] = h.category);

    completions.forEach(c => {
      const category = habitCategories[c.habitId.toString()] || 'unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    const distribution = {};

    Object.entries(categoryCount).forEach(([category, count]) => {
      distribution[category] = {
        count,
        percentage: Math.round((count / total) * 100)
      };
    });

    return distribution;
  }

  analyzeStreakPatterns(habits, completions) {
    const streakData = {
      totalActiveStreaks: habits.filter(h => h.currentStreak > 0).length,
      longestCurrentStreak: Math.max(...habits.map(h => h.currentStreak), 0),
      averageStreak: habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length || 0,
      streakDistribution: this.getStreakDistribution(habits),
      streakBreakPatterns: this.analyzeStreakBreaks(habits, completions)
    };

    return streakData;
  }

  getStreakDistribution(habits) {
    const ranges = { '0': 0, '1-7': 0, '8-30': 0, '31-90': 0, '90+': 0 };

    habits.forEach(h => {
      const streak = h.currentStreak;
      if (streak === 0) ranges['0']++;
      else if (streak <= 7) ranges['1-7']++;
      else if (streak <= 30) ranges['8-30']++;
      else if (streak <= 90) ranges['31-90']++;
      else ranges['90+']++;
    });

    return ranges;
  }

  analyzeStreakBreaks(habits, completions) {
    // Analyze patterns in streak breaks (simplified)
    const habitsWithBreaks = habits.filter(h => h.longestStreak > h.currentStreak);
    return {
      habitsWithBrokenStreaks: habitsWithBreaks.length,
      averageLongestStreak: habitsWithBreaks.reduce((sum, h) => sum + h.longestStreak, 0) / habitsWithBreaks.length || 0
    };
  }

  analyzeConsistencyTrends(completions) {
    // Group completions by week and analyze trends
    const weeklyCompletions = {};

    completions.forEach(c => {
      const weekStart = this.getWeekStart(new Date(c.completedAt));
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyCompletions[weekKey] = (weeklyCompletions[weekKey] || 0) + 1;
    });

    const weeks = Object.keys(weeklyCompletions).sort();
    const recentWeeks = weeks.slice(-8); // Last 8 weeks

    if (recentWeeks.length < 2) return { trend: 'insufficient_data' };

    const firstHalf = recentWeeks.slice(0, Math.floor(recentWeeks.length / 2));
    const secondHalf = recentWeeks.slice(Math.floor(recentWeeks.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, week) => sum + weeklyCompletions[week], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, week) => sum + weeklyCompletions[week], 0) / secondHalf.length;

    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return {
      trend: trendPercentage > 10 ? 'improving' : trendPercentage < -10 ? 'declining' : 'stable',
      trendPercentage: Math.round(trendPercentage),
      weeklyAverage: Object.values(weeklyCompletions).reduce((sum, count) => sum + count, 0) / weeks.length
    };
  }

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  analyzeMoodTrends(moodEntries) {
    if (moodEntries.length < 7) return { trend: 'insufficient_data' };

    const recentEntries = moodEntries.slice(0, 14); // Last 2 weeks
    const firstWeek = recentEntries.slice(7, 14);
    const secondWeek = recentEntries.slice(0, 7);

    const firstWeekAvg = {
      mood: firstWeek.reduce((sum, m) => sum + m.mood, 0) / firstWeek.length,
      energy: firstWeek.reduce((sum, m) => sum + m.energy, 0) / firstWeek.length,
      stress: firstWeek.reduce((sum, m) => sum + m.stress, 0) / firstWeek.length
    };

    const secondWeekAvg = {
      mood: secondWeek.reduce((sum, m) => sum + m.mood, 0) / secondWeek.length,
      energy: secondWeek.reduce((sum, m) => sum + m.energy, 0) / secondWeek.length,
      stress: secondWeek.reduce((sum, m) => sum + m.stress, 0) / secondWeek.length
    };

    return {
      moodTrend: secondWeekAvg.mood > firstWeekAvg.mood ? 'improving' : 'declining',
      energyTrend: secondWeekAvg.energy > firstWeekAvg.energy ? 'improving' : 'declining',
      stressTrend: secondWeekAvg.stress < firstWeekAvg.stress ? 'improving' : 'declining',
      moodChange: Math.round((secondWeekAvg.mood - firstWeekAvg.mood) * 10) / 10,
      energyChange: Math.round((secondWeekAvg.energy - firstWeekAvg.energy) * 10) / 10,
      stressChange: Math.round((secondWeekAvg.stress - firstWeekAvg.stress) * 10) / 10
    };
  }

  analyzeMoodHabitCorrelations(moodEntries, completions) {
    const correlations = {};

    moodEntries.forEach(mood => {
      const moodDate = new Date(mood.date).toDateString();
      const dayCompletions = completions.filter(c =>
        new Date(c.completedAt).toDateString() === moodDate
      ).length;

      if (!correlations[dayCompletions]) {
        correlations[dayCompletions] = { moods: [], energies: [], stresses: [] };
      }

      correlations[dayCompletions].moods.push(mood.mood);
      correlations[dayCompletions].energies.push(mood.energy);
      correlations[dayCompletions].stresses.push(mood.stress);
    });

    // Calculate averages for each completion count
    const correlationData = {};
    Object.entries(correlations).forEach(([completionCount, data]) => {
      correlationData[completionCount] = {
        avgMood: data.moods.reduce((sum, m) => sum + m, 0) / data.moods.length,
        avgEnergy: data.energies.reduce((sum, e) => sum + e, 0) / data.energies.length,
        avgStress: data.stresses.reduce((sum, s) => sum + s, 0) / data.stresses.length,
        sampleSize: data.moods.length
      };
    });

    return correlationData;
  }

  analyzeMotivationPatterns(xpTransactions, completions) {
    // Analyze XP earning patterns and motivation
    return {
      totalXPEarned: xpTransactions.reduce((sum, xp) => sum + (xp.amount || 0), 0),
      xpPerCompletion: xpTransactions.length > 0 ?
        xpTransactions.reduce((sum, xp) => sum + (xp.amount || 0), 0) / completions.length : 0,
      motivationLevel: this.calculateMotivationLevel(xpTransactions, completions)
    };
  }

  calculateMotivationLevel(xpTransactions, completions) {
    // Simple motivation calculation based on recent activity
    const recentCompletions = completions.filter(c =>
      new Date(c.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (recentCompletions >= 10) return 'high';
    if (recentCompletions >= 5) return 'medium';
    return 'low';
  }

  calculateEngagementMetrics(completions, habits) {
    const totalPossibleCompletions = habits.length * 30; // 30 days
    const actualCompletions = completions.filter(c =>
      new Date(c.completedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      engagementRate: totalPossibleCompletions > 0 ?
        Math.round((actualCompletions / totalPossibleCompletions) * 100) : 0,
      dailyAverage: actualCompletions / 30,
      consistency: this.calculateConsistencyScore(completions, habits)
    };
  }

  calculateConsistencyScore(completions, habits) {
    // Calculate how consistently user completes habits
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayCompletions = completions.filter(c =>
        new Date(c.completedAt).toDateString() === date.toDateString()
      ).length;
      last30Days.push(dayCompletions);
    }

    const daysWithCompletions = last30Days.filter(count => count > 0).length;
    return Math.round((daysWithCompletions / 30) * 100);
  }

  analyzeCategoryBalance(habits) {
    const categories = {};
    habits.forEach(h => {
      categories[h.category] = (categories[h.category] || 0) + 1;
    });

    const total = habits.length;
    const balance = {};
    Object.entries(categories).forEach(([category, count]) => {
      balance[category] = Math.round((count / total) * 100);
    });

    return balance;
  }

  identifyImprovementAreas(habits, completions) {
    const areas = [];

    // Low consistency habits
    const lowConsistencyHabits = habits.filter(h => h.consistencyRate < 50);
    if (lowConsistencyHabits.length > 0) {
      areas.push({
        area: 'consistency',
        description: `${lowConsistencyHabits.length} habits have low consistency rates`,
        priority: 'high'
      });
    }

    // Broken streaks
    const brokenStreaks = habits.filter(h => h.longestStreak > h.currentStreak && h.currentStreak === 0);
    if (brokenStreaks.length > 0) {
      areas.push({
        area: 'streak_recovery',
        description: `${brokenStreaks.length} habits have broken streaks to rebuild`,
        priority: 'medium'
      });
    }

    return areas;
  }

  identifySuccessFactors(habits, completions, moodEntries) {
    const factors = [];

    // High performing habits
    const highPerformers = habits.filter(h => h.consistencyRate > 80);
    if (highPerformers.length > 0) {
      factors.push({
        factor: 'high_consistency_habits',
        description: `${highPerformers.length} habits maintain excellent consistency`,
        categories: [...new Set(highPerformers.map(h => h.category))]
      });
    }

    // Strong streaks
    const strongStreaks = habits.filter(h => h.currentStreak > 14);
    if (strongStreaks.length > 0) {
      factors.push({
        factor: 'strong_streaks',
        description: `${strongStreaks.length} habits have strong active streaks`,
        longestStreak: Math.max(...strongStreaks.map(h => h.currentStreak))
      });
    }

    return factors;
  }

  calculateAccountAge(habits) {
    if (habits.length === 0) return 0;
    const oldestHabit = habits.reduce((oldest, habit) =>
      new Date(habit.createdAt) < new Date(oldest.createdAt) ? habit : oldest
    );
    const ageInDays = Math.floor((Date.now() - new Date(oldestHabit.createdAt)) / (1000 * 60 * 60 * 24));
    return ageInDays;
  }

  determineExperienceLevel(habits, completions) {
    const totalCompletions = completions.length;
    const accountAge = this.calculateAccountAge(habits);

    if (totalCompletions > 500 && accountAge > 90) return 'expert';
    if (totalCompletions > 200 && accountAge > 30) return 'advanced';
    if (totalCompletions > 50 && accountAge > 14) return 'intermediate';
    return 'beginner';
  }

  calculateAnalysisTimeframe(completions, moodEntries) {
    const allDates = [
      ...completions.map(c => new Date(c.completedAt)),
      ...moodEntries.map(m => new Date(m.date))
    ].sort((a, b) => a - b);

    if (allDates.length === 0) return null;

    const earliest = allDates[0];
    const latest = allDates[allDates.length - 1];
    const daysDiff = Math.floor((latest - earliest) / (1000 * 60 * 60 * 1000));

    return {
      startDate: earliest,
      endDate: latest,
      totalDays: daysDiff,
      dataPoints: allDates.length
    };
  }

  /**
   * Analyze user's habit ecosystem for intelligent suggestions
   */
  analyzeHabitEcosystem(habits, completions, moodEntries) {
    const allCategories = ['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'social', 'creativity', 'finance'];
    const existingCategories = [...new Set(habits.map(h => h.category))];
    const categoryGaps = allCategories.filter(cat => !existingCategories.includes(cat));

    // Analyze successful habits for patterns
    const successfulHabits = habits.filter(h => h.consistencyRate > 70);
    const successPatterns = this.extractSuccessPatterns(successfulHabits, completions);

    // Analyze timing patterns
    const timingAnalysis = this.analyzeOptimalTiming(completions);

    // Identify improvement areas
    const improvementAreas = this.identifyHabitGaps(habits, completions, moodEntries);

    // Analyze habit stacking opportunities
    const stackingOpportunities = this.identifyStackingOpportunities(habits, completions);

    return {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.active).length,
      categoryDistribution: this.getCategoryDistribution(habits),
      categoryGaps,
      successfulHabits: successfulHabits.length,
      averageConsistency: habits.reduce((sum, h) => sum + h.consistencyRate, 0) / habits.length || 0,
      bestTimes: timingAnalysis.bestTimes,
      successPatterns: successPatterns,
      improvementAreas,
      stackingOpportunities,
      experienceLevel: this.determineExperienceLevel(habits, completions),
      moodCorrelation: this.calculateMoodHabitCorrelation(moodEntries, completions)
    };
  }

  getCategoryDistribution(habits) {
    const distribution = {};
    habits.forEach(h => {
      distribution[h.category] = (distribution[h.category] || 0) + 1;
    });
    return distribution;
  }

  extractSuccessPatterns(successfulHabits, completions) {
    const patterns = [];

    // Category success patterns
    const successfulCategories = [...new Set(successfulHabits.map(h => h.category))];
    if (successfulCategories.length > 0) {
      patterns.push(`Strong performance in ${successfulCategories.join(', ')} categories`);
    }

    // Timing patterns from successful habits
    const successfulHabitIds = successfulHabits.map(h => h._id.toString());
    const successfulCompletions = completions.filter(c =>
      successfulHabitIds.includes(c.habitId.toString())
    );

    const timePattern = this.getCompletionTimePattern(successfulCompletions);
    if (timePattern.length > 0) {
      patterns.push(`Most successful during ${timePattern[0]} hours`);
    }

    return patterns;
  }

  analyzeOptimalTiming(completions) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    completions.forEach(c => {
      const hour = new Date(c.completedAt).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
    });

    const sortedTimes = Object.entries(timeSlots)
      .sort(([, a], [, b]) => b - a)
      .map(([time]) => time);

    return {
      bestTimes: sortedTimes.slice(0, 2),
      timeDistribution: timeSlots
    };
  }

  identifyHabitGaps(habits, completions, moodEntries) {
    const gaps = [];

    // Check for missing foundational categories
    const categories = new Set(habits.map(h => h.category));

    if (!categories.has('health') && !categories.has('fitness')) {
      gaps.push('Physical wellness habits missing');
    }

    if (!categories.has('mindfulness')) {
      gaps.push('Mental wellness and mindfulness practices missing');
    }

    if (!categories.has('learning')) {
      gaps.push('Personal development and learning habits missing');
    }

    // Check for consistency issues
    const lowConsistencyHabits = habits.filter(h => h.consistencyRate < 50);
    if (lowConsistencyHabits.length > habits.length * 0.3) {
      gaps.push('Overall consistency needs improvement');
    }

    // Check mood correlation
    if (moodEntries.length > 10) {
      const avgMood = moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length;
      if (avgMood < 3) {
        gaps.push('Mood-boosting habits could be beneficial');
      }
    }

    return gaps;
  }

  identifyStackingOpportunities(habits, completions) {
    const opportunities = [];

    // Find habits with high consistency that could anchor new habits
    const anchorHabits = habits.filter(h => h.consistencyRate > 80);

    anchorHabits.forEach(habit => {
      const habitCompletions = completions.filter(c =>
        c.habitId.toString() === habit._id.toString()
      );

      const commonTime = this.getMostCommonCompletionTime(habitCompletions);
      if (commonTime !== null) {
        opportunities.push({
          anchorHabit: habit.name,
          category: habit.category,
          optimalTime: commonTime,
          consistency: habit.consistencyRate
        });
      }
    });

    return opportunities.slice(0, 3); // Top 3 opportunities
  }

  getMostCommonCompletionTime(completions) {
    if (completions.length === 0) return null;

    const hours = completions.map(c => new Date(c.completedAt).getHours());
    const hourCount = {};

    hours.forEach(hour => {
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const mostCommonHour = Object.entries(hourCount)
      .sort(([, a], [, b]) => b - a)[0];

    return mostCommonHour ? parseInt(mostCommonHour[0]) : null;
  }

  calculateMoodHabitCorrelation(moodEntries, completions) {
    if (moodEntries.length < 5) return null;

    let totalMoodOnCompletionDays = 0;
    let totalMoodOnNonCompletionDays = 0;
    let completionDays = 0;
    let nonCompletionDays = 0;

    moodEntries.forEach(mood => {
      const moodDate = new Date(mood.date).toDateString();
      const dayCompletions = completions.filter(c =>
        new Date(c.completedAt).toDateString() === moodDate
      ).length;

      if (dayCompletions > 0) {
        totalMoodOnCompletionDays += mood.mood;
        completionDays++;
      } else {
        totalMoodOnNonCompletionDays += mood.mood;
        nonCompletionDays++;
      }
    });

    if (completionDays === 0 || nonCompletionDays === 0) return null;

    const avgMoodWithHabits = totalMoodOnCompletionDays / completionDays;
    const avgMoodWithoutHabits = totalMoodOnNonCompletionDays / nonCompletionDays;

    return {
      correlation: avgMoodWithHabits > avgMoodWithoutHabits ? 'positive' : 'negative',
      moodDifference: Math.round((avgMoodWithHabits - avgMoodWithoutHabits) * 10) / 10,
      avgMoodWithHabits: Math.round(avgMoodWithHabits * 10) / 10,
      avgMoodWithoutHabits: Math.round(avgMoodWithoutHabits * 10) / 10
    };
  }

  /**
   * Analyze user's current context for personalized motivation
   */
  analyzeMotivationContext(habits, todayCompletions, moodEntries, allCompletions, context) {
    const completionRate = habits.length > 0 ? (todayCompletions.length / habits.length) * 100 : 0;
    const totalStreaks = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
    const longestCurrentStreak = Math.max(...habits.map(h => h.currentStreak), 0);

    // Analyze recent performance (last 7 days)
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayCompletions = allCompletions.filter(c =>
        new Date(c.completedAt).toDateString() === date.toDateString()
      ).length;
      last7Days.push(dayCompletions);
    }

    const weeklyAverage = last7Days.reduce((sum, count) => sum + count, 0) / 7;
    const recentTrend = last7Days[0] > weeklyAverage ? 'improving' :
      last7Days[0] < weeklyAverage ? 'declining' : 'stable';

    // Identify achievements
    const achievements = [];
    if (longestCurrentStreak >= 7) achievements.push(`${longestCurrentStreak}-day streak active`);
    if (completionRate >= 80) achievements.push('excellent daily completion rate');
    if (totalStreaks > habits.length) achievements.push('multiple active streaks');

    const strongHabits = habits.filter(h => h.consistencyRate > 80);
    if (strongHabits.length > 0) achievements.push(`${strongHabits.length} highly consistent habits`);

    // Identify challenge areas
    const challengeAreas = [];
    if (completionRate < 50) challengeAreas.push('daily completion consistency');

    const strugglingHabits = habits.filter(h => h.consistencyRate < 40);
    if (strugglingHabits.length > 0) challengeAreas.push(`${strugglingHabits.length} habits need attention`);

    if (habits.filter(h => h.currentStreak === 0).length > habits.length * 0.5) {
      challengeAreas.push('streak rebuilding');
    }

    // Analyze emotional context
    let emotionalContext = 'neutral';
    if (moodEntries.length > 0) {
      const recentMood = moodEntries.slice(0, 3);
      const avgRecentMood = recentMood.reduce((sum, m) => sum + m.mood, 0) / recentMood.length;

      if (avgRecentMood >= 4) emotionalContext = 'positive';
      else if (avgRecentMood <= 2) emotionalContext = 'challenging';
      else emotionalContext = 'moderate';
    }

    // Determine performance level
    let todayPerformance = 'getting_started';
    if (completionRate >= 90) todayPerformance = 'excellent';
    else if (completionRate >= 70) todayPerformance = 'strong';
    else if (completionRate >= 50) todayPerformance = 'moderate';
    else if (completionRate > 0) todayPerformance = 'building';

    return {
      completionRate: Math.round(completionRate),
      totalStreaks,
      longestCurrentStreak,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      recentTrends: recentTrend,
      todayPerformance,
      achievements,
      challengeAreas,
      emotionalContext,
      habitCount: habits.length,
      activeStreakCount: habits.filter(h => h.currentStreak > 0).length,
      consistencyLevel: habits.reduce((sum, h) => sum + h.consistencyRate, 0) / habits.length || 0
    };
  }

  /**
   * Fallback habit suggestions when AI is not available
   */
  getFallbackHabitSuggestions() {
    const fallbackSuggestions = [
      {
        name: "Morning Hydration",
        description: "Drink a glass of water immediately upon waking to kickstart your metabolism and improve energy levels throughout the day.",
        category: "health",
        difficulty: "easy",
        timeCommitment: "1-2 minutes",
        expectedBenefits: ["Better energy", "Improved metabolism", "Enhanced focus"],
        startingTips: ["Keep water by your bedside", "Use a marked water bottle", "Start with half a glass if needed"],
        frequency: "daily",
        icon: "💧",
        color: "#3B82F6",
        reasoning: "Hydration is a foundational habit that supports all other wellness goals and is easy to maintain consistently."
      },
      {
        name: "Gratitude Journaling",
        description: "Write down 3 things you're grateful for each day to boost positivity and mental well-being.",
        category: "mindfulness",
        difficulty: "easy",
        timeCommitment: "3-5 minutes",
        expectedBenefits: ["Improved mood", "Better sleep", "Increased life satisfaction"],
        startingTips: ["Keep journal by bedside", "Start with just one gratitude item", "Be specific in your entries"],
        frequency: "daily",
        icon: "🙏",
        color: "#8B5CF6",
        reasoning: "Gratitude practice has proven mental health benefits and can be easily integrated into morning or evening routines."
      },
      {
        name: "5-Minute Walk",
        description: "Take a short walk outside or around your home to boost energy and clear your mind.",
        category: "fitness",
        difficulty: "easy",
        timeCommitment: "5 minutes",
        expectedBenefits: ["Increased energy", "Better mood", "Improved circulation"],
        startingTips: ["Start with just around the block", "Use it as a break between tasks", "Listen to music or podcasts"],
        frequency: "daily",
        icon: "🚶",
        color: "#10B981",
        reasoning: "Short walks are accessible to everyone and provide immediate physical and mental benefits without requiring special equipment."
      },
      {
        name: "Deep Breathing",
        description: "Practice 5 deep breaths to reduce stress and improve focus during busy moments.",
        category: "mindfulness",
        difficulty: "easy",
        timeCommitment: "2-3 minutes",
        expectedBenefits: ["Reduced stress", "Better focus", "Improved calm"],
        startingTips: ["Use the 4-7-8 technique", "Practice during transitions", "Set hourly reminders"],
        frequency: "daily",
        icon: "🫁",
        color: "#6366F1",
        reasoning: "Breathing exercises are scientifically proven to reduce stress and can be done anywhere, anytime."
      },
      {
        name: "Evening Phone-Free Time",
        description: "Spend 30 minutes before bed without screens to improve sleep quality and mental clarity.",
        category: "productivity",
        difficulty: "medium",
        timeCommitment: "30 minutes",
        expectedBenefits: ["Better sleep", "Reduced anxiety", "Improved focus"],
        startingTips: ["Charge phone outside bedroom", "Read a book instead", "Start with 15 minutes"],
        frequency: "daily",
        icon: "📱",
        color: "#F59E0B",
        reasoning: "Reducing screen time before bed significantly improves sleep quality and overall well-being."
      }
    ];

    return {
      success: true,
      data: fallbackSuggestions,
      generatedAt: new Date(),
      fallback: true,
      analysisUsed: {
        note: "Fallback suggestions - general wellness habits suitable for most users"
      }
    };
  }

  /**
   * Fallback motivational content with basic personalization
   */
  getFallbackMotivationalContent(motivationData = null) {
    const baseContent = {
      message: "Every small step you take today builds the foundation for tomorrow's success. Your consistency is your superpower!",
      tone: 'encouraging',
      quote: "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
      tips: [
        'Focus on progress, not perfection',
        'Celebrate small wins along the way',
        'Remember why you started this journey'
      ],
      challenge: 'Complete all your morning habits before checking your phone today',
      affirmation: 'I am building positive habits that transform my life one day at a time.',
      celebration: 'You showed up today, and that matters',
      encouragement: 'Every day is a new opportunity to grow',
      dataInsight: 'Consistency beats perfection every time',
      nextMilestone: 'Focus on completing one habit at a time'
    };

    // Add basic personalization if data is available
    if (motivationData) {
      if (motivationData.longestCurrentStreak > 0) {
        baseContent.celebration = `You have a ${motivationData.longestCurrentStreak}-day streak going strong!`;
      }

      if (motivationData.completionRate >= 70) {
        baseContent.message = `Amazing! You're at ${motivationData.completionRate}% completion today. Your dedication is paying off!`;
        baseContent.tone = 'celebratory';
      } else if (motivationData.completionRate > 0) {
        baseContent.message = `You've completed ${motivationData.completionRate}% of your habits today. Every step forward counts!`;
        baseContent.encouragement = 'You\'re making progress, keep going!';
      }
    }

    return {
      success: true,
      data: baseContent,
      generatedAt: new Date(),
      fallback: true
    };
  }
}

export default new AIService();