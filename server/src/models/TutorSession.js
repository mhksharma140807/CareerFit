import mongoose from 'mongoose';

const tutorTurnSchema = new mongoose.Schema(
  {
    turnIndex: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    context: {
      type: String,
      default: '',
      trim: true,
    },
    expectedKeyPoints: {
      type: [String],
      default: [],
    },
    userResponse: {
      type: String,
      default: '',
      trim: true,
    },
    evaluation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      strengths: {
        type: [String],
        default: [],
      },
      missingPoints: {
        type: [String],
        default: [],
      },
      feedback: {
        type: String,
        default: '',
        trim: true,
      },
      exemplaryAnswer: {
        type: String,
        default: '',
        trim: true,
      },
      source: {
        type: String,
        enum: ['ai', 'deterministic'],
        default: 'deterministic',
      },
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const tutorSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workflow: {
      type: String,
      enum: [
        'weak_topic',
        'competency_drill',
        'mock_interview',
        'job_interview_prep',
        'mistake_remediation',
        'resume_project_prep',
        'communication_practice',
      ],
      required: true,
    },
    domain: {
      type: String,
      default: 'Technology and Software Development',
      trim: true,
    },
    roleTitle: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    targetTopic: {
      type: String,
      default: '',
      trim: true,
    },
    customJd: {
      type: String,
      default: '',
      trim: true,
    },
    contextSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    turns: [tutorTurnSchema],
    currentTurnIndex: {
      type: Number,
      default: 0,
    },
    maxTurns: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
      index: true,
    },
    summary: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      keyStrengths: {
        type: [String],
        default: [],
      },
      areasToImprove: {
        type: [String],
        default: [],
      },
      remediationAdvice: {
        type: String,
        default: '',
        trim: true,
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for student recent sessions query
tutorSessionSchema.index({ userId: 1, createdAt: -1 });

const TutorSession = mongoose.model('TutorSession', tutorSessionSchema);

export default TutorSession;
