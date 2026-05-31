import { Request, Response, NextFunction } from "express";
import { getParamString } from "../../utils/paramHelper";
import { createOrgSchema } from "./org.schema";
import {
  createOrganization,
  getUserOrganizations,
  getOrganizationForUser,
} from "./org.service";
import { OrgMember } from "../../models/OrgMember";
import { TaskComment } from "../../models/TaskComment";
import { getIO } from "../../socket";
import { logActivity } from "../../utils/activityLogger";
import { Activity } from "../../models/Activity";
import { createNotification } from "../../utils/notificationService";
import { Task } from "../../models/Task";
import { User } from "../../models/User";

export const createOrgHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = createOrgSchema.parse(req.body);
    const org = await createOrganization(req.user.userId, parsed);

    res.status(201).json({
      orgId: org._id,
      name: org.name,
    });
  } catch (err) {
    next(err);
  }
};

export const listUserOrgsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orgs = await getUserOrganizations(req.user.userId);
    res.json(orgs);
  } catch (err) {
    next(err);
  }
};

export const getOrgHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orgId = getParamString(req.params.orgId)!;
    const org = await getOrganizationForUser(req.user.userId, orgId);

    res.json(org);
  } catch (err) {
    next(err);
  }
};

export const listOrgMembersHandler = async (req: Request, res: Response) => {
  const orgId = getParamString(req.params.orgId)!;

  const members = await OrgMember.find({ orgId })
    .populate("userId", "name email")
    .sort({ createdAt: 1 });

  res.json(members);
};

export const removeOrgMemberHandler = async (req: Request, res: Response) => {
  const orgId = getParamString(req.params.orgId)!;
  const userId = getParamString(req.params.userId)!;

  if (req.user!.userId === userId) {
    return res.status(400).json({ message: "Cannot remove yourself" });
  }

  const member = await OrgMember.findOne({ orgId, userId });
  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  if (member.role === "OWNER") {
    return res.status(400).json({ message: "Cannot remove owner" });
  }

  await member.deleteOne();
  res.json({ success: true });
};

export const listTaskComments = async (req: Request, res: Response) => {
  const orgId = getParamString(req.params.orgId)!;
  const projectId = getParamString(req.params.projectId)!;
  const taskId = getParamString(req.params.taskId)!;

  const comments = await TaskComment.find({
    orgId,
    projectId,
    taskId,
  })
    .populate("authorId", "name email")
    .sort({ createdAt: 1 });

  res.json(comments);
};

export const createTaskComment = async (req: Request, res: Response) => {
  const orgId = getParamString(req.params.orgId)!;
  const projectId = getParamString(req.params.projectId)!;
  const taskId = getParamString(req.params.taskId)!;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  const task = await Task.findOne({ _id: taskId, orgId, projectId });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const comment = await TaskComment.create({
    orgId,
    projectId,
    taskId,
    authorId: req.user!.userId,
    content,
  });

  // 🔴 realtime emit (project room)
  // after creating comment
  getIO().to(`org:${orgId}:project:${projectId}`).emit("task:comment:created", {
    taskId,
    projectId,
  });

  await logActivity({
    orgId,
    projectId,
    taskId,
    actorId: req.user!.userId,
    type: "COMMENT_ADDED",
  });
  const user = await User.findById(req.user!.userId).select("name");

  const members = await OrgMember.find({ orgId });
  const recipients = members
    .map((m) => m.userId.toString())
    .filter((userId) => userId !== req.user!.userId); // exclude actor

  for (const userId of recipients) {
    await createNotification({
      userId,
      orgId,
      type: "COMMENT",
      message: `${req.user!.email} commented on "${task.title}"`,
      meta: {
        taskId,
        projectId,
      },
    });
  }

  res.status(201).json(comment);
};

export const listOrgActivity = async (req: Request, res: Response) => {
  const orgId = getParamString(req.params.orgId)!;

  const activity = await Activity.find({ orgId })
    .populate("actorId", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  getIO().to(`org:${orgId}`).emit("activity:created");

  res.json(activity);
};
