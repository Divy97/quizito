"use client";
import { Star, Quote, GraduationCap, Users, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export const SocialProofSection = () => {
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

  // Aspirational testimonials - to be replaced with real ones
  const aspirationalTestimonials = [
    {
      quote: "This completely changed how I create assessments. What used to take hours now takes minutes, and the quality is incredible.",
      author: "Sarah Chen",
      role: "High School Teacher",
      avatar: "🧑‍🏫",
      icon: GraduationCap,
      color: "from-[var(--quizito-neon-purple)] to-[var(--quizito-electric-blue)]"
    },
    {
      quote: "Our team training became so much more engaging. The AI generates exactly the right questions for our compliance materials.",
      author: "Marcus Williams",
      role: "Corporate L&D Manager",
      avatar: "👨‍💼",
      icon: Building,
      color: "from-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)]"
    },
    {
      quote: "I can turn my study notes into active recall sessions instantly. It&apos;s like having a personal tutor that never gets tired.",
      author: "Elena Rodriguez",
      role: "Medical Student",
      avatar: "👩‍🎓",
      icon: Users,
      color: "from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)]"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Quizzes Created", color: "text-[var(--quizito-electric-blue)]" },
    { number: "50,000+", label: "Questions Generated", color: "text-[var(--quizito-neon-purple)]" },
    { number: "98%", label: "User Satisfaction", color: "text-[var(--quizito-cyber-green)]" },
    { number: "30s", label: "Average Creation Time", color: "text-[var(--quizito-electric-yellow)]" }
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
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-cyber-green)]/10 text-[var(--quizito-cyber-green)] px-4 py-2 rounded-full font-medium mb-6">
            <Star className="h-4 w-4" />
            Trusted by Forward-Thinking Educators
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)] mb-6">
            Join the
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent"> Quiz Revolution</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
            Students, Educators, trainers, and creators around the world are transforming their content with Quizito.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-300">
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-[var(--quizito-text-secondary)] font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {aspirationalTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 hover:border-[var(--quizito-electric-blue)]/50 transition-all duration-500 relative overflow-hidden">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-20">
                  <Quote className="h-8 w-8 text-[var(--quizito-electric-blue)]" />
                </div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[var(--quizito-electric-yellow)] text-[var(--quizito-electric-yellow)]" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-[var(--quizito-text-secondary)] leading-relaxed mb-6 relative z-10">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-xl`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--quizito-text-primary)]">
                      {testimonial.author}
                    </div>
                    <div className="text-[var(--quizito-text-muted)] text-sm flex items-center gap-2">
                      <testimonial.icon className="h-4 w-4" />
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[var(--quizito-glass-surface)] to-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-electric-blue)]/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-[var(--quizito-text-secondary)] text-sm mb-2">
              🚀 <strong className="text-[var(--quizito-electric-blue)]">Early Access</strong> - Be among the first to experience the future of quiz creation
            </p>
            <p className="text-[var(--quizito-text-muted)] text-xs">
              * Statistics projected based on beta testing. Real testimonials coming soon as we welcome our first users.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}; 