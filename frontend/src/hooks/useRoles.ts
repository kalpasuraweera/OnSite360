import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

export interface Role {
  id: string;
  name: string;
  rolePermissions: RolePermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  level: number;
  permission?: {
    id: string;
    pageId: string;
    pageName: string;
    components: string | null;
    createdAt: string;
    updatedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  name: string;
  permissions: {
    permissionId: string;
    level: number;
  }[];
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: {
    permissionId: string;
    level: number;
  }[];
}

// Get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await instance.get("/roles");
      return data as Role[];
    },
  });
};

// Get a single role by ID
export const useRole = (id: string) => {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => {
      const { data } = await instance.get(`/roles/${id}`);
      return data as Role;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
};

// Create a new role
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newRole: CreateRoleDto) => {
      const { data } = await instance.post("/roles", newRole);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

// Update a role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UpdateRoleDto }) => {
      const { data } = await instance.patch(`/roles/${id}`, role);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch both the list and the specific role
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
};

// Delete a role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/roles/${id}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the roles list
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
