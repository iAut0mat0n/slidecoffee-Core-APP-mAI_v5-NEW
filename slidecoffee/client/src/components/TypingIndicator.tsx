export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-muted/50 rounded-2xl rounded-bl-sm w-fit">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
      </div>
    </div>
  );
}

