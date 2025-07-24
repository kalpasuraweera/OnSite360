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
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Mock responses for demonstration
  const getMockResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('document') || message.includes('drawing') || message.includes('find')) {
      return `I found 3 relevant documents for your query:\n\n1. **Foundation_Plan_Rev_C.pdf** - Latest foundation drawings with updated specifications\n2. **Structural_Details_Sheet_4.dwg** - Detailed structural drawings for foundation work\n3. **Site_Survey_Report.pdf** - Site conditions report relevant to foundation\n\nWould you like me to retrieve specific information from any of these documents?`;
    }
    
    if (message.includes('rfi') || message.includes('draft') || message.includes('response')) {
      return `Here's a draft response for the RFI about concrete specifications:\n\n**Subject: Response to RFI #2024-15 - Concrete Mix Design**\n\nThank you for your inquiry regarding the concrete mix design for the foundation elements.\n\n**Response:**\nPer the project specifications (Section 03 30 00), the required concrete strength is f'c = 4000 psi at 28 days. The mix design should include:\n- Portland cement Type II\n- Maximum water-cement ratio: 0.45\n- Air entrainment: 5-7%\n- Slump: 3-5 inches\n\nPlease refer to Drawing S-101 for reinforcement details and Construction Details CD-03 for placement requirements.\n\nWould you like me to modify or add anything to this response?`;
    }
    
    if (message.includes('safety') || message.includes('protocol')) {
      return `I found several safety protocols in your project documents:\n\n**Key Safety Documents:**\n1. **Site_Safety_Plan_2024.pdf** - Comprehensive safety protocols\n2. **PPE_Requirements.pdf** - Personal protective equipment guidelines\n3. **Emergency_Procedures.pdf** - Emergency response protocols\n\n**Relevant Safety Requirements:**\n- Hard hats and safety vests required in all work areas\n- Fall protection required for work above 6 feet\n- Daily safety briefings mandatory\n- Hot work permits required for welding/cutting\n\nWould you like me to search for specific safety protocols or create a safety checklist?`;
    }
    
    if (message.includes('progress') || message.includes('summary') || message.includes('report')) {
      return `Based on the latest project reports, here's a summary of current progress:\n\n**Project Status Overview:**\n📊 **Overall Progress:** 68% complete\n🏗️ **Foundation Work:** 95% complete (ahead of schedule)\n🔧 **Structural Steel:** 45% complete (on schedule)\n🧱 **Masonry Work:** 20% complete (2 days behind)\n\n**Key Highlights:**\n- Foundation inspection passed with no issues\n- Steel delivery scheduled for next week\n- Weather delays affected masonry work\n- 3 RFIs pending response\n\n**Upcoming Milestones:**\n- Structural steel completion: March 15\n- MEP rough-in start: March 20\n- Exterior envelope start: April 1\n\nWould you like me to dive deeper into any specific area?`;
    }
    
    return `I'm here to help with your project needs! I can assist you with:\n\n🔍 **Document Search** - Find specific drawings, specs, or reports\n📝 **Draft Responses** - Help create RFI responses, emails, or reports  \n📊 **Project Analysis** - Summarize progress, identify issues, or trends\n🔧 **Technical Support** - Answer questions about specifications or procedures\n\nWhat would you like me to help you with today?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getMockResponse(userMessage.content),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
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
