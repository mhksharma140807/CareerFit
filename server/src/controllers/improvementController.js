import { StudentProfile } from '../models/StudentProfile.js';
import { ReadinessReport } from '../models/ReadinessReport.js';

export const getImprovementPlan = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const latestReport = await ReadinessReport.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // If profile has no tasks yet but report has tasks, sync them
    if ((!profile.improvementTasks || profile.improvementTasks.length === 0) && latestReport && latestReport.tasks) {
      profile.improvementTasks = latestReport.tasks.map((t, idx) => ({
        id: `task_${Date.now()}_${idx}`,
        title: t.title,
        category: t.category,
        isCompleted: false,
        linkUrl: t.linkUrl || '/assessments',
      }));
      await profile.save();
    }

    const tasks = profile.improvementTasks || [];
    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        targetRole: latestReport ? `${latestReport.jobTitle} at ${latestReport.company}` : 'General Placement Readiness',
        latestReadinessIndex: latestReport ? latestReport.readinessIndex : null,
        totalTasks: tasks.length,
        completedCount,
        progressPercentage,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const task = profile.improvementTasks.find((t) => t.id === taskId || t._id?.toString() === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in improvement plan.' });
    }

    task.isCompleted = !task.isCompleted;
    await profile.save();

    const tasks = profile.improvementTasks;
    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    res.json({
      success: true,
      message: `Task marked as ${task.isCompleted ? 'completed' : 'pending'}.`,
      data: {
        task,
        completedCount,
        progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addTask = async (req, res, next) => {
  try {
    const { title, category = 'General', linkUrl = '' } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const newTask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      isCompleted: false,
      linkUrl: linkUrl.trim(),
    };

    profile.improvementTasks.push(newTask);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Task added to improvement plan.',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

