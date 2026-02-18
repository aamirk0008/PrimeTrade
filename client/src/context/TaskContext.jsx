import { createContext, useContext, useReducer, useCallback } from "react";
import { taskService } from "../services";
import toast from "react-hot-toast";

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  stats: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  statsLoading: false,
  filters: {
    status: "",
    priority: "",
    search: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 10,
  },
};

function taskReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_STATS_LOADING":
      return { ...state, statsLoading: action.payload };
    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload.tasks,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case "ADD_TASK": {
      const current = Array.isArray(state.tasks) ? state.tasks : [];
      return {
        ...state,
        tasks: [action.payload, ...current],
        total: state.total + 1,
      };
    }
    case "UPDATE_TASK": {
      const current = Array.isArray(state.tasks) ? state.tasks : [];
      return {
        ...state,
        tasks: current.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        ),
      };
    }
    case "DELETE_TASK": {
      const current = Array.isArray(state.tasks) ? state.tasks : [];
      return {
        ...state,
        tasks: current.filter((t) => t._id !== action.payload),
        total: state.total - 1,
      };
    }
    case "SET_STATS":
      return { ...state, stats: action.payload, statsLoading: false };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload, page: 1 },
      };
    case "SET_PAGE":
      return { ...state, filters: { ...state.filters, page: action.payload } };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async (filters = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await taskService.getAll(params);
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks: data.data.tasks,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tasks");
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_STATS_LOADING", payload: true });
    try {
      const { data } = await taskService.getStats();
      dispatch({ type: "SET_STATS", payload: data.data });
    } catch {
      dispatch({ type: "SET_STATS_LOADING", payload: false });
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const { data } = await taskService.create(taskData);
    dispatch({ type: "ADD_TASK", payload: data.data.task });
    toast.success("Task created");
    return data.data.task;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const { data } = await taskService.update(id, taskData);
    dispatch({ type: "UPDATE_TASK", payload: data.data.task });
    toast.success("Task updated");
    return data.data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskService.delete(id);
    dispatch({ type: "DELETE_TASK", payload: id });
    toast.success("Task deleted");
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        deleteTask,
        setFilters,
        setPage,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTask must be used within TaskProvider");
  return ctx;
};
