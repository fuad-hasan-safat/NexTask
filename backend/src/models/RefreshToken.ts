import { Schema, model, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  // Unique token id embedded in the refresh JWT (jti). A token is only valid
  // while its jti is present here; rotation deletes the old jti and inserts a
  // new one, and logout deletes it — giving us server-side revocation.
  jti: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },
    // TTL index: Mongo automatically purges expired refresh tokens.
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  {
    timestamps: true
  }
);

export const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);
