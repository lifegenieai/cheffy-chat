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
          <div className="prose prose-base max-w-none
            prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold
            prose-h1:text-[32px] prose-h1:leading-[1.2] prose-h1:mb-6 prose-h1:mt-8 first:prose-h1:mt-0
            prose-h2:text-[20px] prose-h2:leading-[1.3] prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-[18px] prose-h3:leading-[1.4] prose-h3:mb-3 prose-h3:mt-6
            prose-h4:text-[16px] prose-h4:leading-normal prose-h4:mb-3 prose-h4:mt-4 prose-h4:font-semibold
            prose-p:text-[17px] prose-p:leading-[1.7] prose-p:text-foreground prose-p:mb-6
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-6 prose-ul:space-y-3
            prose-ol:my-6 prose-ol:space-y-3
            prose-li:text-[17px] prose-li:leading-[1.7] prose-li:text-foreground
            prose-table:w-full prose-table:my-8 prose-table:border-collapse prose-table:border-2 prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden
            prose-thead:bg-muted/50
            prose-th:text-[16px] prose-th:font-semibold prose-th:text-foreground prose-th:text-left prose-th:px-6 prose-th:py-4 prose-th:border prose-th:border-border
            prose-td:text-[16px] prose-td:text-foreground prose-td:px-6 prose-td:py-4 prose-td:border prose-td:border-border prose-td:leading-relaxed
            prose-tbody:divide-y prose-tbody:divide-border
            prose-tr:border-b prose-tr:border-border last:prose-tr:border-b-0
            prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
            prose-code:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[15px]">
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
