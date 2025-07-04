"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const FloatingParticles = () => {
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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Don't render particles during SSR
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[...Array(50)].map((_, i) => {
        // Use a seeded random based on index to ensure consistency
        const seed1 = (i * 123456789) % 1000000 / 1000000;
        const seed2 = (i * 987654321) % 1000000 / 1000000;
        const seed3 = (i * 456789123) % 1000000 / 1000000;
        const seed4 = (i * 789123456) % 1000000 / 1000000;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            initial={{
              x: seed1 * dimensions.width,
              y: seed2 * dimensions.height,
            }}
            animate={{
              x: seed3 * dimensions.width,
              y: seed4 * dimensions.height,
            }}
            transition={{
              duration: seed1 * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        );
      })}
    </div>
  );
}; 