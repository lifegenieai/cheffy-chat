import { cn } from "@/lib/utils";

interface RecipeIntroductionProps {
  text: string;
}

export const RecipeIntroduction = ({ text }: RecipeIntroductionProps) => {
  // Smart paragraph detection: split on double newlines or detect natural breaks
  const detectParagraphs = (content: string): string[] => {
    // First try splitting on double newlines
    let paragraphs = content.split('\n\n').filter(p => p.trim());
    
    // If we only got one paragraph but it's long (>300 chars), try to split intelligently
    if (paragraphs.length === 1 && content.length > 300) {
      // Split on single newlines if they exist
      const singleNewlineSplit = content.split('\n').filter(p => p.trim());
      if (singleNewlineSplit.length > 1) {
        paragraphs = singleNewlineSplit;
      } else {
        // As last resort, split long text into ~150-200 char chunks at sentence boundaries
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        paragraphs = [];
        let currentPara = '';
        
        sentences.forEach(sentence => {
          if (currentPara.length + sentence.length > 200 && currentPara.length > 0) {
            paragraphs.push(currentPara.trim());
            currentPara = sentence;
          } else {
            currentPara += sentence;
          }
        });
        
        if (currentPara.trim()) {
          paragraphs.push(currentPara.trim());
        }
      }
    }
    
    return paragraphs;
  };

  const paragraphs = detectParagraphs(text);

  return (
    <div className="recipe-introduction max-w-[65ch] mx-auto">
      {paragraphs.map((para, index) => (
        <p
          key={index}
          className={cn(
            "paragraph-base text-[17px] leading-[1.75] mb-6 text-foreground",
            "md:text-[17px] md:leading-[1.75] md:mb-6",
            index === 0 && "first-paragraph text-[17px] md:text-[18px] tracking-[0.01em] font-[450] mb-8"
          )}
        >
          {para}
        </p>
      ))}
    </div>
  );
};
