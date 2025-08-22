import { spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { Place } from './places_service';

export interface UserProfile {
  interests: string[];
  budget: number; // 1-4 scale (1=budget, 4=luxury)
  pace: 'relaxed' | 'moderate' | 'fast';
  dietary?: string[];
  group_size?: number;
  age_group?: 'young' | 'middle' | 'senior';
}

export interface RecommendationResult {
  activity: Place;
  score: number;
  rank: number;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: RecommendationResult[];
  total_considered: number;
  user_profile: UserProfile;
  error?: string;
  type?: string;
}

export class RecommendationService {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    // Try to find Python 3
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(__dirname, '../../ai/recommendation_engine.py');
  }

  /**
   * Get personalized activity recommendations using the ML model
   */
  async getPersonalizedRecommendations(
    userProfile: UserProfile,
    activities: Place[],
    topN: number = 5
  ): Promise<RecommendationResult[]> {
    try {
      // Prepare input data
      const inputData = {
        user_profile: userProfile,
        activities: activities,
        top_n: topN
      };

      // Call Python script
      const result = await this.callPythonScript(inputData);

      if (!result.success) {
        console.warn('Python recommendation engine failed:', result.error);
        // Fallback to simple scoring
        return this.fallbackRecommendations(userProfile, activities, topN);
      }

      return result.recommendations;
    } catch (error) {
      console.error('Recommendation service error:', error);
      // Fallback to simple scoring
      return this.fallbackRecommendations(userProfile, activities, topN);
    }
  }

  /**
   * Call the Python recommendation engine script
   */
  private callPythonScript(inputData: any): Promise<RecommendationResponse> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Send input data
      python.stdin.write(JSON.stringify(inputData));
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
          console.error('Python script error:', stderr);
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error('Failed to parse Python script output'));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Fallback recommendation system using simple heuristics
   */
  private fallbackRecommendations(
    userProfile: UserProfile,
    activities: Place[],
    topN: number
  ): RecommendationResult[] {
    const { interests, budget, pace } = userProfile;
    
    // Interest type mapping
    const interestTypeMap: Record<string, string[]> = {
      'art': ['museum', 'art_gallery'],
      'culture': ['museum', 'art_gallery', 'historical_site'],
      'history': ['museum', 'historical_site', 'monument'],
      'food': ['restaurant', 'cafe', 'bakery'],
      'nature': ['park', 'garden', 'zoo'],
      'shopping': ['shopping_mall', 'store'],
      'nightlife': ['bar', 'night_club'],
      'architecture': ['point_of_interest', 'church'],
      'entertainment': ['entertainment', 'amusement_park']
    };

    // Score each activity
    const scoredActivities = activities.map((activity) => {
      let score = 0;

      // Base score from rating
      score += (activity.rating || 3.5) / 5.0; // Normalize to 0-1

      // Interest matching
      const activityTypes = activity.types.map(t => t.toLowerCase());
      for (const interest of interests) {
        const relevantTypes = interestTypeMap[interest.toLowerCase()] || [];
        if (relevantTypes.some(type => activityTypes.includes(type))) {
          score += 0.5; // Boost for interest match
        }
      }

      // Budget compatibility
      const activityPrice = activity.price_level || 1;
      if (activityPrice <= budget) {
        score += 0.2;
      } else if (activityPrice > budget + 1) {
        score -= 0.3;
      }

      // Pace considerations
      if (pace === 'relaxed' && activityTypes.some(t => ['park', 'cafe', 'garden'].includes(t))) {
        score += 0.2;
      } else if (pace === 'fast' && activityTypes.some(t => ['entertainment', 'point_of_interest'].includes(t))) {
        score += 0.2;
      }

      // Quality indicators
      if ((activity.rating || 0) >= 4.0) {
        score += 0.2;
      }
      if ((activity.user_ratings_total || 0) >= 100) {
        score += 0.1;
      }

      return {
        activity,
        score,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by score and assign ranks
    scoredActivities.sort((a, b) => b.score - a.score);
    scoredActivities.forEach((item, index) => {
      item.rank = index + 1;
    });

    return scoredActivities.slice(0, topN);
  }

  /**
   * Check if Python dependencies are available
   */
  async checkPythonDependencies(): Promise<boolean> {
    try {
      const result = await this.callPythonScript({
        user_profile: { interests: ['test'], budget: 2, pace: 'moderate' },
        activities: [],
        top_n: 1
      });
      return result.success;
    } catch (error) {
      console.warn('Python dependencies not available, using fallback recommendations');
      return false;
    }
  }

  /**
   * Normalize user interests to standard categories
   */
  static normalizeUserInterests(interests: string[]): string[] {
    const normalizedMap: Record<string, string> = {
      'museums': 'culture',
      'galleries': 'art',
      'dining': 'food',
      'restaurants': 'food',
      'parks': 'nature',
      'outdoor': 'nature',
      'sightseeing': 'culture',
      'shopping': 'shopping',
      'bars': 'nightlife',
      'clubs': 'nightlife'
    };

    return interests.map(interest => 
      normalizedMap[interest.toLowerCase()] || interest.toLowerCase()
    );
  }

  /**
   * Convert budget string to numeric scale
   */
  static normalizeBudget(budget: string | number): number {
    if (typeof budget === 'number') {
      return Math.max(1, Math.min(4, budget));
    }

    const budgetMap: Record<string, number> = {
      'budget': 1,
      'low': 1,
      'economic': 1,
      'moderate': 2,
      'medium': 2,
      'mid': 2,
      'high': 3,
      'expensive': 3,
      'luxury': 4,
      'premium': 4
    };

    return budgetMap[budget.toLowerCase()] || 2;
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
