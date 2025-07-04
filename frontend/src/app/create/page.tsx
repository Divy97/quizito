"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/ui/app-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { PageTitle, BodyText } from "@/components/ui/typography";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link, Youtube, BrainCircuit, Sparkles, ArrowRight, Lock, AlertCircle } from "lucide-react";

export default function CreatePage() {
  const [session, setSession] = useState<null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      setSession(null);
      setLoading(false);
    };
    getSession();
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("topic");
  const [formData, setFormData] = useState({
    title: "",
    questionCount: "5",
    description: "",
    source: "",
    isPublic: false
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.title.trim() && formData.source.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        source_type: selectedTab,
        source_data: formData.source,
        question_count: parseInt(formData.questionCount, 10),
        is_public: formData.isPublic,
        difficulty: 'medium', // Defaulting to medium for now
      };

      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const result = await response.json();
      router.push(`/quiz/${result.quizId}`);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getSourcePlaceholder = () => {
    switch (selectedTab) {
      case "topic":
        return "E.g., 'Machine Learning Basics', 'Ancient Rome', 'React Hooks'";
      case "youtube":
        return "https://youtube.com/watch?v=dQw4w9WgXcQ";
      case "url":
        return "https://example.com/your-article";
      default:
        return "";
    }
  };

  const getSourceLabel = () => {
    switch (selectedTab) {
      case "topic":
        return "What topic should your quiz cover?";
      case "youtube":
        return "Paste the YouTube video URL";
      case "url":
        return "Paste the article or blog URL";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <AppLayout backgroundVariant="minimal">
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Sparkles className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AppLayout>
    )
  }

  if (!session) {
    return (
      <AppLayout backgroundVariant="minimal">
        <Dialog open={true} onOpenChange={() => router.push("/")}>
          <DialogContent className="bg-[#1E1E1E] border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-400" />
                Authentication Required
              </DialogTitle>
              <DialogDescription className="text-[#A0A0A0]">
                You need to be logged in to create a quiz. Please sign in to continue.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] hover:from-[#5B5CF6] hover:to-[#10B981] text-white mt-4"
            >
              Go to Login
            </Button>
          </DialogContent>
        </Dialog>

        {/* Blurred background content */}
        <div className="relative overflow-hidden blur-sm pointer-events-none">
          <div className="relative z-10 flex items-center justify-center px-4 py-6 min-h-[calc(100vh-120px)]">
            <div className="text-center mb-6">
              <PageTitle>
                Create Your Quiz
              </PageTitle>
              <BodyText className="max-w-2xl mx-auto">
                Transform any content into an engaging, AI-powered quiz in seconds
              </BodyText>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout backgroundVariant="default">
      <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-120px)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <PageTitle>
              Create Your Quiz
            </PageTitle>
            <BodyText className="max-w-2xl mx-auto">
              Transform any content into an engaging, AI-powered quiz in seconds
            </BodyText>
          </motion.div>

          {/* Main Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-2xl shadow-purple-500/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Source Selection */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <Label className="text-[#E0E0E0] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] rounded-full"></span>
                      Choose Your Source
                    </Label>
                    
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-[#2A2A2A]/50 border border-[#3A3A3A] backdrop-blur-sm">
                        <TabsTrigger 
                          value="topic" 
                          className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#14B8A6] data-[state=active]:text-white transition-all"
                        >
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Topic
                        </TabsTrigger>
                        <TabsTrigger 
                          value="youtube"
                          className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#14B8A6] data-[state=active]:text-white transition-all"
                        >
                          <Youtube className="mr-2 h-4 w-4" />
                          YouTube
                        </TabsTrigger>
                        <TabsTrigger 
                          value="url"
                          className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6366F1] data-[state=active]:to-[#14B8A6] data-[state=active]:text-white transition-all"
                        >
                          <Link className="mr-2 h-4 w-4" />
                          URL
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="mt-3">
                        <Label className="text-sm text-[#A0A0A0] mb-2 block">
                          {getSourceLabel()}
                        </Label>
                        {["topic", "youtube", "url"].map((tab) => (
                          <TabsContent key={tab} value={tab} className="mt-0">
                            <Input
                              value={selectedTab === tab ? formData.source : ""}
                              onChange={(e) => {
                                if (selectedTab === tab) {
                                  handleInputChange("source", e.target.value);
                                }
                              }}
                              placeholder={selectedTab === tab ? getSourcePlaceholder() : ""}
                              className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-all"
                            />
                          </TabsContent>
                        ))}
                      </div>
                    </Tabs>
                  </motion.div>

                  {/* Quiz Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Title */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <Label htmlFor="title" className="text-[#E0E0E0] font-medium text-sm">
                        Quiz Title
                      </Label>
                      <Input 
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="E.g., 'History of Rome'" 
                        className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-all"
                      />
                    </motion.div>
                    
                    {/* Question Count */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="question-count" className="text-[#E0E0E0] font-medium text-sm">
                        Questions
                      </Label>
                      <Input
                        id="question-count"
                        type="number"
                        value={formData.questionCount}
                        onChange={(e) => handleInputChange("questionCount", e.target.value)}
                        min="3"
                        max="20"
                        className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-all"
                      />
                    </motion.div>
                  </div>

                  {/* Public Toggle */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#2A2A2A]/50 border border-[#3A3A3A]">
                      <div>
                        <Label htmlFor="public-switch" className="flex items-center gap-2 font-medium text-[#E0E0E0]">
                          <Lock className="h-4 w-4" />
                          Make Quiz Public
                        </Label>
                        <p className="text-sm text-[#A0A0A0] mt-1">
                          Public quizzes have a shareable link and a leaderboard. Private quizzes are only for you.
                        </p>
                      </div>
                      <Switch
                        id="public-switch"
                        checked={formData.isPublic}
                        onCheckedChange={(value) => handleInputChange('isPublic', value)}
                        className="data-[state=checked]:bg-[#14B8A6] data-[state=unchecked]:bg-gray-600"
                      />
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="description" className="text-[#E0E0E0] font-medium text-sm">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Add a brief description of your quiz..."
                      className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-all min-h-[100px]"
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={!isFormValid() || isGenerating}
                      className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] hover:from-[#5B5CF6] hover:to-[#10B981] text-white px-8 py-3 text-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          Create Quiz
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 