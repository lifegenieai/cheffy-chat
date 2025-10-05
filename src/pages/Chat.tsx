import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, BookOpen, ChevronDown, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RecipeCard } from "@/components/RecipeCard";
import { LibrarySheet } from "@/components/LibrarySheet";
import { ProfileSheet } from "@/components/ProfileSheet";
import { ResetPasswordSheet } from "@/components/ResetPasswordSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { Recipe } from "@/types/recipe";
import { useSaveRecipe } from "@/hooks/useSaveRecipe";
import { useLibraryRecipes } from "@/hooks/useLibraryRecipes";
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
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFromLibrary, setIsFromLibrary] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showResetPasswordSheet, setShowResetPasswordSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const saveRecipeMutation = useSaveRecipe();
  const { data: savedRecipes } = useLibraryRecipes();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveRecipe = () => {
    if (currentRecipe) {
      saveRecipeMutation.mutate(currentRecipe);
    }
  };

  const handleLibraryRecipeSelect = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIsFromLibrary(true);
    setIsRecipeSheetOpen(true);
  };

  const isRecipeSaved = currentRecipe 
    ? savedRecipes?.some(saved => saved.recipe_data.id === currentRecipe.id)
    : false;

  // Check scroll position to show/hide scroll-to-bottom button
  const checkScrollPosition = () => {
    const element = scrollAreaRef.current;
    if (!element) return;
    
    const isNearBottom = 
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen to scroll events
  useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;

    element.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition(); // Check initial state

    return () => {
      element.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  // Check scroll position when messages change
  useEffect(() => {
    checkScrollPosition();
  }, [messages]);

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
      let tokenCounter = 0;
      
      console.log('[Chat] Starting stream processing...');

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
              tokenCounter++;
              
              // Debug logging for tokens
              if (tokenCounter === 1) {
                console.log('[Chat] First token received:', content.substring(0, 50));
              }
              
              // Periodic status logging every 10 tokens
              if (tokenCounter % 10 === 0) {
                console.log('[Chat] Stream status:', {
                  tokens: tokenCounter,
                  totalLength: assistantContent.length,
                  lastChars: assistantContent.slice(-100),
                  hasRecipeBlockStart: assistantContent.includes('```recipe-json'),
                  hasRecipeBlockEnd: assistantContent.includes('```recipe-json') && /```recipe-json[\s\S]*?```/.test(assistantContent)
                });
              }
              
              // Detect recipe block appearance
              if (content.includes('```recipe-json') || (assistantContent.includes('```recipe-json') && tokenCounter % 5 === 0)) {
                console.log('[Chat] Recipe block detected at token', tokenCounter);
              }
              
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

      // Final stream completion logging
      console.log('[Chat] Stream complete:', {
        totalTokens: tokenCounter,
        totalLength: assistantContent.length,
        hasRecipeBlock: assistantContent.includes('```recipe-json'),
        recipeBlockComplete: /```recipe-json[\s\S]*?```/.test(assistantContent),
        preview: assistantContent.substring(0, 200) + '...'
      });

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
      <header className="flex items-center justify-between px-4 py-6 border-b border-border bg-background shadow-refined">
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
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowProfileSheet(true)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
          <Button
            onClick={() => setIsLibraryOpen(true)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Library</span>
          </Button>
          <Button
            onClick={() => setShowSettingsSheet(true)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
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
                console.log('[Chat] View recipe clicked, imageUrl:', recipe.imageUrl);
                setCurrentRecipe({ ...recipe }); // Clone to ensure fresh state
                setIsFromLibrary(false);
                setIsRecipeSheetOpen(true);
              }}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

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
              isSaved={isRecipeSaved}
              isFromLibrary={isFromLibrary}
              onSave={handleSaveRecipe}
              onOpenLibrary={() => setIsLibraryOpen(true)}
              onModify={() => {
                setIsRecipeSheetOpen(false);
                console.log('Modify recipe:', currentRecipe.id);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Library Sheet */}
      <LibrarySheet 
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onRecipeSelect={handleLibraryRecipeSelect}
      />

      {/* Profile Sheet */}
      <ProfileSheet
        open={showProfileSheet}
        onOpenChange={setShowProfileSheet}
        onOpenResetPassword={() => {
          setShowProfileSheet(false);
          setShowResetPasswordSheet(true);
        }}
        onOpenSettings={() => {
          setShowProfileSheet(false);
          setShowSettingsSheet(true);
        }}
      />

      {/* Reset Password Sheet */}
      <ResetPasswordSheet
        open={showResetPasswordSheet}
        onOpenChange={setShowResetPasswordSheet}
      />

      {/* Settings Sheet */}
      <SettingsSheet
        open={showSettingsSheet}
        onOpenChange={setShowSettingsSheet}
      />
    </div>
  );
};

export default Index;
