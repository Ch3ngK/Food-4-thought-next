'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import './ResetPassword.css';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    // Parse the hash fragment manually from the URL
    const hash = window.location.hash.substring(1); // removes the `#`
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (type === 'recovery' && accessToken) {
      // Log the user in using the recovery token
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') ?? '',
        })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setError('Failed to set session from recovery link.');
          }
          setIsTokenChecked(true);
        });
    } else {
      setError('Missing recovery token. Please use the password reset link from your email.');
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
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    }

    setIsSubmitting(false);
  };

  if (!isTokenChecked && !error) {
    return <p className="text-center mt-10">Verifying token...</p>;
  }

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
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
    </div>
  );
}
