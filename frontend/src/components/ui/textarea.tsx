import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full border-2 border-foreground bg-card px-4 py-3 text-sm shadow-[4px_4px_0px_#000] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[4px_4px_0px_hsl(54,100%,50%)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:border-muted-foreground transition-shadow duration-100",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
