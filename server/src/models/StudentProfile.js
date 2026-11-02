import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    graduationYear: {
      type: Number,
      min: [1990, 'Graduation year must be valid'],
      max: [2040, 'Graduation year must be valid'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String, trim: true },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        techStack: [{ type: String, trim: true }],
        link: { type: String, trim: true },
      },
    ],
    experience: [
      {
        title: { type: String, trim: true },
        company: { type: String, trim: true },
        duration: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    resume: {
      rawText: { type: String, default: '' },
      filename: { type: String, default: '' },
      uploadedAt: { type: Date },
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    improvementTasks: [
      {
        id: { type: String },
        title: { type: String, trim: true },
        category: { type: String, trim: true },
        isCompleted: { type: Boolean, default: false },
        linkUrl: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
