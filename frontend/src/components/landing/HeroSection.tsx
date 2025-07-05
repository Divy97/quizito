"use client";
import { ArrowRight, Play } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { TypewriterText } from './TypewriterText';
import Link from 'next/link';

export const HeroSection = () => {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef);
  const controls = useAnimation();

  useEffect(() => {
    if (isHeroInView) {
      controls.start("visible");
    }
  }, [isHeroInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section 
      ref={heroRef} 
      className="relative w-full pt-20 md:pt-32 pb-10 lg:pt-40 text-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="container mx-auto px-4 md:px-6 z-10"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 
            id="hero-heading"
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400">
              Turn Any{" "}
              <TypewriterText 
                texts={["YouTube Video", "Blog Post", "PDF Document", "Topic"]}
                className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400"
              />
            </span>
            <br />
            <span className="text-white">Into an Interactive Quiz</span>
          </h1>
        </motion.div>

        <motion.p 
          variants={itemVariants} 
          className="max-w-[600px] mx-auto text-lg text-[var(--quizito-text-secondary)] md:text-xl mb-12 font-medium"
        >
          The fastest way to create engaging quizzes from any content. AI-powered, instantly shareable, and fun.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--quizito-primary)] to-[var(--quizito-secondary)] px-8 py-4 text-lg font-medium text-white shadow-xl shadow-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/40"
              aria-label="Start creating quizzes for free"
            >
              <span className="relative z-10">Start Creating Free</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--quizito-primary-hover)] to-[var(--quizito-secondary-hover)] opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--quizito-primary)]/30 px-8 py-4 text-lg font-medium text-[var(--quizito-primary)] backdrop-blur-sm transition-all hover:border-[var(--quizito-primary)]/60 hover:bg-[var(--quizito-primary)]/10"
            aria-label="Watch demo video"
          >
            <Play className="mr-2 h-5 w-5" aria-hidden="true" />
            Watch Demo
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}; 