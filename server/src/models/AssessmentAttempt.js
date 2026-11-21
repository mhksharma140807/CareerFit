import mongoose from 'mongoose';

const assessmentAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    isAdaptive: {
      type: Boolean,
      default: false,
    },
    stage: {
      type: Number,
      default: 1,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    competencyBreakdown: [
      {
        competency: { type: String, required: true },
        totalQuestions: { type: Number, required: true },
        correctCount: { type: Number, required: true },
        accuracy: { type: Number, required: true },
        isWeak: { type: Boolean, default: false },
      },
    ],
    weakCompetencies: [{ type: String }],
    strongCompetencies: [{ type: String }],
    assessmentCoverage: {
      type: Number,
      default: 100,
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        questionText: { type: String, default: '' },
        options: [{ type: String }],
        correctOption: { type: Number },
        explanation: { type: String, default: '' },
        competency: { type: String, default: 'General' },
        topic: { type: String, default: 'General' },
        difficulty: { type: String, default: 'Medium' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
export default AssessmentAttempt;
