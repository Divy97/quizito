"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

import { AppLayout } from '@/components/ui/app-layout';
import { PageTitle, BodyText } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Globe, Youtube, Loader2, Wand2, Link, LogIn, AlertCircle, Sparkles, Settings, FileText } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LoginButton } from '@/components/ui/login-button';

export default function CreatePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source_type: 'topic',
    source_data: '',
    difficulty: 'medium',
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

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.title.trim().length >= 5 && formData.source_data.trim().length >= 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !user) return;

    setLoading(true);
    setError(null);
    toast.loading('Generating your quiz... this may take a moment!');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Sends the auth cookie
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || result.error || 'Failed to generate quiz');
      }

      toast.dismiss();
      toast.success('Quiz generated successfully!');
      router.push(`/quiz/${result.quizId}`);

    } catch (error) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      console.error('Quiz generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getSourcePlaceholder = () => {
    switch (formData.source_type) {
      case 'topic': return 'e.g., "The History of Ancient Rome"';
      case 'url': return 'https://example.com/article';
      case 'youtube': return 'https://www.youtube.com/watch?v=...';
      default: return '';
    }
  };

  const getSourceLabel = () => {
    switch (formData.source_type) {
      case 'topic': return 'Topic';
      case 'url': return 'URL';
      case 'youtube': return 'YouTube URL';
      default: return 'Source';
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
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-120px)]">
          <div className="max-w-md w-full space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="mx-auto bg-gradient-to-tr from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-4 w-fit">
                <LogIn className="h-12 w-12 text-[var(--quizito-electric-blue)]" />
              </div>
              <PageTitle>Log In to Create Quizzes</PageTitle>
              <BodyText>
                You&apos;re just one step away from creating your own AI-powered quizzes.
                Sign in to unlock this feature and many more.
              </BodyText>
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 py-12"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-tr from-[var(--quizito-electric-blue)]/20 to-[var(--quizito-neon-purple)]/20 rounded-full p-3">
              <Sparkles className="h-8 w-8 text-[var(--quizito-electric-blue)]" />
            </div>
          </div>
          <PageTitle>Create Your Next Quiz</PageTitle>
          <BodyText className="max-w-2xl mx-auto">
            Transform any content into an engaging, AI-powered quiz in seconds. 
            Choose from topics, URLs, or YouTube videos to get started.
          </BodyText>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quiz Details Card */}
              <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[var(--quizito-text-primary)]">
                  <FileText className="h-5 w-5 text-[var(--quizito-electric-blue)]" />
                  <h2 className="text-lg font-medium">Quiz Details</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[var(--quizito-text-primary)] font-medium">
                      Quiz Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., 'The Ultimate Space Trivia'"
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[var(--quizito-text-primary)] font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="A brief summary of what this quiz is about."
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300 resize-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Source Content Section */}
              <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[var(--quizito-text-primary)]">
                  <Wand2 className="h-5 w-5 text-[var(--quizito-electric-blue)]" />
                  <h2 className="text-lg font-medium">{getSourceLabel()}</h2>
                </div>
                <Tabs value={formData.source_type} onValueChange={(value) => handleInputChange("source_type", value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border-0 rounded-xl p-1">
                    <TabsTrigger value="topic" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-black transition-all duration-300">
                      <Wand2 className="h-4 w-4" />
                      Topic
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-black transition-all duration-300">
                      <Link className="h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="flex items-center gap-2 data-[state=active]:bg-[var(--quizito-electric-blue)] data-[state=active]:text-black transition-all duration-300">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="topic" className="mt-6">
                    <Input
                      value={formData.source_data}
                      onChange={(e) => handleInputChange("source_data", e.target.value)}
                      placeholder={getSourcePlaceholder()}
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-6">
                    <Input
                      value={formData.source_data}
                      onChange={(e) => handleInputChange("source_data", e.target.value)}
                      placeholder={getSourcePlaceholder()}
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300"
                    />
                  </TabsContent>
                  <TabsContent value="youtube" className="mt-6">
                    <Input
                      value={formData.source_data}
                      onChange={(e) => handleInputChange("source_data", e.target.value)}
                      placeholder={getSourcePlaceholder()}
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] placeholder:text-[var(--quizito-text-muted)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar Configuration */}
            <div className="space-y-8">
              {/* Configuration Section */}
              <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[var(--quizito-text-primary)]">
                  <Settings className="h-5 w-5 text-[var(--quizito-electric-blue)]" />
                  <h2 className="text-lg font-medium">Configuration</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="question-count" className="text-[var(--quizito-text-primary)] font-medium">
                      Number of Questions
                    </Label>
                    <Input
                      id="question-count"
                      type="number"
                      value={formData.question_count}
                      onChange={(e) => handleInputChange('question_count', parseInt(e.target.value, 10))}
                      min="3"
                      max="10"
                      className="bg-white/5 backdrop-blur-xl border-0 text-[var(--quizito-text-primary)] focus:ring-2 focus:ring-[var(--quizito-electric-blue)]/50 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--quizito-text-primary)] font-medium">Difficulty</Label>
                    <Tabs value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border-0 rounded-xl p-1">
                        <TabsTrigger value="easy" className="data-[state=active]:bg-[var(--quizito-cyber-green)] data-[state=active]:text-black transition-all duration-300">
                          Easy
                        </TabsTrigger>
                        <TabsTrigger value="medium" className="data-[state=active]:bg-[var(--quizito-electric-yellow)] data-[state=active]:text-black transition-all duration-300">
                          Medium
                        </TabsTrigger>
                        <TabsTrigger value="hard" className="data-[state=active]:bg-[var(--quizito-hot-pink)] data-[state=active]:text-black transition-all duration-300">
                          Hard
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl rounded-xl">
                    <Label htmlFor="public-switch" className="flex items-center gap-2 text-[var(--quizito-text-primary)] font-medium">
                      <Globe className="h-4 w-4 text-[var(--quizito-electric-blue)]" />
                      Make Public
                    </Label>
                    <Switch
                      id="public-switch"
                      checked={formData.is_public}
                      onCheckedChange={(value) => handleInputChange('is_public', value)}
                      className="data-[state=checked]:bg-[var(--quizito-cyber-green)] data-[state=unchecked]:bg-[var(--quizito-text-muted)]"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </motion.div>
              
              {/* Error Display */}
              {error && (
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center gap-3 rounded-xl bg-[var(--quizito-hot-pink)]/10 p-4 text-sm text-[var(--quizito-hot-pink)]"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </form>
      </motion.div>
    </AppLayout>
  );
} 