"use client";

import { ReactNode } from "react";

interface PageBackgroundProps {
  variant?: "default" | "hero" | "minimal";
  children: ReactNode;
}

export const PageBackground = ({ variant = "default", children }: PageBackgroundProps) => {
  const getBackgroundClasses = () => {
    switch (variant) {
      case "hero":
        return "bg-gradient-to-br from-background via-background to-muted/20";
      case "minimal":
        return "bg-background";
      default:
        return "bg-gradient-to-b from-background to-muted/10";
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      {children}
    </div>
  );
}; 