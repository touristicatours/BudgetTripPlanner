import { PrismaClient } from '@prisma/client';
import { GoogleMapsService } from './google_maps_service';
import { NotificationService } from './notification_service';
import { ItineraryOptimizationService } from './itinerary_optimization_service';

const prisma = new PrismaClient();

export interface LocationUpdate {
  tripId: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface ExecutionContext {
  tripId: string;
  userId: string;
  currentActivityIndex: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdateTime: Date;
  isActive: boolean;
  delays: Delay[];
  optimizations: Optimization[];
}

export interface Delay {
  activityId: string;
  activityName: string;
  originalStartTime: Date;
  estimatedDelay: number; // minutes
  reason: 'traffic' | 'closure' | 'wait_time' | 'user_delay';
  timestamp: Date;
}

export interface Optimization {
  type: 'skip' | 'reorder' | 'shorten' | 'reschedule';
  activityId: string;
  activityName: string;
  originalStartTime: Date;
  newStartTime?: Date;
  newDuration?: number;
  reason: string;
  timestamp: Date;
  applied: boolean;
}

export interface RealTimeStatus {
  currentActivity: {
    id: string;
    name: string;
    startTime: Date;
    endTime: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    status: 'upcoming' | 'current' | 'completed' | 'delayed';
    estimatedArrival?: Date;
    travelTime?: number; // minutes
  };
  nextActivity?: {
    id: string;
    name: string;
    startTime: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    travelTime: number; // minutes
    travelMode: 'walking' | 'driving' | 'transit';
  };
  timeline: {
    activities: Array<{
      id: string;
      name: string;
      startTime: Date;
      endTime: Date;
      status: 'completed' | 'current' | 'upcoming' | 'skipped';
      delay?: number;
    }>;
    totalDelay: number;
    estimatedCompletion: Date;
  };
  alerts: Array<{
    type: 'delay' | 'closure' | 'optimization' | 'weather';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    actionable: boolean;
    actionUrl?: string;
  }>;
}

export class ExecutionService {
  private googleMapsService: GoogleMapsService;
  private notificationService: NotificationService;
  private optimizationService: ItineraryOptimizationService;
  private activeExecutions: Map<string, ExecutionContext> = new Map();

  constructor() {
    this.googleMapsService = new GoogleMapsService();
    this.notificationService = new NotificationService();
    this.optimizationService = new ItineraryOptimizationService();
  }

  /**
   * Start execution mode for a trip
   */
  async startExecution(tripId: string, userId: string): Promise<ExecutionContext> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itineraries: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    const context: ExecutionContext = {
      tripId,
      userId,
      currentActivityIndex: 0,
      currentLocation: { latitude: 0, longitude: 0 },
      lastUpdateTime: new Date(),
      isActive: true,
      delays: [],
      optimizations: []
    };

    this.activeExecutions.set(tripId, context);

    // Start background monitoring
    this.startBackgroundMonitoring(tripId);

    return context;
  }

  /**
   * Update user location and check for delays
   */
  async updateLocation(update: LocationUpdate): Promise<RealTimeStatus> {
    const context = this.activeExecutions.get(update.tripId);
    if (!context) {
      throw new Error('Execution not active for this trip');
    }

    // Update context
    context.currentLocation = {
      latitude: update.latitude,
      longitude: update.longitude
    };
    context.lastUpdateTime = update.timestamp;

    // Get current itinerary
    const itinerary = await this.getCurrentItinerary(update.tripId);
    if (!itinerary) {
      throw new Error('No active itinerary found');
    }

    const itineraryData = JSON.parse(itinerary.data);
    const currentActivity = itineraryData.activities[context.currentActivityIndex];

    // Check for delays and get real-time status
    const status = await this.calculateRealTimeStatus(context, itineraryData);

    // Check if significant delay detected
    if (status.timeline.totalDelay > 30) { // 30 minutes threshold
      await this.handleSignificantDelay(context, status);
    }

    // Check for activity completions
    await this.checkActivityCompletion(context, update);

    return status;
  }

  /**
   * Calculate real-time status including delays and travel times
   */
  private async calculateRealTimeStatus(
    context: ExecutionContext, 
    itineraryData: any
  ): Promise<RealTimeStatus> {
    const currentActivity = itineraryData.activities[context.currentActivityIndex];
    const nextActivity = itineraryData.activities[context.currentActivityIndex + 1];

    // Calculate travel time to current activity
    const travelTimeToCurrent = await this.googleMapsService.getTravelTime(
      context.currentLocation,
      currentActivity.location,
      'driving'
    );

    // Calculate estimated arrival
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + travelTimeToCurrent);

    // Check if we're delayed
    const originalStartTime = new Date(currentActivity.startTime);
    const delay = estimatedArrival > originalStartTime ? 
      Math.floor((estimatedArrival.getTime() - originalStartTime.getTime()) / (1000 * 60)) : 0;

    // Get next activity travel time if exists
    let nextActivityTravelTime = 0;
    let travelMode: 'walking' | 'driving' | 'transit' = 'driving';
    
    if (nextActivity) {
      nextActivityTravelTime = await this.googleMapsService.getTravelTime(
        currentActivity.location,
        nextActivity.location,
        'driving'
      );
      
      // Check if walking is faster
      const walkingTime = await this.googleMapsService.getTravelTime(
        currentActivity.location,
        nextActivity.location,
        'walking'
      );
      
      if (walkingTime < nextActivityTravelTime) {
        nextActivityTravelTime = walkingTime;
        travelMode = 'walking';
      }
    }

    // Build timeline with delays
    const timeline = {
      activities: itineraryData.activities.map((activity: any, index: number) => {
        let status: 'completed' | 'current' | 'upcoming' | 'skipped' = 'upcoming';
        let delay = 0;

        if (index < context.currentActivityIndex) {
          status = 'completed';
        } else if (index === context.currentActivityIndex) {
          status = 'current';
          delay = delay;
        }

        return {
          id: activity.id,
          name: activity.name,
          startTime: new Date(activity.startTime),
          endTime: new Date(activity.endTime),
          status,
          delay
        };
      }),
      totalDelay: delay,
      estimatedCompletion: this.calculateEstimatedCompletion(itineraryData, delay)
    };

    // Check for closures and wait times
    const alerts = await this.checkForAlerts(currentActivity, nextActivity);

    return {
      currentActivity: {
        id: currentActivity.id,
        name: currentActivity.name,
        startTime: new Date(currentActivity.startTime),
        endTime: new Date(currentActivity.endTime),
        location: currentActivity.location,
        status: delay > 15 ? 'delayed' : 'current',
        estimatedArrival,
        travelTime: travelTimeToCurrent
      },
      nextActivity: nextActivity ? {
        id: nextActivity.id,
        name: nextActivity.name,
        startTime: new Date(nextActivity.startTime),
        location: nextActivity.location,
        travelTime: nextActivityTravelTime,
        travelMode
      } : undefined,
      timeline,
      alerts
    };
  }

  /**
   * Handle significant delays by triggering re-optimization
   */
  private async handleSignificantDelay(context: ExecutionContext, status: RealTimeStatus) {
    const trip = await prisma.trip.findUnique({
      where: { id: context.tripId },
      include: {
        itineraries: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!trip) return;

    // Create optimization suggestion
    const optimization: Optimization = {
      type: 'reorder',
      activityId: status.currentActivity.id,
      activityName: status.currentActivity.name,
      originalStartTime: status.currentActivity.startTime,
      reason: `Significant delay detected (${status.timeline.totalDelay} minutes). Re-optimizing remaining activities.`,
      timestamp: new Date(),
      applied: false
    };

    context.optimizations.push(optimization);

    // Trigger re-optimization
    const optimizedItinerary = await this.optimizationService.autoOptimize(
      context.tripId,
      context.currentActivityIndex,
      status.timeline.totalDelay
    );

    if (optimizedItinerary) {
      // Save new itinerary version
      await prisma.itinerary.create({
        data: {
          tripId: context.tripId,
          name: `Auto-optimized (${new Date().toLocaleTimeString()})`,
          data: JSON.stringify(optimizedItinerary),
          version: (trip.itineraries[0]?.version || 0) + 1
        }
      });

      // Send notification
      await this.notificationService.sendNotification(context.userId, {
        type: 'optimization',
        title: 'Itinerary Re-optimized',
        message: `Heads up! Traffic has put you ${status.timeline.totalDelay} min behind. I've rearranged your afternoon to save your dinner reservation. Tap to review.`,
        data: {
          tripId: context.tripId,
          optimizationId: optimization.activityId
        }
      });
    }
  }

  /**
   * Check if current activity is completed
   */
  private async checkActivityCompletion(context: ExecutionContext, locationUpdate: LocationUpdate) {
    const itinerary = await this.getCurrentItinerary(locationUpdate.tripId);
    if (!itinerary) return;

    const itineraryData = JSON.parse(itinerary.data);
    const currentActivity = itineraryData.activities[context.currentActivityIndex];

    // Check if user is near the activity location
    const distance = this.calculateDistance(
      locationUpdate.latitude,
      locationUpdate.longitude,
      currentActivity.location.latitude,
      currentActivity.location.longitude
    );

    // If user is within 100 meters of activity location, consider it started
    if (distance < 0.1) { // 100 meters
      const now = new Date();
      const activityEndTime = new Date(currentActivity.endTime);
      
      // If past the activity end time, mark as completed
      if (now > activityEndTime) {
        context.currentActivityIndex++;
        
        // Log completion
        await prisma.userFeedback.create({
          data: {
            userId: locationUpdate.userId,
            tripId: locationUpdate.tripId,
            activityId: currentActivity.id,
            activityName: currentActivity.name,
            action: 'completed',
            category: currentActivity.category,
            createdAt: now
          }
        });
      }
    }
  }

  /**
   * Check for real-time alerts (closures, wait times, etc.)
   */
  private async checkForAlerts(currentActivity: any, nextActivity?: any): Promise<RealTimeStatus['alerts']> {
    const alerts: RealTimeStatus['alerts'] = [];

    // Check current activity for closures
    if (currentActivity) {
      const placeDetails = await this.googleMapsService.getPlaceDetails(currentActivity.placeId);
      
      if (placeDetails?.openingHours?.openNow === false) {
        alerts.push({
          type: 'closure',
          message: `${currentActivity.name} is currently closed.`,
          severity: 'high',
          timestamp: new Date(),
          actionable: true,
          actionUrl: `/trip/${currentActivity.tripId}/optimize?reason=closure&activityId=${currentActivity.id}`
        });
      }

      // Check for long wait times (simulated)
      const waitTime = Math.random() * 60; // 0-60 minutes
      if (waitTime > 30) {
        alerts.push({
          type: 'delay',
          message: `${currentActivity.name} has a ${Math.round(waitTime)} minute wait time.`,
          severity: 'medium',
          timestamp: new Date(),
          actionable: true,
          actionUrl: `/trip/${currentActivity.tripId}/optimize?reason=wait_time&activityId=${currentActivity.id}`
        });
      }
    }

    return alerts;
  }

  /**
   * Start background monitoring for a trip
   */
  private startBackgroundMonitoring(tripId: string) {
    // Set up interval to check for updates every 5 minutes
    const interval = setInterval(async () => {
      const context = this.activeExecutions.get(tripId);
      if (!context || !context.isActive) {
        clearInterval(interval);
        return;
      }

      // Check for weather alerts, traffic updates, etc.
      await this.checkBackgroundAlerts(context);
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Check for background alerts (weather, traffic, etc.)
   */
  private async checkBackgroundAlerts(context: ExecutionContext) {
    // This would integrate with weather APIs, traffic APIs, etc.
    // For now, we'll simulate some checks
    
    const itinerary = await this.getCurrentItinerary(context.tripId);
    if (!itinerary) return;

    const itineraryData = JSON.parse(itinerary.data);
    const currentActivity = itineraryData.activities[context.currentActivityIndex];

    // Simulate weather check
    const weatherAlert = await this.checkWeatherAlert(currentActivity.location);
    if (weatherAlert) {
      await this.notificationService.sendNotification(context.userId, {
        type: 'weather',
        title: 'Weather Alert',
        message: weatherAlert,
        data: { tripId: context.tripId }
      });
    }
  }

  /**
   * Check weather conditions for an activity
   */
  private async checkWeatherAlert(location: any): Promise<string | null> {
    // This would integrate with a weather API
    // For now, return null (no weather alerts)
    return null;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(itineraryData: any, totalDelay: number): Date {
    const lastActivity = itineraryData.activities[itineraryData.activities.length - 1];
    const completionTime = new Date(lastActivity.endTime);
    completionTime.setMinutes(completionTime.getMinutes() + totalDelay);
    return completionTime;
  }

  /**
   * Get current itinerary for a trip
   */
  private async getCurrentItinerary(tripId: string) {
    return await prisma.itinerary.findFirst({
      where: { tripId },
      orderBy: { version: 'desc' }
    });
  }

  /**
   * Stop execution mode
   */
  async stopExecution(tripId: string): Promise<void> {
    const context = this.activeExecutions.get(tripId);
    if (context) {
      context.isActive = false;
      this.activeExecutions.delete(tripId);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(tripId: string): Promise<ExecutionContext | null> {
    return this.activeExecutions.get(tripId) || null;
  }

  /**
   * Apply optimization suggestion
   */
  async applyOptimization(tripId: string, optimizationId: string): Promise<void> {
    const context = this.activeExecutions.get(tripId);
    if (!context) return;

    const optimization = context.optimizations.find(opt => opt.activityId === optimizationId);
    if (optimization) {
      optimization.applied = true;
    }
  }
}
