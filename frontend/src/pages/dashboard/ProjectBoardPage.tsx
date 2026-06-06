import { useParams, Link } from "react-router-dom";
import { useOrgStore } from "../../store/org.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjectApi } from "../../api/projectApi";
import {
  fetchTasksApi,
  createTaskApi,
  updateTaskStatusApi,
  type Task,
  type TaskStatus,
} from "../../api/taskApi";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useMemo, useState, type FormEvent } from "react";
import TaskModal from "../../components/TaskModal";
import { useTaskRealtime } from "../../hooks/useTaskRealtime";
import { useProjectRoom } from "../../hooks/useProjectRoom";

const STATUS_COLUMNS: { id: TaskStatus; title: string; dot: string }[] = [
  { id: "BACKLOG", title: "Backlog", dot: "bg-slate-400" },
  { id: "IN_PROGRESS", title: "In Progress", dot: "bg-sky-400" },
  { id: "REVIEW", title: "Review", dot: "bg-violet-400" },
  { id: "DONE", title: "Done", dot: "bg-emerald-400" },
];

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "text-slate-300 bg-slate-700/50",
  MEDIUM: "text-amber-300 bg-amber-500/15",
  HIGH: "text-rose-300 bg-rose-500/15",
  URGENT: "text-rose-200 bg-rose-600/25",
};

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const orgId = useOrgStore((s) => s.orgId);
  const queryClient = useQueryClient();

  // 🔴 Enable realtime sync
  useProjectRoom(orgId, projectId);
  useTaskRealtime(orgId, projectId);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", orgId, projectId],
    queryFn: () => fetchProjectApi(orgId!, projectId!),
    enabled: Boolean(orgId && projectId),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", orgId, projectId],
    queryFn: () => fetchTasksApi(orgId!, projectId!),
    enabled: Boolean(orgId && projectId),
  });

  const { mutate: createTask, isPending: creatingTask } = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      createTaskApi(orgId!, projectId!, {
        title: data.title,
        description: data.description,
        status: "BACKLOG",
        priority: "MEDIUM",
      }),
    onSuccess: () => {
      setNewTaskTitle("");
      setNewTaskDesc("");
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId, projectId] });
    },
  });

  const { mutate: moveTask } = useMutation({
    mutationFn: (payload: { taskId: string; status: TaskStatus }) =>
      updateTaskStatusApi(orgId!, projectId!, payload.taskId, payload.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId, projectId] });
    },
  });

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    (tasks ?? []).forEach((t) => {
      map[t.status].push(t);
    });

    return map;
  }, [tasks]);

  if (!orgId) {
    return (
      <div className="text-sm text-slate-300">No organization selected.</div>
    );
  }

  if (!projectId) {
    return <div className="text-sm text-slate-300">No project selected.</div>;
  }

  const handleNewTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId as TaskStatus;
    const destStatus = result.destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) return;

    const sourceTasks = tasksByStatus[sourceStatus];
    const movedTask = sourceTasks[result.source.index];
    if (!movedTask) return;

    moveTask({ taskId: movedTask._id, status: destStatus });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/app"
            className="text-xs text-slate-400 transition-colors hover:text-slate-200"
          >
            ← Back to projects
          </Link>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {projectLoading
              ? "Loading project..."
              : projectError
              ? "Project"
              : project?.name}
          </h1>

          {project?.description && (
            <p className="mt-1 text-sm text-slate-400">{project.description}</p>
          )}
        </div>

        <form
          onSubmit={handleNewTaskSubmit}
          className="w-full shrink-0 space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 lg:w-80"
        >
          <div className="text-xs font-medium text-slate-200">
            Add task to Backlog
          </div>

          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />

          <textarea
            className="min-h-[60px] w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Description (optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
          />

          <button
            type="submit"
            disabled={creatingTask}
            className="w-full rounded-md bg-indigo-600 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {creatingTask ? "Adding..." : "Add task"}
          </button>
        </form>
      </div>

      {tasksLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="h-48 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Horizontal scroll on small screens, 4-up grid on large */}
          <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {STATUS_COLUMNS.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex w-[80vw] shrink-0 snap-start flex-col rounded-xl border p-3 transition-colors sm:w-72 lg:w-auto ${
                      snapshot.isDraggingOver
                        ? "border-indigo-500/50 bg-slate-900"
                        : "border-slate-800 bg-slate-900/50"
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <span className="text-xs font-semibold text-slate-200">
                        {col.title}
                      </span>
                      <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {tasksByStatus[col.id].length}
                      </span>
                    </div>

                    <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                      {tasksByStatus[col.id].map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={`cursor-pointer rounded-lg border bg-slate-800/80 px-3 py-2.5 transition-colors will-change-transform ${
                                snapshot.isDragging
                                  ? "border-indigo-500/60 shadow-lg shadow-black/40"
                                  : "border-slate-700/80 hover:border-slate-600 hover:bg-slate-800"
                              }`}
                              onClick={() => {
                                setSelectedTask(task);
                                setModalOpen(true);
                              }}
                            >
                              <div className="text-xs font-medium text-slate-50">
                                {task.title}
                              </div>

                              {task.description && (
                                <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                                  {task.description}
                                </div>
                              )}

                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                    PRIORITY_BADGE[task.priority] ??
                                    PRIORITY_BADGE.LOW
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {tasksByStatus[col.id].length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-800 px-3 py-6 text-center text-[11px] text-slate-600">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskModal
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        orgId={orgId}
        projectId={projectId!}
      />
    </div>
  );
}
