import { spawn } from 'child_process';
import path from 'path';

export interface UserFeedback {
  id: string;
  userId: string;
  tripId: string;
  activityId: string;
  activityName: string;
  action: 'added' | 'removed' | 'rated' | 'liked' | 'disliked' | 'viewed';
  rating?: number;
  category?: string;
  priceLevel?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface InferredPreference {
  value: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  source: 'stated' | 'inferred' | 'combined';
  lastUpdated: string;
}

export interface InferredPreferences {
  interests: Record<string, InferredPreference>;
  budgetPreference: InferredPreference;
  pacePreference: InferredPreference;
  priceSensitivity: InferredPreference;
  categoryAffinities: Record<string, InferredPreference>;
  lastAnalysis: string;
}

export interface UpdatedUserProfile {
  interests: string[];
  budget: number;
  pace: 'relaxed' | 'moderate' | 'fast';
  inferredPreferences?: {
    lastAnalysis: string;
    confidenceScores: {
      budget: number;
      pace: number;
      interestsCount: number;
    };
    categoryAffinities: Record<string, {
      value: number;
      confidence: number;
    }>;
  };
}

export class FeedbackLearningService {
  private pythonPath: string;
  private analyzerPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.analyzerPath = path.join(process.cwd(), 'ai', 'feedback_analyzer.py');
  }

  /**
   * Analyze user feedback to infer preferences
   */
  async analyzeUserFeedback(userId: string): Promise<InferredPreferences> {
    try {
      const result = await this.callPythonAnalyzer('analyze_feedback', { userId });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze feedback');
      }

      return result.data;
    } catch (error) {
      console.error('Error analyzing user feedback:', error);
      throw error;
    }
  }

  /**
   * Update user profile with inferred preferences
   */
  async updateUserProfile(
    userId: string,
    statedPreferences: Record<string, any>,
    inferredPreferences: InferredPreferences
  ): Promise<UpdatedUserProfile> {
    try {
      const result = await this.callPythonAnalyzer('update_user_profile', {
        userId,
        statedPreferences,
        inferredPreferences
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user profile');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get enhanced user profile with learning applied
   */
  async getEnhancedUserProfile(
    userId: string,
    statedPreferences: Record<string, any>
  ): Promise<UpdatedUserProfile> {
    try {
      // First, analyze feedback to get inferred preferences
      const inferredPreferences = await this.analyzeUserFeedback(userId);
      
      // Then, update the profile with inferred preferences
      const updatedProfile = await this.updateUserProfile(
        userId,
        statedPreferences,
        inferredPreferences
      );

      return updatedProfile;
    } catch (error) {
      console.error('Error getting enhanced user profile:', error);
      // Return original preferences if learning fails
      return {
        interests: statedPreferences.interests || [],
        budget: statedPreferences.budget || 2,
        pace: statedPreferences.pace || 'moderate'
      };
    }
  }

  /**
   * Call the Python feedback analyzer
   */
  private callPythonAnalyzer(
    method: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.analyzerPath, method], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Send input data
      python.stdin.write(JSON.stringify(data));
      python.stdin.end();

      // Collect output
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('Python analyzer error:', stderr);
          resolve({
            success: false,
            error: `Python analyzer failed with code ${code}: ${stderr}`
          });
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', stdout);
          resolve({
            success: false,
            error: 'Failed to parse Python analyzer output'
          });
        }
      });

      python.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
    });
  }

  /**
   * Check if the feedback analyzer is available
   */
  async checkAnalyzerAvailability(): Promise<boolean> {
    try {
      const result = await this.callPythonAnalyzer('check_availability', {});
      return result.success;
    } catch (error) {
      console.warn('Feedback analyzer not available:', error);
      return false;
    }
  }

  /**
   * Get learning statistics for a user
   */
  async getLearningStats(userId: string): Promise<{
    totalFeedback: number;
    lastAnalysis: string;
    confidenceScores: Record<string, number>;
    topInferredInterests: Array<{ interest: string; value: number; confidence: number }>;
  }> {
    try {
      const inferredPreferences = await this.analyzeUserFeedback(userId);
      
      const topInterests = Object.entries(inferredPreferences.interests)
        .map(([interest, pref]) => ({
          interest,
          value: pref.value,
          confidence: pref.confidence
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return {
        totalFeedback: Object.keys(inferredPreferences.interests).length,
        lastAnalysis: inferredPreferences.lastAnalysis,
        confidenceScores: {
          budget: inferredPreferences.budgetPreference.confidence,
          pace: inferredPreferences.pacePreference.confidence,
          interests: Object.values(inferredPreferences.interests)
            .reduce((sum, pref) => sum + pref.confidence, 0) / 
            Math.max(Object.keys(inferredPreferences.interests).length, 1)
        },
        topInferredInterests: topInterests
      };
    } catch (error) {
      console.error('Error getting learning stats:', error);
      return {
        totalFeedback: 0,
        lastAnalysis: new Date().toISOString(),
        confidenceScores: { budget: 0, pace: 0, interests: 0 },
        topInferredInterests: []
      };
    }
  }
}

// Export singleton instance
export const feedbackLearningService = new FeedbackLearningService();
