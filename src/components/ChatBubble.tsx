import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatBubble = ({ message, role, timestamp }: ChatBubbleProps) => {
  const isUser = role === "user";
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div 
      className={cn(
        "flex flex-col animate-fade-in",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-5 py-4 shadow-refined transition-standard",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>
      <span className="text-xs text-muted-foreground mt-1.5 px-1 opacity-60">
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;
