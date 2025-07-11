import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

// Document Type Enum
export type DocumentType =
  | "drawings"
  | "specifications"
  | "contracts"
  | "permits"
  | "reports"
  | "submittals"
  | "invoices"
  | "photos";

// Document interfaces
export interface Document {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: DocumentType | string;
  category?: string | null;
  version?: string;
  size?: number | null;
  mimeType?: string | null;
  uploadedById?: string | null;
  description?: string | null;
  tags?: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  uploader?: {
    id: string;
    name: string;
    roleId?: string;
  };
}

// DTOs
export interface CreateDocumentDto {
  projectId: string;
  name: string;
  type: DocumentType | string;
  category?: string;
  version?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateDocumentDto {
  projectId?: string;
  name?: string;
  type?: DocumentType | string;
  category?: string;
  version?: string;
  description?: string;
  tags?: string[];
}

// Filters
export interface DocumentFilters {
  projectId?: string;
  userId?: string;
}

// HOOKS

// Get all documents (optionally filter by project or user)
export const useDocuments = (filters?: DocumentFilters) => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append("projectId", filters.projectId);
  if (filters?.userId) queryParams.append("userId", filters.userId);
  const queryString = queryParams.toString();
  const url = queryString ? `/documents?${queryString}` : "/documents";
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const { data } = await instance.get(url);
      return data as Document[];
    },
  });
};

// Get documents for a project
export const useProjectDocuments = (projectId: string) => {
  return useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/documents/project/${projectId}`);
      return data as Document[];
    },
    enabled: !!projectId,
  });
};

// Get documents uploaded by a user
export const useUserDocuments = (userId: string) => {
  return useQuery({
    queryKey: ["user-documents", userId],
    queryFn: async () => {
      const { data } = await instance.get(`/documents/user/${userId}`);
      return data as Document[];
    },
    enabled: !!userId,
  });
};

// Get a single document by ID
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const { data } = await instance.get(`/documents/${id}`);
      return data as Document;
    },
    enabled: !!id,
  });
};

// Upload a new document (with file)
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dto, file }: { dto: CreateDocumentDto; file: File }) => {
      const formData = new FormData();
      Object.entries(dto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, value as string);
          }
        }
      });
      formData.append("file", file);
      const { data } = await instance.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as Document;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["project-documents", variables.dto.projectId] });
      if (data && data.uploadedById)
        queryClient.invalidateQueries({ queryKey: ["user-documents", data.uploadedById] });
    },
  });
};

// Update a document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, document }: { id: string; document: UpdateDocumentDto }) => {
      const { data } = await instance.patch(`/documents/${id}`, document);
      return data as Document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id] });
      if (variables.document.projectId)
        queryClient.invalidateQueries({ queryKey: ["project-documents", variables.document.projectId] });
    },
  });
};

// Delete a document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/documents/${id}`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", id] });
    },
  });
};

// Utility hook to refresh document queries
export const useRefreshDocuments = () => {
  const queryClient = useQueryClient();
  return {
    refreshAllDocuments: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    refreshProjectDocuments: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", projectId] });
    },
    refreshUserDocuments: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ["user-documents", userId] });
    },
  };
};
