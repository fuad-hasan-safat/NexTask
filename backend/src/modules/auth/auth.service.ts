import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { User, IUser } from "../../models/User";
import { RefreshToken } from "../../models/RefreshToken";
import { RegisterInput, LoginInput } from "./auth.schema";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenExpiry
} from "../../utils/jwt";

const publicUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

// Issues a fresh access + refresh token pair and records the refresh token's
// jti so it can later be rotated or revoked.
const issueTokens = async (user: IUser) => {
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email
  });

  const jti = randomUUID();
  const refreshToken = signRefreshToken({ userId: user._id.toString(), jti });

  await RefreshToken.create({
    userId: user._id,
    jti,
    expiresAt: getTokenExpiry(refreshToken)
  });

  return { user: publicUser(user), accessToken, refreshToken };
};

export const registerUser = async (data: RegisterInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash
  });

  return issueTokens(user);
};

export const loginUser = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return issueTokens(user);
};

// Rotates a refresh token: verifies the JWT, confirms its jti is still active
// (i.e. not already rotated away or revoked), deletes the old jti, and issues a
// new pair. A valid signature whose jti is unknown is treated as reuse/theft.
export const refreshSession = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new Error("Invalid refresh token");
  }

  const existing = await RefreshToken.findOneAndDelete({ jti: payload.jti });
  if (!existing) {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error("Invalid refresh token");
  }

  return issueTokens(user);
};

// Best-effort logout: revoke the presented refresh token if it is valid. Never
// throws, so signing out always succeeds from the client's perspective.
export const logoutSession = async (token?: string) => {
  if (!token) return;
  try {
    const payload = verifyRefreshToken(token);
    await RefreshToken.deleteOne({ jti: payload.jti });
  } catch {
    // Invalid/expired token — nothing to revoke.
  }
};
