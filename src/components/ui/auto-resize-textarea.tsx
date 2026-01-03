import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, onInput, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Properly combine external ref with internal ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    const adjustHeight = React.useCallback(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    // Use useLayoutEffect for synchronous height adjustment before paint
    React.useLayoutEffect(() => {
      adjustHeight();
    }, [props.value, adjustHeight]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onInput?.(e);
    };

    return (
      <textarea
        ref={internalRef}
        data-testid="auto-resize-textarea"
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none overflow-hidden leading-normal min-h-[38px] box-border",
          className
        )}
        rows={1}
        onInput={handleInput}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
