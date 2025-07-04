"use client";
import { motion } from 'framer-motion';

export const StepsSection = () => {
  const steps = [
    { 
      title: "Input Content", 
      description: "Paste a URL, upload a file, or type any topic. Quizito handles the rest automatically.", 
      number: 1 
    },
    { 
      title: "AI Processing", 
      description: "Advanced AI analyzes your content and generates relevant, challenging questions in seconds.", 
      number: 2 
    },
    { 
      title: "Share & Compete", 
      description: "Take the quiz yourself, share with friends, or make it public for everyone to try.", 
      number: 3 
    },
  ];

  return (
    <section 
      className="w-full pb-20" 
      aria-labelledby="steps-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          id="steps-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Generate in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400">
            3 Steps
          </span>
        </motion.h2>
        
        <div className="flex flex-col lg:flex-row justify-center items-center gap-12">
          {steps.map((step, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring" }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="relative mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold mb-4 shadow-lg shadow-purple-500/25"
                  aria-label={`Step ${step.number}`}
                >
                  {step.number}
                </motion.div>
                {i < 2 && (
                  <div 
                    className="hidden lg:block absolute top-12 left-24 w-32 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" 
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-gray-300 leading-relaxed">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}; 