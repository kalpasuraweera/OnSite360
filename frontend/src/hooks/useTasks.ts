import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

// Task Status and Priority Enums
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

// Task interfaces
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Relations
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  comments?: Comment[];
  _count?: {
    comments: number;
  };
}

// Comment interfaces
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}

// Statistics interfaces (matching backend service statistics)
export interface ProjectTaskSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  averageProgress: number;
  totalEstimatedHours?: number;
  totalActualHours?: number;
  overdueTasks: number;
  tasksByPriority: {
    [key: string]: number;
  };
}

export interface UserTaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime?: number;
  totalHoursLogged?: number;
}

// DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
  attachments?: string[];
}

export interface CreateCommentDto {
  taskId: string;
  content: string;
}

export interface UpdateCommentDto {
  content?: string;
}

// Filter interfaces
export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
}

// TASK HOOKS

// Get all tasks with optional filtering
export const useTasks = (filters?: TaskFilters) => {
  const queryParams = new URLSearchParams();
  
  if (filters?.projectId) queryParams.append('projectId', filters.projectId);
  if (filters?.assigneeId) queryParams.append('assigneeId', filters.assigneeId);
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';

  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await instance.get(url);
      return data as Task[];
    },
  });
};

// Get tasks assigned to the current user
export const useMyTasks = (filters?: { projectId?: string; status?: TaskStatus }) => {
  const queryParams = new URLSearchParams();
  
  if (filters?.projectId) queryParams.append('projectId', filters.projectId);
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString ? `/tasks/my-tasks?${queryString}` : '/tasks/my-tasks';

  return useQuery({
    queryKey: ['my-tasks', filters],
    queryFn: async () => {
      const { data } = await instance.get(url);
      return data as Task[];
    },
  });
};

// Get a single task by ID
export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await instance.get(`/tasks/${id}`);
      return data as Task;
    },
    enabled: !!id,
  });
};

// Get task summary for a project
export const useProjectTaskSummary = (projectId: string) => {
  return useQuery({
    queryKey: ['task-summary', projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/tasks/project/${projectId}/summary`);
      return data as ProjectTaskSummary;
    },
    enabled: !!projectId,
  });
};

// Get user task statistics
export const useUserTaskStats = () => {
  return useQuery({
    queryKey: ['user-task-stats'],
    queryFn: async () => {
      const { data } = await instance.get('/tasks/stats/user');
      return data as UserTaskStats;
    },
  });
};

// Create a new task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: CreateTaskDto) => {
      const { data } = await instance.post('/tasks', newTask);
      return data as Task;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-summary', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    },
  });
};

// Update a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      task,
    }: {
      id: string;
      task: UpdateTaskDto;
    }) => {
      const { data } = await instance.patch(`/tasks/${id}`, task);
      return data as Task;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      if (variables.task.projectId) {
        queryClient.invalidateQueries({ queryKey: ['task-summary', variables.task.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    },
  });
};

// Delete a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/tasks/${id}`);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.removeQueries({ queryKey: ['tasks', variables] });
      queryClient.invalidateQueries({ queryKey: ['task-summary'] });
      queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    },
  });
};

// COMMENT HOOKS

// Get all comments for a task
export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data } = await instance.get(`/tasks/${taskId}/comments`);
      return data as Comment[];
    },
    enabled: !!taskId,
  });
};

// Create a new comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: CreateCommentDto) => {
      const { data } = await instance.post('/tasks/comments', newComment);
      return data as Comment;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', variables.taskId] });
      // Also invalidate the task itself to update comment count
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
};

// Update a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      comment,
    }: {
      commentId: string;
      comment: UpdateCommentDto;
    }) => {
      const { data } = await instance.patch(`/tasks/comments/${commentId}`, comment);
      return data as Comment;
    },
    onSuccess: (data) => {
      // Invalidate and refetch comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', data.taskId] });
      // Also invalidate the task itself
      queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
    },
  });
};

// Delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await instance.delete(`/tasks/comments/${commentId}`);
      return data;
    },
    onSuccess: (data) => {
      // We need to get the taskId from the comment data returned by the API
      // Since the delete endpoint might return the deleted comment data
      if (data && data.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-comments', data.taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
      } else {
        // Fallback: invalidate all comment queries
        queryClient.invalidateQueries({ queryKey: ['task-comments'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
};

// UTILITY HOOKS

// Hook to refetch task-related queries
export const useRefreshTasks = () => {
  const queryClient = useQueryClient();

  return {
    refreshAllTasks: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
    refreshTaskComments: (taskId: string) => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
    },
    refreshTaskSummary: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ['task-summary', projectId] });
    },
    refreshUserStats: () => {
      queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    },
  };
};

// Hook for optimistic updates
export const useOptimisticTaskUpdate = () => {
  const queryClient = useQueryClient();

  const updateTaskOptimistically = (taskId: string, updates: Partial<Task>) => {
    queryClient.setQueryData(['tasks', taskId], (oldData: Task | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });

    // Also update in lists
    queryClient.setQueryData(['tasks'], (oldData: Task[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
    });

    queryClient.setQueryData(['my-tasks'], (oldData: Task[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
    });
  };

  const revertTaskUpdate = (taskId: string) => {
    queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
  };

  return { updateTaskOptimistically, revertTaskUpdate };
};