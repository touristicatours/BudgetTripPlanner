import { spawn } from 'child_process';
import { logger } from '../lib/logger';

export interface ItineraryHealthScore {
  overall_score: number;
  health_status: string;
  breakdown: {
    pacing: { score: number; max_score: number; details: any };
    budget: { score: number; max_score: number; details: any };
    cohesion: { score: number; max_score: number; details: any };
    diversity: { score: number; max_score: number; details: any };
    rating_quality: { score: number; max_score: number; details: any };
  };
  total_score: number;
  max_score: number;
}

export interface OptimizationResult {
  itinerary: any;
  health_score: ItineraryHealthScore;
  optimizations_applied: number;
  improvement: number;
  original_score: number;
}

export class HealthScoringService {
  private pythonPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
  }

  /**
   * Calculate health score for an itinerary
   */
  async calculateHealthScore(itinerary: any, userProfile: any): Promise<ItineraryHealthScore> {
    try {
      logger.info('Calculating itinerary health score', { 
        destination: itinerary.destination,
        days: itinerary.days?.length || 0 
      });

      const input = {
        health_score: true,
        itinerary,
        user_profile: userProfile
      };

      const result = await this.callPythonEngine(input);
      
      if (result.status === 'success') {
        logger.info('Health score calculated successfully', {
          score: result.health_score.overall_score,
          status: result.health_score.health_status
        });
        return result.health_score;
      } else {
        throw new Error(result.message || 'Failed to calculate health score');
      }
    } catch (error) {
      logger.error('Error calculating health score', { error });
      throw error;
    }
  }

  /**
   * Auto-optimize an itinerary to improve its health score
   */
  async autoOptimize(
    itinerary: any, 
    userProfile: any, 
    availableActivities: any[], 
    maxIterations: number = 5
  ): Promise<OptimizationResult> {
    try {
      logger.info('Starting itinerary auto-optimization', {
        destination: itinerary.destination,
        availableActivities: availableActivities.length,
        maxIterations
      });

      const input = {
        auto_optimize: true,
        itinerary,
        user_profile: userProfile,
        available_activities: availableActivities,
        max_iterations: maxIterations
      };

      const result = await this.callPythonEngine(input);
      
      if (result.status === 'success') {
        const optimizationResult = result.optimization_result;
        logger.info('Auto-optimization completed', {
          optimizationsApplied: optimizationResult.optimizations_applied,
          improvement: optimizationResult.improvement,
          finalScore: optimizationResult.health_score.overall_score
        });
        return optimizationResult;
      } else {
        throw new Error(result.message || 'Failed to auto-optimize itinerary');
      }
    } catch (error) {
      logger.error('Error during auto-optimization', { error });
      throw error;
    }
  }

  /**
   * Call the Python recommendation engine
   */
  private async callPythonEngine(input: any): Promise<any> {
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
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error}`));
      });

      // Send input to Python process
      pythonProcess.stdin.write(JSON.stringify(input));
      pythonProcess.stdin.end();
    });
  }

  /**
   * Check if health scoring is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testInput = {
        info: true
      };
      await this.callPythonEngine(testInput);
      return true;
    } catch (error) {
      logger.warn('Health scoring service not available', { error });
      return false;
    }
  }
}

// Export singleton instance
export const healthScoringService = new HealthScoringService();
