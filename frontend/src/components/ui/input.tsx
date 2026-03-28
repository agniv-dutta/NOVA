import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border-2 border-foreground bg-card px-4 py-2 text-base shadow-[4px_4px_0px_#000] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[4px_4px_0px_hsl(54,100%,50%)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:border-muted-foreground md:text-sm transition-shadow duration-100",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
