"use client";
import { useState } from 'react';
import { ArrowRight, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const NewHeroSection = () => {
  const [demoText, setDemoText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);

  const generateSampleQuiz = async () => {
    if (!demoText.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation with sample questions
    setTimeout(() => {
      const samples = [
        "What is the main concept discussed in this content?",
        "Which of the following best summarizes the key point?",
        "How does this information relate to practical applications?"
      ];
      setSampleQuestions(samples);
      setIsGenerating(false);
    }, 2000);
  };

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
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <section className="relative w-full pt-20 md:pt-32 pb-20 lg:pt-40 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 z-10 max-w-7xl"
      >
        {/* Headline */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent">
              From Content to Quiz
            </span>
            <br />
            <span className="text-[var(--quizito-text-primary)]">
              in 30 Seconds
            </span>
          </h1>
          
          {/* Sub-headline */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-[var(--quizito-text-secondary)] leading-relaxed font-medium">
            Quizito uses advanced AI to generate thoughtful, accurate questions from your articles, documents, and study notes. 
            <span className="text-[var(--quizito-electric-blue)] font-semibold"> Perfect for educators, trainers, and creators.</span>
          </p>
        </motion.div>

        {/* The Magic Box - Interactive Demo */}
        {/* <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-16">
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/10 hover:shadow-[var(--quizito-electric-blue)]/20 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full p-2">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--quizito-text-primary)]">
                See the Magic in Action
              </h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--quizito-text-secondary)] mb-3">
                  Paste your content here to see the magic...
                </label>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  placeholder="Try pasting an article, lesson notes, or any text content. Watch AI transform it into engaging quiz questions instantly!"
                  className="w-full h-32 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] px-4 py-3 rounded-xl focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 resize-none"
                />
              </div>
              
              <motion.button
                onClick={generateSampleQuiz}
                disabled={!demoText.trim() || isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate My Quiz
                  </>
                )}
              </motion.button>

              {/* Sample Questions Display */}
              {/* {sampleQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-6 bg-[var(--quizito-glass-surface)] backdrop-blur-xl rounded-2xl border border-[var(--quizito-cyber-green)]/30"
                >
                  <div className="flex items-center gap-2 text-[var(--quizito-cyber-green)]">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">✨ AI Generated Questions</span>
                  </div>
                  <div className="space-y-3">
                    {sampleQuestions.map((question, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-[var(--quizito-electric-blue)] text-white text-sm font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="text-[var(--quizito-text-secondary)]">{question}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--quizito-text-muted)] text-center">
                    🎉 That's how fast it works! Ready to create your own?
                  </p>
                </motion.div>
              )}
            </div>
          </div> */}
        {/* </motion.div> */} 

        {/* Primary CTA */}
        <motion.div variants={itemVariants} className="text-center">
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-all duration-300"
            >
              <span className="relative z-10">Generate Your First Quiz for Free</span>
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--quizito-electric-blue-hover)] to-[var(--quizito-neon-purple-hover)] opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </Link>
          
          <p className="mt-4 text-[var(--quizito-text-muted)]">
            No credit card required • Start creating in seconds
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}; 