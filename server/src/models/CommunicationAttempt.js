import mongoose from 'mongoose';

const dimensionScoreSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const communicationAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scenarioId: {
      type: String,
      default: '',
    },
    scenario: {
      title: { type: String, required: true, trim: true },
      domain: { type: String, default: 'General Professional', trim: true },
      roleTitle: { type: String, default: 'Professional', trim: true },
      category: {
        type: String,
        enum: [
          'client_stakeholder',
          'project_decision',
          'workplace_conflict',
          'status_update',
          'problem_solution',
          'general',
        ],
        default: 'client_stakeholder',
      },
      format: {
        type: String,
        enum: ['Email', 'Executive Brief', 'Incident Report', 'Slack / Team Update', 'Memo'],
        default: 'Email',
      },
      recipient: { type: String, default: 'Colleague / Stakeholder', trim: true },
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
      },
      context: { type: String, required: true },
      prompt: { type: String, required: true },
      constraints: {
        minWords: { type: Number, default: 50 },
        maxWords: { type: Number, default: 350 },
        requiredElements: [{ type: String }],
      },
    },
    userResponse: {
      type: String,
      required: true,
      trim: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    dimensionScores: {
      clarity: { type: dimensionScoreSchema, required: true },
      structure: { type: dimensionScoreSchema, required: true },
      professionalTone: { type: dimensionScoreSchema, required: true },
      relevance: { type: dimensionScoreSchema, required: true },
      conciseness: { type: dimensionScoreSchema, required: true },
      grammar: { type: dimensionScoreSchema, required: true },
      problemFraming: { type: dimensionScoreSchema, required: true },
      actionability: { type: dimensionScoreSchema, required: true },
    },
    strengths: [{ type: String }],
    improvementAreas: [{ type: String }],
    suggestedRewrite: {
      type: String,
      default: '',
    },
    evaluationSource: {
      type: String,
      enum: ['ai', 'deterministic'],
      default: 'deterministic',
    },
    status: {
      type: String,
      enum: ['evaluated', 'draft'],
      default: 'evaluated',
    },
  },
  {
    timestamps: true,
  }
);

communicationAttemptSchema.index({ userId: 1, createdAt: -1 });

const CommunicationAttempt =
  mongoose.models.CommunicationAttempt ||
  mongoose.model('CommunicationAttempt', communicationAttemptSchema);

export default CommunicationAttempt;
