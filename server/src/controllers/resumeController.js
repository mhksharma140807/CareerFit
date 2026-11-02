import { StudentProfile } from '../models/StudentProfile.js';

// Curated technical skill dictionary for deterministic keyword detection
export const SKILL_DICTIONARY = [
  'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Node', 'Express', 'Express.js', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL',
  'Python', 'Java', 'C++', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Sass',
  'Redux', 'Zustand', 'GraphQL', 'REST APIs', 'REST', 'WebSockets',
  'Docker', 'Kubernetes', 'Linux', 'Git', 'GitHub', 'CI/CD', 'GitHub Actions',
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Firebase', 'Vercel', 'Render',
  'Redis', 'Microservices', 'OOP', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems',
  'Jest', 'Mocha', 'Postman', 'Figma', 'Pandas', 'NumPy', 'Machine Learning', 'Data Analysis',
];

export const extractSkillsFromText = async (req, res, next) => {
  try {
    const { text = '', saveToProfile = false } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Resume text is required for analysis.' });
    }

    const lowerText = text.toLowerCase();
    const detectedSet = new Set();

    SKILL_DICTIONARY.forEach((skill) => {
      // Word boundary check
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, 'i');
      if (regex.test(lowerText)) {
        detectedSet.add(skill);
      }
    });

    const detectedSkills = Array.from(detectedSet);

    let alreadyInProfile = [];
    let newlyDetected = detectedSkills;

    if (req.user) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        const studentLowerSkills = new Set((profile.skills || []).map((s) => s.toLowerCase()));
        alreadyInProfile = detectedSkills.filter((s) => studentLowerSkills.has(s.toLowerCase()));
        newlyDetected = detectedSkills.filter((s) => !studentLowerSkills.has(s.toLowerCase()));

        if (saveToProfile) {
          profile.resume = {
            rawText: text,
            filename: req.body.filename || 'manual_entry.txt',
            uploadedAt: new Date(),
          };
          await profile.save();
        }
      }
    }

    res.json({
      success: true,
      message: `Detected ${detectedSkills.length} technical skills from resume text.`,
      extractedSkills: detectedSkills,
      data: {
        totalDetected: detectedSkills.length,
        alreadyInProfile,
        newlyDetected,
        allDetected: detectedSkills,
        extractedSkills: detectedSkills,
        previewText: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    let extractedText = '';
    const filename = req.file.originalname || 'uploaded_resume';

    // If text file, read buffer directly as utf-8
    if (req.file.mimetype === 'text/plain' || filename.endsWith('.txt')) {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      // For PDF or binary files, attempt plain text extraction from buffer strings
      const rawBuf = req.file.buffer.toString('latin1');
      // Filter printable text blocks
      const printableMatches = rawBuf.match(/[\x20-\x7E\t\n\r]{4,}/g) || [];
      extractedText = printableMatches.join(' ');
    }

    // Extract skills from parsed document text
    const lowerText = extractedText.toLowerCase();
    const detectedSet = new Set();
    SKILL_DICTIONARY.forEach((skill) => {
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, 'i');
      if (regex.test(lowerText)) {
        detectedSet.add(skill);
      }
    });

    const detectedSkills = Array.from(detectedSet);

    // Save to student profile if user is logged in
    if (req.user && extractedText) {
      await StudentProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: {
            'resume.rawText': extractedText,
            'resume.filename': filename,
            'resume.uploadedAt': new Date(),
          },
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: `Resume file uploaded and parsed successfully. Detected ${detectedSkills.length} skills.`,
      filename,
      extractedSkills: detectedSkills,
      data: {
        filename,
        sizeBytes: req.file.size,
        text: extractedText,
        extractedSkills: detectedSkills,
        allDetected: detectedSkills,
        totalDetected: detectedSkills.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

