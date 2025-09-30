const LoadingIndicator = () => {
  return (
    <div className="flex items-start animate-fade-in">
      <div className="bg-secondary rounded-xl px-5 py-4 shadow-refined">
        <div className="flex gap-1.5">
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle"
            style={{ animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle"
            style={{ animationDelay: '200ms' }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle"
            style={{ animationDelay: '400ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
