import { Notification } from '../models/Notification.js';

/**
 * Creates a notification if a notification with the same eventFingerprint does not already exist for the user.
 */
export const triggerNotification = async ({
  userId,
  title,
  message,
  type,
  link = '',
  eventFingerprint = '',
}) => {
  try {
    if (!userId || !title || !message || !type) return null;

    if (eventFingerprint) {
      const existing = await Notification.findOne({ userId, eventFingerprint });
      if (existing) {
        return existing; // idempotent: already triggered
      }
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      eventFingerprint: eventFingerprint || `${type}_${Date.now()}`,
    });

    return notification;
  } catch (err) {
    console.error('Failed to trigger notification:', err.message);
    return null;
  }
};

