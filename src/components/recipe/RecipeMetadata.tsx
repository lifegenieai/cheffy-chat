import { Clock } from "lucide-react";

interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  totalTime: string;
}

export const RecipeMetadata = ({ prepTime, cookTime, totalTime }: RecipeMetadataProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 py-6 border-b border-border">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground mb-1">Prep Time</div>
        <div className="text-base font-medium text-foreground">{prepTime}</div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground mb-1">Cook Time</div>
        <div className="text-base font-medium text-foreground">{cookTime}</div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground mb-1">Total Time</div>
        <div className="text-base font-medium text-foreground">{totalTime}</div>
      </div>
    </div>
  );
};
