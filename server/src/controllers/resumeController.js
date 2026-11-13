import { StudentProfile } from '../models/StudentProfile.js';
import { extractTextFromDocument, segmentResumeSections } from '../utils/documentParser.js';
import {
  extractSkillsDeterministically,
  canonicalizeSkill,
  getSkillCategory,
  SKILL_DEFINITIONS,
} from '../utils/skillTaxonomy.js';
import { extractSkillsWithGemini, isGeminiConfigured } from '../services/aiService.js';

// Export legacy array for any backwards-compatibility references
export const SKILL_DICTIONARY = SKILL_DEFINITIONS.map((s) => s.canonical);

/**
 * Hybrid extraction pipeline: Tries Gemini Flash first, gracefully falls back to deterministic taxonomy
 */
const runHybridSkillExtraction = async (cleanedText, sections) => {
  // 1. If Gemini is configured, attempt AI extraction
  if (isGeminiConfigured()) {
    try {
      const aiResult = await extractSkillsWithGemini(cleanedText, sections);
      if (aiResult && Array.isArray(aiResult.skills) && aiResult.skills.length > 0) {
        return aiResult;
      }
    } catch (aiErr) {
      console.warn('[Resume Extraction] Gemini attempt failed, using deterministic fallback:', aiErr.message);
    }
  }

  // 2. Deterministic rule-based extraction (autonomous fallback)
  return extractSkillsDeterministically(cleanedText, sections);
};

/**
 * Handles plain text skill extraction (pasted resume or text entry)
 */
export const extractSkillsFromText = async (req, res, next) => {
  try {
    const { text = '', saveToProfile = false } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Resume text is required for analysis.' });
    }

    const sections = segmentResumeSections(text);
    const extraction = await runHybridSkillExtraction(text, sections);
    const detectedSkills = extraction.skills;

    let alreadyInProfile = [];
    let newlyDetected = detectedSkills;

    if (req.user) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        const studentCanonicalSkills = new Set((profile.skills || []).map(canonicalizeSkill));
        alreadyInProfile = detectedSkills.filter((s) => studentCanonicalSkills.has(s));
        newlyDetected = detectedSkills.filter((s) => !studentCanonicalSkills.has(s));

        if (saveToProfile) {
          // Merge unique skills into profile
          const mergedSet = new Set([...(profile.skills || []), ...detectedSkills]);
          profile.skills = Array.from(mergedSet);
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
      message: `Detected ${detectedSkills.length} technical skills (${extraction.extractionSource === 'ai' ? 'AI-analyzed' : 'Deterministic'}).`,
      extractedSkills: detectedSkills,
      data: {
        totalDetected: detectedSkills.length,
        alreadyInProfile,
        newlyDetected,
        allDetected: detectedSkills,
        extractedSkills: detectedSkills,
        categorized: extraction.categorized || {},
        extractionSource: extraction.extractionSource,
        modelUsed: extraction.modelUsed || null,
        previewText: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles resume file upload (PDF, DOCX, TXT) with stream decompression & hybrid skill extraction
 */
export const handleFileUpload = async (req, res, next) => {
  try {
    const file = req.file || (req.files && req.files[0]);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded. Please upload a PDF (.pdf), Word document (.docx), or text (.txt) file.',
      });
    }

    const filename = file.originalname || 'uploaded_resume';

    // 1. Parse document text properly using stream decompression
    const docResult = await extractTextFromDocument({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: filename,
    });

    const { cleanedText, sections, format } = docResult;

    if (!cleanedText || cleanedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Unable to extract readable text from this document. Please ensure it is not a scanned image or password-protected.',
      });
    }

    // 2. Perform hybrid extraction (Gemini -> Deterministic Taxonomy fallback)
    const extraction = await runHybridSkillExtraction(cleanedText, sections);
    const detectedSkills = extraction.skills;

    // 3. Save to student profile if user is authenticated
    if (req.user && cleanedText) {
      await StudentProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: {
            'resume.rawText': cleanedText,
            'resume.filename': filename,
            'resume.uploadedAt': new Date(),
          },
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: `Resume file parsed successfully (${format.toUpperCase()}). Detected ${detectedSkills.length} skills (${extraction.extractionSource === 'ai' ? 'AI-powered' : 'Deterministic rule-based'}).`,
      filename,
      extractedSkills: detectedSkills,
      data: {
        filename,
        format,
        sizeBytes: file.size,
        text: cleanedText,
        extractedSkills: detectedSkills,
        allDetected: detectedSkills,
        totalDetected: detectedSkills.length,
        categorized: extraction.categorized || {},
        sections: {
          skills: sections.skills || '',
          experience: sections.experience || '',
          projects: sections.projects || '',
          education: sections.education || '',
        },
        extractionSource: extraction.extractionSource,
        modelUsed: extraction.modelUsed || null,
        projects: extraction.projects || [],
        summary: extraction.summary || '',
      },
    });
  } catch (error) {
    next(error);
  }
};
