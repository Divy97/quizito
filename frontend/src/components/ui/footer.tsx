"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: "/create", label: "Create Quiz" },
      { href: "/my-quizzes", label: "My Quizzes" },
    ]
  };

  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center group">
              <div className="relative h-24 w-24 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Quizito"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Transform any content into engaging, AI-powered quizzes. Create, share, and compete with friends in seconds.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/Divy97"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-accent"
                aria-label="Visit our GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/ParekhDivy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-accent"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:support@quizito.com"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-accent"
                aria-label="Send us an email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold text-lg">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Quizito. All rights reserved.
            </p>
        
          </div>
        </div>
      </div>
    </footer>
  );
}; 