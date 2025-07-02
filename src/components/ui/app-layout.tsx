"use client";

import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { PageBackground } from "./page-background";

interface AppLayoutProps {
  children: ReactNode;
  backgroundVariant?: "default" | "hero" | "minimal";
}

export const AppLayout = ({ children, backgroundVariant = "default" }: AppLayoutProps) => {
  return (
    <PageBackground variant={backgroundVariant}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </PageBackground>
  );
}; 