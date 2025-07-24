import { useState, useRef, useEffect } from "react";
import { 
  IoSend, 
  IoAttach, 
  IoDocument, 
  IoSearch, 
  IoRocket, 
  IoBulb,
  IoClose,
  IoCopy,
  IoRefresh
} from "react-icons/io5";
import { MdSupportAgent, MdHistory } from "react-icons/md";
import { useAuthStore } from "../stores/useAuthStore";
import { useProject, useProjectStatistics, useProjectIssues } from "../hooks/useProjects";
import { useTextGeneration } from "../hooks/useCopilot";
import type { Issue } from "../hooks/useProjects";
import { useUserProjects } from "../hooks/useUsers";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'document' | 'search' | 'draft';
  attachments?: string[];
}

interface ChatSuggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: 'document' | 'draft' | 'search' | 'general';
}

const Copilot = () => {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id || "");
  
  // State management
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // AI Integration
  const { mutate: generateText, isPending: isGenerating } = useTextGeneration();
  
  // Get current project data
  const { data: currentProject, isLoading: currentProjectLoading } = useProject(selectedProject);
  const { data: projectStatistics, isLoading: statisticsLoading } = useProjectStatistics(selectedProject);
  const { data: projectIssues, isLoading: issuesLoading } = useProjectIssues(selectedProject);
  
  // Combined loading state
  const isTyping = isGenerating;
  const isDataLoading = currentProjectLoading || statisticsLoading || issuesLoading;

  // Chat suggestions - context-aware based on project data
  const getChatSuggestions = (): ChatSuggestion[] => {
    const baseSuggestions = [
      {
        id: '1',
        text: 'Show me the current project status and progress',
        icon: <IoRocket className="text-purple-500" />,
        category: 'general' as const
      },
      {
        id: '2',
        text: 'What are the current issues and their priorities?',
        icon: <IoBulb className="text-yellow-500" />,
        category: 'search' as const
      },
      {
        id: '3',
        text: 'Generate a daily progress report for today',
        icon: <IoDocument className="text-blue-500" />,
        category: 'document' as const
      },
      {
        id: '4',
        text: 'Review safety protocols and recommendations',
        icon: <IoSearch className="text-green-500" />,
        category: 'search' as const
      }
    ];

    // Add project-specific suggestions if we have project data
    if (currentProject && projectStatistics) {
      if (projectStatistics.overdueTasks > 0) {
        baseSuggestions.push({
          id: '5',
          text: `Help prioritize ${projectStatistics.overdueTasks} overdue tasks`,
          icon: <IoBulb className="text-red-500" />,
          category: 'general' as const
        });
      }

      if (projectStatistics.totalIssues > 0) {
        baseSuggestions.push({
          id: '6',
          text: `Analyze and summarize ${projectStatistics.totalIssues} project issues`,
          icon: <IoSearch className="text-orange-500" />,
          category: 'search' as const
        });
      }
    }

    return baseSuggestions;
  };

  const chatSuggestions = getChatSuggestions();

  // Set default project when projects load
  useEffect(() => {
    if (
      Array.isArray(projects) &&
      projects.length > 0 &&
      !selectedProject &&
      !projectsLoading
    ) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, projectsLoading]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if a project is selected and user has projects
    if (Array.isArray(projects) && projects.length === 0 && !projectsLoading) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "It looks like you don't have access to any projects yet. Please contact your administrator to get assigned to a project, or create a new project to start using OnSite360 Copilot.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!selectedProject) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Please select a project from the dropdown above to get project-specific insights and assistance.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // If we're still loading project data, show a loading message
    if (isDataLoading && !currentProject) {
      const loadingMessage: Message = {
        id: Date.now().toString(),
        content: "Loading project data... Please wait a moment for the most up-to-date information.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);
      return;
    }

    // Wait for at least the basic project data before proceeding
    if (selectedProject && !currentProject) {
      const waitingMessage: Message = {
        id: Date.now().toString(),
        content: "Please wait while I gather the latest project information...",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, waitingMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = inputValue.trim();
    setInputValue("");

    // Build project context with current data at the time of sending
    const buildProjectContext = () => {
      // Debug logging to understand data structure
      console.log('🔍 Building context with:', {
        currentProject,
        projectStatistics,
        projectIssues: projectIssues?.length || 0,
        loadingStates: {
          currentProjectLoading,
          statisticsLoading,
          issuesLoading
        }
      });

      let context = '';

      // Extract the actual data from the API response wrapper
      const projectData = currentProject?.data;
      const statsData = projectStatistics?.data;
      const issuesData = projectIssues?.data || projectIssues; // Issues might be direct array

      // Current project info - access data from API response wrapper
      if (projectData) {
        context += `
## Current Project Context
**Project:** ${projectData.name || 'Unnamed Project'}
**Description:** ${projectData.description || 'No description available'}
**Location:** ${projectData.location || 'Location not specified'}
**Type:** ${projectData.type || 'Type not specified'}
**Budget:** ${projectData.budget ? `$${projectData.budget.toLocaleString()}` : 'Budget not specified'}
**Square Feet:** ${projectData.squareFeet ? `${projectData.squareFeet.toLocaleString()} sq ft` : 'Square footage not specified'}
**Start Date:** ${projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'Start date not set'}
**End Date:** ${projectData.endDate ? new Date(projectData.endDate).toLocaleDateString() : 'End date not set'}`;

        // Add team members if available
        if (projectData.userProjects && projectData.userProjects.length > 0) {
          context += `

## Team Members
${projectData.userProjects.slice(0, 5).map((up: {
            user: { firstName: string; lastName: string };
            projectRole?: string;
            accessLevel?: number;
          }) => 
            `- **${up.user.firstName} ${up.user.lastName}** (${up.projectRole || 'No role specified'}) - Access Level: ${up.accessLevel || 'Not specified'}`
          ).join('\n')}`;
        }

        // Add recent tasks if available
        if (projectData.tasks && projectData.tasks.length > 0) {
          const recentTasks = projectData.tasks.slice(0, 3);
          context += `

## Recent Tasks
${recentTasks.map((task: {
            title: string;
            status: string;
            priority: string;
            progress: number;
          }) => 
            `- **${task.title}** (${task.status}) - ${task.priority} priority, ${task.progress}% complete`
          ).join('\n')}`;
        }
      } else {
        context += `
## Current Project Context
Project details are currently being loaded...`;
      }

      // Project statistics - access data from API response wrapper
      if (statsData) {
        context += `

## Project Statistics
**Total Tasks:** ${statsData.tasks?.total ?? 0}
**Completed Tasks:** ${statsData.tasks?.completed ?? 0}
**In Progress Tasks:** ${statsData.tasks?.inProgress ?? 0}
**Pending Tasks:** ${statsData.tasks?.pending ?? 0}
**Task Completion Rate:** ${statsData.tasks?.completionRate?.toFixed(1) ?? 0}%
**Total Documents:** ${statsData.documents?.total ?? 0}
**Total Communication Threads:** ${statsData.threads?.total ?? 0}
**Total Issues:** ${statsData.issues?.total ?? 0}
**Open Issues:** ${statsData.issues?.open ?? 0}
**Resolved Issues:** ${statsData.issues?.resolved ?? 0}
**Total Team Members:** ${statsData.users?.total ?? 0}
**Active Team Members:** ${statsData.users?.active ?? 0}`;
      } else if (statisticsLoading) {
        context += `

## Project Statistics
Project statistics are currently loading...`;
      } else {
        context += `

## Project Statistics
No statistics available for this project.`;
      }

      // Recent issues - access from project data if available
      if (projectData?.issue && projectData.issue.length > 0) {
        const recentIssues = projectData.issue.slice(0, 3);
        context += `

## Recent Issues
${recentIssues.map((issue: {
          title: string;
          status: string;
          severity: string;
          category: string;
          reportedBy: string;
        }) => 
          `- **${issue.title}** (${issue.status}) - ${issue.severity} severity, Category: ${issue.category}, Reported by: ${issue.reportedBy}`
        ).join('\n')}`;
      } else if (issuesData && Array.isArray(issuesData) && issuesData.length > 0) {
        const recentIssues = issuesData.slice(0, 3);
        context += `

## Recent Issues
${recentIssues.map((issue: Issue) => 
          `- **${issue.title}** (${issue.status}) - ${issue.severity} severity, Category: ${issue.category}`
        ).join('\n')}`;
      } else if (issuesLoading) {
        context += `

## Recent Issues
Issues are currently loading...`;
      }

      return context;
    };

    // Prepare enhanced prompt with comprehensive project context
    const projectContextString = buildProjectContext();
    console.log(projectContextString)
    const conversationContext = messages.slice(-3).map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    
    const enhancedPrompt = `You are OnSite360 Copilot, an AI assistant specialized in construction project management, document analysis, and technical support.

${projectContextString}

## Recent Conversation
${conversationContext}

## User Question
${userPrompt}

## Instructions
Based on the project context above, provide a helpful, accurate, and professional response. Consider:
- Current project status and statistics
- Any relevant issues or concerns
- Team composition and roles
- Project timeline and budget constraints
- Construction industry best practices
- Safety considerations

Please provide actionable insights and recommendations when appropriate.`;

    // Call AI API
    generateText({
      prompt: enhancedPrompt,
      projectId: selectedProject,
      model: 'llama3',
      maxTokens: 1000,
      temperature: 0.7
    }, {
      onSuccess: (response) => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      },
      onError: (error) => {
        console.error('AI generation failed:', error);
        let errorContent = "Sorry, I encountered an error while processing your request. Please try again.";
        
        // Handle specific error types
        if (error && typeof error === 'object') {
          if ('code' in error && error.code === 'ECONNABORTED') {
            errorContent = "The request is taking longer than expected. Please try with a shorter question or try again in a moment.";
          } else if ('message' in error && typeof error.message === 'string') {
            if (error.message.includes('timeout')) {
              errorContent = "Request timed out. Please try again with a simpler question.";
            } else if (error.message.includes('network')) {
              errorContent = "Network error occurred. Please check your connection and try again.";
            }
          }
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorContent,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    setInputValue(suggestion.text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MdSupportAgent className="text-primary" />
            OnSite360 Copilot
          </h1>
          <p className="text-gray-500 mt-1">
            Your AI assistant for project management, document search, and technical support
          </p>
        </div>
        
        {/* Project Selection */}
        <div className="flex items-center gap-4">
          <div className="form-control">
            <select
              className={`select select-bordered ${!selectedProject ? 'select-error' : ''}`}
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projectsLoading}
            >
              {projectsLoading ? (
                <option>Loading projects...</option>
              ) : Array.isArray(projects) && projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option>No projects available</option>
              )}
            </select>
            {!selectedProject && Array.isArray(projects) && projects.length > 0 && (
              <label className="label">
                <span className="label-text-alt text-error">Please select a project</span>
              </label>
            )}
            {Array.isArray(projects) && projects.length === 0 && !projectsLoading && (
              <label className="label">
                <span className="label-text-alt text-warning">No projects assigned</span>
              </label>
            )}
            {selectedProject && isDataLoading && (
              <label className="label">
                <span className="label-text-alt text-info">
                  <span className="loading loading-dots loading-xs"></span>
                  Loading project data...
                </span>
              </label>
            )}
          </div>
          
          {messages.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearChat}
              title="Clear conversation"
            >
              <IoRefresh className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-base-200 border border-base-300 rounded-2xl overflow-hidden flex flex-col">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center mb-8">
                <MdSupportAgent className="text-8xl text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to OnSite360 Copilot</h2>
                <p className="text-gray-500 max-w-md">
                  I'm here to help you with project documents, draft responses, search information, and more. 
                  Try one of the suggestions below or ask me anything!
                </p>
              </div>
              
              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                {chatSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="btn btn-outline btn-lg h-auto p-4 text-left justify-start hover:bg-primary hover:text-primary-content transition-all duration-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{suggestion.icon}</div>
                      <span className="text-wrap">{suggestion.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-100 border border-base-300'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    {!message.isUser && (
                      <button
                        className="btn btn-ghost btn-xs mt-2 opacity-70 hover:opacity-100"
                        onClick={() => copyToClipboard(message.content)}
                        title="Copy to clipboard"
                      >
                        <IoCopy />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-base-100 border border-base-300 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="loading loading-dots loading-sm"></span>
                      <span className="text-sm text-gray-500">Copilot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-base-300 p-4">
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <div className="relative">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAttachments(!showAttachments)}
                title="Attach files"
              >
                <IoAttach className="text-lg" />
              </button>
              
              {showAttachments && (
                <div className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 min-w-48">
                  <button className="btn btn-ghost btn-sm w-full justify-start">
                    <IoDocument /> Upload Document
                  </button>
                  <button className="btn btn-ghost btn-sm w-full justify-start">
                    <MdHistory /> Reference Past Chat
                  </button>
                  <button
                    className="btn btn-ghost btn-sm w-full justify-start text-error"
                    onClick={() => setShowAttachments(false)}
                  >
                    <IoClose /> Close
                  </button>
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about documents, draft responses, search information, or get project insights..."
                className="textarea textarea-bordered w-full resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={isTyping}
              />
            </div>

            {/* Send Button */}
            <button
              className="btn btn-primary btn-square"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <IoSend />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="btn btn-ghost btn-xs">
              <IoDocument className="text-xs" />
              Find Documents
            </button>
            <button className="btn btn-ghost btn-xs">
              <IoBulb className="text-xs" />
              Draft Response
            </button>
            <button className="btn btn-ghost btn-xs">
              <IoSearch className="text-xs" />
              Search Project
            </button>
            <button className="btn btn-ghost btn-xs">
              <IoRocket className="text-xs" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
