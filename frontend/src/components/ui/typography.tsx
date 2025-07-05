import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export const PageTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn(
    "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground",
    className
  )}>
    {children}
  </h1>
);

export const SectionTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cn(
    "text-2xl md:text-3xl font-semibold text-foreground mb-4 tracking-tight",
    className
  )}>
    {children}
  </h2>
);

export const CardTitle = ({ children, className }: TypographyProps) => (
  <h3 className={cn(
    "text-xl font-semibold text-foreground mb-3 tracking-tight",
    className
  )}>
    {children}
  </h3>
);

export const BodyText = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-base text-muted-foreground leading-relaxed",
    className
  )}>
    {children}
  </p>
);

export const MutedText = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-sm text-muted-foreground leading-relaxed",
    className
  )}>
    {children}
  </p>
);

export const SmallText = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-xs text-muted-foreground leading-relaxed",
    className
  )}>
    {children}
  </p>
);

interface GradientTextProps extends TypographyProps {
  variant?: "primary" | "success" | "warning" | "purple" | "orange";
}

export const GradientText = ({ children, className, variant = "primary" }: GradientTextProps) => {
  const gradientVariants = {
    primary: "gradient-primary",
    success: "gradient-success", 
    warning: "gradient-accent",
    purple: "bg-gradient-to-r from-purple-600 to-blue-600",
    orange: "bg-gradient-to-r from-orange-600 to-red-600",
  };

  return (
    <span className={cn(
      "bg-clip-text text-transparent font-semibold",
      gradientVariants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const VibrantText = ({ children, className, color = "primary" }: TypographyProps & { color?: "primary" | "success" | "warning" | "purple" | "orange" }) => {
  const colorVariants = {
    primary: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <span className={cn(
      "font-semibold",
      colorVariants[color],
      className
    )}>
      {children}
    </span>
  );
};

export const EmphasisText = ({ children, className }: TypographyProps) => (
  <span className={cn(
    "text-foreground font-semibold",
    className
  )}>
    {children}
  </span>
);

// Hero Title for Landing Pages
export const HeroTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn(
    "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground",
    className
  )}>
    {children}
  </h1>
);

// Large Display Text
export const DisplayText = ({ children, className }: TypographyProps) => (
  <div className={cn(
    "text-3xl md:text-4xl font-bold text-foreground tracking-tight",
    className
  )}>
    {children}
  </div>
);

// Code or Monospace Text
export const CodeText = ({ children, className }: TypographyProps) => (
  <code className={cn(
    "font-mono text-sm bg-muted text-foreground px-2 py-1 rounded border",
    className
  )}>
    {children}
  </code>
);

// Subtitle
export const Subtitle = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-lg md:text-xl text-muted-foreground mb-4",
    className
  )}>
    {children}
  </p>
); 