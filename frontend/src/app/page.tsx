"use client";
import { useState, useEffect } from 'react';
import { PageBackground } from '@/components/ui/page-background';
import { NewHeroSection } from '@/components/landing/NewHeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { WhyDifferentSection } from '@/components/landing/WhyDifferentSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { UseCaseSection } from '@/components/landing/UseCaseSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <PageBackground variant="hero">
      <div className="flex flex-col min-h-screen text-[var(--quizito-text-primary)] relative">
        {/* Cursor Glow Effect */}
        <div
          className="fixed w-96 h-96 pointer-events-none z-50"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <main className="flex-1 relative z-10">
          <NewHeroSection />
          <ProblemSolutionSection />
          <WhyDifferentSection />
          <SocialProofSection />
          <UseCaseSection />
          <FinalCTASection />
        </main>

        <Footer />
      </div>
    </PageBackground>
  );
}
