import express from "express";
import cors from "cors";
import morgan from "morgan";
import { json } from "express";
import authRoutes from "./modules/auth/auth.routes";
import orgRoutes from "./modules/org/org.routes";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/authMiddleware";
import { requireOrgMemberMiddleware } from "./middleware/orgMiddleware";
import projectRoutes from "./modules/project/project.routes";
import taskRoutes from "./modules/tasks/task.routes";
import inviteRoutes from "./modules/invite/invite.route";
import notificationRoutes from "./modules/notification/notification.routes";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(json());

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(
  "/api/orgs/:orgId/projects",
  requireAuth,
  requireOrgMemberMiddleware(),
  projectRoutes,
);

app.use(
  "/api/orgs/:orgId/projects/:projectId/tasks",
  requireAuth,
  requireOrgMemberMiddleware(),
  taskRoutes,
);

app.use("/api", inviteRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
