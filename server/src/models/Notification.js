import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['job_match', 'assessment_result', 'readiness_update', 'profile_completion', 'system'],
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    eventFingerprint: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee trigger idempotency and avoid duplicate notifications
notificationSchema.index({ userId: 1, eventFingerprint: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);

