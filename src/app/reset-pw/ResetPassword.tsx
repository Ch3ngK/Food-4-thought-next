'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Avoid server-side rendering issues
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (type === 'recovery' && accessToken) {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? '',
        })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setError('Failed to validate recovery link. Please try again.');
          }
          setTokenProcessed(true);
        });
    } else {
      setError('Missing recovery token. Please use the password reset link from your email.');
      setTokenProcessed(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    }

    setIsSubmitting(false);
  };

  if (!tokenProcessed && !error) {
    return <p className="text-center mt-10">Verifying your reset link...</p>;
  }

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      {!message && (
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
