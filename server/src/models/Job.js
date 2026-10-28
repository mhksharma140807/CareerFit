import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote / On-site',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Junior', 'Mid', 'Senior'],
      default: 'Fresher',
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    isSample: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model('Job', jobSchema);
