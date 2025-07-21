'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import './ResetPassword.css';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const handleReset = async () => {
      // Check if running in browser
      if (typeof window === 'undefined') return;

      // Debug: Log the URL details
      console.log('URL:', window.location.href);
      console.log('Hash:', window.location.hash);

      const hash = window.location.hash.substring(1); // Remove #
      if (!hash) {
        setError("Invalid reset link. Please use the link from your email.");
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (type !== 'recovery' || !accessToken || !refreshToken) {
        setError("Invalid reset link format. Please use the link from your email.");
        return;
      }

      // Set session with tokens
      const { error: authError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (authError) {
        console.error('Auth error:', authError);
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      setSessionLoaded(true);
      // Clean URL by removing hash
      window.history.replaceState(null, '', window.location.pathname);
    };

    handleReset();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!sessionLoaded) {
      setError("Session not ready. Please try again.");
      return;
    }

try {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  
  setMessage("Password updated! Redirecting to login...");
  setTimeout(() => router.push('/login'), 2000);
} catch (err: unknown) {
  console.error('Update error:', err);
  setError(
    err instanceof Error ? err.message : "Password update failed. Please try again."
  );
}

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      
      <form onSubmit={handleSubmit} className="reset-form">
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />

        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <Button type="submit" disabled={!sessionLoaded}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
}