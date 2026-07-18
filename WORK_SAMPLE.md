# NexTask — Real-Time Collaborative Task Management Platform

---

## Project Overview

NexTask is a full-stack, multi-tenant project management platform built to help distributed teams
track work in real time. The platform enables teams to organize tasks on Kanban boards, collaborate
through live comments, manage organizational access, and receive instant notifications — all without
ever needing to refresh the page.

The project was built end-to-end as a production-grade monorepo, covering everything from database
modeling and REST API design to UI architecture, real-time event handling, and deployment
infrastructure.

---

## Technical Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Frontend     | React 19, TypeScript, Tailwind CSS v4, TanStack Query, Zustand |
| Real-time    | Socket.IO (WebSockets)                                  |
| Drag & Drop  | @hello-pangea/dnd                                       |
| Backend      | Node.js, Express.js                                     |
| Database     | MongoDB (with Mongoose)                                 |
| Auth         | JWT (access tokens via HTTP headers)                    |
| Build & Dev  | Vite, ESLint, TypeScript compiler                       |
| Deployment   | Render (Blueprint — both frontend and backend)          |
| Monorepo     | npm Workspaces                                          |

---

## Core Features

### 1. Real-Time Kanban Boards

Tasks are organized across four workflow stages — Backlog, In Progress, Review, and Done. Users can
drag and drop cards between columns and the move is instantly reflected for every teammate viewing
the board, powered by Socket.IO WebSocket events. Each task card displays its priority level,
creation date, and a description preview.

### 2. Multi-Tenant Organization System

A single user can belong to multiple organizations simultaneously. Each organization maintains fully
isolated data — projects, members, tasks, and activity logs are never shared across tenants. Users
can create new organizations or switch between existing ones directly from the dashboard header.

### 3. Role-Based Access Control

Three roles govern what each member can do:

- **Owner** — full control over the organization, including removing members and managing invites
- **Admin** — can manage members and projects
- **Member** — can create and manage tasks within assigned projects

Permissions are enforced at both the API level and in the UI, with role-gated navigation links and
action buttons.

### 4. Task Detail System

Clicking any task opens a full-featured modal where users can edit the title, description, status,
priority, and assignee. Tasks support threaded comments that stream in live as teammates post them,
removing the need for any page reload. All changes are optimistically applied to the UI for a snappy
experience, then reconciled with the server.

### 5. Instant Notifications

A notification bell in the header updates in real time via a Socket.IO event listener. Notifications
are generated server-side for key events such as being assigned to a task or receiving a comment,
and a dedicated Notifications page allows users to review and mark items as read.

### 6. Activity Feed

A live activity sidebar and dedicated Activity page log every significant action — task creation,
status updates, assignments, deletions, and comments — along with the actor's name and a relative
timestamp. The feed updates in real time as the organization's members work.

### 7. Invite System

Owners can invite new members by email address. Invitees see pending invitations in their Invites
page and can accept or reject them. Accepting an invite immediately grants access to the organization
and its projects.

---

## Architecture Highlights

**Monorepo with npm Workspaces** — The frontend and backend share a single repository with a
root-level `package.json` that coordinates both workspaces. A single `npm run dev` command starts
both servers concurrently using `concurrently`.

**Optimistic UI updates** — When a user saves task changes, the UI updates immediately without
waiting for the server response. If the API call fails, the change is rolled back automatically
using TanStack Query's `onMutate`/`onError` lifecycle, keeping the interface fast and resilient.

**Centralized real-time layer** — A single Socket.IO client is instantiated once and shared across
the application via a custom `useSocket` hook. Page-specific hooks (`useTaskRealtime`,
`useCommentRealtime`, `useActivityRealtime`, `useNotificationRealtime`) subscribe to targeted rooms
and events, then trigger query invalidations to keep the UI synchronized.

**Persistent layout with outlet composition** — The dashboard wraps all authenticated pages in a
`DashboardLayout` component that holds the navigation header and activity sidebar. Individual pages
render into a React Router `<Outlet>`, avoiding full-page remounts during navigation and keeping
Socket.IO connections alive.

**Consistent design system** — A single design language is applied across every screen: a dark
`slate-950` canvas, indigo/violet gradient accents, rounded card surfaces, and shared status and
priority color tokens. Responsive breakpoints ensure the UI is fully usable on mobile (hamburger nav
with slide-down drawer and horizontally scrollable Kanban board), tablet, and desktop viewports.

---

## Responsive Design

The application is fully responsive across all screen sizes:

- **Mobile (< 768px)** — The navigation collapses into a hamburger-triggered slide-down drawer. The
  Kanban board switches from a four-column grid to a horizontally scrollable, snap-to-column
  carousel. The project board header stacks vertically and the task-creation form expands to full
  width.
- **Tablet (768px – 1024px)** — Two-column project grids, full navigation visible, activity sidebar
  hidden so the main content has room to breathe.
- **Desktop (> 1024px)** — Four-column Kanban board, three-column project grid, and a sticky
  activity sidebar displayed alongside the main content.

---

## Deployment

The application is deployed on **Render** using a **Blueprint** — a single infrastructure-as-code
file (`render.yaml`) committed to the repository that provisions and configures both services
automatically.

**How it works:** After pushing the repository to GitHub, connecting it to Render's Blueprint runner
creates both services in one step. Render reads `render.yaml`, builds each service, and wires up all
environment variables.

### Services

**Backend — `nextask-backend` (Render Web Service)**

- Runtime: Node.js
- Root directory: `backend/`
- Build command: `npm install && npm run build` (compiles TypeScript to JavaScript)
- Start command: `npm start` (runs the compiled Express + Socket.IO server)
- Environment variables configured via the Render dashboard: `MONGO_URI` (MongoDB Atlas connection
  string), `JWT_ACCESS_SECRET`, and `CORS_ORIGIN` (set to the frontend service URL)

**Frontend — `nextask-frontend` (Render Static Site)**

- Root directory: `frontend/`
- Build command: `npm install && npm run build` (Vite bundles React, TypeScript, and Tailwind CSS)
- Publish directory: `dist/`
- SPA fallback: all routes rewrite to `index.html` so React Router handles client-side navigation
- Build-time environment variables: `VITE_API_URL` and `VITE_SOCKET_URL` point at the backend
  Render service URL

### Infrastructure as Code

The entire deployment topology is captured in a single `render.yaml` Blueprint at the monorepo
root. A new environment (staging, production) can be spun up from scratch in minutes by connecting
the same repository to a new Blueprint instance — no manual service configuration required.

---

## Key Engineering Decisions

**Why Socket.IO over polling?**
Polling would introduce latency and unnecessary server load for a team-facing tool. WebSockets give
near-instant propagation with a persistent connection, which is the right trade-off for a real-time
collaboration product.

**Why TanStack Query?**
It provides first-class support for caching, background refetching, optimistic updates, and query
invalidation — all patterns this project relies on heavily — without requiring custom state
management for server data.

**Why Zustand for client state?**
The global state is narrow — authenticated user and selected organization ID. Zustand's minimal API
handles this without the boilerplate of larger state libraries, keeping the store easy to reason
about.

**Why a monorepo?**
Co-locating frontend and backend in a single repository simplifies development (one `npm run dev`
starts everything), keeps API types within reach, and streamlines CI/CD with a shared deployment
configuration file.

---

*Built with Node.js, Express, MongoDB, React, TypeScript, Tailwind CSS v4, and Socket.IO.*
*Deployed on Render via Blueprint (render.yaml).*
