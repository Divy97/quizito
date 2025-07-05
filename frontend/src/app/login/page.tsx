"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Chrome, Sparkles, Zap, Brain } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { AppLayout } from "@/components/ui/app-layout";
import { PageTitle, BodyText, CardTitle, MutedText } from "@/components/ui/typography";
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
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <AppLayout backgroundVariant="default">
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-120px)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Floating Icons */}
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut" as const
              }}
              className="absolute -top-6 -left-6"
            >
              <Sparkles className="h-6 w-6 text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut" as const,
                delay: 1
              }}
              className="absolute -top-4 -right-8"
            >
              <Zap className="h-5 w-5 text-pink-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut" as const,
                delay: 2
              }}
              className="absolute -bottom-2 left-4"
            >
              <Brain className="h-4 w-4 text-indigo-400" />
            </motion.div>
          </div>

          {/* Welcome Text */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring" as const, 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <PageTitle className="text-3xl md:text-4xl mb-2">
                Welcome to
              </PageTitle>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring" as const, 
                stiffness: 100, 
                damping: 15,
                delay: 0.4 
              }}
              className="mb-4"
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                Quizito
              </h2>
            </motion.div>
            <motion.div variants={itemVariants}>
              <BodyText className="text-lg">
                Transform knowledge into engaging quizzes with AI
              </BodyText>
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1E1E1E]/80 backdrop-blur-xl border-[#2A2A2A] shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🚀
                  </motion.div>
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <motion.div 
                  className="flex flex-col gap-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                >
                  <Button
                    asChild // Important: Treat the button as a link container
                    className="w-full h-12 bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 text-white transition-all duration-300 group relative overflow-hidden"
                  >
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    
                    <div className="relative flex items-center justify-center gap-3">
                      <Chrome className="h-5 w-5 group-hover:text-purple-300 transition-colors duration-300" />
                      <span className="font-medium">Continue with Google</span>
                    </div>
                    </a>
                  </Button>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <MutedText className="text-center mt-2">
                      Sign in to create and share amazing quizzes
                    </MutedText>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Preview */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <div className="grid grid-cols-3 gap-4 text-xs text-[#666]">
              <motion.div 
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1, color: "#6366F1" }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Powered</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1, color: "#14B8A6" }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Zap className="h-4 w-4" />
                <span>Lightning Fast</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1, color: "#6366F1" }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Brain className="h-4 w-4" />
                <span>Smart Learning</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 