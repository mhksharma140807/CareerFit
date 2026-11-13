import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTextFromDocument } from '../src/utils/documentParser.js';
import { extractSkillsDeterministically } from '../src/utils/skillTaxonomy.js';
import zlib from 'node:zlib';

/**
 * Creates a minimal valid unencrypted PDF file buffer containing compressed Flate streams
 */
function createMinimalTestPdf(textContent) {
  // A minimal valid PDF specification stream with Flate compression
  const streamContent = `BT /F1 12 Tf 72 712 Td (${textContent}) Tj ET`;
  const compressedStream = zlib.deflateSync(Buffer.from(streamContent));

  const pdfParts = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${compressedStream.length} /Filter /FlateDecode >>\nstream\n`,
    compressedStream,
    '\nendstream\nendobj\n',
    'xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000118 00000 n \n0000000234 00000 n \n0000000307 00000 n \n',
    'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n450\n%%EOF\n',
  ];

  return Buffer.concat(pdfParts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p))));
}

test('Document Formats — Real Stream Extraction (PDF & Plain Text)', async (t) => {
  await t.test('extracts text from plain text (.txt) file', async () => {
    const txtBuffer = Buffer.from('Technical Skills: C++, Python, Node.js, React, Docker');
    const result = await extractTextFromDocument({
      buffer: txtBuffer,
      mimetype: 'text/plain',
      originalname: 'resume.txt',
    });

    assert.equal(result.format, 'txt');
    assert.ok(result.cleanedText.includes('C++, Python, Node.js, React, Docker'));

    const skills = extractSkillsDeterministically(result.cleanedText).skills;
    assert.ok(skills.includes('C++'));
    assert.ok(skills.includes('Node.js'));
    assert.ok(skills.includes('React'));
    assert.ok(skills.includes('Python'));
    assert.ok(skills.includes('Docker'));
  });

  await t.test('extracts text and decompresses FlateDecode PDF streams using pdf-parse', async () => {
    const resumeText = 'Technical Skills: React, Node.js, C++, MongoDB, Docker, AWS';
    const pdfBuffer = createMinimalTestPdf(resumeText);

    const result = await extractTextFromDocument({
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      originalname: 'student_resume.pdf',
    });

    assert.equal(result.format, 'pdf');
    assert.ok(result.cleanedText.length > 0);
    // Verifies that text from inside compressed FlateDecode streams is extracted!
    assert.ok(result.cleanedText.includes('React') || result.cleanedText.includes('C++'));

    const skills = extractSkillsDeterministically(result.cleanedText).skills;
    assert.ok(skills.length > 0, 'Extracted skills count should be greater than 0 from PDF');
  });
});

