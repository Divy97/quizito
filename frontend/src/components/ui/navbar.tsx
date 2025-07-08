"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, Plus, User, LogOut, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useUser();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { href: "/create", label: "Create Quiz", icon: Plus },
    { href: "/my-quizzes", label: "My Quizzes", icon: History },
  ];

  const getDisplayName = () => {
    if (!user) return "";
    return user.username || user.email;
  };

  const getDisplayEmail = () => {
    if (!user) return "";
    return user.email;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--quizito-glass-surface)] backdrop-blur-2xl border-b border-[var(--quizito-glass-border)] shadow-lg shadow-[var(--quizito-electric-blue)]/5">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-32 w-28 transition-transform duration-200 group-hover:scale-105">
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
          <div className="hidden md:flex items-center space-x-2">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-[var(--quizito-text-secondary)] hover:text-[var(--quizito-electric-blue)] transition-all duration-200 px-4 py-2 rounded-xl hover:bg-[var(--quizito-electric-blue)]/10 font-medium"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="h-10 w-24 bg-[var(--quizito-glass-surface)] animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--quizito-glass-surface)] border border-[var(--quizito-glass-border)]">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={getDisplayName()}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-[var(--quizito-electric-blue)]" />
                  )}
                  <span className="text-sm text-[var(--quizito-text-primary)] font-medium">{getDisplayName()}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  title="Sign Out"
                  className="hover:text-[var(--quizito-hot-pink)] hover:bg-[var(--quizito-hot-pink)]/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--quizito-text-primary)] hover:text-[var(--quizito-electric-blue)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--quizito-electric-blue)]/10"
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
            className="md:hidden border-t border-[var(--quizito-glass-border)] py-6 space-y-4 bg-[var(--quizito-glass-surface)] mt-2 mx-2 mb-2 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 text-[var(--quizito-text-secondary)] hover:text-[var(--quizito-electric-blue)] transition-colors duration-200 px-4 py-3 rounded-xl hover:bg-[var(--quizito-electric-blue)]/10 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t border-[var(--quizito-glass-border)]">
              {isLoading ? (
                <div className="h-10 bg-[var(--quizito-glass-surface)] animate-pulse rounded-lg" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[var(--quizito-glass-surface)] border border-[var(--quizito-glass-border)]">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={getDisplayName()}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-[var(--quizito-electric-blue)]" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--quizito-text-primary)] font-medium">{getDisplayName()}</span>
                      <span className="text-xs text-[var(--quizito-text-muted)]">{getDisplayEmail()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start hover:text-[var(--quizito-hot-pink)] hover:bg-[var(--quizito-hot-pink)]/10"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[var(--quizito-electric-blue)] to-[var(--quizito-neon-purple)] text-white font-semibold py-3 rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-300">
                    <Sparkles className="mr-2 h-4 w-4" />
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