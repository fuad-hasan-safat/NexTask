import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskPriority, TaskStatus } from "../api/taskApi";
import { updateTaskApi, deleteTaskApi } from "../api/taskApi";
import {
  createCommentApi,
  fetchCommentsApi,
  type TaskComment,
} from "../api/commentApi";
import { useCommentRealtime } from "../hooks/useCommentRealTime";
import axiosClient from "../api/axiosClient";

type Props = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  orgId: string | null;
  projectId: string | null;
};

const STATUS_OPTIONS: TaskStatus[] = [
  "BACKLOG",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// Helper function for priority colors (left accent strip on the modal header)
const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "LOW":
      return "border-l-slate-500 bg-slate-500/10";
    case "MEDIUM":
      return "border-l-amber-500 bg-amber-500/10";
    case "HIGH":
      return "border-l-orange-500 bg-orange-500/10";
    case "URGENT":
      return "border-l-rose-500 bg-rose-500/10";
    default:
      return "border-l-slate-500";
  }
};

// Helper function for status colors (matches the board column dots)
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "BACKLOG":
      return "bg-slate-600";
    case "IN_PROGRESS":
      return "bg-sky-600";
    case "REVIEW":
      return "bg-violet-600";
    case "DONE":
      return "bg-emerald-600";
    default:
      return "bg-slate-600";
  }
};

export default function TaskModal({
  open,
  onClose,
  task,
  orgId,
  projectId,
}: Props) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("BACKLOG");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const valid = !!orgId && !!projectId && !!task;
  const tasksQueryKey = ["tasks", orgId, projectId];
  const commentsQueryKey = ["comments", orgId, projectId, task?._id];
  useCommentRealtime(orgId, projectId, task?._id);

  /* ------------------ hydrate state ------------------ */
  useEffect(() => {
    setErrorMsg(null);
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee ?? null);
    }
  }, [task]);

  /* ------------------ queries ------------------ */
  const { data: comments } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => fetchCommentsApi(orgId!, projectId!, task!._id),
    enabled: valid,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["orgMembers", orgId],
    queryFn: async () => {
      const res = await axiosClient.get(`/orgs/${orgId}/members`);
      return res.data;
    },
    enabled: !!orgId,
  });

  /* ------------------ mutations ------------------ */
  const { mutateAsync: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: (data: Parameters<typeof updateTaskApi>[3]) =>
      updateTaskApi(orgId!, projectId!, task!._id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey });
      const previous = queryClient.getQueryData<Task[]>(tasksQueryKey);

      queryClient.setQueryData<Task[] | undefined>(tasksQueryKey, (old) => {
        if (!old) return old;

        return old.map((t) => {
          if (t._id !== task!._id) return t;

          return {
            ...t,
            title: newData.title ?? t.title,
            description:
              newData.description !== undefined
                ? newData.description === null
                  ? undefined
                  : newData.description
                : t.description,
            status: newData.status ?? t.status,
            priority: newData.priority ?? t.priority,
          };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(tasksQueryKey, ctx.previous);
      }
      setErrorMsg("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });

  const { mutateAsync: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteTaskApi(orgId!, projectId!, task!._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey });
      const previous = queryClient.getQueryData<Task[]>(tasksQueryKey);

      queryClient.setQueryData<Task[] | undefined>(tasksQueryKey, (old) =>
        old?.filter((t) => t._id !== task!._id),
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(tasksQueryKey, ctx.previous);
      }
      setErrorMsg("Failed to delete task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });

  const { mutateAsync: addComment, isPending: isCommenting } = useMutation({
    mutationFn: (content: string) =>
      createCommentApi(orgId!, projectId!, task!._id, content),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
  });

  if (!open || !task) return null;
  const disabled = isUpdating || isDeleting;

  /* ------------------ handlers ------------------ */
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    await updateTask({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assigneeId: assigneeId,
    });

    onClose();
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone.",
      )
    )
      return;
    await deleteTask();
    onClose();
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(newComment.trim());
  };

  /* ------------------ UI ------------------ */
  return createPortal(
    <>
      {/* Backdrop with fade effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40"
        onClick={() => !disabled && onClose()}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`border-l-4 ${getPriorityColor(priority)} px-6 py-4`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <input
                    className="w-full bg-transparent text-xl font-semibold text-white placeholder:text-slate-400 focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={disabled}
                    placeholder="Task title"
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        status,
                      )} text-white`}
                    >
                      {status.replace("_", " ")}
                    </span>
                    <span className="text-sm text-slate-400">
                      {new Date(task.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => !disabled && onClose()}
                  disabled={disabled}
                  className="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={disabled}
                  placeholder="Add a detailed description..."
                />
                <select
                  className="mt-2 w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={assigneeId ?? ""}
                  onChange={(e) => setAssigneeId(e.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {members.map((m: any) => (
                    <option key={m.userId._id} value={m.userId._id}>
                      {m.userId.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          status === s
                            ? `${getStatusColor(s)} text-white`
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_OPTIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          priority === p
                            ? getPriorityColor(p) +
                              " text-white border-transparent"
                            : "border-slate-700 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Comments
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {comments?.length || 0} comments
                  </span>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {comments?.map((c: TaskComment) => (
                    <div
                      key={c._id}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                            {c.authorId.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {c.authorId.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm pl-10">{c.content}</p>
                    </div>
                  ))}

                  {!comments?.length && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      No comments yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[80px] text-sm resize-none"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCommenting}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isCommenting || !newComment.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {isCommenting ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Posting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-rose-400 text-sm">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Last updated{" "}
                  {new Date(task.updatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={disabled}
                    className="px-5 py-2.5 border border-slate-700 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/10 hover:border-rose-500/50 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Task
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={disabled}
                      className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSave}
                      disabled={disabled}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
