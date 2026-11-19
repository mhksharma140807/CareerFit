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

/**
 * Deterministically parses any raw job description across multiple domains
 * Identifies requirements, preferred skills, role title, and domain without external AI APIs.
 */
export const parseJobDescriptionDeterministic = (rawText = '', hintTitle = '', hintCompany = '') => {
  const cleaned = cleanDocumentText(rawText);
  if (!cleaned) {
    return {
      domain: 'General',
      roleTitle: hintTitle || 'Target Role',
      company: hintCompany || 'Target Employer',
      mandatorySkills: [],
      preferredSkills: [],
      transferableSkills: [],
      roleSummary: '',
      extractionSource: 'deterministic',
    };
  }

  // 1. Detect Domain from Text Keywords
  const domainKeywords = {
    'Technology & Software': [
      'software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'api', 'react', 'node',
      'python', 'java', 'c++', 'cloud', 'aws', 'docker', 'kubernetes', 'database', 'git', 'devops',
    ],
    'Data & Analytics': [
      'data analyst', 'data science', 'analytics', 'tableau', 'power bi', 'sql', 'pandas', 'statistics',
      'machine learning', 'bi analyst', 'etl', 'data warehouse', 'quantitative',
    ],
    'Finance & Accounting': [
      'finance', 'financial analyst', 'accounting', 'audit', 'tax', 'balance sheet', 'cash flow', 'valuation',
      'dcf', 'excel', 'financial modeling', 'gaap', 'reconciliation', 'banking', 'investment',
    ],
    'Business & Product': [
      'product manager', 'apm', 'business analyst', 'roadmap', 'scrum', 'agile', 'prd', 'kpi', 'stakeholder',
      'strategy', 'operations', 'project manager', 'market research', 'user stories',
    ],
    'Marketing & Sales': [
      'marketing', 'seo', 'sem', 'campaign', 'social media', 'content', 'growth', 'sales', 'lead generation',
      'crm', 'hubspot', 'conversion rate', 'copywriting', 'b2b', 'roas',
    ],
    'Human Resources': [
      'hr', 'human resources', 'recruiting', 'talent acquisition', 'onboarding', 'payroll', 'employee relations',
      'sourcing', 'ats', 'interviewing', 'people operations',
    ],
    'Design & Creative': [
      'ui/ux', 'product designer', 'figma', 'wireframe', 'prototype', 'user research', 'graphic design',
      'adobe', 'photoshop', 'illustrator', 'design system', 'typography',
    ],
  };

  const lowerText = cleaned.toLowerCase();
  let detectedDomain = 'Technology & Software'; // default
  let highestDomainCount = 0;

  for (const [domainName, keywords] of Object.entries(domainKeywords)) {
    let count = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw)) count++;
    }
    if (count > highestDomainCount) {
      highestDomainCount = count;
      detectedDomain = domainName;
    }
  }

  // 2. Identify Role Title if not provided
  let inferredTitle = hintTitle;
  if (!inferredTitle) {
    const firstFewLines = cleaned.split('\n').filter((l) => l.trim().length > 3 && l.trim().length < 80);
    const titleRegex = /(?:job title|role|position|looking for a|hiring a|seeking a)\s*[:\-]?\s*([A-Za-z0-9\s/]+)/i;
    for (const line of firstFewLines.slice(0, 5)) {
      const match = line.match(titleRegex);
      if (match && match[1]) {
        inferredTitle = match[1].trim();
        break;
      }
    }
    if (!inferredTitle && firstFewLines.length > 0) {
      inferredTitle = firstFewLines[0].replace(/[-_#*]/g, '').trim();
    }
  }

  // 3. Segment into Mandatory vs. Preferred sections
  const lines = cleaned.split('\n');
  const mandatoryLines = [];
  const preferredLines = [];
  const generalLines = [];

  let currentSection = 'general';

  const mandatoryHeaderRegex = /^(?:requirements|qualifications|what (?:you'll|you will) need|must have|skills required|basic qualifications|core skills|who you are)/i;
  const preferredHeaderRegex = /^(?:preferred|nice to have|bonus|good to have|desired qualifications|plus|what sets you apart)/i;
  const sectionBoundaryRegex = /^[A-Z\s]{3,30}:?$|^(?:about|responsibilities|benefits|perks|compensation|overview|what you'll do)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (preferredHeaderRegex.test(trimmed)) {
      currentSection = 'preferred';
      continue;
    } else if (mandatoryHeaderRegex.test(trimmed)) {
      currentSection = 'mandatory';
      continue;
    } else if (sectionBoundaryRegex.test(trimmed)) {
      currentSection = 'general';
    }

    if (currentSection === 'mandatory') {
      mandatoryLines.push(trimmed);
    } else if (currentSection === 'preferred') {
      preferredLines.push(trimmed);
    } else {
      generalLines.push(trimmed);
    }
  }

  // 4. Extract Skills using universal pattern matching
  const extractSkillsFromLines = (textList) => {
    const textBlob = textList.join('\n');
    const detected = new Set();

    // Universal cross-domain skill dictionary
    const universalSkills = [
      // Tech
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', '.NET', 'React', 'Node.js', 'Express',
      'Angular', 'Vue', 'Next.js', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'REST APIs', 'GraphQL', 'HTML5', 'CSS3', 'Tailwind CSS',
      // Data
      'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'R', 'Machine Learning', 'Data Modeling',
      // Business & Product
      'Product Strategy', 'Agile', 'Scrum', 'Jira', 'User Research', 'Wireframing', 'PRD Writing', 'A/B Testing',
      'Roadmap Planning', 'Stakeholder Management', 'Market Research', 'KPI Analysis',
      // Finance
      'Financial Modeling', 'DCF Valuation', 'Budgeting', 'Financial Reporting', 'Forecasting', 'Variance Analysis',
      'Cash Flow', 'Internal Controls', 'Auditing', 'GAAP', 'QuickBooks', 'SAP',
      // Marketing
      'SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Copywriting',
      'Email Marketing', 'Brand Strategy', 'PPC Advertising', 'HubSpot', 'Conversion Optimization',
      // HR
      'Talent Acquisition', 'Full-Cycle Recruiting', 'Onboarding', 'Employee Engagement', 'HRIS', 'ATS',
      'Labor Laws', 'Performance Management', 'Structured Interviewing',
      // Design
      'Figma', 'UI/UX Design', 'User Personas', 'Information Architecture', 'Usability Testing', 'Adobe Creative Suite',
      // Transferable
      'Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Team Collaboration', 'Time Management',
    ];

    universalSkills.forEach((skill) => {
      // Escape punctuation for safe regex
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;•/\\(])${escaped}(?:$|[\\s,;•/\\).!?:])`, 'i');
      if (regex.test(textBlob)) {
        detected.add(skill);
      }
    });

    return Array.from(detected);
  };

  let mandatorySkills = extractSkillsFromLines(mandatoryLines.length > 0 ? mandatoryLines : generalLines);
  let preferredSkills = extractSkillsFromLines(preferredLines);

  // If no separation found, split top 60% as mandatory, rest as preferred
  if (preferredSkills.length === 0 && mandatorySkills.length > 5) {
    const all = [...mandatorySkills];
    const cutoff = Math.ceil(all.length * 0.65);
    mandatorySkills = all.slice(0, cutoff);
    preferredSkills = all.slice(cutoff);
  } else if (mandatorySkills.length === 0 && generalLines.length > 0) {
    const all = extractSkillsFromLines(generalLines);
    const cutoff = Math.ceil(all.length * 0.7);
    mandatorySkills = all.slice(0, cutoff);
    preferredSkills = all.slice(cutoff);
  }

  // De-duplicate: preferred skills shouldn't duplicate mandatory
  preferredSkills = preferredSkills.filter((p) => !mandatorySkills.includes(p));

  // Extract transferable soft skills
  const transferableKeywords = ['Communication', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Team Collaboration', 'Time Management'];
  const transferableSkills = mandatorySkills.filter((s) => transferableKeywords.includes(s));

  return {
    domain: detectedDomain,
    roleTitle: inferredTitle || 'Custom Career Opportunity',
    company: hintCompany || 'Target Employer',
    mandatorySkills,
    preferredSkills,
    transferableSkills,
    roleSummary: cleaned.slice(0, 240).replace(/\n+/g, ' ') + '...',
    extractionSource: 'deterministic',
  };
};


