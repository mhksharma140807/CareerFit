import mongoose from 'mongoose';

const readinessReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    assessmentScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    readinessIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete_assessment', 'incomplete_match'],
      default: 'complete',
    },
    matchedSkills: [{ type: String }],
    missingMandatorySkills: [{ type: String }],
    missingPreferredSkills: [{ type: String }],
    bonusSkills: [{ type: String }],
    verifiedStrengths: [{ type: String }],
    criticalGaps: [{ type: String }],
    recommendations: [{ type: String }],
    tasks: [
      {
        title: { type: String, required: true },
        category: { type: String, default: 'General' },
        isCompleted: { type: Boolean, default: false },
        linkUrl: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ReadinessReport = mongoose.model('ReadinessReport', readinessReportSchema);

