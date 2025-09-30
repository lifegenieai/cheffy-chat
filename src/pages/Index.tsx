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

  // Test recipe data for UI development
  const openTestRecipe = () => {
    const testRecipe: Recipe = {
      id: "test-1",
      title: "Classic Coq au Vin",
      servings: 4,
      difficulty: "medium",
      prepTime: "30 minutes",
      cookTime: "1 hour 30 minutes",
      totalTime: "2 hours",
      introduction: "A timeless French braised chicken dish, where tender pieces are slowly simmered in red wine with aromatic vegetables and herbs, resulting in a deeply flavored, elegant preparation.",
      historicalContext: "This dish originated in the Burgundy region of France, traditionally prepared by farmers using older roosters that required long, slow cooking to become tender.",
      tips: [
        "Use a full-bodied red wine such as Burgundy or Pinot Noir for authentic flavor.",
        "Allow the chicken to marinate in wine for 2-4 hours before cooking for enhanced depth.",
        "Cook the bacon until crisp to provide textural contrast to the tender chicken."
      ],
      equipment: ["Large Dutch oven or heavy-bottomed pot", "Sharp chef's knife", "Cutting board", "Measuring cups and spoons"],
      ingredients: [
        { name: "Chicken thighs, bone-in", weightGrams: 1200, weightOz: 42, notes: "skin-on preferred" },
        { name: "Thick-cut bacon", weightGrams: 150, weightOz: 5, notes: "diced" },
        { name: "Pearl onions", weightGrams: 200, weightOz: 7, notes: "peeled" },
        { name: "Carrots", weightGrams: 150, weightOz: 5, notes: "cut into 2-inch pieces" },
        { name: "Garlic cloves", weightGrams: 15, notes: "minced" },
        { name: "Red wine", volume: "750ml", notes: "Burgundy or Pinot Noir" },
        { name: "Chicken stock", volume: "240ml" },
        { name: "Tomato paste", volume: "2 tbsp" },
        { name: "Fresh thyme", volume: "4 sprigs" },
        { name: "Bay leaves", volume: "2 leaves" },
        { name: "Button mushrooms", weightGrams: 250, weightOz: 8, notes: "halved" }
      ],
      instructions: [
        { stepNumber: 1, description: "Season chicken pieces generously with salt and pepper. In a large Dutch oven over medium-high heat, cook bacon until crisp. Remove and set aside.", timing: "5 minutes" },
        { stepNumber: 2, description: "In the bacon fat, brown chicken pieces in batches, skin-side down first, until golden. Remove and set aside.", timing: "8-10 minutes", temperature: "medium-high heat" },
        { stepNumber: 3, description: "Add pearl onions and carrots to the pot. Cook until lightly caramelized, about 5 minutes. Add garlic and cook for 1 minute until fragrant.", timing: "6 minutes" },
        { stepNumber: 4, description: "Stir in tomato paste, then pour in red wine and chicken stock. Add thyme and bay leaves. Return chicken and bacon to the pot.", timing: "2 minutes" },
        { stepNumber: 5, description: "Bring to a simmer, then reduce heat to low. Cover and braise until chicken is tender and cooked through.", timing: "1 hour", temperature: "low simmer" },
        { stepNumber: 6, description: "In the final 15 minutes, add mushrooms. Remove bay leaves and thyme sprigs before serving. Adjust seasoning as needed.", timing: "15 minutes" }
      ],
      nutrition: {
        calories: 485,
        totalFat: 24,
        saturatedFat: 8,
        cholesterol: 165,
        sodium: 620,
        totalCarbohydrates: 12,
        dietaryFiber: 2,
        sugars: 4,
        protein: 42
      },
      createdAt: new Date().toISOString()
    };
    setCurrentRecipe(testRecipe);
    setIsRecipeSheetOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        {/* Temporary test button for UI development */}
        <button 
          onClick={openTestRecipe}
          className="absolute right-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          View Test Recipe
        </button>
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
