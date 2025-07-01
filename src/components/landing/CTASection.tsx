"use client";
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section 
      className="py-20 text-center border-t border-purple-500/20" 
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 
            id="cta-heading"
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400">
              Quizzin ?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create quizzes and compete with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
              aria-label="Start creating quizzes for free"
            >
              Start Creating Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 