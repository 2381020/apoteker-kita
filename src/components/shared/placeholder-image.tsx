import type { ReactNode } from "react";
import * as React from "react";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}

export function PlaceholderImage({
  src,
  alt,
  className,
  fallback,
}: PlaceholderImageProps) {
  const [error, setError] = React.useState(false);

  const handleImageError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div
        className={className}
        style={{
          backgroundImage: fallback
            ? `url("${fallback}")`
            : "url('/images/placeholder.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleImageError}
      className={className}
      loading="lazy"
    />
  );
}
