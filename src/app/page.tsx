"use client";
import { useState, useEffect } from 'react';
import { PageBackground } from '@/components/ui/page-background';
import { HeroSection } from '@/components/landing/HeroSection';
import { StepsSection } from '@/components/landing/StepsSection';
import { InputTypesSection } from '@/components/landing/InputTypesSection';
import { CTASection } from '@/components/landing/CTASection';
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
      <div className="flex flex-col min-h-screen text-[#E0E0E0] relative">
        {/* Cursor Glow Effect */}
        <div
          className="fixed w-96 h-96 pointer-events-none z-50"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <main className="flex-1 relative z-10">
          <HeroSection />
          <StepsSection />
          <InputTypesSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </PageBackground>
  );
}
