import { predictionService } from "./predictionService";

export class PredictionScheduler {
  private evaluationInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting prediction evaluation scheduler...');
    
    // Run evaluation every 5 minutes
    this.evaluationInterval = setInterval(async () => {
      try {
        await predictionService.evaluatePredictions();
      } catch (error) {
        console.error('Error in prediction evaluation scheduler:', error);
      }
    }, 5 * 60 * 1000);

    // Run initial evaluation after 30 seconds
    setTimeout(async () => {
      try {
        await predictionService.evaluatePredictions();
      } catch (error) {
        console.error('Error in initial prediction evaluation:', error);
      }
    }, 30000);
  }

  stop() {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
    this.isRunning = false;
    console.log('Stopped prediction evaluation scheduler');
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}

export const predictionScheduler = new PredictionScheduler();