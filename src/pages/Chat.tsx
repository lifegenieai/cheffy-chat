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

type MessageEventType = "user" | "assistant" | "status" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  eventType: MessageEventType;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Good day. I'm your culinary advisor, here to guide you through recipes, techniques, and ingredient selections with precision and expertise. How may I assist you today?",
      timestamp: new Date(),
      eventType: "assistant"
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
  const { session, signOut } = useAuth();
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
      timestamp: new Date(),
      eventType: "user"
    };

    const statusMessageId = `${Date.now()}-status`;
    const statusMessage: Message = {
      id: statusMessageId,
      role: "assistant",
      content: "Recipe under development…",
      timestamp: new Date(),
      eventType: "status"
    };

    const conversationHistory = messages
      .filter(message => message.eventType === "user" || message.eventType === "assistant")
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    setMessages(prev => [...prev, userMessage, statusMessage]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const accessToken = session?.access_token;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          }),
        },
        body: JSON.stringify({
          messages: [...conversationHistory, userMessage].map(m => ({
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
      let assistantContent = "";
      let assistantMessageId: string | null = null;
      let streamDone = false;
      let encounteredError = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":")) continue;
          if (line.trim() === "") continue;
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (jsonStr === "") continue;
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr) as {
              type: "status" | "assistant" | "error" | string;
              content?: string;
              done?: boolean;
            };

            const { type, content, done } = parsed;

            if (type === "status") {
              const statusText = content || (done ? "Recipe ready to view." : undefined);

              if (statusText) {
                setMessages(prev =>
                  prev.map(message =>
                    message.id === statusMessageId
                      ? { ...message, content: statusText, timestamp: new Date() }
                      : message
                  )
                );
              }

              if (done) {
                streamDone = true;
                break;
              }

              continue;
            }

            if (type === "assistant") {
              if (content) {
                assistantContent += content;

                if (!assistantMessageId) {
                  assistantMessageId = `${Date.now()}-assistant`;
                  const newAssistantMessage: Message = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: assistantContent,
                    timestamp: new Date(),
                    eventType: "assistant"
                  };
                  setMessages(prev => [...prev, newAssistantMessage]);
                } else {
                  setMessages(prev =>
                    prev.map(message =>
                      message.id === assistantMessageId
                        ? { ...message, content: assistantContent, timestamp: new Date() }
                        : message
                    )
                  );
                }
              }

              if (done) {
                streamDone = true;
                break;
              }

              continue;
            }

            if (type === "error") {
              const fallbackStatus = "We encountered an issue while developing your recipe.";

              setMessages(prev => {
                const updated = prev.map(message =>
                  message.id === statusMessageId
                    ? {
                        ...message,
                        content: content || fallbackStatus,
                        timestamp: new Date()
                      }
                    : message
                );

                if (content) {
                  const errorMessage: Message = {
                    id: `${Date.now()}-error`,
                    role: "assistant",
                    content,
                    timestamp: new Date(),
                    eventType: "error"
                  };
                  return [...updated, errorMessage];
                }

                return updated;
              });

              encounteredError = true;
              streamDone = true;
              break;
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (!encounteredError) {
        setMessages(prev =>
          prev.map(message =>
            message.id === statusMessageId && message.eventType === "status" && message.content === "Recipe under development…"
              ? { ...message, content: "Recipe ready to view.", timestamp: new Date() }
              : message
          )
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);

      const fallbackStatus = "We encountered an issue while developing your recipe.";

      setMessages(prev =>
        prev.map(message =>
          message.id === statusMessageId && message.eventType === "status"
            ? { ...message, content: fallbackStatus, timestamp: new Date() }
            : message
        )
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm temporarily unable to respond. Please try again in a moment.",
        timestamp: new Date(),
        eventType: "error"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-border/70 bg-background/95 px-4 py-10 shadow-[0_1px_0_rgba(15,23,42,0.05)] backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <img
                src={logoLight}
                alt="Culinary Advisor"
                className="h-16 w-16"
              />
              <div>
                <h1 className="text-4xl font-serif font-semibold tracking-tight text-foreground sm:text-5xl">
                  Culinary Advisor
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                  Tailored culinary counsel crafted for your kitchen.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-4">
              <Button
                onClick={() => setShowProfileSheet(true)}
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button
                onClick={() => setIsLibraryOpen(true)}
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </Button>
              <Button
                onClick={() => setShowSettingsSheet(true)}
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 pb-20 pt-10 sm:px-6 lg:px-8">
            <section className="relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-card/90 p-6 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
              <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto px-1 sm:px-3"
              >
                <div className="space-y-6">
                  {messages.map((message) => (
                    message.eventType === "status" ? (
                      <div key={message.id} className="flex justify-center">
                        <div className="rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground shadow-refined animate-fade-in">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <ChatBubble
                        key={message.id}
                        message={message.content}
                        role={message.role}
                        timestamp={message.timestamp}
                        onViewRecipe={(recipe) => {
                          setCurrentRecipe(recipe);
                          setIsFromLibrary(false);
                          setIsRecipeSheetOpen(true);
                        }}
                      />
                    )
                  ))}
                  {isLoading && <LoadingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

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
