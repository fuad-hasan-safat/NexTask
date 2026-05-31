import { Request, Response, NextFunction } from "express";
import { getParamString } from "../../types/express";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import {
  createProject,
  listProjectsForOrg,
  getProjectById,
  updateProject,
  deleteProject,
} from "./project.service";

export const createProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;

    const parsed = createProjectSchema.parse(req.body);
    const project = await createProject(orgId, req.user.userId, parsed);

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const listProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.orgMembership) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orgId } = req.orgMembership;
    const projects = await listProjectsForOrg(orgId);

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectHandler = async (
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

    const project = await getProjectById(orgId, projectId);

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProjectHandler = async (
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

    const parsed = updateProjectSchema.parse(req.body);
    const project = await updateProject(orgId, projectId, parsed);

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const deleteProjectHandler = async (
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

    const project = await deleteProject(orgId, projectId);

    res.json({ message: "Project deleted", projectId: project._id });
  } catch (err) {
    next(err);
  }
};
