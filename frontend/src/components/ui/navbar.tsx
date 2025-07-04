"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, Plus, User, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const handleSignOut = () => {}

  const isAuthenticated = false;

  const navItems = [
    { href: "/create", label: "Create Quiz", icon: Plus },
    { href: "/my-quizzes", label: "My Quizzes", icon: History },
  ];

  const getUserEmail = () => {
    return "User";
  };

  const getDisplayName = () => {
    const email = getUserEmail();
    return email.length > 20 ? email.substring(0, 17) + "..." : email;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#2A2A2A] bg-[#0D0D0D]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0D0D0D]/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-36 w-32">
              <Image
                src="/logo.png"
                alt="Quizito"
                className="object-contain"
                priority
                fill
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-[#A0A0A0] hover:text-white transition-colors duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-20 bg-[#2A2A2A] animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A]">
                  <User className="h-4 w-4 text-[#6366F1]" />
                  <span className="text-sm text-[#E0E0E0]">{getDisplayName()}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A] transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] hover:from-[#5B5CF6] hover:to-[#10B981] text-white transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#E0E0E0] hover:text-white transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-[#2A2A2A] py-4 space-y-4"
          >
            {isAuthenticated && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-[#A0A0A0] hover:text-white transition-colors duration-200 px-2 py-2 rounded-md hover:bg-[#1E1E1E]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t border-[#2A2A2A]">
              {loading ? (
                <div className="h-9 bg-[#2A2A2A] animate-pulse rounded-md" />
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A]">
                    <User className="h-4 w-4 text-[#6366F1]" />
                    <span className="text-sm text-[#E0E0E0]">{getDisplayName()}</span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A] transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] hover:from-[#5B5CF6] hover:to-[#10B981] text-white transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}; 