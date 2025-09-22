import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../api/axiosInstance";

// Budget Entry interfaces
export interface BudgetEntry {
  id: string;
  projectId: string;
  category: string;
  amount: number;
  budgeted?: number;
  description?: string;
  date: string;
  createdBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    budget?: number;
  };
}

export interface CreateBudgetEntryDto {
  category: string;
  amount: number;
  budgeted?: number;
  description?: string;
  date?: string;
  notes?: string;
}

export interface UpdateBudgetEntryDto {
  category?: string;
  amount?: number;
  budgeted?: number;
  description?: string;
  date?: string;
  notes?: string;
}

export interface BudgetAnalytics {
  project: {
    id: string;
    name: string;
    totalBudget: number;
    budgetThreshold?: number;
  };
  summary: {
    totalSpent: number;
    totalBudgeted: number;
    remainingBudget: number;
    spentPercentage: number;
    isOverBudget: boolean;
    isApproachingLimit: boolean;
  };
  categoryBreakdown: {
    category: string;
    spent: number;
    budgeted: number;
    count: number;
    percentage: number;
  }[];
}

// Risk Assessment interfaces
export interface RiskAssessment {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  riskScore: number;
  status: string;
  owner?: string;
  mitigation?: string;
  contingency?: string;
  dueDate?: string;
  reviewDate?: string;
  cost?: number;
  schedule?: number;
  identifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface CreateRiskAssessmentDto {
  title: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  owner?: string;
  mitigation?: string;
  contingency?: string;
  dueDate?: string;
  reviewDate?: string;
  cost?: number;
  schedule?: number;
}

export interface UpdateRiskAssessmentDto {
  title?: string;
  description?: string;
  category?: string;
  probability?: string;
  impact?: string;
  status?: string;
  owner?: string;
  mitigation?: string;
  contingency?: string;
  dueDate?: string;
  reviewDate?: string;
  cost?: number;
  schedule?: number;
}

export interface RiskAnalytics {
  project: {
    id: string;
    name: string;
  };
  summary: {
    totalRisks: number;
    openRisks: number;
    closedRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    totalCostImpact: number;
    totalScheduleImpact: number;
  };
  categoryBreakdown: {
    category: string;
    total: number;
    open: number;
    high: number;
    medium: number;
    low: number;
  }[];
  riskTrend: {
    month: string;
    created: number;
    closed: number;
    net: number;
  }[];
}

// Budget Management Hooks
export const useProjectBudgetEntries = (projectId: string) => {
  return useQuery({
    queryKey: ["project-budget", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/budget`);
      return data.data as BudgetEntry[];
    },
    enabled: !!projectId,
  });
};

export const useProjectBudgetAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: ["project-budget-analytics", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/budget/analytics`);
      return data.data as BudgetAnalytics;
    },
    enabled: !!projectId,
  });
};

export const useCreateBudgetEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, budgetEntry }: { projectId: string; budgetEntry: CreateBudgetEntryDto }) => {
      const { data } = await instance.post(`/projects/${projectId}/budget`, budgetEntry);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-budget", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-budget-analytics", variables.projectId] });
    },
  });
};

export const useUpdateBudgetEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      entryId, 
      budgetEntry 
    }: { 
      projectId: string; 
      entryId: string; 
      budgetEntry: UpdateBudgetEntryDto 
    }) => {
      const { data } = await instance.patch(`/projects/${projectId}/budget/${entryId}`, budgetEntry);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-budget", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-budget-analytics", variables.projectId] });
    },
  });
};

export const useDeleteBudgetEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, entryId }: { projectId: string; entryId: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/budget/${entryId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-budget", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-budget-analytics", variables.projectId] });
    },
  });
};

// Risk Management Hooks
export const useProjectRiskAssessments = (projectId: string) => {
  return useQuery({
    queryKey: ["project-risks", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/risks`);
      return data.data as RiskAssessment[];
    },
    enabled: !!projectId,
  });
};

export const useProjectRiskAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: ["project-risk-analytics", projectId],
    queryFn: async () => {
      const { data } = await instance.get(`/projects/${projectId}/risks/analytics`);
      return data.data as RiskAnalytics;
    },
    enabled: !!projectId,
  });
};

export const useCreateRiskAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, riskAssessment }: { projectId: string; riskAssessment: CreateRiskAssessmentDto }) => {
      const { data } = await instance.post(`/projects/${projectId}/risks`, riskAssessment);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-risk-analytics", variables.projectId] });
    },
  });
};

export const useUpdateRiskAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      riskId, 
      riskAssessment 
    }: { 
      projectId: string; 
      riskId: string; 
      riskAssessment: UpdateRiskAssessmentDto 
    }) => {
      const { data } = await instance.patch(`/projects/${projectId}/risks/${riskId}`, riskAssessment);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-risk-analytics", variables.projectId] });
    },
  });
};

export const useDeleteRiskAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, riskId }: { projectId: string; riskId: string }) => {
      const { data } = await instance.delete(`/projects/${projectId}/risks/${riskId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-risk-analytics", variables.projectId] });
    },
  });
};