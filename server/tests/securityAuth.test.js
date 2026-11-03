import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, validatePassword } from '../src/utils/securityValidators.js';
import { generateCaptcha, verifyCaptcha } from '../src/utils/captcha.js';

test('Security Validators — Email Tests', async (t) => {
  await t.test('accepts valid university and corporate emails', () => {
    assert.equal(validateEmail('student@college.edu').isValid, true);
    assert.equal(validateEmail('rohan.sharma@domain.ac.in').isValid, true);
    assert.equal(validateEmail('user_123@sub.example.com').isValid, true);
  });

  await t.test('rejects malformed and invalid emails', () => {
    assert.equal(validateEmail('notanemail').isValid, false);
    assert.equal(validateEmail('user@').isValid, false);
    assert.equal(validateEmail('@domain.com').isValid, false);
    assert.equal(validateEmail('user@domain').isValid, false);
    assert.equal(validateEmail('user..name@domain.com').isValid, false);
    assert.equal(validateEmail('').isValid, false);
    assert.equal(validateEmail(null).isValid, false);
  });
});

test('Security Validators — Password Tests', async (t) => {
  await t.test('accepts strong passwords meeting all 5 criteria', () => {
    const valid = validatePassword('CareerFit@2026!');
    assert.equal(valid.isValid, true);
    assert.equal(valid.strength, 'strong');
    assert.equal(valid.errors.length, 0);
  });

  await t.test('rejects weak passwords lacking complexity or length', () => {
    // Too short
    const short = validatePassword('Ab1!');
    assert.equal(short.isValid, false);
    assert.ok(short.errors.some((e) => e.includes('8 characters')));

    // No uppercase
    const noUpper = validatePassword('careerfit@123');
    assert.equal(noUpper.isValid, false);
    assert.ok(noUpper.errors.some((e) => e.includes('uppercase')));

    // No lowercase
    const noLower = validatePassword('CAREERFIT@123');
    assert.equal(noLower.isValid, false);
    assert.ok(noLower.errors.some((e) => e.includes('lowercase')));

    // No number
    const noNumber = validatePassword('CareerFit@Pass');
    assert.equal(noNumber.isValid, false);
    assert.ok(noNumber.errors.some((e) => e.includes('number')));

    // No special char
    const noSpecial = validatePassword('CareerFit2026');
    assert.equal(noSpecial.isValid, false);
    assert.ok(noSpecial.errors.some((e) => e.includes('special character')));
  });
});

test('CAPTCHA Engine — Generation and Cryptographic Verification', async (t) => {
  await t.test('generates valid SVG markup and signed token', () => {
    const captcha = generateCaptcha();
    assert.ok(captcha.captchaSvg.includes('<svg'));
    assert.ok(captcha.captchaSvg.includes('</svg>'));
    assert.ok(captcha.captchaToken);
  });

  await t.test('rejects incorrect captcha answer', () => {
    const captcha = generateCaptcha();
    const result = verifyCaptcha(captcha.captchaToken, 'WRONGANSWER');
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes('Incorrect CAPTCHA'));
  });

  await t.test('rejects invalid or empty captcha token', () => {
    const result = verifyCaptcha('invalid.jwt.token', 'ABC123');
    assert.equal(result.isValid, false);
  });
});

