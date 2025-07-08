"use client";
import { Clock, FileText, Share2, Zap, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProblemSolutionSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const steps = [
    {
      icon: FileText,
      title: "Paste Your Content",
      description: "Text documents, articles, lecture notes.",
      detail: "Simply paste or upload any content - we handle the rest automatically."
    },
    {
      icon: Wand2,
      title: "Customize Your Quiz",
      description: "Choose difficulty, question types, and style.",
      detail: "AI analyzes your content and generates intelligent questions in seconds."
    },
    {
      icon: Share2,
      title: "Share & Analyze",
      description: "Get a link, see results in real-time.",
      detail: "Share with anyone, track performance, and get detailed analytics."
    }
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-b from-transparent to-[var(--quizito-bg-secondary)]/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-6 max-w-7xl"
      >
        {/* Before & After Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--quizito-text-primary)]">
            Stop Wasting Time on 
            <span className="bg-gradient-to-r from-[var(--quizito-hot-pink)] to-[var(--quizito-electric-yellow)] bg-clip-text text-transparent"> Quiz Creation</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Before - The Pain */}
            <motion.div 
              variants={itemVariants}
              className="space-y-6"
            >
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[var(--quizito-hot-pink)]/10 text-[var(--quizito-hot-pink)] px-4 py-2 rounded-full font-medium mb-4">
                  <Clock className="h-4 w-4" />
                  The Slow, Tedious Way
                </div>
                <h3 className="text-3xl font-bold text-[var(--quizito-text-primary)] mb-6">
                  Hours of Manual Work
                </h3>
              </div>
              
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-hot-pink)]/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-hot-pink)] rounded-full"></div>
                  <span>Manually typing out questions</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-hot-pink)] rounded-full"></div>
                  <span>Creating answer options and distractors</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-hot-pink)] rounded-full"></div>
                  <span>Formatting and organizing content</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-hot-pink)] rounded-full"></div>
                  <span>Setting up sharing and distribution</span>
                </div>
                <div className="text-center pt-4 border-t border-[var(--quizito-hot-pink)]/20">
                  <span className="text-[var(--quizito-hot-pink)] font-bold text-xl">⏰ 2-3 Hours Per Quiz</span>
                </div>
              </div>
            </motion.div>

            {/* After - The Gain */}
            <motion.div 
              variants={itemVariants}
              className="space-y-6"
            >
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[var(--quizito-cyber-green)]/10 text-[var(--quizito-cyber-green)] px-4 py-2 rounded-full font-medium mb-4">
                  <Zap className="h-4 w-4" />
                  The New, Intelligent Way
                </div>
                <h3 className="text-3xl font-bold text-[var(--quizito-text-primary)] mb-6">
                  AI-Powered Automation
                </h3>
              </div>
              
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-cyber-green)]/30 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                  <span>Paste content, AI generates questions</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                  <span>Smart distractors and answer choices</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                  <span>Beautiful, ready-to-share format</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--quizito-text-secondary)]">
                  <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                  <span>Instant sharing with analytics</span>
                </div>
                <div className="text-center pt-4 border-t border-[var(--quizito-cyber-green)]/20">
                  <span className="text-[var(--quizito-cyber-green)] font-bold text-xl">⚡ 30 Seconds</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works - 3 Steps */}
        <motion.div variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[var(--quizito-text-primary)]">
            How It 
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] bg-clip-text text-transparent"> Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300"
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-full h-0.5 bg-gradient-to-r from-[var(--quizito-electric-blue)]/50 to-transparent" />
                  )}
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--quizito-cyber-green)] text-black text-sm font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--quizito-text-secondary)] font-medium mb-2">
                  {step.description}
                </p>
                <p className="text-[var(--quizito-text-muted)] text-sm">
                  {step.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}; 