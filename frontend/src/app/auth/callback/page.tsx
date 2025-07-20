"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Cookies from 'js-cookie';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useUser();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Set the cookie to be accessible by the browser
      Cookies.set('token', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 1 // 1 day
      });
      
      // Fetch the user to update the context
      fetchUser().then(() => {
        router.push('/create');
      });

    } else {
      // Handle cases where the token is not present
      console.error('No token found in callback URL');
      router.push('/login');
    }
  }, [router, searchParams, fetchUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Authenticating...</p>
    </div>
  );
} 