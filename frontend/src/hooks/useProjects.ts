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
