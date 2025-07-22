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
    if (typeof window === 'undefined') return;

    // Handle both hash and query parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    const type = hashParams.get('type') || queryParams.get('type');
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

    if (type === 'recovery' && accessToken) {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? '',
        })
        .then(({ error }) => {
          if (error) {
            setError('Failed to validate recovery link. Please try again.');
            console.error(error);
          }
          // Clear the URL parameters after processing
          window.history.replaceState({}, document.title, window.location.pathname);
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

    // Password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error(error);
      if (error.message.includes('invalid refresh token')) {
        setError('Password reset link has expired. Please request a new one.');
      } else {
        setError(error.message);
      }
    } else {
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    }

    setIsSubmitting(false);
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      message: `Password must be at least ${minLength} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.`
    };
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