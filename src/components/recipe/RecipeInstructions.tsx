import { Recipe } from "@/types/recipe";

interface RecipeInstructionsProps {
  instructions: Recipe['instructions'];
}

export const RecipeInstructions = ({ instructions }: RecipeInstructionsProps) => {
  return (
    <div className="py-6 border-b border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        Instructions
      </h2>
      <ol className="space-y-6">
        {instructions.map((instruction) => (
          <li key={instruction.stepNumber} className="flex gap-4">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              {instruction.stepNumber}
            </span>
            <div className="flex-1 pt-0.5">
              <p className="text-base text-foreground leading-relaxed mb-2">
                {instruction.description}
              </p>
              {(instruction.timing || instruction.temperature) && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {instruction.timing && <span>⏱ {instruction.timing}</span>}
                  {instruction.temperature && <span>🌡 {instruction.temperature}</span>}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
