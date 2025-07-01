"use client";

import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function MyQuizzesPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2">My Quizzes</h1>
              <p className="text-[#A0A0A0]">Manage and view all your created quizzes</p>
            </div>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create New Quiz
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="h-16 w-16 text-[#A0A0A0] mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">
                  No quizzes yet
                </h3>
                <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
                  You haven't created any quizzes yet. Start by creating your first quiz from any content you like.
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 