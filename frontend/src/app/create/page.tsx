"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion, Variants } from 'framer-motion';

import { AppLayout } from '@/components/ui/app-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Globe, Youtube, Loader2, Wand2, Link, LogIn, AlertCircle, Sparkles, Settings, FileText, Rocket, Upload, Brain } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api';
import { LoginButton } from '@/components/ui/login-button';

export default function CreatePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source_type: 'topic',
    source_data: '',
    difficulty: 'medium',
    taxonomy_level: undefined as string | undefined,
    question_count: 5,
    is_public: false,
  });
  
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    source_data: '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  type FormValue = string | boolean | number | undefined;

  const handleInputChange = (key: string, value: FormValue) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getSourceLabel = () => {
    switch (formData.source_type) {
      case 'topic': return 'Generate from Topic';
      case 'url': return 'Extract from URL';
      case 'youtube': return 'Analyze YouTube Video';
      case 'pdf': return 'Upload PDF Documents';
      default: return 'Content Source';
    }
  };

  const getSourcePlaceholder = () => {
    switch (formData.source_type) {
      case 'topic': return 'e.g., "Machine Learning Basics", "World War II", "Photosynthesis"';
      case 'url': return 'e.g., https://example.com/article-about-topic';
      case 'youtube': return 'e.g., https://youtube.com/watch?v=video-id';
      case 'pdf': return 'Upload one or more PDF files';
      default: return 'Enter your content source...';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for PDFs only and validate file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    const validPdfs = files.filter(file => {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validPdfs.length === 0) {
      toast.error('Please upload valid PDF files (max 5MB each)');
      return;
    }

    setPdfFiles(prev => [...prev, ...validPdfs]);
    e.target.value = ''; // Reset file input
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAndProcessPdfs = async (): Promise<string | null> => {
    if (pdfFiles.length === 0) {
      toast.error('Please upload at least one PDF file');
      return null;
    }

    setError(null);
    setPdfProcessing(true); // Set processing state

    try {
      const formData = new FormData();
      pdfFiles.forEach((file) => {
        formData.append('pdfs', file);
      });

      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/pdfs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process PDFs');
      }

      const data = await response.json();
      toast.success('PDFs processed successfully!');
      return data.data.source_data; // Return the extracted text from source_data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDFs';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setPdfProcessing(false); // Reset processing state
    }
  };



  const validateForm = () => {
    const newErrors = { title: '', source_data: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required.';
      isValid = false;
    }

    if (formData.source_type !== 'pdf' && !formData.source_data.trim()) {
      newErrors.source_data = 'Please provide a content source.';
      isValid = false;
    }

    if (formData.source_type === 'pdf' && pdfFiles.length === 0) {
      newErrors.source_data = 'Please upload at least one PDF file.';
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const isFormValid =
    formData.title.trim() &&
    (formData.source_type === 'pdf'
      ? pdfFiles.length > 0
      : formData.source_data.trim());

  const pollForQuizStatus = async (quizId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/status`);
        if (!response.ok) {
          // Stop polling on non-2xx responses
          clearInterval(interval);
          setError('Failed to get quiz status.');
          setLoading(false);
          return;
        }

        const data = await response.json();

        // console.log('Quizz completedData:', data);

        if (data.data?.status === 'COMPLETED') {
          clearInterval(interval);
          toast.success('Quiz generated successfully!');
          router.push(`/quiz/${quizId}`);
        } else if (data.data?.status === 'FAILED') {
          clearInterval(interval);
          setError(data.data?.errorMessage || 'Quiz generation failed. Please try again.');
          toast.error(data.data?.errorMessage || 'Quiz generation failed');
          setLoading(false);
        }
        // If status is 'PENDING', do nothing and let it poll again.

      } catch (error: unknown) {
        clearInterval(interval);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while checking quiz status.';
        setError(errorMessage);
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const finalFormData = { ...formData };

      if (formData.source_type === 'pdf') {
        const pdfText = await uploadAndProcessPdfs();
        if (!pdfText) return; // Error is handled in the upload function
        finalFormData.source_data = pdfText;
      }

      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start quiz generation');
      }

      const result = await response.json();
      // console.log('Quiz generation response:', result);

      const quizId = result.data?.quizId;
      // console.log('QuizID:', quizId);


      if (!quizId) {
        throw new Error('Quiz ID was not returned from the server.');
      }
      
      toast.info('Quiz generation started! You will be redirected when it is ready.');
      
      // Start polling for the quiz status
      pollForQuizStatus(quizId);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      console.error('Quiz generation error:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="fixed inset-0 bg-[var(--quizito-bg-primary)] flex items-center justify-center z-50">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full opacity-60"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
            
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full blur-3xl">
              <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-[var(--quizito-cyber-green)]/20 to-[var(--quizito-electric-yellow)]/20 rounded-full blur-3xl">
              <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>

          {/* Main Loading Content */}
          <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="mx-auto w-24 h-24 bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-3xl flex items-center justify-center shadow-2xl shadow-[var(--quizito-electric-blue)]/50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent mb-4">
                Creating Your Quiz
              </h1>
              <p className="text-xl text-[var(--quizito-text-secondary)]">
                Our AI is crafting the perfect questions for you
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-3 h-3 bg-[var(--quizito-cyber-green)] rounded-full animate-pulse" />
                  <span className="text-[var(--quizito-text-secondary)]">Analyzing content</span>
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-3 h-3 bg-[var(--quizito-neon-purple)] rounded-full animate-pulse" />
                  <span className="text-[var(--quizito-text-secondary)]">Generating questions</span>
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-3 h-3 bg-[var(--quizito-electric-blue)] rounded-full animate-pulse" />
                  <span className="text-[var(--quizito-text-secondary)]">Creating options</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Animated Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="w-full max-w-md mx-auto bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--quizito-text-secondary)]">Progress</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-[var(--quizito-electric-blue)] font-semibold"
                  >
                    Processing...
                  </motion.span>
                </div>
                <div className="w-full bg-[var(--quizito-glass-surface)] rounded-full h-3 border border-[var(--quizito-glass-border)] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Fun Facts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-6 max-w-lg mx-auto">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex items-center justify-center space-x-3"
                >
                  <Brain className="w-5 h-5 text-[var(--quizito-electric-blue)]" />
                  <span className="text-[var(--quizito-text-secondary)] text-sm">
                    Did you know? Our AI analyzes thousands of similar questions to create the perfect quiz for you!
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Loading Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="flex items-center justify-center space-x-2"
            >
              <motion.div
                className="w-3 h-3 bg-[var(--quizito-electric-blue)] rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-3 h-3 bg-[var(--quizito-neon-purple)] rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-[var(--quizito-cyber-green)] rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-[var(--quizito-bg-primary)] via-[var(--quizito-bg-secondary)] to-[var(--quizito-bg-primary)] -z-10" />
        
        <div className="flex flex-col items-center justify-center text-center p-4 md:p-6 min-h-[calc(100vh-120px)]">
          <div className="max-w-md w-full space-y-6 md:space-y-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-full p-4 md:p-6 w-fit mx-auto">
                <LogIn className="h-8 w-8 md:h-12 md:w-12 text-[var(--quizito-electric-blue)]" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--quizito-text-primary)]">
                Log In to Create Quizzes
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
                You&apos;re just one step away from creating your own AI-powered quizzes.
                <br />
                <span className="text-[var(--quizito-electric-blue)] font-semibold">Sign in to unlock this feature and many more.</span>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LoginButton />
            </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster />
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--quizito-bg-primary)] via-[var(--quizito-bg-secondary)] to-[var(--quizito-bg-primary)] -z-10" />
      <motion.div
        className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants as Variants} className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-3 md:px-4 py-2 rounded-full font-medium mb-4 md:mb-6">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">AI Quiz Generator</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--quizito-text-primary)] mb-4 md:mb-6">
            Create Your Next
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent"> Quiz</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-[var(--quizito-text-secondary)] max-w-3xl mx-auto leading-relaxed px-4">
            Transform any content into an engaging, AI-powered quiz in seconds. 
            Choose from topics, URLs, or YouTube videos to get started.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="xl:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
              {/* Quiz Details Card */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 md:mb-6 lg:mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full p-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--quizito-text-primary)]">Quiz Details</h2>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-[var(--quizito-text-primary)] font-semibold text-base md:text-lg">
                      Quiz Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., 'The Ultimate Space Trivia'"
                      disabled={loading}
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-10 md:h-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-[var(--quizito-hot-pink)] mt-1">{validationErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-[var(--quizito-text-primary)] font-semibold text-sm md:text-base">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="A brief summary of what this quiz is about..."
                      disabled={loading}
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 resize-none min-h-[100px] md:min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Source Content Section */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 md:mb-6 lg:mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] rounded-full p-2">
                    <Wand2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--quizito-text-primary)]">{getSourceLabel()}</h2>
                </div>
                <Tabs value={formData.source_type} onValueChange={(value) => handleInputChange("source_type", value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl md:rounded-2xl p-1 md:p-2 h-auto md:h-14">
                    <TabsTrigger value="topic" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm py-2 md:py-0" disabled={loading}>
                      <Wand2 className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Topic</span>
                      <span className="sm:hidden">Topic</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm py-2 md:py-0" disabled={loading}>
                      <Link className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">URL</span>
                      <span className="sm:hidden">URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm py-2 md:py-0" disabled={loading}>
                      <Upload className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm py-2 md:py-0" disabled={loading}>
                      <Youtube className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">YouTube</span>
                      <span className="sm:hidden">YT</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="topic" className="mt-4 md:mt-6">
                    <Input
                      value={formData.source_data}
                      onChange={(e) => handleInputChange("source_data", e.target.value)}
                      placeholder={getSourcePlaceholder()}
                      disabled={loading}
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-10 md:h-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {validationErrors.source_data && (
                      <p className="text-sm text-[var(--quizito-hot-pink)] mt-1">{validationErrors.source_data}</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="url" className="mt-4 md:mt-6">
                    <Input
                      value={formData.source_data}
                      onChange={(e) => handleInputChange("source_data", e.target.value)}
                      placeholder={getSourcePlaceholder()}
                      disabled={loading}
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-10 md:h-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {validationErrors.source_data && (
                      <p className="text-sm text-[var(--quizito-hot-pink)] mt-1">{validationErrors.source_data}</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="youtube" className="mt-4 md:mt-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[var(--quizito-neon-purple)]/10 via-[var(--quizito-electric-blue)]/5 to-[var(--quizito-cyber-green)]/10 backdrop-blur-xl border-2 border-dashed border-[var(--quizito-neon-purple)]/30 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 text-center">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[var(--quizito-neon-purple)]/20 rounded-full blur-xl animate-pulse" />
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[var(--quizito-electric-blue)]/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}} />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[var(--quizito-cyber-green)]/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-center mb-4 md:mb-6">
                          <div className="relative">
                            <Youtube className="h-12 w-12 md:h-16 md:w-16 text-[var(--quizito-neon-purple)] animate-bounce" />
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)] text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                              SOON
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--quizito-text-primary)] mb-3 md:mb-4">
                          YouTube Integration
                          <span className="bg-gradient-to-r from-[var(--quizito-neon-purple)] via-[var(--quizito-electric-blue)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent"> Coming Soon!</span>
                        </h3>
                        
                        <p className="text-sm md:text-base text-[var(--quizito-text-secondary)] mb-4 md:mb-6 max-w-md mx-auto leading-relaxed">
                          We&apos;re cooking up something amazing! Soon you&apos;ll be able to transform any YouTube video into an interactive quiz with our AI magic. ✨
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--quizito-text-muted)]">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[var(--quizito-neon-purple)] rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-[var(--quizito-electric-blue)] rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-2 h-2 bg-[var(--quizito-cyber-green)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                          </div>
                          <span className="ml-2">Stay tuned for updates!</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdf" className="mt-4 md:mt-6">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="pdf-upload"
                          className={`flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-lg transition-colors ${
                            loading || pdfProcessing
                              ? 'cursor-not-allowed bg-[var(--quizito-bg-secondary)]/50 border-[var(--quizito-border)]/50' 
                              : 'cursor-pointer bg-[var(--quizito-bg-secondary)] border-[var(--quizito-border)] hover:bg-[var(--quizito-bg-tertiary)]'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                            {pdfProcessing ? (
                              <>
                                <Loader2 className="w-8 h-8 md:w-10 md:h-10 mb-3 text-[var(--quizito-electric-blue)] animate-spin" />
                                <p className="mb-2 text-sm text-[var(--quizito-electric-blue)] font-semibold text-center">
                                  Processing PDFs...
                                </p>
                                <p className="text-xs text-[var(--quizito-text-tertiary)] text-center">
                                  Please wait while we extract text
                                </p>
                              </>
                            ) : (
                              <>
                            <Upload className="w-8 h-8 md:w-10 md:h-10 mb-3 text-[var(--quizito-text-secondary)]" />
                            <p className="mb-2 text-sm text-[var(--quizito-text-secondary)] text-center">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[var(--quizito-text-tertiary)] text-center">
                                  PDF files only (MAX. 5MB each)
                            </p>
                              </>
                            )}
                          </div>
                          <input
                            id="pdf-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            multiple
                            onChange={handlePdfUpload}
                            disabled={loading || pdfProcessing}
                          />
                        </label>
                      </div>

                      {pdfFiles.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-[var(--quizito-text-secondary)]">
                            Selected Files ({pdfFiles.length}):
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg border-[var(--quizito-border)]">
                            {pdfFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 text-sm rounded-md bg-[var(--quizito-bg-secondary)]"
                              >
                                <span className="truncate flex-1">{file.name}</span>
                                <span className="text-xs text-[var(--quizito-text-tertiary)] ml-2">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePdf(index)}
                                  className="ml-2 text-[var(--quizito-text-tertiary)] hover:text-[var(--quizito-text-primary)]"
                                  aria-label="Remove file"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            {/* Sidebar Configuration */}
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              {/* Configuration Section */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 md:mb-6 lg:mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)] rounded-full p-2">
                    <Settings className="h-4 w-4 md:h-5 md:w-5 text-black" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--quizito-text-primary)]">Configuration</h2>
                </div>

                <div className="space-y-6 md:space-y-8">
                   <div className="space-y-3">
                    <Label htmlFor="question-count" className="text-[var(--quizito-text-primary)] font-semibold text-sm md:text-base">
                      Number of Questions
                    </Label>
                    <Input
                      id="question-count"
                      type="number"
                      value={formData.question_count}
                      onChange={(e) => handleInputChange('question_count', parseInt(e.target.value, 10))}
                      min="3"
                      max="10"
                      disabled={loading}
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-10 md:h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Tabs value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-lg md:rounded-xl p-1 h-10 md:h-12">
                        <TabsTrigger value="easy" className="data-[state=active]:bg-[var(--quizito-cyber-green)] data-[state=active]:text-black transition-all duration-300 font-semibold text-xs md:text-sm" disabled={loading}>
                          Easy
                        </TabsTrigger>
                        <TabsTrigger value="medium" className="data-[state=active]:bg-[var(--quizito-electric-yellow)] data-[state=active]:text-black transition-all duration-300 font-semibold text-xs md:text-sm" disabled={loading}>
                          Medium
                        </TabsTrigger>
                        <TabsTrigger value="hard" className="data-[state=active]:bg-[var(--quizito-hot-pink)] data-[state=active]:text-white transition-all duration-300 font-semibold text-xs md:text-sm" disabled={loading}>
                          Hard
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                 
                  
                  <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl md:rounded-2xl">
                    <Label htmlFor="public-switch" className="flex items-center gap-2 md:gap-3 text-[var(--quizito-text-primary)] font-semibold text-sm md:text-base">
                      <Globe className="h-4 w-4 md:h-5 md:w-5 text-[var(--quizito-electric-blue)]" />
                      Make Public
                    </Label>
                    <Switch
                      id="public-switch"
                      checked={formData.is_public}
                      onCheckedChange={(value) => handleInputChange('is_public', value)}
                      disabled={loading}
                      className="data-[state=checked]:bg-[var(--quizito-cyber-green)] data-[state=unchecked]:bg-[var(--quizito-text-muted)] scale-110 md:scale-125 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={!isFormValid || loading || pdfProcessing}
                  className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white px-6 md:px-8 py-4 md:py-6 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {loading || pdfProcessing ? (
                    <>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 animate-spin" />
                      <span className="text-sm md:text-base">Generating Magic...</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 animate-spin" />
                          <span className="text-sm md:text-base">Processing PDFs...</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                      <span className="text-sm md:text-base">Generate Quiz</span>
                    </>
                  )}
                </Button>
              </motion.div>
              
              {/* Error Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-[var(--quizito-hot-pink)]/10 border border-[var(--quizito-hot-pink)]/20 p-4 text-[var(--quizito-hot-pink)]"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </form>
      </motion.div>
  </AppLayout>
  );
}