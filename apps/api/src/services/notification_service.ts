import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Notification {
  type: 'optimization' | 'delay' | 'closure' | 'weather' | 'traffic' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export interface PushNotification {
  userId: string;
  notification: Notification;
  sentAt: Date;
  read: boolean;
  actionTaken?: boolean;
}

export class NotificationService {
  /**
   * Send a notification to a user
   */
  async sendNotification(userId: string, notification: Notification): Promise<void> {
    try {
      // Store notification in database
      await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data ? JSON.stringify(notification.data) : null,
          priority: notification.priority || 'medium',
          expiresAt: notification.expiresAt,
          sentAt: new Date(),
          read: false
        }
      });

      // Send push notification if user has push enabled
      await this.sendPushNotification(userId, notification);

      // Send email notification for high priority items
      if (notification.priority === 'high') {
        await this.sendEmailNotification(userId, notification);
      }

      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, notification: Notification): Promise<void> {
    try {
      // Get user's push notification settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          email: true,
          pushToken: true, // You'd need to add this field to your schema
          notificationSettings: true // You'd need to add this field to your schema
        }
      });

      if (!user) return;

      // Check if user has push notifications enabled
      const settings = user.notificationSettings ? JSON.parse(user.notificationSettings) : {};
      if (settings.pushEnabled === false) return;

      // Check if user has a push token
      if (!user.pushToken) return;

      // Send push notification using a service like Firebase Cloud Messaging
      await this.sendFirebasePushNotification(user.pushToken, notification);

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send Firebase push notification
   */
  private async sendFirebasePushNotification(token: string, notification: Notification): Promise<void> {
    try {
      // This would integrate with Firebase Cloud Messaging
      // For now, we'll simulate the API call
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: notification.data ? {
          ...notification.data,
          type: notification.type,
          priority: notification.priority || 'medium'
        } : {
          type: notification.type,
          priority: notification.priority || 'medium'
        },
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            sound: notification.priority === 'high' ? 'default' : 'default',
            priority: notification.priority === 'high' ? 'high' : 'normal'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: notification.priority === 'high' ? 'default' : 'default',
              badge: 1
            }
          }
        }
      };

      // Simulate Firebase API call
      console.log('Firebase push notification would be sent:', message);
      
      // In real implementation:
      // const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(message)
      // });

    } catch (error) {
      console.error('Error sending Firebase push notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(userId: string, notification: Notification): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user?.email) return;

      // This would integrate with an email service like SendGrid, Mailgun, etc.
      const emailData = {
        to: user.email,
        subject: notification.title,
        template: 'notification',
        data: {
          name: user.name || 'Traveler',
          notification: notification,
          actionUrl: notification.data?.actionUrl || null
        }
      };

      // Simulate email sending
      console.log('Email notification would be sent:', emailData);

      // In real implementation:
      // await emailService.send(emailData);

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Send delay alert notification
   */
  async sendDelayAlert(
    userId: string, 
    tripId: string, 
    delayMinutes: number, 
    activityName: string
  ): Promise<void> {
    const notification: Notification = {
      type: 'delay',
      title: 'Travel Delay Detected',
      message: `You're ${delayMinutes} minutes behind schedule for "${activityName}". Tap to see alternative routes.`,
      priority: delayMinutes > 30 ? 'high' : 'medium',
      data: {
        tripId,
        delayMinutes,
        activityName,
        actionUrl: `/trip/${tripId}/execution?alert=delay`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send optimization suggestion notification
   */
  async sendOptimizationSuggestion(
    userId: string,
    tripId: string,
    optimizationType: string,
    reason: string
  ): Promise<void> {
    const notification: Notification = {
      type: 'optimization',
      title: 'Itinerary Optimization Available',
      message: `I've found a better way to organize your day: ${reason}. Tap to review changes.`,
      priority: 'medium',
      data: {
        tripId,
        optimizationType,
        reason,
        actionUrl: `/trip/${tripId}/optimize?type=${optimizationType}`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send closure alert notification
   */
  async sendClosureAlert(
    userId: string,
    tripId: string,
    activityName: string,
    alternativeSuggestions?: string[]
  ): Promise<void> {
    const message = alternativeSuggestions && alternativeSuggestions.length > 0
      ? `${activityName} is currently closed. I've found ${alternativeSuggestions.length} nearby alternatives.`
      : `${activityName} is currently closed. Tap to find alternatives.`;

    const notification: Notification = {
      type: 'closure',
      title: 'Activity Closed',
      message,
      priority: 'high',
      data: {
        tripId,
        activityName,
        alternativeSuggestions,
        actionUrl: `/trip/${tripId}/alternatives?activity=${encodeURIComponent(activityName)}`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send weather alert notification
   */
  async sendWeatherAlert(
    userId: string,
    tripId: string,
    weatherCondition: string,
    impact: string
  ): Promise<void> {
    const notification: Notification = {
      type: 'weather',
      title: 'Weather Alert',
      message: `${weatherCondition} may affect your plans: ${impact}. Tap for weather updates.`,
      priority: 'medium',
      data: {
        tripId,
        weatherCondition,
        impact,
        actionUrl: `/trip/${tripId}/weather`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send traffic alert notification
   */
  async sendTrafficAlert(
    userId: string,
    tripId: string,
    delayMinutes: number,
    routeDescription: string
  ): Promise<void> {
    const notification: Notification = {
      type: 'traffic',
      title: 'Traffic Alert',
      message: `Traffic will add ${delayMinutes} minutes to your journey via ${routeDescription}. Tap for alternative routes.`,
      priority: delayMinutes > 15 ? 'high' : 'medium',
      data: {
        tripId,
        delayMinutes,
        routeDescription,
        actionUrl: `/trip/${tripId}/routes?alert=traffic`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send reminder notification
   */
  async sendReminder(
    userId: string,
    tripId: string,
    activityName: string,
    minutesUntil: number
  ): Promise<void> {
    const notification: Notification = {
      type: 'reminder',
      title: 'Upcoming Activity',
      message: `${activityName} starts in ${minutesUntil} minutes. Time to head out!`,
      priority: 'medium',
      data: {
        tripId,
        activityName,
        minutesUntil,
        actionUrl: `/trip/${tripId}/execution`
      }
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<PushNotification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { 
          userId,
          expiresAt: { gt: new Date() } // Only non-expired notifications
        },
        orderBy: { sentAt: 'desc' },
        take: limit
      });

      return notifications.map(notification => ({
        userId: notification.userId,
        notification: {
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          data: notification.data ? JSON.parse(notification.data) : undefined,
          priority: notification.priority as any,
          expiresAt: notification.expiresAt || undefined
        },
        sentAt: notification.sentAt,
        read: notification.read,
        actionTaken: notification.actionTaken || false
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark notification action as taken
   */
  async markNotificationActionTaken(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { actionTaken: true }
      });
    } catch (error) {
      console.error('Error marking notification action taken:', error);
    }
  }

  /**
   * Delete expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      await prisma.notification.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    highPriority: number;
    byType: Record<string, number>;
  }> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        select: {
          type: true,
          read: true,
          priority: true
        }
      });

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        highPriority: notifications.filter(n => n.priority === 'high').length,
        byType: {} as Record<string, number>
      };

      // Count by type
      notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        unread: 0,
        highPriority: 0,
        byType: {}
      };
    }
  }
}
