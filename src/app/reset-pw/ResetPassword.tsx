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
  const [logoUrl, setLogoUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load Supabase session from hash fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
      const at = params.get('access_token');
      const rt = params.get('refresh_token');

      if (at && rt) {
        setAccessToken(at);
        setRefreshToken(rt);
      } else {
        setError("Missing recovery token. Please use the password reset link from your email.");
      }
    } else {
      setError("Missing recovery token. Please use the password reset link from your email.");
    }
  }, []);

  // Set session once tokens are available
  useEffect(() => {
    const setSession = async () => {
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error("Session error:", error.message);
          setError("Invalid or expired reset link. Please request a new one.");
        } else {
          setSessionLoaded(true);
        }
      }
    };

    setSession();
  }, [accessToken, refreshToken]);

  // Load assets (optional)
  useEffect(() => {
    setLogoUrl('/logo.svg'); // replace with your actual logo
    setChefUrl('/chef-icon.svg'); // replace with your actual image
  }, []);

  // Handle password reset submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!sessionLoaded) {
      setError("Session not established. Please retry with the link from your email.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  return (
    <div className="reset-password-container">
      {logoUrl && (
        <Image src={logoUrl} alt="Logo" width={100} height={100} className="logo" />
      )}

      <h2>Reset Your Password</h2>

      <form onSubmit={handleSubmit} className="reset-form">
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <Button type="submit">Reset Password</Button>
      </form>

      {chefUrl && (
        <Image src={chefUrl} alt="Chef" width={150} height={150} className="chef-image" />
      )}
    </div>
  );
}
