import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Normalizes and cleans raw document text
 */
export const cleanDocumentText = (rawText = '') => {
  if (!rawText || typeof rawText !== 'string') return '';

  return (
    rawText
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize various bullet points to hyphen
      .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA\u25BA]/g, '\n- ')
      // Normalize smart quotes and unicode dashes
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      // Replace tabs with spaces
      .replace(/\t+/g, ' ')
      // Replace multiple spaces on single line with one space
      .replace(/[^\S\n]+/g, ' ')
      // Collapse 3 or more newlines to 2 newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};

/**
 * Redacts personally identifiable information (PII) before external API transmission
 */
export const redactPII = (text = '') => {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Redact email addresses
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    '[REDACTED_EMAIL]'
  );

  // Redact phone numbers (international and local formats)
  sanitized = sanitized.replace(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,9}/g,
    (match) => {
      // Avoid redacting short 4-digit numbers like years (2020-2024)
      const digitsOnly = match.replace(/\D/g, '');
      if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        return '[REDACTED_PHONE]';
      }
      return match;
    }
  );

  // Redact potential physical postal codes or URLs containing personal domains
  sanitized = sanitized.replace(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s]+/gi, '[REDACTED_LINKEDIN]');
  sanitized = sanitized.replace(/https?:\/\/(?:www\.)?github\.com\/[^\s]+/gi, '[REDACTED_GITHUB]');

  return sanitized;
};

/**
 * Detects common resume sections and segments the content
 */
export const segmentResumeSections = (text = '') => {
  const cleaned = cleanDocumentText(text);
  const lines = cleaned.split('\n');

  const sections = {
    contact: '',
    summary: '',
    skills: '',
    experience: '',
    projects: '',
    education: '',
    certifications: '',
    other: '',
    fullText: cleaned,
  };

  const headerRegexes = [
    { key: 'skills', regex: /^(?:technical\s+skills|skills\s*(?:&|and)?\s*technologies|technical\s+proficiencies|core\s+competencies|skills|technologies|tools\s*(?:&|and)?\s*frameworks)[:\s-]*$/i },
    { key: 'experience', regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|internships?|experience|work\s+history)[:\s-]*$/i },
    { key: 'projects', regex: /^(?:projects|academic\s+projects|personal\s+projects|key\s+projects|technical\s+projects)[:\s-]*$/i },
    { key: 'education', regex: /^(?:education|academic\s+qualifications?|educational\s+background|academics)[:\s-]*$/i },
    { key: 'certifications', regex: /^(?:certifications?|licenses?|achievements?|courses?|awards?)[:\s-]*$/i },
    { key: 'summary', regex: /^(?:profile|summary|professional\s+summary|career\s+objective|about\s+me)[:\s-]*$/i },
  ];

  let currentKey = 'contact';
  const buffer = {
    contact: [],
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    other: [],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line represents a section heading
    let matchedHeader = false;
    for (const { key, regex } of headerRegexes) {
      if (regex.test(trimmed)) {
        currentKey = key;
        matchedHeader = true;
        break;
      }
    }

    if (!matchedHeader) {
      buffer[currentKey].push(line);
    }
  }

  for (const key of Object.keys(buffer)) {
    sections[key] = buffer[key].join('\n').trim();
  }

  return sections;
};

/**
 * Extracts raw text from an uploaded document buffer (PDF, DOCX, TXT)
 */
export const extractTextFromDocument = async ({ buffer, mimetype = '', originalname = '' }) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid or missing file buffer for document extraction.');
  }

  const nameLower = (originalname || '').toLowerCase();
  const isPdf = mimetype === 'application/pdf' || nameLower.endsWith('.pdf');
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    nameLower.endsWith('.docx');
  const isTxt = mimetype === 'text/plain' || nameLower.endsWith('.txt');

  let extractedRawText = '';
  let format = 'unknown';

  if (isPdf) {
    format = 'pdf';
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedRawText = result?.text || '';
    } catch (pdfErr) {
      throw new Error(`Failed to parse PDF document: ${pdfErr.message}`);
    }
  } else if (isDocx) {
    format = 'docx';
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedRawText = result?.value || '';
    } catch (docxErr) {
      throw new Error(`Failed to parse DOCX document: ${docxErr.message}`);
    }
  } else if (isTxt) {
    format = 'txt';
    try {
      extractedRawText = buffer.toString('utf-8');
    } catch (txtErr) {
      throw new Error(`Failed to read text file: ${txtErr.message}`);
    }
  } else {
    // Attempt graceful fallback: test if text stream or throw clear error
    try {
      const utf8Candidate = buffer.toString('utf-8');
      if (/^[\x20-\x7E\t\n\r]{10,}$/.test(utf8Candidate.slice(0, 200))) {
        extractedRawText = utf8Candidate;
        format = 'plain_text_fallback';
      } else {
        throw new Error(
          `Unsupported file format: ${originalname || mimetype || 'unknown'}. Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt).`
        );
      }
    } catch (err) {
      throw new Error(
        `Unsupported document format: ${originalname || mimetype}. Please upload a .pdf, .docx, or .txt file.`
      );
    }
  }

  const cleanedText = cleanDocumentText(extractedRawText);
  const sections = segmentResumeSections(cleanedText);

  return {
    format,
    cleanedText,
    sections,
    characterCount: cleanedText.length,
    wordCount: cleanedText ? cleanedText.split(/\s+/).filter(Boolean).length : 0,
  };
};

