"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PageBackgroundProps {
  variant?: "default" | "hero" | "minimal";
  children: React.ReactNode;
}

export const PageBackground = ({ variant = "default", children }: PageBackgroundProps) => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const particleCount = variant === "hero" ? 50 : variant === "minimal" ? 15 : 25;
  const showGradientOrbs = variant !== "minimal";

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-[#E0E0E0] overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10" />
      
      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(particleCount)].map((_, i) => {
            const seed1 = (i * 123456789) % 1000000 / 1000000;
            const seed2 = (i * 987654321) % 1000000 / 1000000;
            const seed3 = (i * 456789123) % 1000000 / 1000000;
            const seed4 = (i * 789123456) % 1000000 / 1000000;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
                initial={{
                  x: seed1 * dimensions.width,
                  y: seed2 * dimensions.height,
                }}
                animate={{
                  x: seed3 * dimensions.width,
                  y: seed4 * dimensions.height,
                }}
                transition={{
                  duration: seed1 * 25 + 15,
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                  ease: "linear" as const
                }}
              />
            );
          })}
        </div>
      )}

      {/* Gradient Orbs */}
      {showGradientOrbs && (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 