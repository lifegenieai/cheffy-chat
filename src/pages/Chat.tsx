import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RecipeCard } from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";
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
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isRecipeSheetOpen, setIsRecipeSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll to allow users to read messages as they stream in

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          }))
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";
      let assistantMessageId = (Date.now() + 1).toString();

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant' && lastMsg.id === assistantMessageId) {
                  return prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, content: assistantContent }
                      : m
                  );
                }
                return [...prev, {
                  id: assistantMessageId,
                  role: 'assistant' as const,
                  content: assistantContent,
                  timestamp: new Date()
                }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm temporarily unable to respond. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
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
              onViewRecipe={(recipe) => {
                setCurrentRecipe(recipe);
                setIsRecipeSheetOpen(true);
              }}
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

      {/* Recipe Sheet */}
      <Sheet open={isRecipeSheetOpen} onOpenChange={setIsRecipeSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-8">
          {currentRecipe && (
            <RecipeCard 
              recipe={currentRecipe}
              onSave={() => {
                // TODO: Implement save to library
                console.log('Save recipe:', currentRecipe.id);
              }}
              onModify={() => {
                // TODO: Implement recipe modification
                setIsRecipeSheetOpen(false);
                console.log('Modify recipe:', currentRecipe.id);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
