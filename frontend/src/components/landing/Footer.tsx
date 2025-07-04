"use client";
import { Github, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="w-full py-8 border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          © 2025 Quizito. All rights reserved.
        </p>
        <nav aria-label="Social media links">
          <div className="flex gap-4">
            <motion.a
              whileHover={{ scale: 1.2, rotate: 5 }}
              href="https://github.com/Divy97"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-purple-400 transition-colors"
              aria-label="Visit our GitHub repository"
            >
              <Github className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, rotate: -5 }}
              href="https://twitter.com/ParekhDivy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-sky-400 transition-colors"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="h-5 w-5" />
            </motion.a>
          </div>
        </nav>
      </div>
    </footer>
  );
}; 