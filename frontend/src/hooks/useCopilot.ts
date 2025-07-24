/**
 * Custom hooks for Copilot AI functionality using React Query.
 *
 * @remarks
 * This hook leverages React Query to efficiently manage AI operations using:
 * - Text generation using LLM models (Ollama API compatible)
 * - Project-aware AI assistance for construction management
 *
 * All operations are cached and provide loading/error states automatically.
 */

import { useMutation } from '@tanstack/react-query';
import instance from '../api/axiosInstance';

// Text Generation Types
export interface TextGenerationRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  projectId?: string;
  timeout?: number; // Custom timeout in milliseconds
}

export interface TextGenerationResponse {
  response: string;
  model: string;
  tokens?: number;
  duration?: number;
  timestamp: Date;
}

// Text Generation Hook
export const useTextGeneration = () => {
  return useMutation({
    mutationFn: async (request: TextGenerationRequest): Promise<TextGenerationResponse> => {
      // Use custom timeout if provided, otherwise use defaults based on stream mode
      const timeout = request.timeout || 
        (request.stream ? CopilotConfig.STREAMING_TIMEOUT : CopilotConfig.DEFAULT_TIMEOUT);
      
      const { data } = await instance.post('/copilot/generate', request, {
        timeout, // Override the default 10 second timeout
      });
      return data;
    },
  });
};

// Utility hook for quick text generation without managing state
export const useQuickGenerate = () => {
  const { mutateAsync: generateText } = useTextGeneration();

  const quickGenerate = async (
    prompt: string,
    options?: Partial<TextGenerationRequest>
  ): Promise<string> => {
    const response = await generateText({
      prompt,
      timeout: CopilotConfig.QUICK_TIMEOUT, // Default to quick timeout for utility functions
      ...options, // Allow override of timeout and other options
    });
    return response.response;
  };

  return { quickGenerate };
};

// Utility hook for construction-specific AI assistant
export const useConstructionAssistant = (projectId?: string) => {
  const { quickGenerate } = useQuickGenerate();

  const askSafetyQuestion = async (question: string) => {
    const prompt = `As a construction safety expert, please answer this question: ${question}`;
    return await quickGenerate(prompt, { projectId });
  };

  const generateDailyReport = async (activities: string) => {
    const prompt = `Generate a professional daily construction report based on these activities: ${activities}`;
    return await quickGenerate(prompt, { projectId });
  };

  const summarizeIssues = async (issues: string[]) => {
    const prompt = `Summarize these construction issues and provide recommendations: ${issues.join(', ')}`;
    return await quickGenerate(prompt, { projectId });
  };

  const getProjectInsights = async (query: string, context?: string) => {
    let prompt = `You are OnSite360 Copilot, an AI assistant specialized in construction project management and technical support. `;
    
    if (context) {
      prompt += `\n\nProject Context: ${context}\n\n`;
    }
    
    prompt += `Question: ${query}\n\nPlease provide a helpful, accurate, and professional response.`;
    
    return await quickGenerate(prompt, { projectId });
  };

  const generateResponse = async (userMessage: string, conversationContext?: string, projectContext?: string) => {
    let prompt = `You are OnSite360 Copilot, an AI assistant specialized in construction project management, document analysis, and technical support.`;

    if (projectContext) {
      prompt += `\n\nProject Context: ${projectContext}`;
    }

    if (conversationContext) {
      prompt += `\n\nRecent conversation context:\n${conversationContext}`;
    }

    prompt += `\n\nUser Question: ${userMessage}\n\nPlease provide a helpful, accurate, and professional response.`;

    // Use longer timeout for detailed responses that might include project context
    return await quickGenerate(prompt, { 
      projectId,
      timeout: CopilotConfig.DEFAULT_TIMEOUT // Use default timeout for conversational responses
    });
  };

  return {
    askSafetyQuestion,
    generateDailyReport,
    summarizeIssues,
    getProjectInsights,
    generateResponse,
    quickGenerate,
  };
};

// Constants for common prompts and configurations
export const CopilotPrompts = {
  SAFETY_CHECK: 'Please review the current work activities and identify any potential safety concerns.',
  DAILY_SUMMARY: 'Generate a summary of today\'s construction activities and progress.',
  ISSUE_ANALYSIS: 'Analyze the reported issues and provide recommendations for resolution.',
  MATERIAL_CHECK: 'Review material usage and suggest optimizations.',
  WEATHER_IMPACT: 'Assess how current weather conditions might impact construction activities.',
} as const;

export const CopilotModels = {
  TEXT_GENERATION: 'llama3',
} as const;

export const CopilotConfig = {
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_TIMEOUT: 60000, // 60 seconds for regular generation
  STREAMING_TIMEOUT: 120000, // 2 minutes for streaming generation
  QUICK_TIMEOUT: 30000, // 30 seconds for quick operations
} as const;