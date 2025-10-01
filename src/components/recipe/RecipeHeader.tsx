import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RecipeHeaderProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  servings: number;
  actionButtons?: ReactNode;
}

const difficultyConfig = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  hard: { label: 'Advanced', className: 'bg-red-100 text-red-800 border-red-200' }
};

export const RecipeHeader = ({ title, difficulty, category, servings, actionButtons }: RecipeHeaderProps) => {
  const config = difficultyConfig[difficulty];
  
  return (
    <div className="space-y-4 pb-6 border-b border-border">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-tight">
        {title}
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className={cn("px-3 py-1", config.className)}>
          {config.label}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1 text-xs">
          {category}
        </Badge>
        <span className="text-base text-muted-foreground">
          Serves {servings}
        </span>
        {actionButtons && (
          <div className="flex items-center gap-2 ml-auto">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
};
