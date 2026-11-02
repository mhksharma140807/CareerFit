import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { triggerNotification } from '../utils/notificationHelper.js';

export const getAssessments = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    const assessments = await Assessment.find(filter)
      .select('title category skillTag difficulty durationMinutes description questions')
      .lean();

    // Map to public view hiding correct answers
    const mapped = assessments.map((a) => ({
      _id: a._id,
      title: a.title,
      category: a.category,
      skillTag: a.skillTag,
      difficulty: a.difficulty || 'Medium',
      durationMinutes: a.durationMinutes || 15,
      description: a.description || '',
      questionCount: a.questions ? a.questions.length : 0,
    }));

    // If student is logged in, attach their latest attempt scores
    if (req.user) {
      const attempts = await AssessmentAttempt.find({ userId: req.user._id }).lean();
      const attemptsByAssessment = new Map();
      attempts.forEach((att) => {
        const idStr = att.assessmentId.toString();
        const existing = attemptsByAssessment.get(idStr);
        if (!existing || att.percentage > existing.percentage) {
          attemptsByAssessment.set(idStr, att);
        }
      });

      mapped.forEach((item) => {
        const best = attemptsByAssessment.get(item._id.toString());
        item.userBestAttempt = best
          ? {
              attemptId: best._id,
              percentage: best.percentage,
              score: best.score,
              totalQuestions: best.totalQuestions,
              completedAt: best.createdAt || best.completedAt,
            }
          : null;
      });
    }

    res.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('title category skillTag difficulty durationMinutes description questions.questionText questions.options')
      .lean();

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    res.json({
      success: true,
      data: {
        _id: assessment._id,
        title: assessment.title,
        category: assessment.category,
        skillTag: assessment.skillTag,
        difficulty: assessment.difficulty,
        durationMinutes: assessment.durationMinutes,
        description: assessment.description,
        questionCount: assessment.questions ? assessment.questions.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).lean();

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Strip out correctIndex and explanation to prevent client-side inspection (ADR-007)
    const questionsWithoutAnswers = assessment.questions.map((q, idx) => ({
      index: idx,
      _id: q._id,
      id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    res.json({
      success: true,
      data: {
        assessmentId: assessment._id,
        title: assessment.title,
        category: assessment.category,
        skillTag: assessment.skillTag,
        difficulty: assessment.difficulty,
        durationMinutes: assessment.durationMinutes,
        totalQuestions: questionsWithoutAnswers.length,
        questions: questionsWithoutAnswers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers = [] } = req.body;

    const assessment = await Assessment.findById(id).lean();
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    let correctCount = 0;
    const evaluatedAnswers = assessment.questions.map((q, idx) => {
      const studentAnswer = answers.find(
        (a) =>
          Number(a.questionIndex) === idx ||
          (a.questionId && (a.questionId.toString() === q._id?.toString() || a.questionId.toString() === q.id?.toString())) ||
          (a.id && (a.id.toString() === q._id?.toString() || a.id.toString() === q.id?.toString()))
      );
      const selectedOption =
        studentAnswer && studentAnswer.selectedOption !== undefined && studentAnswer.selectedOption !== null
          ? Number(studentAnswer.selectedOption)
          : -1;
      const isCorrect = selectedOption >= 0 && selectedOption === q.correctIndex;

      if (isCorrect) correctCount++;

      return {
        questionIndex: idx,
        selectedOption,
        isCorrect,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctIndex,
        explanation: q.explanation || '',
      };
    });

    const totalQuestions = assessment.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const attempt = await AssessmentAttempt.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      score: correctCount,
      totalQuestions,
      percentage,
      answers: evaluatedAnswers,
    });

    // Trigger genuine notification
    await triggerNotification({
      userId: req.user._id,
      title: `Assessment Completed: ${assessment.title}`,
      message: `You scored ${percentage}% (${correctCount}/${totalQuestions}) on ${assessment.title}.`,
      type: 'assessment_result',
      link: `/assessments/attempts/${attempt._id}`,
      eventFingerprint: `assessment_eval_${attempt._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Assessment evaluated successfully.',
      data: {
        _id: attempt._id,
        attemptId: attempt._id,
        assessmentTitle: assessment.title,
        category: assessment.category,
        score: correctCount,
        totalQuestions,
        percentage,
        isPassed: percentage >= 70,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('assessmentId', 'title category skillTag difficulty durationMinutes')
      .lean();

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found.' });
    }

    // Horizontal access control: student can only view own attempt unless admin
    if (attempt.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this attempt report.' });
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user._id })
      .populate('assessmentId', 'title category skillTag difficulty')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};

