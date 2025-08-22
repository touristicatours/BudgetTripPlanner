import { spawn } from 'child_process';
import path from 'path';

export interface ProactiveTip {
  type: 'weather' | 'connection' | 'budget' | 'popularity' | 'accessibility';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action_type: string;
  action_data: any;
}

export interface WeatherForecast {
  [date: string]: {
    condition: string;
    temperature: number;
    precipitation_chance: number;
    humidity: number;
  };
}

export interface ProactiveTipsResult {
  status: 'success' | 'error';
  tips?: ProactiveTip[];
  message?: string;
}

export class ProactiveTipsService {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(__dirname, '../../ai/recommendation_engine.py');
  }

  async generateProactiveTips(
    itinerary: any,
    userProfile: any,
    weatherForecast?: WeatherForecast
  ): Promise<ProactiveTipsResult> {
    try {
      const inputData = {
        proactive_tips: true,
        itinerary,
        user_profile: userProfile,
        weather_forecast: weatherForecast
      };

      const result = await this.callPythonEngine(inputData);
      
      if (result.status === 'success' && result.proactive_tips) {
        return {
          status: 'success',
          tips: result.proactive_tips
        };
      } else {
        return {
          status: 'error',
          message: result.message || 'Failed to generate proactive tips'
        };
      }
    } catch (error) {
      console.error('Error generating proactive tips:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async callPythonEngine(inputData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath]);

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
            reject(new Error(`Failed to parse Python output: ${stdout}`));
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

  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.callPythonEngine({ info: true });
      return result.status === 'success';
    } catch (error) {
      console.error('ProactiveTipsService not available:', error);
      return false;
    }
  }
}

export const proactiveTipsService = new ProactiveTipsService();
