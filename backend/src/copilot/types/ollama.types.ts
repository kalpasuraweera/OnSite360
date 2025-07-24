// Types for Ollama API responses
export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaEmbeddingResponse {
  embedding: number[];
  model?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    num_predict?: number;
    temperature?: number;
    top_k?: number;
    top_p?: number;
    repeat_last_n?: number;
    repeat_penalty?: number;
    seed?: number;
    stop?: string[];
  };
  context?: number[];
}

export interface OllamaEmbeddingRequest {
  model: string;
  prompt: string;
}
