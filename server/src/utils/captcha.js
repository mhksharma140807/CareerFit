import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Readable character charset excluding ambiguous characters (0, O, 1, I, l)
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a random alphanumeric string of given length
 */
const generateRandomCode = (length = 6) => {
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[randomBytes[i] % CHARS.length];
  }
  return result;
};

/**
 * Generate an SVG captcha with noise lines, dots, and randomized character placement
 */
export const generateCaptcha = () => {
  const code = generateRandomCode(6);
  const width = 220;
  const height = 65;

  const bgColors = [
    '#f8fafc', // slate-50
    '#f1f5f9', // slate-100
    '#f0fdf4', // emerald-50
  ];
  const selectedBg = bgColors[Math.floor(Math.random() * bgColors.length)];

  // Text color palette (accessible, high-contrast)
  const colors = [
    '#0f172a', // slate-900
    '#047857', // emerald-700
    '#0369a1', // sky-700
    '#4338ca', // indigo-700
    '#b45309', // amber-700
    '#be123c', // rose-700
  ];

  // Generate random noise lines
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const strokeColor = colors[Math.floor(Math.random() * colors.length)];
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.2" stroke-opacity="0.35" />`;
  }

  // Generate random noise dots
  let dots = '';
  for (let i = 0; i < 25; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" opacity="0.4" />`;
  }

  // Render each character with rotation and slight jitter
  let charsSvg = '';
  const charSpacing = (width - 40) / code.length;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = 20 + i * charSpacing + (Math.random() * 4 - 2);
    const y = 42 + (Math.random() * 8 - 4);
    const rotate = (Math.random() * 32 - 16).toFixed(1);
    const fontSize = Math.floor(Math.random() * 6) + 26; // 26-31px
    const color = colors[Math.floor(Math.random() * colors.length)];

    charsSvg += `
      <text
        x="${x}"
        y="${y}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        transform="rotate(${rotate}, ${x}, ${y})"
        letter-spacing="2"
      >${char}</text>
    `;
  }

  // Build complete SVG markup
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="border-radius: 12px; border: 1px solid #cbd5e1; background: ${selectedBg}; user-select: none;">
      <defs>
        <pattern id="noise-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 20 M 0 0 L 20 20" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#noise-grid)" />
      ${lines}
      ${dots}
      ${charsSvg}
    </svg>
  `.trim();

  // Create cryptographic hash of normalized solution
  const solutionHash = crypto
    .createHash('sha256')
    .update(code.trim().toUpperCase())
    .digest('hex');

  // Sign a JWT token valid for 10 minutes
  const secret = process.env.JWT_SECRET || 'careerfit_captcha_secret_min_32_characters';
  const captchaToken = jwt.sign(
    {
      solutionHash,
      purpose: 'password_reset_captcha',
    },
    secret,
    { expiresIn: '10m' }
  );

  return {
    captchaSvg: svg,
    captchaToken,
  };
};

/**
 * Verify submitted captcha answer against the signed token
 */
export const verifyCaptcha = (captchaToken, userAnswer) => {
  if (!captchaToken || !userAnswer) {
    return {
      isValid: false,
      error: 'CAPTCHA token and answer are required.',
    };
  }

  try {
    const secret = process.env.JWT_SECRET || 'careerfit_captcha_secret_min_32_characters';
    const decoded = jwt.verify(captchaToken, secret);

    if (decoded.purpose !== 'password_reset_captcha') {
      return { isValid: false, error: 'Invalid CAPTCHA token format.' };
    }

    const submittedHash = crypto
      .createHash('sha256')
      .update(userAnswer.trim().toUpperCase())
      .digest('hex');

    if (submittedHash !== decoded.solutionHash) {
      return { isValid: false, error: 'Incorrect CAPTCHA answer. Please try again.' };
    }

    return { isValid: true, error: null };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { isValid: false, error: 'CAPTCHA has expired. Please click refresh for a new CAPTCHA.' };
    }
    return { isValid: false, error: 'Invalid or corrupted CAPTCHA token.' };
  }
};

