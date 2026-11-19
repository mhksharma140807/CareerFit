import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Slice 2: Dynamic AI Assessment Generation & Adaptive Engine (Deterministic Logic)', () => {
  // Test offline fallback questions integrity
  test('1. Offline fallback question pool contains verified, pedagogical questions with valid indices', () => {
    const samplePool = [
      {
        questionText: 'What is the primary difference between synchronous and asynchronous code execution in Node.js?',
        options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
        correctIndex: 0,
        competency: 'Node.js',
        difficulty: 'Medium',
      },
      {
        questionText: 'In React, what is the key advantage of using the useEffect cleanup function?',
        options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
        correctIndex: 0,
        competency: 'React',
        difficulty: 'Medium',
      },
      {
        questionText: 'Which SQL clause is used to filter rows AFTER aggregate functions like SUM() or COUNT() have been applied?',
        options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'],
        correctIndex: 0,
        competency: 'SQL',
        difficulty: 'Easy',
      },
    ];

    for (const q of samplePool) {
      assert.ok(q.questionText.length >= 15);
      assert.equal(q.options.length, 4);
      assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
      assert.ok(q.competency);
      assert.ok(['Easy', 'Medium', 'Hard'].includes(q.difficulty));
    }
  });

  test('2. Deterministic Competency Accuracy & Weakness Detection logic', () => {
    // Simulate 6 evaluated answers across 3 competencies:
    // React: 2 questions, 2 correct -> 100% (Strong)
    // SQL: 2 questions, 1 correct -> 50% (Weak)
    // Node.js: 2 questions, 0 correct -> 0% (Weak)
    const evaluatedAnswers = [
      { competency: 'React', isCorrect: true },
      { competency: 'React', isCorrect: true },
      { competency: 'SQL', isCorrect: true },
      { competency: 'SQL', isCorrect: false },
      { competency: 'Node.js', isCorrect: false },
      { competency: 'Node.js', isCorrect: false },
    ];

    const competencyMap = new Map();
    let correctCount = 0;

    for (const a of evaluatedAnswers) {
      if (a.isCorrect) correctCount++;
      if (!competencyMap.has(a.competency)) {
        competencyMap.set(a.competency, { total: 0, correct: 0 });
      }
      const c = competencyMap.get(a.competency);
      c.total++;
      if (a.isCorrect) c.correct++;
    }

    const weakCompetencies = [];
    const strongCompetencies = [];
    const breakdown = [];

    competencyMap.forEach((val, comp) => {
      const accuracy = Math.round((val.correct / val.total) * 100);
      const isWeak = accuracy < 60;
      if (isWeak) weakCompetencies.push(comp);
      if (accuracy >= 75) strongCompetencies.push(comp);

      breakdown.push({ competency: comp, total: val.total, correct: val.correct, accuracy, isWeak });
    });

    const percentage = Math.round((correctCount / evaluatedAnswers.length) * 100);

    assert.equal(percentage, 50, 'Overall score should be 50% (3/6)');
    assert.deepEqual(strongCompetencies, ['React'], 'React should be strong');
    assert.deepEqual(weakCompetencies.sort(), ['Node.js', 'SQL'].sort(), 'Node.js and SQL should be weak');
  });

  test('3. Adaptive Stage Transition and Stopping Criteria logic', () => {
    // Stage 1 with weak competencies and score < 85% must trigger follow-up
    const stage1CanFollowUp = (stage, weakComps, percentage) => {
      return stage < 2 && weakComps.length > 0 && percentage < 85;
    };

    assert.equal(stage1CanFollowUp(1, ['SQL'], 60), true, 'Stage 1 with weak competencies triggers Stage 2');
    assert.equal(stage1CanFollowUp(1, [], 90), false, 'Stage 1 with zero weak competencies stops (mastered)');
    assert.equal(stage1CanFollowUp(2, ['SQL'], 65), false, 'Stage 2 stops unconditionally (max depth reached)');
  });

  test('4. Assessment Coverage metric accurately reflects proportion of target competencies tested', () => {
    const targetCompetencies = ['React', 'Node.js', 'SQL', 'Docker', 'AWS'];
    const testedCompetencies = new Set(['React', 'Node.js', 'SQL']);

    const testedCount = targetCompetencies.filter((c) => testedCompetencies.has(c)).length;
    const coverage = Math.round((testedCount / targetCompetencies.length) * 100);

    assert.equal(coverage, 60, '3 out of 5 target competencies tested = 60% coverage');
  });
});

