

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

export interface Permission {
  id: string;
  pageId: string;
  pageName: string;
  components: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionDto {
  pageId: string;
  pageName: string;
  components: string[];
}

// Get all permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data } = await instance.get("/permissions");
      return data as Permission[];
    },
  });
};

// Get a single permission by ID
export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ["permissions", id],
    queryFn: async () => {
      const { data } = await instance.get(`/permissions/${id}`);
      return data as Permission;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
};

// Create a new permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPermission: CreatePermissionDto) => {
      const { data } = await instance.post("/permissions", newPermission);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the permissions list
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

// Update a permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, permission }: { id: string; permission: Partial<CreatePermissionDto> }) => {
      const { data } = await instance.patch(`/permissions/${id}`, permission);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch both the list and the specific permission
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", variables.id] });
    },
  });
};

// Delete a permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/permissions/${id}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the permissions list
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};