import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        ) : (
          <div className="prose prose-lg max-w-none 
            prose-headings:font-serif prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0
            prose-h1:text-2xl prose-h1:font-semibold 
            prose-h2:text-xl prose-h2:font-semibold 
            prose-h3:text-lg prose-h3:font-semibold
            prose-p:text-foreground prose-p:mb-4 prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:text-foreground prose-ul:my-4 prose-ul:space-y-2
            prose-ol:text-foreground prose-ol:my-4 prose-ol:space-y-2
            prose-li:text-foreground prose-li:leading-relaxed
            prose-table:text-foreground prose-table:my-6 prose-table:border-collapse
            prose-th:text-foreground prose-th:font-semibold prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2
            prose-td:text-foreground prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
            prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:my-4
            prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground mt-1.5 px-1 opacity-60">
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;
