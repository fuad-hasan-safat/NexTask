import { Request, Response, NextFunction } from "express";
import { getParamString } from "../../types/express";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import {
  createTask,
  listTasksForProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.service";
import { logActivity } from "../../utils/activityLogger";
import { createNotification } from "../notification/notification.service";

export const createTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projectId = getParamString(req.params.projectId)!;

    console.log("createTaskHandler params:", req.params); // debug

    const parsed = createTaskSchema.parse(req.body);
    const task = await createTask(orgId, projectId, req.user.userId, parsed);

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const listTasksHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projectId = getParamString(req.params.projectId)!;

    const tasks = await listTasksForProject(orgId, projectId);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projectId = getParamString(req.params.projectId)!;
    const taskId = getParamString(req.params.taskId)!;

    const task = await getTaskById(orgId, projectId, taskId);

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projectId = getParamString(req.params.projectId)!;
    const taskId = getParamString(req.params.taskId)!;

    const parsed = updateTaskSchema.parse(req.body);

    const task = await updateTask(
      orgId,
      projectId,
      taskId,
      req.user!.userId,
      parsed,
    );

    // ✅ activity only if assignee was part of update payload
    if (parsed.assigneeId !== undefined) {
      await logActivity({
        orgId,
        projectId,
        taskId,
        actorId: req.user!.userId,
        type: "TASK_ASSIGNED",
      });
    }

    // ✅ notify assignee (if not self)
    if (parsed.assigneeId && parsed.assigneeId !== req.user!.userId) {
      await createNotification({
        userId: parsed.assigneeId,
        orgId,
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${task.title}"`,
        meta: { taskId, projectId },
      });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projectId = getParamString(req.params.projectId)!;
    const taskId = getParamString(req.params.taskId)!;

    const task = await deleteTask(
      orgId,
      projectId,
      taskId,
      req.user?.userId as string,
    );

    res.json({ message: "Task deleted", taskId: task._id });
  } catch (err) {
    next(err);
  }
};
