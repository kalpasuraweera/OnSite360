import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    rolePermissions: RolePermission[];
  };
  createdAt?: string;
  updatedAt?: string;
}

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
    components: string[];
    createdAt: string;
    updatedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export interface UserProject {
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
  userProject: {
    id: string;
    projectRole: string;
    accessLevel: number;
    assignedDate: string;
    isActive: boolean;
  };
  _count?: {
    tasks: number;
    documents: number;
    threads: number;
    issue: number;
  };
}

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await instance.get("/users");
      return data as User[];
    },
  });
};

// Get a single user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await instance.get(`/users/${id}`);
      return data as User;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
};

// Create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser: CreateUserDto) => {
      const { data } = await instance.post("/users", newUser);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, user }: { id: string; user: UpdateUserDto }) => {
      const { data } = await instance.patch(`/users/${id}`, user);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch both the list and the specific user
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
};

// Delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/users/${id}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Get projects for a specific user
export const useUserProjects = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId, "projects"],
    queryFn: async () => {
      const { data } = await instance.get(`/users/${userId}/projects`);
      return data as UserProject[];
    },
    enabled: !!userId, // Only run the query if we have a user ID
  });
};
