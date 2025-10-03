import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSendMessage(trimmedInput);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="border-t border-border/70 bg-background/90 pb-10 pt-6 sm:pt-8">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about recipes, techniques, or ingredients..."
            disabled={disabled}
            className="w-full flex-1 resize-none rounded-[1.25rem] border border-border/70 bg-card px-5 py-4 text-base leading-relaxed shadow-none transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[64px] max-h-36"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="h-14 w-full rounded-[1.25rem] px-6 text-base font-medium shadow-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:translate-y-0 sm:w-auto sm:px-8"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default ChatInput;
