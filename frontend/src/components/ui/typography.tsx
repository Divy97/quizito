import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export const PageTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn(
    "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4",
    "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400",
    className
  )}>
    {children}
  </h1>
);

export const SectionTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cn(
    "text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-4",
    className
  )}>
    {children}
  </h2>
);

export const CardTitle = ({ children, className }: TypographyProps) => (
  <h3 className={cn(
    "text-xl font-semibold text-[#E0E0E0] mb-2",
    className
  )}>
    {children}
  </h3>
);

export const BodyText = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-base text-[#A0A0A0] leading-relaxed",
    className
  )}>
    {children}
  </p>
);

export const MutedText = ({ children, className }: TypographyProps) => (
  <p className={cn(
    "text-sm text-[#666]",
    className
  )}>
    {children}
  </p>
);

export const GradientText = ({ children, className, gradient = "from-purple-400 via-pink-400 to-sky-400" }: TypographyProps & { gradient?: string }) => (
  <span className={cn(
    "bg-clip-text text-transparent bg-gradient-to-r",
    gradient,
    className
  )}>
    {children}
  </span>
); 