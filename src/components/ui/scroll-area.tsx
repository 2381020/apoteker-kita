import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("rounded-md border-border", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className={cn("rounded-md", className)}>{children}</ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Thumb className={cn("rounded-full border-border bg-secondary")} />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea };
