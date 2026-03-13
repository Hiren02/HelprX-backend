const { Notification, Worker } = require('../../database/models');
const { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } = require('../../common/constants');
const { Op } = require('sequelize');
const logger = require('../../common/utils/logger');

// Uncomment to enable external notification services
// const twilio = require('twilio');
// const nodemailer = require('nodemailer');
// const admin = require('firebase-admin');

class NotificationService {
  constructor() {
    // Initialize notification services
    // this.initializeTwilio();
    // this.initializeEmail();
    // this.initializeFCM();
  }

  /**
   * Send job notification to worker or user
   */
  async sendJobNotification(recipientId, job, notificationType) {
    const notificationData = this.getJobNotificationData(job, notificationType);

    // Send in-app notification
    await this.sendInAppNotification(recipientId, notificationData, notificationType);

    // Send push notification (commented out)
    // await this.sendPushNotification(recipientId, notificationData);

    // Send SMS for critical notifications (commented out)
    // if (this.isCriticalNotification(notificationType)) {
    //   await this.sendSMS(recipientId, notificationData.body);
    // }
  }

  /**
   * Get notification data based on job and type
   */
  getJobNotificationData(job, notificationType) {
    const serviceName = job.serviceType || 'job';
    const notifications = {
      job_available: {
        title: 'New Job Available',
        body: `New ${serviceName} job available near you`,
        data: { jobId: job.id, serviceType: job.serviceType },
      },
      job_assigned: {
        title: 'Job Assigned',
        body: job.assignedWorker 
          ? `Your ${serviceName} job has been assigned to ${job.assignedWorker.name}`
          : `Your ${serviceName} job has been assigned to a worker`,
        data: { jobId: job.id },
      },
      job_started: {
        title: 'Job Started',
        body: `Worker has started working on your ${serviceName} job`,
        data: { jobId: job.id },
      },
      job_completed: {
        title: 'Job Completed',
        body: `Your ${serviceName} job has been completed`,
        data: { jobId: job.id },
      },
      job_cancelled: {
        title: 'Job Cancelled',
        body: `Your ${serviceName} job has been cancelled`,
        data: { jobId: job.id },
      },
    };

    return notifications[notificationType] || notifications.job_available;
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(recipientId, notificationData, type) {
    try {
      // Determine if recipientId is a workerId or userId
      // Based on type: job_available is for workers
      const isWorkerNotification = type === 'job_available';
      
      const notificationFields = {
        type,
        channel: NOTIFICATION_CHANNELS.IN_APP,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
        sentAt: new Date(),
        deliveryStatus: 'sent',
      };

      if (isWorkerNotification) {
        notificationFields.workerId = recipientId;
      } else {
        notificationFields.userId = recipientId;
      }

      await Notification.create(notificationFields);

      logger.info(`In-app notification sent to ${recipientId} (Type: ${type})`);
    } catch (error) {
      logger.error(`Failed to send in-app notification:`, error);
    }
  }

  /**
   * Send push notification via FCM
   * COMMENTED OUT - Uncomment to enable
   */
  /*
  async sendPushNotification(recipientId, notificationData) {
    try {
      // Get user's FCM token from database
      const user = await User.findByPk(recipientId);
      if (!user || !user.fcmToken) {
        return;
      }

      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: notificationData.data,
        token: user.fcmToken,
      };

      await admin.messaging().send(message);
      logger.info(`Push notification sent to ${recipientId}`);
    } catch (error) {
      logger.error(`Failed to send push notification:`, error);
    }
  }
  */

  /**
   * Send SMS via Twilio
   * COMMENTED OUT - Uncomment to enable
   */
  /*
  async sendSMS(recipientId, message) {
    try {
      const user = await User.findByPk(recipientId);
      if (!user || !user.phone) {
        return;
      }

      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone,
      });

      logger.info(`SMS sent to ${recipientId}`);
    } catch (error) {
      logger.error(`Failed to send SMS:`, error);
    }
  }
  */

  /**
   * Send email notification
   * COMMENTED OUT - Uncomment to enable
   */
  /*
  async sendEmail(recipientId, subject, htmlContent) {
    try {
      const user = await User.findByPk(recipientId);
      if (!user || !user.email) {
        return;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject,
        html: htmlContent,
      });

      logger.info(`Email sent to ${recipientId}`);
    } catch (error) {
      logger.error(`Failed to send email:`, error);
    }
  }
  */

  /**
   * Check if notification is critical
   */
  isCriticalNotification(type) {
    const criticalTypes = [
      NOTIFICATION_TYPES.JOB_ASSIGNED,
      NOTIFICATION_TYPES.JOB_CANCELLED,
      NOTIFICATION_TYPES.PAYMENT_FAILED,
    ];
    return criticalTypes.includes(type);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = filters;
    const offset = (page - 1) * limit;

    // Handle string booleans from query params
    const isUnreadOnly = unreadOnly === true || unreadOnly === 'true';

    // Find associated worker if exists to fetch their notifications too
    const worker = await Worker.findOne({ where: { userId } });
    
    const where = {
      [Op.or]: [
        { userId },
      ]
    };

    if (worker) {
      where[Op.or].push({ workerId: worker.id });
    }

    if (isUnreadOnly) {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const worker = await Worker.findOne({ where: { userId } });
    const where = {
      id: notificationId,
      [Op.or]: [
        { userId },
      ]
    };

    if (worker) {
      where[Op.or].push({ workerId: worker.id });
    }

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const worker = await Worker.findOne({ where: { userId } });
    const where = {
      isRead: false,
      [Op.or]: [
        { userId },
      ]
    };

    if (worker) {
      where[Op.or].push({ workerId: worker.id });
    }

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where }
    );
  }
}

module.exports = new NotificationService();
