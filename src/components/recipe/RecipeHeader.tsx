import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeHeaderProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
}

const difficultyConfig = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  hard: { label: 'Advanced', className: 'bg-red-100 text-red-800 border-red-200' }
};

export const RecipeHeader = ({ title, difficulty, servings }: RecipeHeaderProps) => {
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
        <span className="text-base text-muted-foreground">
          Serves {servings}
        </span>
      </div>
    </div>
  );
};
