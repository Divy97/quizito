"use client";
import { Brain, Target, Sparkles, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhyDifferentSection = () => {
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

  const features = [
    {
      icon: Brain,
      title: "Go Beyond Trivia",
      subtitle: "Deep Understanding, Not Just Memory",
      description: "Don't just test memory. Our AI understands concepts, allowing you to create quizzes that probe critical thinking and analytical skills, not just basic recall.",
      highlight: "Critical Thinking Questions",
      color: "from-[var(--quizito-neon-purple)] to-[var(--quizito-electric-blue)]",
      glowColor: "rgba(139,92,246,0.3)"
    },
    {
      icon: Target,
      title: "Ask Better Questions",
      subtitle: "Intelligent AI-Crafted Content",
      description: "Our AI doesn't just generate questions; it refines them. Every question is reviewed for nuance, accuracy, and clarity, complete with challenging distractors that test true understanding.",
      highlight: "Smart Answer Choices",
      color: "from-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)]",
      glowColor: "rgba(0,212,255,0.3)"
    },
    {
      icon: Users,
      title: "Frictionless for Everyone",
      subtitle: "No Barriers, Maximum Engagement",
      description: "Share your quiz with a simple link. Your learners don't need to sign up or create an account. It's a seamless experience for them, and you get better engagement.",
      highlight: "Instant Sharing",
      color: "from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)]",
      glowColor: "rgba(0,255,136,0.3)"
    }
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-b from-[var(--quizito-bg-secondary)]/30 to-transparent">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-6 max-w-7xl"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-4 py-2 rounded-full font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            What Makes Us Different
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)] mb-6">
            Why Quizito is
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] bg-clip-text text-transparent"> Revolutionary</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
            We&apos;re not just another quiz tool. We&apos;re building the future of intelligent content assessment.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-500 relative overflow-hidden">
                {/* Background Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.glowColor} 0%, transparent 70%)`
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--quizito-electric-blue)] font-medium text-sm">
                        {feature.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-[var(--quizito-text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Highlight Badge */}
                    <div className="pt-4">
                      <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent font-semibold text-sm`}>
                        <Zap className="h-4 w-4 text-[var(--quizito-electric-blue)]" />
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          variants={itemVariants}
          className="text-center mt-16"
        >
          <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)] mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-[var(--quizito-text-secondary)] mb-6">
              Join thousands of educators and creators who&apos;ve discovered the future of quiz making.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Try It Free Now
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}; 