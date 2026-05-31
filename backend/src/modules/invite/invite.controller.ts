import { Request, Response, NextFunction } from "express";
import { getParamString } from "../../types/express";
import { createInviteSchema } from "./invite.schema";
import {
  createInvite,
  listInvitesForUser,
  acceptInvite,
  rejectInvite,
} from "./invite.service";

export const createInviteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orgId = getParamString(req.params.orgId)!;
    const data = createInviteSchema.parse(req.body);

    const invite = await createInvite(orgId, req.user!.userId, data);

    res.status(201).json(invite);
  } catch (err) {
    next(err);
  }
};

export const listMyInvitesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const invites = await listInvitesForUser(req.user!.email);
    res.json(invites);
  } catch (err) {
    next(err);
  }
};

export const acceptInviteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inviteId = getParamString(req.params.inviteId)!;
    const invite = await acceptInvite(
      inviteId,
      req.user!.userId,
      req.user!.email,
    );
    res.json(invite);
  } catch (err) {
    next(err);
  }
};

export const rejectInviteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inviteId = getParamString(req.params.inviteId)!;
    const invite = await rejectInvite(inviteId, req.user!.email);
    res.json(invite);
  } catch (err) {
    next(err);
  }
};
