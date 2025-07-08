"use client";
import { useState } from 'react';
import { GraduationCap, Building, Users, Brain, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const UseCaseSection = () => {
  const [activeTab, setActiveTab] = useState(0);

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

  const useCases = [
    {
      id: 'educators',
      title: 'For Educators',
      icon: GraduationCap,
      badge: 'K-12 & Higher Ed',
      color: 'from-[var(--quizito-neon-purple)] to-[var(--quizito-electric-blue)]',
      description: 'Transform your teaching materials into engaging assessments that boost student engagement and learning outcomes.',
      longDescription: 'Quickly create formative assessments, exam practice guides, and engaging homework from your lesson plans and reading materials. Turn boring textbook chapters into interactive learning experiences.',
      features: [
        'Convert lesson plans to quizzes instantly',
        'Create formative assessments in seconds',
        'Generate exam practice from textbooks',
        'Make homework more engaging',
        'Track student understanding in real-time',
        'Differentiate instruction with adaptive difficulty'
      ],
      metrics: [
        { label: 'Time Saved', value: '85%', description: 'Less time creating assessments' },
        { label: 'Engagement', value: '+60%', description: 'Higher student participation' },
        { label: 'Coverage', value: '100%', description: 'All learning objectives covered' }
      ],
      testimonial: 'I can create a comprehensive quiz from my 20-page lesson plan in under 2 minutes. My students are more engaged and I have real-time insights into their understanding.',
      ctaText: 'Start Teaching Better'
    },
    {
      id: 'corporate',
      title: 'For Corporate Training',
      icon: Building,
      badge: 'L&D Teams',
      color: 'from-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)]',
      description: 'Scale your training programs with AI-powered assessments that ensure compliance and boost employee knowledge retention.',
      longDescription: 'Instantly assess knowledge retention from training documents, compliance materials, and onboarding guides. Track team understanding with detailed analytics and ensure everyone meets your standards.',
      features: [
        'Turn training docs into assessments',
        'Ensure compliance with automated testing',
        'Onboard new hires efficiently',
        'Track team knowledge gaps',
        'Generate reports for stakeholders',
        'Scale training across departments'
      ],
      metrics: [
        { label: 'Training Time', value: '-40%', description: 'Faster employee onboarding' },
        { label: 'Compliance', value: '99%', description: 'Meeting rate improvement' },
        { label: 'Retention', value: '+45%', description: 'Better knowledge retention' }
      ],
      testimonial: 'Our compliance training went from a dreaded annual requirement to an engaging experience. Knowledge retention improved dramatically and we can prove ROI to leadership.',
      ctaText: 'Scale Your Training'
    },
    {
      id: 'creators',
      title: 'For Students & Creators',
      icon: Users,
      badge: 'Self-Learning',
      color: 'from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)]',
      description: 'Accelerate your learning with active recall or add value to your content with interactive knowledge checks.',
      longDescription: 'Turn your study notes into active recall sessions for better retention. If you create content, add value and engagement with knowledge checks for your audience.',
      features: [
        'Convert study notes to practice tests',
        'Implement active recall techniques',
        'Add quizzes to your content',
        'Engage your audience interactively',
        'Track your learning progress',
        'Share knowledge assessments'
      ],
      metrics: [
        { label: 'Study Efficiency', value: '+70%', description: 'Better retention rates' },
        { label: 'Content Value', value: '+55%', description: 'Audience engagement boost' },
        { label: 'Learning Speed', value: '2x', description: 'Faster concept mastery' }
      ],
      testimonial: 'I&apos;ve transformed how I study for med school. Active recall through AI-generated quizzes helped me ace my exams while studying half the time.',
      ctaText: 'Boost Your Learning'
    }
  ];

  const activeUseCase = useCases[activeTab];

  return (
    <section className="w-full py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-6 max-w-7xl"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-neon-purple)]/10 text-[var(--quizito-neon-purple)] px-4 py-2 rounded-full font-medium mb-6">
            <Brain className="h-4 w-4" />
            Perfect for Every Use Case
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)] mb-6">
            Find Your
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] bg-clip-text text-transparent"> Perfect Fit</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
            Whether you&apos;re teaching, training, or learning - Quizito adapts to your unique needs.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {useCases.map((useCase, index) => (
              <button
                key={useCase.id}
                onClick={() => setActiveTab(index)}
                className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === index
                    ? `bg-gradient-to-r ${useCase.color} text-white shadow-lg`
                    : 'bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-secondary)] hover:border-[var(--quizito-electric-blue)]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <useCase.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{useCase.title}</div>
                    <div className="text-xs opacity-80">{useCase.badge}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Main Description */}
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8">
              <div className={`w-16 h-16 bg-gradient-to-br ${activeUseCase.color} rounded-2xl flex items-center justify-center mb-6`}>
                <activeUseCase.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--quizito-text-primary)] mb-4">
                {activeUseCase.title}
              </h3>
              
              <p className="text-[var(--quizito-text-secondary)] leading-relaxed mb-6">
                {activeUseCase.longDescription}
              </p>
              
              {/* Features List */}
              <div className="space-y-3">
                {activeUseCase.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[var(--quizito-cyber-green)] flex-shrink-0" />
                    <span className="text-[var(--quizito-text-secondary)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6">
              <blockquote className="text-[var(--quizito-text-secondary)] leading-relaxed italic">
                &quot;{activeUseCase.testimonial}&quot;
              </blockquote>
            </div>
          </div>

          {/* Right Column - Metrics & CTA */}
          <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-1 gap-6">
              {activeUseCase.metrics.map((metric, index) => (
                <div key={index} className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 text-center">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${activeUseCase.color} bg-clip-text text-transparent mb-2`}>
                    {metric.value}
                  </div>
                  <div className="text-[var(--quizito-text-primary)] font-semibold mb-1">
                    {metric.label}
                  </div>
                  <div className="text-[var(--quizito-text-muted)] text-sm">
                    {metric.description}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-8 text-center">
              <h4 className="text-xl font-bold text-[var(--quizito-text-primary)] mb-4">
                Ready to Get Started?
              </h4>
              <p className="text-[var(--quizito-text-secondary)] mb-6">
                Join thousands who&apos;ve already transformed their workflow.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full bg-gradient-to-r ${activeUseCase.color} text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {activeUseCase.ctaText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}; 