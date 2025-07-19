"use client";
import { PageBackground } from '@/components/ui/page-background';
import { NewHeroSection } from '@/components/landing/NewHeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { WhyDifferentSection } from '@/components/landing/WhyDifferentSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { UseCaseSection } from '@/components/landing/UseCaseSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {

  return (
    <PageBackground variant="hero">
      <div className="flex flex-col min-h-screen text-[var(--quizito-text-primary)] relative">
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
