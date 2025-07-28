"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useUser();

  const handleCallback = useCallback(async () => {
    const token = searchParams.get('token');

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      try {
        // Fetch the user to update the context
        await fetchUser();
        // Redirect to create page after successful authentication
        router.push('/create');
      } catch (error) {
        console.error('Failed to fetch user after authentication:', error);
        router.push('/login');
      }
    } else {
      // Handle cases where the token is not present
      console.error('No token found in callback URL');
      router.push('/login');
    }
  }, [searchParams, fetchUser, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Authenticating...</p>
    </div>
  );
} 