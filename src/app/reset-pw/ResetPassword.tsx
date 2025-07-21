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
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load Supabase session from hash fragment
  useEffect(() => {
    // First check if we're in the browser (window exists)
    if (typeof window === 'undefined') return;

    // Parse the hash fragment from the URL
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
      const type = params.get('type');
      
      // Supabase password reset links use 'recovery' type
      if (type === 'recovery') {
        // Get the full access token from the hash
        const accessToken = hash.split('access_token=')[1]?.split('&')[0];
        const refreshToken = hash.split('refresh_token=')[1]?.split('&')[0];
        
        if (accessToken && refreshToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          }).then(({ error }) => {
            if (error) {
              console.error("Session error:", error.message);
              setError("Invalid or expired reset link. Please request a new one.");
            } else {
              setSessionLoaded(true);
            }
          });
        } else {
          setError("Missing recovery token. Please use the password reset link from your email.");
        }
      } else {
        setError("Invalid reset link. Please use the password reset link from your email.");
      }
    } else {
      setError("Missing recovery token. Please use the password reset link from your email.");
    }
  }, []);

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

    const { error } = await supabase.auth.updateUser({
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