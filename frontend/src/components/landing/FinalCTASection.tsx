"use client";
import { ArrowRight, Sparkles, Rocket, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const FinalCTASection = () => {
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

  return (
    <section className="w-full py-20 bg-gradient-to-b from-[var(--quizito-bg-secondary)]/30 to-transparent border-t border-[var(--quizito-glass-border)]/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-6 max-w-5xl"
      >
        {/* Main CTA Card */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden"
        >
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-4xl p-12 md:p-16 text-center relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--quizito-electric-blue)]/10 via-[var(--quizito-neon-purple)]/5 to-[var(--quizito-cyber-green)]/10 rounded-4xl" />
            
            {/* Floating Icons */}
            <div className="absolute top-8 left-8 opacity-20">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-8 w-8 text-[var(--quizito-electric-blue)]" />
              </motion.div>
            </div>
            <div className="absolute top-12 right-12 opacity-20">
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Zap className="h-6 w-6 text-[var(--quizito-neon-purple)]" />
              </motion.div>
            </div>
            <div className="absolute bottom-8 left-16 opacity-20">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <Rocket className="h-7 w-7 text-[var(--quizito-cyber-green)]" />
              </motion.div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              {/* Badge */}
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-4 py-2 rounded-full font-medium"
              >
                <Rocket className="h-4 w-4" />
                Ready to Transform Your Content?
              </motion.div>
              
              {/* Headline */}
              <motion.div variants={itemVariants}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--quizito-text-primary)] mb-6 leading-tight">
                  Start Creating
                  <br />
                  <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent">
                    Smarter Quizzes
                  </span>
                </h2>
              </motion.div>
              
              {/* Sub-headline */}
              <motion.div variants={itemVariants}>
                <p className="text-xl md:text-2xl text-[var(--quizito-text-secondary)] leading-relaxed max-w-3xl mx-auto">
                  Join our first group of users and start creating smarter, better quizzes in seconds.
                  <br />
                  <span className="text-[var(--quizito-electric-blue)] font-semibold">No credit card required. Start free today.</span>
                </p>
              </motion.div>
              
              {/* CTA Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <Link href="/create">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-all duration-300 inline-flex items-center gap-3"
                  >
                    <span className="relative z-10">Generate Your First Quiz for Free</span>
                    <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--quizito-electric-blue-hover)] to-[var(--quizito-neon-purple-hover)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.button>
                </Link>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div variants={itemVariants} className="pt-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[var(--quizito-text-muted)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                    <span className="text-sm">Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                    <span className="text-sm">No setup required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full"></div>
                    <span className="text-sm">Results in 30 seconds</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom Message */}
        <motion.div 
          variants={itemVariants}
          className="text-center mt-12"
        >
          <p className="text-[var(--quizito-text-muted)] text-sm">
            🚀 <strong className="text-[var(--quizito-electric-blue)]">Limited Time:</strong> Get early access to all premium features during our launch phase
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}; 