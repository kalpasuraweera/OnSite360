import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

// Thread interfaces
export interface Thread {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  users: ThreadUser[];
  messages?: Message[];
  project?: {
    id: string;
    name: string;
  };
}

export interface ThreadUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Message interfaces
export interface Message {
  id: string;
  content: string;
  threadId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// RFI interfaces
export interface RFI {
  id: string;
  title: string;
  description: string;
  priority?: string;
  status?: string;
  response?: string;
  threadId: string;
  assigneeId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  thread: Thread;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// DTOs
export interface CreateThreadDto {
  title: string;
  description?: string;
  projectId: string;
  participantIds?: string[];
}

export interface UpdateThreadDto {
  title?: string;
  description?: string;
  projectId?: string;
  participantIds?: string[];
}

export interface AddUserToThreadDto {
  userId: string;
}

export interface CreateMessageDto {
  content: string;
  threadId: string;
}

export interface UpdateMessageDto {
  content?: string;
  threadId?: string;
}

export interface CreateRFIDto {
  title: string;
  description: string;
  priority?: string;
  threadId: string;
  assigneeId?: string;
}

export interface UpdateRFIDto {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  response?: string;
  threadId?: string;
  assigneeId?: string;
}

// THREAD HOOKS

// Get all threads for current user
export const useThreads = () => {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data } = await instance.get("/communication/threads");
      return data as Thread[];
    },
  });
};

// Get a single thread by ID
export const useThread = (id: string) => {
  return useQuery({
    queryKey: ["threads", id],
    queryFn: async () => {
      const { data } = await instance.get(`/communication/threads/${id}`);
      return data as Thread;
    },
    enabled: !!id,
  });
};

// Create a new thread
export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newThread: CreateThreadDto) => {
      const { data } = await instance.post("/communication/threads", newThread);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
};

// Update a thread
export const useUpdateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      thread,
    }: {
      id: string;
      thread: UpdateThreadDto;
    }) => {
      const { data } = await instance.patch(
        `/communication/threads/${id}`,
        thread
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["threads", variables.id] });
    },
  });
};

// Add user to thread
export const useAddUserToThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      user,
    }: {
      threadId: string;
      user: AddUserToThreadDto;
    }) => {
      const { data } = await instance.post(
        `/communication/threads/${threadId}/users`,
        user
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({
        queryKey: ["threads", variables.threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["thread-participants", variables.threadId],
      });
    },
  });
};

// Remove user from thread
export const useRemoveUserFromThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      userId,
    }: {
      threadId: string;
      userId: string;
    }) => {
      const { data } = await instance.delete(
        `/communication/threads/${threadId}/users/${userId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({
        queryKey: ["threads", variables.threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["thread-participants", variables.threadId],
      });
    },
  });
};

// Get thread participants
export const useThreadParticipants = (threadId: string) => {
  return useQuery({
    queryKey: ["thread-participants", threadId],
    queryFn: async () => {
      const { data } = await instance.get(
        `/communication/threads/${threadId}/participants`
      );
      return data.participants as ThreadUser[];
    },
    enabled: !!threadId,
  });
};

// MESSAGE HOOKS

// Get messages for a thread
export const useThreadMessages = (threadId: string) => {
  return useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: async () => {
      const { data } = await instance.get(
        `/communication/threads/${threadId}/messages`
      );
      return data as Message[];
    },
    enabled: !!threadId,
  });
};

// Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: CreateMessageDto) => {
      const { data } = await instance.post("/communication/messages", message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["thread-messages", variables.threadId],
      });
      queryClient.invalidateQueries({ queryKey: ["threads"] }); // Update last message in threads list
    },
  });
};

// Update a message
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      message,
    }: {
      id: string;
      message: UpdateMessageDto;
    }) => {
      const { data } = await instance.patch(
        `/communication/messages/${id}`,
        message
      );
      return data;
    },
    onSuccess: (data) => {
      if (data.threadId) {
        queryClient.invalidateQueries({
          queryKey: ["thread-messages", data.threadId],
        });
      }
    },
  });
};

// Delete a message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/communication/messages/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data.threadId) {
        queryClient.invalidateQueries({
          queryKey: ["thread-messages", data.threadId],
        });
      }
    },
  });
};

// RFI HOOKS

// Get all RFIs for current user
export const useRFIs = () => {
  return useQuery({
    queryKey: ["rfis"],
    queryFn: async () => {
      const { data } = await instance.get("/communication/rfis");
      return data as RFI[];
    },
  });
};

// Get a single RFI by ID
export const useRFI = (id: string) => {
  return useQuery({
    queryKey: ["rfis", id],
    queryFn: async () => {
      const { data } = await instance.get(`/communication/rfis/${id}`);
      return data as RFI;
    },
    enabled: !!id,
  });
};

// Create a new RFI
export const useCreateRFI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRFI: CreateRFIDto) => {
      const { data } = await instance.post("/communication/rfis", newRFI);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfis"] });
    },
  });
};

// Update an RFI
export const useUpdateRFI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rfi }: { id: string; rfi: UpdateRFIDto }) => {
      const { data } = await instance.patch(`/communication/rfis/${id}`, rfi);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rfis"] });
      queryClient.invalidateQueries({ queryKey: ["rfis", variables.id] });
    },
  });
};

// Delete an RFI
export const useDeleteRFI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await instance.delete(`/communication/rfis/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfis"] });
    },
  });
};
