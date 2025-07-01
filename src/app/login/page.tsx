"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { handleSignInWithGoogle } from "./actions";
import { AppLayout } from "@/components/ui/app-layout";

export default function LoginPage() {
  return (
    <AppLayout>
      <div className="flex h-full items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-sm bg-[#1E1E1E] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-center text-[#E0E0E0]">Welcome to Quizito</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                await handleSignInWithGoogle();
              }}
            >
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 