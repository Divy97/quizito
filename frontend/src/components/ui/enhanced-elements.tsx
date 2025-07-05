"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";
import { Zap, Star, Trophy, Target, Sparkles } from "lucide-react";

interface EnhancedElementProps {
  children: ReactNode;
  className?: string;
}

interface StatusBadgeProps extends EnhancedElementProps {
  variant?: "success" | "warning" | "error" | "info" | "primary";
  icon?: boolean;
}

interface GlowCardProps extends EnhancedElementProps {
  glowColor?: "primary" | "secondary" | "success" | "warning" | "error";
  intensity?: "subtle" | "medium" | "intense";
}

interface PulseIconProps {
  icon: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Status Badge Component
export const StatusBadge = ({ children, className, variant = "primary", icon = false }: StatusBadgeProps) => {
  const variants = {
    success: "bg-[var(--quizito-success)]/20 text-[var(--quizito-success)] border-[var(--quizito-success)]/30",
    warning: "bg-[var(--quizito-warning)]/20 text-[var(--quizito-warning)] border-[var(--quizito-warning)]/30",
    error: "bg-[var(--quizito-error)]/20 text-[var(--quizito-error)] border-[var(--quizito-error)]/30",
    info: "bg-[var(--quizito-info)]/20 text-[var(--quizito-info)] border-[var(--quizito-info)]/30",
    primary: "bg-[var(--quizito-primary)]/20 text-[var(--quizito-primary)] border-[var(--quizito-primary)]/30"
  };

  const icons = {
    success: <Star className="w-3 h-3" />,
    warning: <Zap className="w-3 h-3" />,
    error: <Target className="w-3 h-3" />,
    info: <Sparkles className="w-3 h-3" />,
    primary: <Trophy className="w-3 h-3" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      {icon && icons[variant]}
      {children}
    </motion.div>
  );
};

// Glow Card Component
export const GlowCard = ({ children, className, glowColor = "primary", intensity = "medium" }: GlowCardProps) => {
  const glowColors = {
    primary: "shadow-[var(--quizito-primary)]/20",
    secondary: "shadow-[var(--quizito-secondary)]/20",
    success: "shadow-[var(--quizito-success)]/20",
    warning: "shadow-[var(--quizito-warning)]/20",
    error: "shadow-[var(--quizito-error)]/20"
  };

  const intensities = {
    subtle: "shadow-lg",
    medium: "shadow-xl",
    intense: "shadow-2xl"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-[var(--quizito-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--quizito-surface-hover)] p-6 transition-all duration-300",
        intensities[intensity],
        glowColors[glowColor],
        "hover:border-opacity-50",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// Pulse Icon Component
export const PulseIcon = ({ icon, color = "primary", size = "md", className }: PulseIconProps) => {
  const colors = {
    primary: "text-[var(--quizito-primary)]",
    secondary: "text-[var(--quizito-secondary)]",
    success: "text-[var(--quizito-success)]",
    warning: "text-[var(--quizito-warning)]",
    error: "text-[var(--quizito-error)]"
  };

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn(
        "flex items-center justify-center",
        sizes[size],
        colors[color],
        className
      )}
    >
      {icon}
    </motion.div>
  );
};

// Gradient Border Component
export const GradientBorder = ({ children, className }: EnhancedElementProps) => (
  <div className={cn("p-[1px] bg-gradient-to-r from-[var(--quizito-primary)] to-[var(--quizito-secondary)] rounded-lg", className)}>
    <div className="bg-[var(--quizito-surface)] rounded-lg p-4">
      {children}
    </div>
  </div>
);

// Floating Action Button
interface FloatingActionButtonProps extends EnhancedElementProps {
  onClick?: () => void;
  icon: ReactNode;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md" | "lg";
}

export const FloatingActionButton = ({ 
  children, 
  onClick, 
  icon, 
  position = "bottom-right", 
  size = "md", 
  className 
}: FloatingActionButtonProps) => {
  const positions = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  };

  const sizes = {
    sm: "w-12 h-12",
    md: "w-14 h-14", 
    lg: "w-16 h-16"
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "bg-gradient-to-r from-[var(--quizito-primary)] to-[var(--quizito-secondary)] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50",
        positions[position],
        sizes[size],
        className
      )}
    >
      {icon}
      {children && (
        <span className="ml-2 font-medium">{children}</span>
      )}
    </motion.button>
  );
};

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  children?: ReactNode;
  className?: string;
}

export const ProgressRing = ({ progress, size = "md", color = "primary", children, className }: ProgressRingProps) => {
  const sizes = {
    sm: { width: 60, stroke: 4 },
    md: { width: 80, stroke: 6 },
    lg: { width: 120, stroke: 8 }
  };

  const colors = {
    primary: "var(--quizito-primary)",
    secondary: "var(--quizito-secondary)",
    success: "var(--quizito-success)",
    warning: "var(--quizito-warning)",
    error: "var(--quizito-error)"
  };

  const { width, stroke } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={width} height={width} className="transform -rotate-90">
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="var(--quizito-surface-active)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({ value, duration = 1, className }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("font-bold text-[var(--quizito-text-primary)]", className)}
    >
      {displayValue}
    </motion.span>
  );
}; 