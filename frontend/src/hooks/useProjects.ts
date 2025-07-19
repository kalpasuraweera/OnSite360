/**
 * Custom hook for fetching projects data using React Query.
 *
 * @returns {UseQueryResult} A React Query result object containing projects data,
 * loading state, error information, and refetch capabilities.
 *
 * @remarks
 * This hook leverages React Query to efficiently manage server state by:
 * - Caching responses to minimize unnecessary network requests
 * - Providing loading and error states automatically
 * - Handling background refetching for data freshness
 * - Managing request deduplication when multiple components request the same data
 * - Supporting automatic retries on failures
 *
 * The data is fetched from the '/projects' endpoint and cached with the 'projects' query key.
 */

import { useQuery } from "@tanstack/react-query";
import instance from "../api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  budget?: number;
  squareFeet?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  logoUrl?: string;
  featuredImageUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  userProjects?: {
    id: string;
    userId: string;
    projectRole: string;
    accessLevel: number;
    isActive: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  _count?: {
    tasks: number;
    documents: number;
    threads: number;
    issue: number;
  };
}

// User Project Assignment Types
export interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  projectRole?: string;
  accessLevel?: number;
  workSchedule?: string;
  hourlyRate?: number;
  emergencyContact?: string;
  notes?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// User Projects
export interface UserProjectWithProject {
  id: string;
  userId: string;
  projectId: string;
  projectRole?: string;
  accessLevel?: number;
  workSchedule?: string;
  hourlyRate?: number;
  emergencyContact?: string;
  notes?: string;
  endDate?: string;
  isActive: boolean;
  assignedBy?: string;
  assignedDate?: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    budget?: number;
    location?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface AssignUserToProjectDto {
  userId: string;
  projectRole?: string;
  accessLevel?: number;
  workSchedule?: string;
  hourlyRate?: number;
  emergencyContact?: string;
  notes?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateUserProjectDto {
  projectRole?: string;
  accessLevel?: number;
  workSchedule?: string;
  hourlyRate?: number;
  emergencyContact?: string;
  notes?: string;
  endDate?: string;
  isActive?: boolean;
}

// Crew Member Types
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  skills?: string[];
  isActive: boolean;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCrewMemberDto {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  skills?: string[];
  isActive?: boolean;
  hireDate?: string;
}

export interface UpdateCrewMemberDto {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  isActive?: boolean;
  hireDate?: string;
}

// Project Attendance Types
export interface ProjectAttendance {
  id: string;
  projectId: string;
  date: string;
  actualStartTime?: string;
  workDelayed: boolean;
  delayReason?: string;
  delayDuration?: number;
  dayType?: string;
  dayTypeReason?: string;
  isWorkDay: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectAttendanceDto {
  date: string;
  actualStartTime?: string;
  workDelayed?: boolean;
  delayReason?: string;
  delayDuration?: number;
  dayType?: string;
  dayTypeReason?: string;
  isWorkDay?: boolean;
  notes?: string;
}

export interface UpdateProjectAttendanceDto {
  actualStartTime?: string;
  workDelayed?: boolean;
  delayReason?: string;
  delayDuration?: number;
  dayType?: string;
  dayTypeReason?: string;
  isWorkDay?: boolean;
  notes?: string;
}

export interface AttendanceRecord {
  crewMemberId: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakDuration?: number;
  totalHours?: number;
  scheduledHours?: number;
  leaveType?: string;
  isApproved?: boolean;
  workLocation?: string;
  tasks?: string[];
  notes?: string;
}

export interface MarkAttendanceDto {
  crewAttendance: AttendanceRecord[];
}

// Project Statistics Type
export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalDocuments: number;
  totalThreads: number;
  totalIssues: number;
  totalUsers: number;
  totalCrewMembers: number;
  completionPercentage: number;
}

// Issue Types
export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  location?: string;
  reportedBy: string;
  reportedById?: string;
  dueDate?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  taggedUsers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface CreateIssueDto {
  title: string;
  description: string;
  category: string;
  severity: string;
  location?: string;
  reportedBy: string;
  taggedUserIds?: string[];
  dueDate?: string;
  attachmentIds?: string[];
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  status?: string;
  location?: string;
  taggedUserIds?: string[];
  dueDate?: string;
  resolution?: string;
  attachmentIds?: string[];
}

export const IssueStatus = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const;

export const IssueSeverity = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export const IssueCategory = {
  SAFETY: 'Safety',
  QUALITY: 'Quality',
  DELAY: 'Delay',
  EQUIPMENT: 'Equipment',
  ENVIRONMENTAL: 'Environmental',
  MATERIAL: 'Material',
  OTHER: 'Other',
} as const;

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await instance.get("/projects");
      return data;
    },
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export interface CreateProjectDto {
  name: string;
  description?: string;
  type?: string;
  budget?: number;
  squareFeet?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  logoUrl?: string;
  featuredImageUrl?: string;
  startDate?: string;
  endDate?: string;
  users?: {
    userId: string;
    projectRole?: string;
    accessLevel?: number;
  }[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  type?: string;
  budget?: number;
  squareFeet?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  logoUrl?: string;
  featuredImageUrl?: string;
  startDate?: string;
  endDate?: string;
  users?: {
    userId: string;
    projectRole?: string;
    accessLevel?: number;
  }[];
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: CreateProjectDto) => {
      const { data } = await instance.post("/projects", newProject);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list after creation
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProjectDto & { id: string }) => {
      const { data } = await instance.patch(`/projects/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch projects list and specific project after update
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/projects/${id}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list after deletion
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// My Projects Hook
export const useMyProjects = () => {
  return useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => {
      const { data } = await instance.get("/projects/my-projects");
      return data;
    },
  });
};

// User Projects Hook
export const useUserProjects = (userId: string) => {
  return useQuery({
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/users/${userId}/projects`);
      return data;
    },
    enabled: !!userId,
  });
};

// Project Users Management Hooks
export const useProjectUsers = (projectId: string) => {
  return useQuery({
    queryKey: ["project-users", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/users`);
      return data;
    },
    enabled: !!projectId,
  });
};

export const useAssignUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...assignData }: AssignUserToProjectDto & { projectId: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/users`, assignData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-users", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateUserProjectAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId, ...updateData }: UpdateUserProjectDto & { projectId: string; userId: string }) => {
      const { data } = await instance.put(`/projects/${projectId}/users/${userId}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-users", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useRemoveUserFromProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/users/${userId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-users", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Project Statistics Hook
export const useProjectStatistics = (projectId: string) => {
  return useQuery({
    queryKey: ["project-statistics", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/statistics`);
      return data;
    },
    enabled: !!projectId,
  });
};

// Crew Members Management Hooks
export const useCrewMembers = () => {
  return useQuery({
    queryKey: ["crew-members"],
    queryFn: async () => {
      const { data } = await instance.get("/projects/crew-members");
      return data;
    },
  });
};

export const useCrewMember = (crewMemberId: string) => {
  return useQuery({
    queryKey: ["crew-member", crewMemberId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/crew-members/${crewMemberId}`);
      return data;
    },
    enabled: !!crewMemberId,
  });
};

export const useCreateCrewMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCrewMember: CreateCrewMemberDto) => {
      const { data } = await instance.post("/projects/crew-members", newCrewMember);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-members"] });
    },
  });
};

export const useUpdateCrewMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ crewMemberId, ...updateData }: UpdateCrewMemberDto & { crewMemberId: string }) => {
      const { data } = await instance.patch(`/projects/crew-members/${crewMemberId}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crew-members"] });
      queryClient.invalidateQueries({ queryKey: ["crew-member", variables.crewMemberId] });
    },
  });
};

export const useDeleteCrewMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (crewMemberId: string) => {
      const { data } = await instance.delete(`/projects/crew-members/${crewMemberId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-members"] });
    },
  });
};

// Project Crew Members Management Hooks
export const useProjectCrewMembers = (projectId: string) => {
  return useQuery({
    queryKey: ["project-crew-members", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/crew-members`);
      return data;
    },
    enabled: !!projectId,
  });
};

export const useAssignCrewMemberToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, crewMemberId, notes }: { projectId: string; crewMemberId: string; notes?: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/crew-members/${crewMemberId}`, { notes });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-crew-members", variables.projectId] });
    },
  });
};

export const useRemoveCrewMemberFromProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, crewMemberId }: { projectId: string; crewMemberId: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/crew-members/${crewMemberId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-crew-members", variables.projectId] });
    },
  });
};

// Project Attendance Management Hooks
export const useProjectAttendanceHistory = (projectId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["project-attendance-history", projectId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const { data } = await instance.get(`/projects/${projectId}/attendance?${params.toString()}`);
      return data;
    },
    enabled: !!projectId,
  });
};

export const useProjectAttendanceByDate = (projectId: string, date: string) => {
  return useQuery({
    queryKey: ["project-attendance", projectId, date],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/attendance/${date}`);
      return data;
    },
    enabled: !!projectId && !!date,
  });
};

export const useCreateProjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...attendanceData }: CreateProjectAttendanceDto & { projectId: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/attendance`, attendanceData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-attendance-history", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-attendance", variables.projectId, variables.date] });
    },
  });
};

export const useUpdateProjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, date, ...updateData }: UpdateProjectAttendanceDto & { projectId: string; date: string }) => {
      const { data } = await instance.patch(`/projects/${projectId}/attendance/${date}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-attendance-history", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-attendance", variables.projectId, variables.date] });
    },
  });
};

export const useDeleteProjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, date }: { projectId: string; date: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/attendance/${date}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-attendance-history", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-attendance", variables.projectId, variables.date] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, date, ...markData }: MarkAttendanceDto & { projectId: string; date: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/attendance/${date}/mark`, markData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-attendance-history", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-attendance", variables.projectId, variables.date] });
    },
  });
};

// Issue Management Hooks
export const useAllIssues = () => {
  return useQuery({
    queryKey: ["all-issues"],
    queryFn: async () => {
      const { data } = await instance.get("/projects/issues");
      return data;
    },
  });
};

export const useProjectIssues = (projectId: string) => {
  return useQuery({
    queryKey: ["project-issues", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/issues`);
      return data;
    },
    enabled: !!projectId,
  });
};

export const useIssue = (projectId: string, issueId: string) => {
  return useQuery({
    queryKey: ["issue", projectId, issueId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/issues/${issueId}`);
      return data;
    },
    enabled: !!projectId && !!issueId,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...issueData }: CreateIssueDto & { projectId: string }) => {
      const { data } = await instance.post(`/projects/${projectId}/issues`, issueData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-issues"] });
      queryClient.invalidateQueries({ queryKey: ["project-statistics", variables.projectId] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, issueId, ...updateData }: UpdateIssueDto & { projectId: string; issueId: string }) => {
      const { data } = await instance.patch(`/projects/${projectId}/issues/${issueId}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["issue", variables.projectId, variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ["all-issues"] });
      queryClient.invalidateQueries({ queryKey: ["project-statistics", variables.projectId] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, issueId }: { projectId: string; issueId: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/issues/${issueId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-issues"] });
      queryClient.invalidateQueries({ queryKey: ["project-statistics", variables.projectId] });
    },
  });
};
