"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Chrome, Sparkles, Zap, Brain, Rocket } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { AppLayout } from "@/components/ui/app-layout";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect them from the login page
    if (!isLoading && user) {
      router.push('/my-quizzes');
    }
  }, [user, isLoading, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AppLayout backgroundVariant="default">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--quizito-bg-primary)] via-[var(--quizito-bg-secondary)] to-[var(--quizito-bg-primary)] -z-10" />
      
      <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-120px)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Floating Icons */}
          <div className="relative mb-12">
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -left-6"
            >
              <Sparkles className="h-8 w-8 text-[var(--quizito-electric-blue)]" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -top-4 -right-8"
            >
              <Zap className="h-6 w-6 text-[var(--quizito-neon-purple)]" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -bottom-2 left-4"
            >
              <Brain className="h-7 w-7 text-[var(--quizito-cyber-green)]" />
            </motion.div>
          </div>

          {/* Welcome Text */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--quizito-text-primary)] mb-4">
                Welcome to
              </h1>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.4 
              }}
              className="mb-6"
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent">
                Quizito
              </h2>
            </motion.div>
            <motion.div variants={itemVariants}>
              <p className="text-xl text-[var(--quizito-text-secondary)] font-medium">
                Transform knowledge into engaging quizzes with AI
              </p>
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/10 hover:shadow-[var(--quizito-electric-blue)]/20 transition-all duration-500 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--quizito-electric-blue)]/5 via-transparent to-[var(--quizito-neon-purple)]/5 rounded-3xl" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-4 py-2 rounded-full font-medium mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Rocket className="h-4 w-4" />
                    </motion.div>
                    Get Started
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)]">
                    Join the Revolution
                  </h3>
                </div>

                <motion.div 
                  className="space-y-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Button
                    asChild
                    className="w-full h-14 bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--quizito-electric-blue-hover)] to-[var(--quizito-neon-purple-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex items-center justify-center gap-3">
                        <Chrome className="h-6 w-6" />
                        <span className="text-lg">Continue with Google</span>
                      </div>
                    </a>
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-[var(--quizito-text-muted)] text-sm">
                      Sign in to create and share amazing quizzes
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div 
            variants={itemVariants}
            className="mt-12"
          >
            <div className="grid grid-cols-3 gap-6">
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-4 mb-2 group-hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-300">
                  <Sparkles className="h-6 w-6 text-[var(--quizito-electric-blue)] mx-auto" />
                </div>
                <span className="text-sm font-medium text-[var(--quizito-text-secondary)] group-hover:text-[var(--quizito-electric-blue)] transition-colors">AI Powered</span>
              </motion.div>
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-4 mb-2 group-hover:border-[var(--quizito-cyber-green)]/50 transition-all duration-300">
                  <Zap className="h-6 w-6 text-[var(--quizito-cyber-green)] mx-auto" />
                </div>
                <span className="text-sm font-medium text-[var(--quizito-text-secondary)] group-hover:text-[var(--quizito-cyber-green)] transition-colors">Lightning Fast</span>
              </motion.div>
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-4 mb-2 group-hover:border-[var(--quizito-neon-purple)]/50 transition-all duration-300">
                  <Brain className="h-6 w-6 text-[var(--quizito-neon-purple)] mx-auto" />
                </div>
                <span className="text-sm font-medium text-[var(--quizito-text-secondary)] group-hover:text-[var(--quizito-neon-purple)] transition-colors">Smart Learning</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 