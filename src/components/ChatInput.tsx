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
    <footer className="sticky bottom-0 inset-x-0 border-t border-border bg-card/95 px-4 py-5 shadow-[0_-8px_24px_-20px_rgb(15_23_42/0.32)] backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about recipes, techniques, or ingredients..."
          disabled={disabled}
          className="w-full flex-1 resize-none rounded-2xl border border-input bg-background/60 px-4 py-4 text-base leading-relaxed shadow-sm transition-standard placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] max-h-36"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="h-14 w-full rounded-2xl shadow-refined transition-standard hover:shadow-refined-md sm:w-16"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </footer>
  );
};

export default ChatInput;
