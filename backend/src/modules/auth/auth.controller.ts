import { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema
} from "./auth.schema";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession
} from "./auth.service";

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshSession(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    // A bad/expired/reused refresh token is an auth failure, not a 500.
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = logoutSchema.parse(req.body);
    await logoutSession(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
