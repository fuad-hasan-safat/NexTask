import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtUserPayload {
  userId: string;
  email: string;
}

// Refresh tokens carry only the user id plus a unique token id (jti). The jti
// is tracked server-side so refresh tokens can be rotated and revoked.
export interface JwtRefreshPayload {
  userId: string;
  jti: string;
}

export const signAccessToken = (payload: JwtUserPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn
  };

  return jwt.sign(payload, env.jwtAccessSecret, options);
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.jwtAccessSecret) as JwtUserPayload;
};

export const signRefreshToken = (payload: JwtRefreshPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwtRefreshExpiresIn
  };

  return jwt.sign(payload, env.jwtRefreshSecret, options);
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtRefreshPayload;
};

// Reads the `exp` claim (seconds since epoch) so callers can persist a matching
// expiry for the token record without re-parsing duration strings.
export const getTokenExpiry = (token: string): Date => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
};
