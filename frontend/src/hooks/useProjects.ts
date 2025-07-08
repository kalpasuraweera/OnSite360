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
