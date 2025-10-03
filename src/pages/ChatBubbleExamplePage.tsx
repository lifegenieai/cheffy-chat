import ChatBubbleRecipeExample from "@/components/examples/ChatBubbleRecipeExample";

const ChatBubbleExamplePage = () => {
  return (
    <main className="min-h-screen bg-background py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Chat bubble recipe fences</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Use this page to manually verify that recipe buttons appear for both
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">```recipe-json</code>
            and
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">```json</code>
            code fences.
          </p>
        </div>

        <ChatBubbleRecipeExample />
      </div>
    </main>
  );
};

export default ChatBubbleExamplePage;
