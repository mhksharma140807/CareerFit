import {
  startTutorSession,
  submitTutorTurn,
  getStudentTutorContext,
  getUserSessions,
  getSessionById,
} from '../services/tutorService.js';

/**
 * GET /api/tutor/context
 * Returns student's diagnostic context, quota status, and personalized workflow recommendations
 */
export const getTutorContext = async (req, res, next) => {
  try {
    const result = await getStudentTutorContext(req.user._id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tutor/session/start
 * Initiates an interactive practice session and returns Turn 0 question
 */
export const startSession = async (req, res, next) => {
  try {
    const { workflow, customRole, customJd, specificTopic, maxTurns } = req.body;

    const session = await startTutorSession({
      userId: req.user._id,
      workflow,
      customRole,
      customJd,
      specificTopic,
      maxTurns: maxTurns ? Number(maxTurns) : 3,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tutor/session/:id/turn
 * Submits user response for the active turn, evaluates it, and generates next question or summary
 */
export const submitTurn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userResponse } = req.body;

    const updatedSession = await submitTutorTurn({
      sessionId: id,
      userId: req.user._id,
      userResponse,
    });

    res.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tutor/sessions
 * Returns the authenticated student's practice session history
 */
export const getMySessions = async (req, res, next) => {
  try {
    const sessions = await getUserSessions(req.user._id);
    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tutor/sessions/:id
 * Returns a specific practice session by ID
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id, req.user._id);
    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
