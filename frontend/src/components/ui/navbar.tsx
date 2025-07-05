"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, Plus, User, LogOut, History } from "lucide-react";
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md shadow-sm">
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
          <div className="hidden md:flex items-center space-x-1">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 px-4 py-2 rounded-lg hover:bg-accent font-medium"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted border border-border">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={getDisplayName()}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-foreground font-medium">{getDisplayName()}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  title="Sign Out"
                  className="hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="vibrant" size="lg" className="font-semibold px-6">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-accent"
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
            className="md:hidden border-t py-6 space-y-4 bg-card mt-2 mx-2 mb-2 rounded-xl shadow-lg"
          >
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-3 rounded-lg hover:bg-accent font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t">
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-lg" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-muted border border-border">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={getDisplayName()}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground font-medium">{getDisplayName()}</span>
                      <span className="text-xs text-muted-foreground">{getDisplayEmail()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="vibrant" size="lg" className="w-full font-semibold">
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