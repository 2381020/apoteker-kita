import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const Tab = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const TabsListItem = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("flex border-b bg-transparent", className)}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
));

TabsListItem.displayName = "TabsListItem";

const TabItem = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors",
      "border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
));

TabItem.displayName = "TabItem";

const TabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("py-4 outline-none", className)}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
));

TabContent.displayName = "TabContent";

export {
  Tabs,
  TabsList,
  Tab,
  TabsContent,
  TabsListItem,
  TabItem,
  TabContent,
};
