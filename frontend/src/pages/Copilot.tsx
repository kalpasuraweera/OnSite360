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
import { useUserProjects, useProject } from "../hooks/useProjects";
import { useTextGeneration } from "../hooks/useCopilot";

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
  const { data: currentProject } = useProject(selectedProject);
  
  // Combined loading state
  const isTyping = isGenerating;

  // Chat suggestions
  const chatSuggestions: ChatSuggestion[] = [
    {
      id: '1',
      text: 'Find drawings related to foundation work',
      icon: <IoDocument className="text-blue-500" />,
      category: 'document'
    },
    {
      id: '2',
      text: 'Draft a response for the latest RFI about concrete specifications',
      icon: <IoBulb className="text-yellow-500" />,
      category: 'draft'
    },
    {
      id: '3',
      text: 'Search for safety protocols in project documents',
      icon: <IoSearch className="text-green-500" />,
      category: 'search'
    },
    {
      id: '4',
      text: 'Summarize project progress from recent reports',
      icon: <IoRocket className="text-purple-500" />,
      category: 'general'
    }
  ];

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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = inputValue.trim();
    setInputValue("");

    // Prepare enhanced prompt with project context
    let enhancedPrompt = userPrompt;
    if (currentProject) {
      const projectContext = `
Context: You are OnSite360 Copilot, an AI assistant specialized in construction project management, document analysis, and technical support for project "${currentProject.name}".

Project Details: ${JSON.stringify(currentProject, null, 2)}

Recent conversation context:
${messages.slice(-3).map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

User Question: ${userPrompt}

Please provide a helpful, accurate, and professional response considering the project context above.`;
      enhancedPrompt = projectContext;
    } else {
      // Add system context even without a specific project
      enhancedPrompt = `
You are OnSite360 Copilot, an AI assistant specialized in construction project management, document analysis, and technical support.

Recent conversation context:
${messages.slice(-3).map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

User Question: ${userPrompt}

Please provide a helpful, accurate, and professional response.`;
    }

    // Call AI API
    generateText({
      prompt: enhancedPrompt,
      projectId: selectedProject || undefined,
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
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I encountered an error while processing your request. Please try again.",
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
          <select
            className="select select-bordered"
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
