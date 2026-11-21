import mongoose from 'mongoose';

const tutorQuotaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true, // format: "YYYY-MM-DD"
      index: true,
    },
    requestCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one record per user per calendar day
tutorQuotaSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

const TutorQuota = mongoose.model('TutorQuota', tutorQuotaSchema);

export default TutorQuota;
