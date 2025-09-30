import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import logoLight from "@/assets/logo-light.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Good day. I'm your culinary advisor, here to guide you through recipes, techniques, and ingredient selections with precision and expertise. How may I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const mockAIResponses = [
    "I'd be delighted to assist you with that recipe. Let me guide you through the process with precision.",
    "Excellent choice. I'll provide you with detailed instructions and professional techniques to ensure optimal results.",
    "Allow me to share my expertise on this matter. I'll walk you through each step methodically.",
    "I'm pleased to help you explore this culinary technique. Let me explain the fundamentals.",
    "That's an interesting inquiry. I'll provide you with comprehensive guidance based on classical techniques."
  ];

  const getRandomResponse = () => {
    return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response with 2-second delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getRandomResponse(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-center px-4 py-6 border-b border-border bg-background shadow-refined">
        <div className="flex items-center gap-3">
          <img 
            src={logoLight} 
            alt="Culinary Advisor" 
            className="h-12 w-12"
          />
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Culinary Advisor
          </h1>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-24"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading}
      />
    </div>
  );
};

export default Index;
