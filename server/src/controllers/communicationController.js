import {
  getScenarioCatalog,
  getScenarioById,
  createOrGenerateScenario,
  submitAndEvaluateCommunication,
  getUserCommunicationHistory,
  getCommunicationAttemptDetails,
} from '../services/communicationAssessmentService.js';

/**
 * Returns available preset scenarios with optional filtering by domain or category
 */
export const getScenarios = async (req, res, next) => {
  try {
    const { domain, category } = req.query;
    const scenarios = getScenarioCatalog({ domain, category });
    res.json({
      success: true,
      count: scenarios.length,
      data: scenarios,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generates a dynamic scenario tailored to a target role, domain, or pasted JD
 */
export const generateScenario = async (req, res, next) => {
  try {
    const {
      scenarioId,
      roleTitle,
      domain,
      experienceLevel,
      customJdText,
      category,
    } = req.body;

    const scenario = await createOrGenerateScenario({
      scenarioId,
      roleTitle,
      domain,
      experienceLevel,
      customJdText,
      category,
    });

    res.json({
      success: true,
      data: scenario,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluates a student's written response against the 8-dimension rubric and stores the attempt
 */
export const evaluateResponse = async (req, res, next) => {
  try {
    const { scenario, userResponse } = req.body;

    if (!scenario || !scenario.title || !scenario.prompt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scenario context provided.',
      });
    }

    if (!userResponse || typeof userResponse !== 'string' || userResponse.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a substantive written response (minimum 15 characters).',
      });
    }

    const evaluationResult = await submitAndEvaluateCommunication({
      userId: req.user._id,
      scenario,
      userResponse,
    });

    res.status(201).json({
      success: true,
      data: evaluationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the authenticated student's previous communication attempts
 */
export const getMyCommunicationHistory = async (req, res, next) => {
  try {
    const history = await getUserCommunicationHistory(req.user._id);
    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single communication attempt with detailed breakdown
 */
export const getCommunicationAttemptById = async (req, res, next) => {
  try {
    const attempt = await getCommunicationAttemptDetails(req.params.id, req.user._id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Communication attempt evaluation not found.',
      });
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};
