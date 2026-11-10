import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Shimmer = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "animate-ping rounded-md bg-muted",
      className
    )}
  />
);

const SkeletonImage = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "h-24 w-full animate-pulse rounded-md bg-muted",
      className
    )}
  />
);

const SkeletonText = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "my-2 h-4 w-full animate-pulse rounded-md bg-muted",
      className
    )}
  />
);

const SkeletonParagraph = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "my-3 h-6 w-full animate-pulse rounded-md bg-muted",
      className
    )}
  />
);

export {
  Shimmer,
  SkeletonImage,
  SkeletonText,
  SkeletonParagraph,
};
