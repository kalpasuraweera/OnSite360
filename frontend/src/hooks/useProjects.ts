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
  createdAt: string;
  updatedAt: string;
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

export interface CreateProjectDto {
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  manager: string;
  location: string;
  description?: string;
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: CreateProjectDto) => {
      const { data } = await instance.post<Project>("/projects", newProject);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list after creation
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
