import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

// Project Phase interfaces
export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  order: number;
  parentId?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: ProjectPhase;
  children: ProjectPhase[];
  project?: {
    id: string;
    name: string;
  };
}

// Schedule Event interfaces
export interface ScheduleEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type: 'MEETING' | 'TASK' | 'MILESTONE' | 'INSPECTION' | 'DELIVERY' | 'OTHER';
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color?: string;
  assignedUserId?: string;
  recurrence?: Record<string, unknown>; // JSON object for recurrence rules
  reminders: string[]; // Array of reminder times
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignees: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

// Daily Log interfaces
export interface DailyLog {
  id: string;
  projectId: string;
  date: string;
  weather?: string;
  temperature?: string;
  workHours?: number;
  summary: string;
  issues?: string;
  notes?: string;
  loggedById: string;
  workersPresent?: number;
  createdAt: string;
  updatedAt: string;
  activities: DailyActivity[];
  logger: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

// Daily Activity interfaces
export interface DailyActivity {
  id: string;
  dailyLogId: string;
  activity: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dailyLog?: DailyLog;
}

// DTOs
export interface CreateProjectPhaseDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  projectId: string;
  color?: string;
  progress?: number;
  parentId?: string;
}

export interface UpdateProjectPhaseDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  color?: string;
  progress?: number;
  parentId?: string;
}

export interface CreateScheduleEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  projectId: string;
  type: 'MEETING' | 'TASK' | 'MILESTONE' | 'INSPECTION' | 'DELIVERY' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: string;
  color?: string;
  allDay?: boolean;
  assignedUserId?: string;
}

export interface UpdateScheduleEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  type?: 'MEETING' | 'TASK' | 'MILESTONE' | 'INSPECTION' | 'DELIVERY' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: string;
  color?: string;
  allDay?: boolean;
  assignedUserId?: string;
}

export interface CreateDailyLogDto {
  date: string;
  projectId: string;
  weather?: string;
  notes?: string;
  workHours?: number;
  workersPresent?: number;
}

export interface UpdateDailyLogDto {
  date?: string;
  projectId?: string;
  weather?: string;
  notes?: string;
  workHours?: number;
  workersPresent?: number;
}

export interface CreateDailyActivityDto {
  activity: string;
  dailyLogId: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  notes?: string;
  taskId?: string; // NEW: optional related task id
}

export interface UpdateDailyActivityDto {
  activity?: string;
  dailyLogId?: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  notes?: string;
  taskId?: string; // NEW: optional related task id
}

// PROJECT PHASE HOOKS

// Get all project phases for a project
export const useProjectPhases = (projectId: string) => {
  return useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/project-phases?projectId=${projectId}`);
      return data as ProjectPhase[];
    },
    enabled: !!projectId,
  });
};

// Get a single project phase by ID
export const useProjectPhase = (id: string) => {
  return useQuery({
    queryKey: ["project-phases", id],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/project-phases/${id}`);
      return data as ProjectPhase;
    },
    enabled: !!id,
  });
};

// Create a new project phase
export const useCreateProjectPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPhase: CreateProjectPhaseDto) => {
      const { data } = await instance.post("/schedule/project-phases", newPhase);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", variables.projectId] });
    },
  });
};

// Update a project phase
export const useUpdateProjectPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      phase,
    }: {
      id: string;
      phase: UpdateProjectPhaseDto;
    }) => {
      const { data } = await instance.patch(`/schedule/project-phases/${id}`, phase);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", variables.phase.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-phases", variables.id] });
    },
  });
};

// Delete a project phase
export const useDeleteProjectPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/schedule/project-phases/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-phases", data.projectId] });
      }
    },
  });
};

// SCHEDULE EVENT HOOKS

// Get all schedule events for a project
export const useScheduleEvents = (projectId: string) => {
  return useQuery({
    queryKey: ["schedule-events", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/events?projectId=${projectId}`);
      return data as ScheduleEvent[];
    },
    enabled: !!projectId,
  });
};

// Get a single schedule event by ID
export const useScheduleEvent = (id: string) => {
  return useQuery({
    queryKey: ["schedule-events", id],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/events/${id}`);
      return data as ScheduleEvent;
    },
    enabled: !!id,
  });
};

// Create a new schedule event
export const useCreateScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEvent: CreateScheduleEventDto) => {
      const { data } = await instance.post("/schedule/events", newEvent);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedule-events", variables.projectId] });
    },
  });
};

// Update a schedule event
export const useUpdateScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      event,
    }: {
      id: string;
      event: UpdateScheduleEventDto;
    }) => {
      const { data } = await instance.patch(`/schedule/events/${id}`, event);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedule-events", variables.event.projectId] });
      queryClient.invalidateQueries({ queryKey: ["schedule-events", variables.id] });
    },
  });
};

// Delete a schedule event
export const useDeleteScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/schedule/events/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ["schedule-events", data.projectId] });
      }
    },
  });
};

// DAILY LOG HOOKS

// Get all daily logs for a project
export const useDailyLogs = (projectId: string) => {
  return useQuery({
    queryKey: ["daily-logs", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/daily-logs?projectId=${projectId}`);
      return data as DailyLog[];
    },
    enabled: !!projectId,
  });
};

// Get daily logs by date and project
export const useDailyLogsByDate = (projectId: string, date: string) => {
  return useQuery({
    queryKey: ["daily-logs", projectId, date],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/daily-logs/by-date?projectId=${projectId}&date=${date}`);
      return data as DailyLog[];
    },
    enabled: !!projectId && !!date,
  });
};

// Get a single daily log by ID
export const useDailyLog = (id: string) => {
  return useQuery({
    queryKey: ["daily-logs", id],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/daily-logs/${id}`);
      return data as DailyLog;
    },
    enabled: !!id,
  });
};

// Create a new daily log
export const useCreateDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLog: CreateDailyLogDto) => {
      const { data } = await instance.post("/schedule/daily-logs", newLog);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", variables.projectId] });
    },
  });
};

// Update a daily log
export const useUpdateDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      log,
    }: {
      id: string;
      log: UpdateDailyLogDto;
    }) => {
      const { data } = await instance.patch(`/schedule/daily-logs/${id}`, log);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", variables.log.projectId] });
      queryClient.invalidateQueries({ queryKey: ["daily-logs", variables.id] });
    },
  });
};

// Delete a daily log
export const useDeleteDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/schedule/daily-logs/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ["daily-logs", data.projectId] });
      }
    },
  });
};

// DAILY ACTIVITY HOOKS

// Get all activities for a daily log
export const useDailyActivities = (logId: string) => {
  return useQuery({
    queryKey: ["daily-activities", logId],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/daily-activities?logId=${logId}`);
      return data as DailyActivity[];
    },
    enabled: !!logId,
  });
};

// Get a single daily activity by ID
export const useDailyActivity = (id: string) => {
  return useQuery({
    queryKey: ["daily-activities", id],
    queryFn: async () => {
      const { data } = await instance.get(`/schedule/daily-activities/${id}`);
      return data as DailyActivity;
    },
    enabled: !!id,
  });
};

// Create a new daily activity
export const useCreateDailyActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newActivity: CreateDailyActivityDto) => {
      const { data } = await instance.post("/schedule/daily-activities", newActivity);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-activities", variables.dailyLogId] });
      queryClient.invalidateQueries({ queryKey: ["daily-logs", variables.dailyLogId] });
    },
  });
};

// Update a daily activity
export const useUpdateDailyActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      activity,
    }: {
      id: string;
      activity: UpdateDailyActivityDto;
    }) => {
      const { data } = await instance.patch(`/schedule/daily-activities/${id}`, activity);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-activities", variables.activity.dailyLogId] });
      queryClient.invalidateQueries({ queryKey: ["daily-activities", variables.id] });
    },
  });
};

// Delete a daily activity
export const useDeleteDailyActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/schedule/daily-activities/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.dailyLogId) {
        queryClient.invalidateQueries({ queryKey: ["daily-activities", data.dailyLogId] });
        queryClient.invalidateQueries({ queryKey: ["daily-logs", data.dailyLogId] });
      }
    },
  });
};