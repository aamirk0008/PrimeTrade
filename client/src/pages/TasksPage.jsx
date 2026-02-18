import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { useTask } from "../context/TaskContext";
import { Button, EmptyState, Skeleton, Modal } from "../components/ui";
import TaskCard from "../components/tasks/TaskCard";
import TaskFormModal from "../components/tasks/TaskFormModal";
import TaskFilters from "../components/tasks/TaskFilters";
import DashboardLayout from "../components/layout/DashboardLayout";
import { extractError } from "../utils";
import toast from "react-hot-toast";

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function TasksPage() {
  const {
    tasks : tasksFromContext,
    total,
    page,
    pages,
    loading,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    setPage,
  } = useTask();
const tasks = tasksFromContext ?? []
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);
  // const prevFilters = useRef(null)

  // Fetch on filter/page change
  useEffect(() => {
    const active = {
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(debouncedSearch && { search: debouncedSearch }),
      sortBy: filters.sortBy || "createdAt",
      order: filters.order || "desc",
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
    fetchTasks(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status,
    filters.priority,
    filters.sortBy,
    filters.order,
    filters.page,
    debouncedSearch,
  ]);
   console.log(tasks);
  const handleFilterChange = useCallback(
    (update) => {
      setFilters(update);
    },
    [setFilters],
  );

  const openCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTask(null);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editTask) {
        await updateTask(editTask._id, data);
      } else {
        await createTask(data);
      }
      closeModal();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div
        className="flex items-start justify-between mb-6 animate-fade-up"
        style={{ animationFillMode: "forwards" }}
      >
        <div>
          <h1 className="font-display font-700 text-2xl text-bright mb-1">
            Tasks
          </h1>
          <p className="text-muted text-sm font-mono">
            {total} task{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus size={15} /> New task
        </Button>
      </div>

      {/* Filters */}
      <div
        className="mb-5 animate-fade-up"
        style={{ animationDelay: "75ms", animationFillMode: "forwards" }}
      >
        <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
        </div>
      ) : tasks?.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks found"
          description={
            filters.search || filters.status || filters.priority
              ? "Try adjusting your filters."
              : "Create your first task to get started."
          }
          action={
            <Button onClick={openCreate}>
              <Plus size={15} /> Create task
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks?.map((task, i) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEdit}
              onDelete={(id) => setDeleteConfirm(id)}
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: "forwards",
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8 animate-fade-in">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border text-muted hover:border-border-bright hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-500 transition-all
                  ${
                    p === page
                      ? "bg-acid text-surface-950"
                      : "text-muted hover:text-bright hover:bg-surface-700 border border-border"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pages}
            className="p-2 rounded-lg border border-border text-muted hover:border-border-bright hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit modal */}
      <TaskFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        task={editTask}
        loading={submitting}
      />

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete task"
        size="sm"
      >
        <p className="text-sm text-muted mb-5">
          This task will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirm(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(deleteConfirm)}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
