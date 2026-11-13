/**
 * Canonical CSE Skill Taxonomy & Normalizer
 * Categorized hierarchy covering Languages, Frontend, Backend, Databases,
 * Cloud/DevOps, Core CS, Testing/Tools, and AI/Data.
 */

export const SKILL_CATEGORIES = {
  LANGUAGES: 'Programming Languages',
  FRONTEND: 'Frontend Development',
  BACKEND: 'Backend & APIs',
  DATABASES: 'Databases & Storage',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  CORE_CS: 'Core Computer Science',
  TESTING_TOOLS: 'Testing & Developer Tools',
  AI_DATA: 'AI, ML & Data Science',
};

export const SKILL_DEFINITIONS = [
  // Programming Languages
  { canonical: 'C++', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['cpp', 'c plus plus', 'c/c++'] },
  { canonical: 'C#', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['csharp', 'c sharp'] },
  { canonical: 'C', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['ansi c', 'c language'] },
  { canonical: 'Python', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['python3', 'py'] },
  { canonical: 'Java', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['core java', 'java se', 'java ee'] },
  { canonical: 'JavaScript', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['js', 'ecmascript', 'es6', 'es6+'] },
  { canonical: 'TypeScript', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['ts'] },
  { canonical: 'Go', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['golang'] },
  { canonical: 'Rust', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['rustlang'] },
  { canonical: 'PHP', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['php7', 'php8'] },
  { canonical: 'Ruby', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['ruby lang'] },
  { canonical: 'Kotlin', category: SKILL_CATEGORIES.LANGUAGES, aliases: [] },
  { canonical: 'Swift', category: SKILL_CATEGORIES.LANGUAGES, aliases: [] },
  { canonical: 'Dart', category: SKILL_CATEGORIES.LANGUAGES, aliases: [] },
  { canonical: 'Scala', category: SKILL_CATEGORIES.LANGUAGES, aliases: [] },
  { canonical: 'R', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['r programming', 'r language'] },
  { canonical: 'SQL', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['structured query language', 't-sql', 'pl/sql'] },
  { canonical: 'Bash', category: SKILL_CATEGORIES.LANGUAGES, aliases: ['shell scripting', 'shell', 'sh', 'zsh'] },

  // Frontend Development
  { canonical: 'React', category: SKILL_CATEGORIES.FRONTEND, aliases: ['reactjs', 'react.js', 'react js'] },
  { canonical: 'Next.js', category: SKILL_CATEGORIES.FRONTEND, aliases: ['nextjs', 'next js', 'next'] },
  { canonical: 'Vue.js', category: SKILL_CATEGORIES.FRONTEND, aliases: ['vue', 'vuejs', 'vue 3', 'vue2'] },
  { canonical: 'Angular', category: SKILL_CATEGORIES.FRONTEND, aliases: ['angularjs', 'angular.js', 'angular 2+'] },
  { canonical: 'Svelte', category: SKILL_CATEGORIES.FRONTEND, aliases: ['sveltekit'] },
  { canonical: 'HTML5', category: SKILL_CATEGORIES.FRONTEND, aliases: ['html'] },
  { canonical: 'CSS3', category: SKILL_CATEGORIES.FRONTEND, aliases: ['css'] },
  { canonical: 'Tailwind CSS', category: SKILL_CATEGORIES.FRONTEND, aliases: ['tailwind', 'tailwindcss'] },
  { canonical: 'Bootstrap', category: SKILL_CATEGORIES.FRONTEND, aliases: ['bootstrap 5', 'bootstrap 4'] },
  { canonical: 'Sass', category: SKILL_CATEGORIES.FRONTEND, aliases: ['scss'] },
  { canonical: 'Redux', category: SKILL_CATEGORIES.FRONTEND, aliases: ['redux toolkit', 'rtk'] },
  { canonical: 'Zustand', category: SKILL_CATEGORIES.FRONTEND, aliases: [] },
  { canonical: 'Vite', category: SKILL_CATEGORIES.FRONTEND, aliases: [] },
  { canonical: 'Webpack', category: SKILL_CATEGORIES.FRONTEND, aliases: [] },
  { canonical: 'jQuery', category: SKILL_CATEGORIES.FRONTEND, aliases: [] },

  // Backend & APIs
  { canonical: 'Node.js', category: SKILL_CATEGORIES.BACKEND, aliases: ['nodejs', 'node', 'node js'] },
  { canonical: 'Express.js', category: SKILL_CATEGORIES.BACKEND, aliases: ['express', 'expressjs', 'express js'] },
  { canonical: 'Django', category: SKILL_CATEGORIES.BACKEND, aliases: ['django rest framework', 'drf'] },
  { canonical: 'Flask', category: SKILL_CATEGORIES.BACKEND, aliases: [] },
  { canonical: 'FastAPI', category: SKILL_CATEGORIES.BACKEND, aliases: [] },
  { canonical: 'Spring Boot', category: SKILL_CATEGORIES.BACKEND, aliases: ['springboot', 'spring framework', 'spring'] },
  { canonical: '.NET', category: SKILL_CATEGORIES.BACKEND, aliases: ['dotnet', '.net core', 'asp.net', 'asp.net core'] },
  { canonical: 'Nest.js', category: SKILL_CATEGORIES.BACKEND, aliases: ['nestjs'] },
  { canonical: 'Ruby on Rails', category: SKILL_CATEGORIES.BACKEND, aliases: ['rails'] },
  { canonical: 'Laravel', category: SKILL_CATEGORIES.BACKEND, aliases: [] },
  { canonical: 'REST APIs', category: SKILL_CATEGORIES.BACKEND, aliases: ['rest', 'rest api', 'restful apis', 'restful'] },
  { canonical: 'GraphQL', category: SKILL_CATEGORIES.BACKEND, aliases: ['apollo graphql'] },
  { canonical: 'WebSockets', category: SKILL_CATEGORIES.BACKEND, aliases: ['socket.io', 'websocket'] },
  { canonical: 'Microservices', category: SKILL_CATEGORIES.BACKEND, aliases: ['microservice architecture', 'micro-services'] },
  { canonical: 'gRPC', category: SKILL_CATEGORIES.BACKEND, aliases: ['grpc'] },

  // Databases & Storage
  { canonical: 'MongoDB', category: SKILL_CATEGORIES.DATABASES, aliases: ['mongo', 'mongoose'] },
  { canonical: 'PostgreSQL', category: SKILL_CATEGORIES.DATABASES, aliases: ['postgres', 'psql'] },
  { canonical: 'MySQL', category: SKILL_CATEGORIES.DATABASES, aliases: ['my-sql'] },
  { canonical: 'SQLite', category: SKILL_CATEGORIES.DATABASES, aliases: ['sqlite3'] },
  { canonical: 'Redis', category: SKILL_CATEGORIES.DATABASES, aliases: ['redis cache'] },
  { canonical: 'Firebase', category: SKILL_CATEGORIES.DATABASES, aliases: ['firestore', 'firebase realtime db'] },
  { canonical: 'Cassandra', category: SKILL_CATEGORIES.DATABASES, aliases: ['apache cassandra'] },
  { canonical: 'DynamoDB', category: SKILL_CATEGORIES.DATABASES, aliases: ['amazon dynamodb'] },
  { canonical: 'Oracle DB', category: SKILL_CATEGORIES.DATABASES, aliases: ['oracle database', 'oracle sql'] },
  { canonical: 'Prisma', category: SKILL_CATEGORIES.DATABASES, aliases: ['prisma orm'] },

  // Cloud & DevOps
  { canonical: 'Docker', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['docker containers', 'dockerfile'] },
  { canonical: 'Kubernetes', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['k8s'] },
  { canonical: 'Linux', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['ubuntu', 'unix', 'debian', 'centos'] },
  { canonical: 'Git', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['git version control'] },
  { canonical: 'GitHub', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'GitLab', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'CI/CD', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['continuous integration', 'cicd'] },
  { canonical: 'GitHub Actions', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'Jenkins', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'AWS', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'Azure', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['microsoft azure'] },
  { canonical: 'Google Cloud', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: ['gcp', 'google cloud platform'] },
  { canonical: 'Nginx', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'Vercel', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'Render', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },
  { canonical: 'Terraform', category: SKILL_CATEGORIES.CLOUD_DEVOPS, aliases: [] },

  // Core Computer Science
  { canonical: 'Data Structures', category: SKILL_CATEGORIES.CORE_CS, aliases: ['dsa', 'data structures and algorithms'] },
  { canonical: 'Algorithms', category: SKILL_CATEGORIES.CORE_CS, aliases: ['algorithm design', 'sorting algorithms'] },
  { canonical: 'OOP', category: SKILL_CATEGORIES.CORE_CS, aliases: ['oops', 'object oriented programming', 'object-oriented programming'] },
  { canonical: 'DBMS', category: SKILL_CATEGORIES.CORE_CS, aliases: ['database management systems', 'database management'] },
  { canonical: 'Operating Systems', category: SKILL_CATEGORIES.CORE_CS, aliases: ['os concepts'] },
  { canonical: 'Computer Networks', category: SKILL_CATEGORIES.CORE_CS, aliases: ['computer networking', 'cn', 'tcp/ip'] },
  { canonical: 'System Design', category: SKILL_CATEGORIES.CORE_CS, aliases: ['low level design', 'high level design', 'lld', 'hld'] },
  { canonical: 'Software Engineering', category: SKILL_CATEGORIES.CORE_CS, aliases: ['sdlc', 'agile', 'scrum'] },

  // Testing & Developer Tools
  { canonical: 'Jest', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: [] },
  { canonical: 'Mocha', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: [] },
  { canonical: 'Cypress', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: [] },
  { canonical: 'Postman', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: ['api testing'] },
  { canonical: 'Swagger', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: ['openapis', 'openapi'] },
  { canonical: 'JUnit', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: [] },
  { canonical: 'PyTest', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: ['pytest'] },
  { canonical: 'Figma', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: ['ui/ux design'] },
  { canonical: 'Jira', category: SKILL_CATEGORIES.TESTING_TOOLS, aliases: [] },

  // AI, ML & Data Science
  { canonical: 'Machine Learning', category: SKILL_CATEGORIES.AI_DATA, aliases: ['ml', 'applied machine learning'] },
  { canonical: 'Deep Learning', category: SKILL_CATEGORIES.AI_DATA, aliases: ['dl', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { canonical: 'NLP', category: SKILL_CATEGORIES.AI_DATA, aliases: ['natural language processing'] },
  { canonical: 'Computer Vision', category: SKILL_CATEGORIES.AI_DATA, aliases: ['cv', 'opencv'] },
  { canonical: 'TensorFlow', category: SKILL_CATEGORIES.AI_DATA, aliases: ['tf'] },
  { canonical: 'PyTorch', category: SKILL_CATEGORIES.AI_DATA, aliases: [] },
  { canonical: 'Scikit-Learn', category: SKILL_CATEGORIES.AI_DATA, aliases: ['sklearn'] },
  { canonical: 'Pandas', category: SKILL_CATEGORIES.AI_DATA, aliases: [] },
  { canonical: 'NumPy', category: SKILL_CATEGORIES.AI_DATA, aliases: [] },
  { canonical: 'Data Analysis', category: SKILL_CATEGORIES.AI_DATA, aliases: ['exploratory data analysis', 'eda'] },
  { canonical: 'Generative AI', category: SKILL_CATEGORIES.AI_DATA, aliases: ['genai', 'large language models', 'llm', 'rag'] },
];

// Pre-compute fast lookup tables
const ALIAS_TO_CANONICAL = new Map();
const CANONICAL_TO_CATEGORY = new Map();
const CANONICAL_SET = new Set();

SKILL_DEFINITIONS.forEach((def) => {
  const canonLower = def.canonical.toLowerCase();
  CANONICAL_SET.add(def.canonical);
  CANONICAL_TO_CATEGORY.set(def.canonical, def.category);
  ALIAS_TO_CANONICAL.set(canonLower, def.canonical);

  def.aliases.forEach((alias) => {
    ALIAS_TO_CANONICAL.set(alias.toLowerCase(), def.canonical);
  });
});

/**
 * Normalizes any skill variant or alias into its canonical name
 */
export const canonicalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  const clean = skill.trim();
  const lower = clean.toLowerCase();

  if (ALIAS_TO_CANONICAL.has(lower)) {
    return ALIAS_TO_CANONICAL.get(lower);
  }

  // Handle minor punctuations
  const stripped = lower.replace(/[._-]/g, '');
  if (ALIAS_TO_CANONICAL.has(stripped)) {
    return ALIAS_TO_CANONICAL.get(stripped);
  }

  // Return trimmed title case original if not in dictionary
  return clean;
};

/**
 * Returns category for a given skill
 */
export const getSkillCategory = (skill) => {
  const canonical = canonicalizeSkill(skill);
  return CANONICAL_TO_CATEGORY.get(canonical) || 'Other Technical Skills';
};

/**
 * Builds safe regex for a term, handling punctuation-heavy tech terms (C++, C#, .NET, Node.js)
 */
const buildTermRegex = (term) => {
  const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Starts with non-word character (e.g. .NET)
  const prefix = /^[^a-zA-Z0-9]/.test(term)
    ? '(?:^|[\\s,;/()[\\]{}])'
    : '(?:^|[\\s,;/()[\\]{}_])';

  // Ends with non-word character (e.g. C++, C#)
  const suffix = /[^a-zA-Z0-9]$/.test(term)
    ? '(?=[\\s,;/()[\\]{}.]|$|\\n)'
    : '(?=[\\s,;/()[\\]{}.\\-_]|$|\\n)';

  return new RegExp(`${prefix}${escaped}${suffix}`, 'i');
};

// Pre-compiled search terms ordered by descending length to match longest phrases first (e.g. "Tailwind CSS" before "CSS")
const COMPILED_SEARCH_TERMS = [];

SKILL_DEFINITIONS.forEach((def) => {
  const terms = [def.canonical, ...def.aliases];
  terms.forEach((term) => {
    // Avoid single-letter standalone matching for 'C' and 'R' directly without specific guard
    if (term === 'C' || term === 'R' || term === 'sh') return;

    COMPILED_SEARCH_TERMS.push({
      term,
      canonical: def.canonical,
      regex: buildTermRegex(term),
      length: term.length,
    });
  });
});

COMPILED_SEARCH_TERMS.sort((a, b) => b.length - a.length);

/**
 * Explicit regex guards for single-letter programming languages
 */
const C_LANG_REGEX = /(?:^|[\s,;/()[\\]{}])C(?=(?:\s*[,/&|]\s*(?:C\+\+|C#|Java|Python|Assembly)|\s+programming|\s+language))/i;
const R_LANG_REGEX = /(?:^|[\s,;/()[\\]{}])R(?=(?:\s*[,/&|]\s*(?:Python|SQL|Pandas)|\s+programming|\s+language))/i;

/**
 * Deterministically extracts skills from document text and section blocks
 */
export const extractSkillsDeterministically = (fullText = '', sections = null) => {
  if (!fullText || typeof fullText !== 'string') {
    return {
      skills: [],
      categorized: {},
      stats: { total: 0 },
      extractionSource: 'deterministic',
    };
  }

  const detectedSet = new Set();

  // Search full text
  for (const item of COMPILED_SEARCH_TERMS) {
    if (item.regex.test(fullText)) {
      detectedSet.add(item.canonical);
    }
  }

  // Handle single-letter languages with context guard
  if (C_LANG_REGEX.test(fullText)) {
    detectedSet.add('C');
  }
  if (R_LANG_REGEX.test(fullText)) {
    detectedSet.add('R');
  }

  // Prioritize technical skills section if available to check high-density lines
  if (sections && sections.skills) {
    for (const item of COMPILED_SEARCH_TERMS) {
      if (item.regex.test(sections.skills)) {
        detectedSet.add(item.canonical);
      }
    }
    if (C_LANG_REGEX.test(sections.skills)) {
      detectedSet.add('C');
    }
  }

  // Special multi-skill alias expansions (e.g. "DSA" -> Data Structures and Algorithms)
  if (/\b(?:dsa|data\s+structures\s+and\s+algorithms)\b/i.test(fullText)) {
    detectedSet.add('Data Structures');
    detectedSet.add('Algorithms');
  }

  const skills = Array.from(detectedSet);

  // Group by category
  const categorized = {};
  skills.forEach((skill) => {
    const category = getSkillCategory(skill);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(skill);
  });

  return {
    skills,
    categorized,
    stats: {
      total: skills.length,
      categoriesCount: Object.keys(categorized).length,
    },
    extractionSource: 'deterministic',
  };
};

