"use client";
import { Youtube, FileText, Globe, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export const InputTypesSection = () => {
  const inputTypes = [
    { icon: Youtube, label: "YouTube", color: "hover:text-red-400" },
    { icon: FileText, label: "PDF & DOCX", color: "hover:text-blue-400" },
    { icon: Globe, label: "Web Articles", color: "hover:text-green-400" },
    { icon: BrainCircuit, label: "Any Topic", color: "hover:text-purple-400" },
  ];

  return (
    <section 
      className="w-full py-20" 
      aria-labelledby="input-types-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          id="input-types-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Works with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400">
            Everything
          </span>
        </motion.h2>
        
        <div className="flex justify-center flex-wrap gap-8">
          {inputTypes.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.2, y: -10, rotate: 5 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`group flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 cursor-pointer transition-all ${type.color}`}
              role="button"
              tabIndex={0}
              aria-label={`Create quiz from ${type.label}`}
            >
              <type.icon className="h-12 w-12 text-gray-400 group-hover:scale-110 transition-all" aria-hidden="true" />
              <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">
                {type.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 