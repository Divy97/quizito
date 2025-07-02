import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizito - Turn Any Content Into Interactive Quizzes Instantly | AI Quiz Generator",
  description: "Create engaging quizzes from YouTube videos, PDFs, blog posts, or any topic in seconds. AI-powered quiz generator with public leaderboards and instant sharing. No signup required.",
  keywords: [
    "quiz generator",
    "AI quiz maker",
    "YouTube quiz",
    "interactive quiz",
    "online quiz tool",
    "quiz from video",
    "quiz from PDF",
    "education technology",
    "e-learning",
    "quiz creation",
    "instant quiz",
    "quiz sharing",
    "leaderboard quiz"
  ],
  authors: [{ name: "Divy Parekh" }],
  creator: "Divy Parekh",
  publisher: "Quizito",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://quizito.com'), // Update with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Quizito - AI-Powered Quiz Generator | Turn Any Content Into Quizzes",
    description: "Transform YouTube videos, PDFs, articles, or any topic into engaging interactive quizzes in seconds. Share with friends and compete on leaderboards.",
    url: 'https://quizito.com',
    siteName: 'Quizito',
    images: [
      {
        url: '/og-image.png', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Quizito - AI Quiz Generator Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Quizito - Turn Any Content Into Interactive Quizzes",
    description: "AI-powered quiz generator that transforms YouTube videos, PDFs, and articles into engaging quizzes instantly. Free to use!",
    images: ['/og-image.png'], // Same image as OG
    creator: '@your_twitter_handle', // Update with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
  category: 'education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Quizito",
              "applicationCategory": "EducationalApplication",
              "description": "AI-powered quiz generator that transforms any content into interactive quizzes instantly",
              "url": "https://quizito.com",
              "author": {
                "@type": "Person",
                "name": "Divy Parekh"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "operatingSystem": "Web Browser",
              "softwareVersion": "1.0",
              "datePublished": "2024-01-01",
              "features": [
                "YouTube video quiz generation",
                "PDF document quiz creation",
                "Blog post quiz conversion",
                "Public leaderboards",
                "Instant sharing",
                "No signup required"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#0D0D0D] text-[#E0E0E0]`}>
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
