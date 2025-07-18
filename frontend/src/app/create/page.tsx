"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

import { AppLayout } from '@/components/ui/app-layout';
import { BodyText } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Globe, Youtube, Loader2, Wand2, Link, LogIn, AlertCircle, Sparkles, Settings, FileText, BrainCircuit, Rocket } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LoginButton } from '@/components/ui/login-button';

export default function CreatePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
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
      default: return 'Content Source';
    }
  };

  const getSourcePlaceholder = () => {
    switch (formData.source_type) {
      case 'topic': return 'e.g., "Machine Learning Basics", "World War II", "Photosynthesis"';
      case 'url': return 'e.g., https://example.com/article-about-topic';
      case 'youtube': return 'e.g., https://youtube.com/watch?v=video-id';
      default: return 'Enter your content source...';
    }
  };

  const isFormValid = () => {
    return formData.title.trim() && formData.source_data.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      toast.success('Quiz generated successfully!');
      router.push(`/quiz/${data.quizId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--quizito-electric-blue)] mx-auto" />
            <BodyText>Loading...</BodyText>
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
        
        <div className="flex flex-col items-center justify-center text-center p-6 min-h-[calc(100vh-120px)]">
          <div className="max-w-md w-full space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-full p-6 w-fit mx-auto">
                <LogIn className="h-12 w-12 text-[var(--quizito-electric-blue)]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--quizito-text-primary)]">
                Log In to Create Quizzes
              </h1>
              <p className="text-xl text-[var(--quizito-text-secondary)] leading-relaxed">
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-12 relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--quizito-electric-blue)]/10 text-[var(--quizito-electric-blue)] px-4 py-2 rounded-full font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI Quiz Generator
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--quizito-text-primary)] mb-6">
            Create Your Next
            <span className="bg-gradient-to-r from-[var(--quizito-electric-blue)] via-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] bg-clip-text text-transparent"> Quiz</span>
          </h1>
          <p className="text-xl text-[var(--quizito-text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Transform any content into an engaging, AI-powered quiz in seconds. 
            Choose from topics, URLs, or YouTube videos to get started.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quiz Details Card */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] rounded-full p-2">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--quizito-text-primary)]">Quiz Details</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-[var(--quizito-text-primary)] font-semibold text-lg">
                      Quiz Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., 'The Ultimate Space Trivia'"
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-[var(--quizito-text-primary)] font-semibold">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="A brief summary of what this quiz is about..."
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 resize-none min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Source Content Section */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-neon-purple)] to-[var(--quizito-cyber-green)] rounded-full p-2">
                    <Wand2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--quizito-text-primary)]">{getSourceLabel()}</h2>
                </div>
                <Tabs value={formData.source_type} onValueChange={(value) => handleInputChange("source_type", value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl p-2 h-14">
                    <TabsTrigger value="topic" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-xl font-semibold">
                      <Wand2 className="h-4 w-4" />
                      Topic
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-xl font-semibold">
                      <Link className="h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 rounded-xl font-semibold">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-8">
                    <TabsContent value="topic" className="mt-0">
                      <Input
                        value={formData.source_data}
                        onChange={(e) => handleInputChange("source_data", e.target.value)}
                        placeholder={getSourcePlaceholder()}
                        className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12 text-lg"
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-0">
                      <Input
                        value={formData.source_data}
                        onChange={(e) => handleInputChange("source_data", e.target.value)}
                        placeholder={getSourcePlaceholder()}
                        className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12 text-lg"
                      />
                    </TabsContent>
                    <TabsContent value="youtube" className="mt-0">
                      <Input
                        value={formData.source_data}
                        onChange={(e) => handleInputChange("source_data", e.target.value)}
                        placeholder={getSourcePlaceholder()}
                        className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12 text-lg"
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Sidebar Configuration */}
            <div className="space-y-8">
              {/* Configuration Section */}
              <div className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-3xl p-8 shadow-2xl shadow-[var(--quizito-electric-blue)]/5 hover:shadow-[var(--quizito-electric-blue)]/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-r from-[var(--quizito-cyber-green)] to-[var(--quizito-electric-yellow)] rounded-full p-2">
                    <Settings className="h-5 w-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--quizito-text-primary)]">Configuration</h2>
                </div>

                <div className="space-y-8">
                   <div className="space-y-3">
                    <Label htmlFor="question-count" className="text-[var(--quizito-text-primary)] font-semibold">
                      Number of Questions
                    </Label>
                    <Input
                      id="question-count"
                      type="number"
                      value={formData.question_count}
                      onChange={(e) => handleInputChange('question_count', parseInt(e.target.value, 10))}
                      min="3"
                      max="10"
                      className="bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] text-[var(--quizito-text-primary)] focus:border-[var(--quizito-electric-blue)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] focus:outline-none transition-all duration-300 h-12"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[var(--quizito-text-primary)] font-semibold">Difficulty</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        className="text-xs text-[var(--quizito-electric-blue)] hover:bg-[var(--quizito-electric-blue)]/10 transition-all duration-200"
                      >
                        {showAdvancedSettings ? 'Hide Advanced' : 'Advanced'}
                      </Button>
                    </div>
                    <Tabs value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl p-1 h-12">
                        <TabsTrigger value="easy" className="data-[state=active]:bg-[var(--quizito-cyber-green)] data-[state=active]:text-black transition-all duration-300 font-semibold">
                          Easy
                        </TabsTrigger>
                        <TabsTrigger value="medium" className="data-[state=active]:bg-[var(--quizito-electric-yellow)] data-[state=active]:text-black transition-all duration-300 font-semibold">
                          Medium
                        </TabsTrigger>
                        <TabsTrigger value="hard" className="data-[state=active]:bg-[var(--quizito-hot-pink)] data-[state=active]:text-white transition-all duration-300 font-semibold">
                          Hard
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {showAdvancedSettings && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                     >
                      <Label className="flex items-center gap-2 text-[var(--quizito-text-primary)] font-semibold">
                        <BrainCircuit className="h-4 w-4 text-[var(--quizito-electric-blue)]" />
                        Cognitive Level (Manual Override)
                      </Label>
                      <Tabs value={formData.taxonomy_level || ''} onValueChange={(value) => handleInputChange("taxonomy_level", value)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 gap-2 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-xl p-2 h-auto">
                          <TabsTrigger value="remembering" className="data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 py-2">
                            Remember
                          </TabsTrigger>
                          <TabsTrigger value="understanding" className="data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 py-2">
                            Understand
                          </TabsTrigger>
                          <TabsTrigger value="applying" className="data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 py-2">
                            Apply
                          </TabsTrigger>
                          <TabsTrigger value="analyzing" className="data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-white transition-all duration-300 py-2">
                            Analyze
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between p-6 bg-[var(--quizito-glass-surface)] backdrop-blur-xl border border-[var(--quizito-glass-border)] rounded-2xl">
                    <Label htmlFor="public-switch" className="flex items-center gap-3 text-[var(--quizito-text-primary)] font-semibold">
                      <Globe className="h-5 w-5 text-[var(--quizito-electric-blue)]" />
                      Make Public
                    </Label>
                    <Switch
                      id="public-switch"
                      checked={formData.is_public}
                      onCheckedChange={(value) => handleInputChange('is_public', value)}
                      className="data-[state=checked]:bg-[var(--quizito-cyber-green)] data-[state=unchecked]:bg-[var(--quizito-text-muted)] scale-125"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white px-8 py-6 text-xl font-bold rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-3 h-6 w-6" />
                      Generate Quiz
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