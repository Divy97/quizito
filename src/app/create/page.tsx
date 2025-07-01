"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/ui/app-layout";

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
import { Link, Youtube, BrainCircuit, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
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
    // TODO: Implement quiz generation logic
    setTimeout(() => setIsGenerating(false), 3000);
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

  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => {
            const seed1 = (i * 123456789) % 1000000 / 1000000;
            const seed2 = (i * 987654321) % 1000000 / 1000000;
            const seed3 = (i * 456789123) % 1000000 / 1000000;
            const seed4 = (i * 789123456) % 1000000 / 1000000;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-500/15 rounded-full"
                initial={{
                  x: seed1 * 1200,
                  y: seed2 * 800,
                }}
                animate={{
                  x: seed3 * 1200,
                  y: seed4 * 800,
                }}
                transition={{
                  duration: seed1 * 25 + 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            );
          })}
        </div>

        <div className="relative z-10 flex items-center justify-center px-4 py-6 min-h-[calc(100vh-120px)]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-4xl"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400">
                  Create Your Quiz
                </span>
              </h1>
              <p className="text-[#A0A0A0] max-w-2xl mx-auto">
                Transform any content into an engaging, AI-powered quiz in seconds
              </p>
            </motion.div>

            {/* Main Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#1E1E1E]/95 border-[#2A2A2A] shadow-2xl shadow-purple-500/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Source Selection */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <Label className="text-[#E0E0E0] font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                        Choose Your Source
                      </Label>
                      
                      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-[#2A2A2A]/50 border border-[#3A3A3A] backdrop-blur-sm">
                          <TabsTrigger 
                            value="topic" 
                            className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all"
                          >
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Topic
                          </TabsTrigger>
                          <TabsTrigger 
                            value="youtube"
                            className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all"
                          >
                            <Youtube className="mr-2 h-4 w-4" />
                            YouTube
                          </TabsTrigger>
                          <TabsTrigger 
                            value="url"
                            className="text-[#A0A0A0] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all"
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
                                className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
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
                          className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
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
                          className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                        />
                      </motion.div>

                      {/* Public Toggle */}
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="is-public" className="text-[#E0E0E0] font-medium text-sm">
                          Visibility
                        </Label>
                        <div className="flex items-center h-10 px-3 rounded-md bg-[#2A2A2A]/50 border border-[#3A3A3A] transition-all hover:border-[#4A4A4A]">
                          <Switch 
                            id="is-public"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-600"
                          />
                          <span className="ml-3 text-sm text-[#A0A0A0]">
                            {formData.isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Description */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="description" className="text-[#E0E0E0] font-medium text-sm">
                        Description <span className="text-[#666] font-normal">(Optional)</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Add a brief description to help others understand your quiz..."
                        className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-purple-500/50 focus:ring-purple-500/20 h-16 resize-none transition-all"
                      />
                    </motion.div>

                    {/* Generate Button */}
                    <motion.div variants={itemVariants} className="pt-2">
                      <Button
                        type="submit"
                        disabled={isGenerating || !isFormValid()}
                        className={`w-full h-12 text-base font-semibold transition-all shadow-lg ${
                          !isFormValid() 
                            ? "bg-[#444] text-[#888] cursor-not-allowed" 
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                            Generating Your Quiz...
                          </>
                        ) : !isFormValid() ? (
                          <>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Please fill required fields
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Quiz
                            <ArrowRight className="ml-2 h-5 w-5" />
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
      </div>
    </AppLayout>
  );
} 