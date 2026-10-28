import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from '../models/Job.js';
import { connectDB } from '../config/db.js';

export const sampleJobsData = [
  {
    title: 'Graduate Software Engineer (Full Stack)',
    company: 'TechNova Solutions',
    location: 'Bangalore / Hybrid',
    description: 'Looking for enthusiastic engineering graduates to join our product engineering team. You will build and maintain web applications using modern JavaScript frameworks, create RESTful APIs, and collaborate on database schema designs.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    preferredSkills: ['Git', 'REST APIs', 'Tailwind CSS', 'Docker'],
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    isSample: true,
  },
  {
    title: 'Frontend Developer (React)',
    company: 'Apex Digital Labs',
    location: 'Pune / Remote',
    description: 'Seeking a frontend developer skilled in building responsive user interfaces with React, state management, and CSS frameworks. Must understand component lifecycle, responsive design, and API integrations.',
    requiredSkills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git'],
    preferredSkills: ['Tailwind CSS', 'TypeScript', 'Redux', 'Jest'],
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    isSample: true,
  },
  {
    title: 'Backend Engineer (Node.js & MongoDB)',
    company: 'CloudPulse Systems',
    location: 'Hyderabad / On-site',
    description: 'Responsible for server-side logic, database management, and building high-performance APIs. You will work on auth workflows, data modeling in MongoDB, and caching strategies.',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'SQL'],
    preferredSkills: ['Redis', 'JWT', 'Microservices', 'Postman'],
    experienceLevel: 'Junior',
    jobType: 'Full-time',
    isSample: true,
  },
  {
    title: 'Data Analyst Intern',
    company: 'QuantEdge Analytics',
    location: 'Gurgaon / Hybrid',
    description: 'Great internship opportunity for students passionate about data. Work with structured datasets, perform statistical analysis, design dashboards, and extract insights.',
    requiredSkills: ['Python', 'SQL', 'Excel', 'Data Analysis'],
    preferredSkills: ['Pandas', 'PowerBI', 'Tableau', 'Statistics'],
    experienceLevel: 'Fresher',
    jobType: 'Internship',
    isSample: true,
  },
  {
    title: 'DevOps & Cloud Associate',
    company: 'SkyNet Infotech',
    location: 'Noida / Remote',
    description: 'Assist in setting up CI/CD automation pipelines, managing containerized deployments, and monitoring Linux cloud infrastructure.',
    requiredSkills: ['Linux', 'Git', 'Docker', 'Bash Scripting'],
    preferredSkills: ['AWS', 'CI/CD', 'Kubernetes', 'GitHub Actions'],
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    isSample: true,
  },
];

export const seedSampleJobs = async () => {
  try {
    let seededCount = 0;
    for (const job of sampleJobsData) {
      await Job.findOneAndUpdate(
        { title: job.title, company: job.company },
        { $set: job },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCount++;
    }
    console.log(`Sample jobs seeded successfully (${seededCount} verified/upserted, no duplicates).`);
    return { success: true, count: seededCount };
  } catch (error) {
    console.error('Error seeding sample jobs:', error.message);
    return { success: false, error: error.message };
  }
};

// Standalone execution support
if (process.argv[1]?.endsWith('seedJobs.js')) {
  dotenv.config();
  connectDB().then(async () => {
    await seedSampleJobs();
    await mongoose.connection.close();
    process.exit(0);
  });
}
