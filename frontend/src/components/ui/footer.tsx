"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Mail, Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: "/create", label: "Create Quiz" },
      { href: "/my-quizzes", label: "My Quizzes" },
      { href: "/explore", label: "Explore Public Quizzes" },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/feedback", label: "Send Feedback" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  };

  return (
    <footer className="w-full border-t border-[#2A2A2A] bg-[#0D0D0D]">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-24 w-24">
                <Image
                  src="/logo.png"
                  alt="Quizito"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-[#A0A0A0] text-sm max-w-md">
              Transform any content into engaging, AI-powered quizzes. Create, share, and compete with friends in seconds.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/Divy97"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-purple-400 transition-colors"
                aria-label="Visit our GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/ParekhDivy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-sky-400 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:support@quizito.com"
                className="text-[#A0A0A0] hover:text-green-400 transition-colors"
                aria-label="Send us an email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-[#E0E0E0] font-semibold">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-[#E0E0E0] font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-[#E0E0E0] font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2A2A2A] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-[#A0A0A0] text-sm">
              © {currentYear} Quizito. All rights reserved.
            </p>
            <p className="flex items-center text-[#A0A0A0] text-sm">
              Made with{" "}
              <Heart className="h-4 w-4 mx-1 text-red-500" />
              for learning
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 