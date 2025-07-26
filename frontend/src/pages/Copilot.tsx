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
import { 
  useProject, 
  useProjectStatistics
} from "../hooks/useProjects";
import { useTextGeneration } from "../hooks/useCopilot";
import type { Issue } from "../hooks/useProjects";
import { useUserProjects } from "../hooks/useUsers";
import instance from "../api/axiosInstance";

// Define interfaces for API responses
interface DailyActivity {
  activity: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  status: string;
  notes?: string;
}

interface DailyLog {
  weather?: string;
  temperature?: string;
  workHours?: number;
  workersPresent?: number;
  summary?: string;
  issues?: string;
  notes?: string;
  logger?: { firstName: string; lastName: string };
  activities?: DailyActivity[];
}

interface AttendanceRecord {
  date: string;
  isWorkDay: boolean;
  workersPresent?: number;
  workDelayed: boolean;
  delayReason?: string;
  actualStartTime?: string;
  notes?: string;
}

interface ThreadUser {
  firstName: string;
  lastName: string;
}

interface Thread {
  projectId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users?: ThreadUser[];
  messages?: unknown[];
  rfis?: unknown[];
}

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
  category: 'issues' | 'daily-log' | 'attendance' | 'communication';
  promptType?: 'smart'; // For smart prompts that fetch specific data
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
  
  // Combined loading state
  const isTyping = isGenerating;
  const isDataLoading = currentProjectLoading || statisticsLoading;

  // Chat suggestions - context-aware based on project data
  const getChatSuggestions = (): ChatSuggestion[] => {
    const smartSuggestions: ChatSuggestion[] = [
      {
        id: '1',
        text: 'Show me all unresolved issues in this project',
        icon: <IoBulb className="text-red-500" />,
        category: 'issues',
        promptType: 'smart'
      },
      {
        id: '2',
        text: 'Study the July 9th daily log and prepare a report',
        icon: <IoDocument className="text-blue-500" />,
        category: 'daily-log',
        promptType: 'smart'
      },
      {
        id: '3',
        text: 'Give me a summary of employee attendance in July',
        icon: <IoSearch className="text-green-500" />,
        category: 'attendance',
        promptType: 'smart'
      },
      {
        id: '4',
        text: 'Summarize communication threads for this project',
        icon: <IoRocket className="text-purple-500" />,
        category: 'communication',
        promptType: 'smart'
      }
    ];

    return smartSuggestions;
  };

  const chatSuggestions = getChatSuggestions();

  // Smart prompt handler that fetches specific data based on prompt type
  const handleSmartPrompt = async (suggestion: ChatSuggestion, userPrompt: string) => {
    let context = '';
    let enhancedPrompt = '';

    switch (suggestion.category) {
      case 'issues': {
        // Fetch only unresolved issues
        try {
          const issuesResponse = await instance.get(`/projects/${selectedProject}/issues`);
          const issuesData = issuesResponse.data;
          const unresolvedIssues = issuesData.filter((issue: Issue) => 
            issue.status !== 'Resolved' && issue.status !== 'Closed'
          );

          context = `
## Unresolved Issues in Project
Total unresolved issues: ${unresolvedIssues.length}

${unresolvedIssues.map((issue: Issue) => `
**${issue.title}**
- Status: ${issue.status}
- Severity: ${issue.severity}
- Category: ${issue.category}
- Reported by: ${issue.reportedBy}
- Due Date: ${issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
- Description: ${issue.description}
`).join('\n')}`;

        } catch {
          context = 'Unable to fetch current issues data.';
        }

        enhancedPrompt = `You are OnSite360 Copilot. Based on the unresolved issues data below, provide a comprehensive analysis and recommendations.

${context}

## User Request
${userPrompt}

Please provide:
1. Overview of critical and high-priority issues
2. Categorization of issues by type
3. Recommended action items and prioritization
4. Any potential risks or concerns`;
        break;
      }

      case 'daily-log': {
        // Fetch July 9th daily log
        try {
          const dailyLogResponse = await instance.get(`/schedule/daily-logs/by-date?projectId=${selectedProject}&date=2025-07-09`);
          const dailyLogData = dailyLogResponse.data;

          if (dailyLogData && dailyLogData.length > 0) {
            const log: DailyLog = dailyLogData[0];
            context = `
## Daily Log for July 9, 2025
**Weather:** ${log.weather || 'Not recorded'}
**Temperature:** ${log.temperature || 'Not recorded'}
**Work Hours:** ${log.workHours || 'Not recorded'}
**Workers Present:** ${log.workersPresent || 'Not recorded'}
**Summary:** ${log.summary || 'No summary provided'}
**Issues:** ${log.issues || 'No issues reported'}
**Notes:** ${log.notes || 'No additional notes'}
**Logged by:** ${log.logger ? `${log.logger.firstName} ${log.logger.lastName}` : 'Unknown'}

## Activities for the Day
${log.activities && log.activities.length > 0 ? 
  log.activities.map((activity: DailyActivity) => `
**${activity.activity}**
- Location: ${activity.location || 'Not specified'}
- Time: ${activity.startTime || 'Not specified'} - ${activity.endTime || 'Not specified'}
- Progress: ${activity.progress || 0}%
- Status: ${activity.status}
- Notes: ${activity.notes || 'No notes'}
`).join('\n') : 'No activities recorded'}`;
          } else {
            context = 'No daily log found for July 9, 2025. This could mean no work was logged for this date.';
          }
        } catch {
          context = 'Unable to fetch daily log data for July 9, 2025.';
        }

        enhancedPrompt = `You are OnSite360 Copilot. Based on the July 9th daily log data below, prepare a comprehensive report.

${context}

## User Request
${userPrompt}

Please provide:
1. Summary of activities and progress for the day
2. Analysis of productivity and work completion
3. Weather impact on work (if applicable)
4. Issues encountered and their implications
5. Recommendations for future similar work days`;
        break;
      }

      case 'attendance': {
        // Fetch July attendance data
        try {
          const attendanceResponse = await instance.get(`/projects/${selectedProject}/attendance?startDate=2025-07-01&endDate=2025-07-31`);
          const attendanceData = attendanceResponse.data;

          if (attendanceData && attendanceData.length > 0) {
            const totalWorkDays = attendanceData.filter((record: AttendanceRecord) => record.isWorkDay).length;
            const delayedDays = attendanceData.filter((record: AttendanceRecord) => record.workDelayed).length;
            const averageWorkers = attendanceData.reduce((sum: number, record: AttendanceRecord) => 
              sum + (record.workersPresent || 0), 0) / attendanceData.length;

            context = `
## July 2025 Attendance Summary
**Total recorded days:** ${attendanceData.length}
**Work days:** ${totalWorkDays}
**Days with delays:** ${delayedDays}
**Average workers present:** ${averageWorkers.toFixed(1)}

## Daily Breakdown
${attendanceData.slice(0, 10).map((record: AttendanceRecord) => `
**${new Date(record.date).toLocaleDateString()}**
- Work day: ${record.isWorkDay ? 'Yes' : 'No'}
- Workers present: ${record.workersPresent || 'Not recorded'}
- Work delayed: ${record.workDelayed ? 'Yes' : 'No'}
- Delay reason: ${record.delayReason || 'N/A'}
- Start time: ${record.actualStartTime || 'Not recorded'}
- Notes: ${record.notes || 'No notes'}
`).join('\n')}${attendanceData.length > 10 ? '\n... and more days' : ''}`;
          } else {
            context = 'No attendance data found for July 2025.';
          }
        } catch {
          context = 'Unable to fetch attendance data for July 2025.';
        }

        enhancedPrompt = `You are OnSite360 Copilot. Based on the July attendance data below, provide a comprehensive summary.

${context}

## User Request
${userPrompt}

Please provide:
1. Overall attendance patterns and trends
2. Analysis of delays and their impact
3. Workforce utilization insights
4. Recommendations for improving attendance and reducing delays
5. Any concerns or positive trends identified`;
        break;
      }

      case 'communication': {
        // Fetch communication threads for the project
        try {
          const threadsResponse = await instance.get('/communication/threads');
          const allThreads = threadsResponse.data;
          const projectThreads = allThreads.filter((thread: Thread) => thread.projectId === selectedProject);

          if (projectThreads && projectThreads.length > 0) {
            context = `
## Communication Threads Summary
**Total threads:** ${projectThreads.length}

## Recent Threads
${projectThreads.slice(0, 8).map((thread: Thread) => `
**${thread.title}**
- Description: ${thread.description || 'No description'}
- Created: ${new Date(thread.createdAt).toLocaleDateString()}
- Last updated: ${new Date(thread.updatedAt).toLocaleDateString()}
- Participants: ${thread.users?.map((user: ThreadUser) => `${user.firstName} ${user.lastName}`).join(', ') || 'No participants listed'}
- Messages: ${thread.messages?.length || 0}
- RFIs: ${thread.rfis?.length || 0}
`).join('\n')}${projectThreads.length > 8 ? '\n... and more threads' : ''}`;
          } else {
            context = 'No communication threads found for this project.';
          }
        } catch {
          context = 'Unable to fetch communication threads data.';
        }

        enhancedPrompt = `You are OnSite360 Copilot. Based on the communication threads data below, provide a comprehensive summary.

${context}

## User Request
${userPrompt}

Please provide:
1. Overview of communication activity and engagement
2. Analysis of thread topics and categories
3. Identification of frequently discussed issues
4. Team collaboration insights
5. Recommendations for improving communication efficiency`;
        break;
      }

      default:
        enhancedPrompt = userPrompt;
    }

    return enhancedPrompt;
  };

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

    // Build simple project context for regular messages
    const buildSimpleProjectContext = () => {
      let context = '';
      const projectData = currentProject?.data;
      const statsData = projectStatistics?.data;

      if (projectData) {
        context += `
## Current Project: ${projectData.name || 'Unnamed Project'}
**Description:** ${projectData.description || 'No description available'}
**Location:** ${projectData.location || 'Location not specified'}`;
      }

      if (statsData) {
        context += `
## Quick Stats
- Total Tasks: ${statsData.tasks?.total ?? 0} (${statsData.tasks?.completed ?? 0} completed)
- Total Issues: ${statsData.issues?.total ?? 0} (${statsData.issues?.open ?? 0} open)
- Team Members: ${statsData.users?.total ?? 0}`;
      }

      return context;
    };

    // Prepare simplified prompt for regular queries
    const projectContextString = buildSimpleProjectContext();
    const conversationContext = messages.slice(-3).map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    
    const enhancedPrompt = `You are OnSite360 Copilot, an AI assistant specialized in construction project management.

${projectContextString}

## Recent Conversation
${conversationContext}

## User Question
${userPrompt}

Please provide a helpful response based on the project context above.`;

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

  const handleSuggestionClick = async (suggestion: ChatSuggestion) => {
    if (suggestion.promptType === 'smart') {
      // For smart prompts, directly send the message with enhanced context
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

      const userMessage: Message = {
        id: Date.now().toString(),
        content: suggestion.text,
        isUser: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Get enhanced prompt with specific data
      const enhancedPrompt = await handleSmartPrompt(suggestion, suggestion.text);

      // Call AI API with enhanced prompt
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
        onError: () => {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Sorry, I encountered an error while processing your request. Please try again.",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
      });
    } else {
      // For regular suggestions, just set the input value
      setInputValue(suggestion.text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
