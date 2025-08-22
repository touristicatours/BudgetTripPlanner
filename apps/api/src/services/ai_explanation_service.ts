import { spawn } from 'child_process';
import { logger } from '../lib/logger';

export interface AIExplanationRequest {
  activity: any;
  userProfile: any;
  decisionFactors?: any;
}

export interface AIExplanationResponse {
  explanation: string;
}

export interface ItinerarySummaryRequest {
  userProfile: any;
  destination: string;
  totalActivities: number;
  dataPoints?: number;
}

export interface ItinerarySummaryResponse {
  summary: {
    optimized_for: string[];
    based_on: string[];
    total_activities: number;
  };
}

export class AIExplanationService {
  private pythonPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
  }

  /**
   * Generate an AI explanation for why an activity was recommended
   */
  async generateExplanation(request: AIExplanationRequest): Promise<string> {
    try {
      logger.info('Generating AI explanation', { 
        activityName: request.activity?.name,
        userId: request.userProfile?.userId 
      });

      const inputData = {
        explain: true,
        activity: request.activity,
        user_profile: request.userProfile,
        decision_factors: request.decisionFactors || {}
      };

      const explanation = await this.callPythonEngine(inputData);
      
      logger.info('AI explanation generated successfully', { 
        activityName: request.activity?.name,
        explanationLength: explanation.length 
      });

      return explanation;
    } catch (error) {
      logger.error('Failed to generate AI explanation', { 
        error: error.message,
        activityName: request.activity?.name 
      });
      
      // Fallback explanation
      return this.generateFallbackExplanation(request.activity, request.userProfile);
    }
  }

  /**
   * Generate an itinerary summary explaining how the itinerary was built
   */
  async generateItinerarySummary(request: ItinerarySummaryRequest): Promise<ItinerarySummaryResponse['summary']> {
    try {
      logger.info('Generating itinerary summary', { 
        destination: request.destination,
        totalActivities: request.totalActivities 
      });

      const inputData = {
        summary: true,
        user_profile: request.userProfile,
        destination: request.destination,
        total_activities: request.totalActivities,
        data_points: request.dataPoints
      };

      const result = await this.callPythonEngine(inputData);
      
      logger.info('Itinerary summary generated successfully', { 
        destination: request.destination,
        optimizedFor: result.summary.optimized_for 
      });

      return result.summary;
    } catch (error) {
      logger.error('Failed to generate itinerary summary', { 
        error: error.message,
        destination: request.destination 
      });
      
      // Fallback summary
      return this.generateFallbackSummary(request);
    }
  }

  /**
   * Call the Python recommendation engine
   */
  private async callPythonEngine(inputData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, ['ai/recommendation_engine.py'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            if (result.status === 'success') {
              resolve(result);
            } else {
              reject(new Error(result.message || 'Python engine returned error'));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Send input data to Python process
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();
    });
  }

  /**
   * Generate a fallback explanation when Python engine fails
   */
  private generateFallbackExplanation(activity: any, userProfile: any): string {
    const activityName = activity?.name || 'This activity';
    const rating = activity?.rating;
    const priceLevel = activity?.price_level;
    const userBudget = userProfile?.budget;
    const userInterests = userProfile?.interests || [];

    const explanations = [];

    // Rating-based explanation
    if (rating && rating >= 4.0) {
      explanations.push(`it has a great rating of ${rating.toFixed(1)} stars`);
    }

    // Budget-based explanation
    if (userBudget && priceLevel) {
      if (priceLevel <= userBudget) {
        explanations.push('it fits your budget preferences');
      }
    }

    // Interest-based explanation
    if (userInterests.length > 0) {
      explanations.push(`it matches your interests in ${userInterests.join(', ')}`);
    }

    // Default explanation
    if (explanations.length === 0) {
      explanations.push('it\'s a great local recommendation');
    }

    return `We recommended ${activityName} because ${explanations.join(' and ')}.`;
  }

  /**
   * Generate a fallback summary when Python engine fails
   */
  private generateFallbackSummary(request: ItinerarySummaryRequest): ItinerarySummaryResponse['summary'] {
    const { userProfile, destination, totalActivities } = request;
    
    const optimizedFor = [];
    const basedOn = [];

    // Add optimization factors
    if (userProfile?.interests?.length > 0) {
      optimizedFor.push(userProfile.interests.join(', ').toUpperCase());
    }

    if (userProfile?.pace) {
      const paceMap = {
        relaxed: 'Relaxed Pace',
        moderate: 'Balanced Experience',
        active: 'Active Exploration'
      };
      optimizedFor.push(paceMap[userProfile.pace] || 'Your Preferences');
    }

    // Add data sources
    basedOn.push('Your preferences and travel style');
    basedOn.push(`thousands of data points from ${destination}`);
    basedOn.push('real-time availability and ratings');

    return {
      optimized_for: optimizedFor,
      based_on: basedOn,
      total_activities: totalActivities
    };
  }
}

// Export singleton instance
export const aiExplanationService = new AIExplanationService();
