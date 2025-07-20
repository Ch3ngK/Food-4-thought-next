'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import './ResetPassword.css';
import Image from 'next/image';
import { Input } from "@/components/ui/input";

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logoUrl, setLogoUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch image URLs
  useEffect(() => {
    const fetchImages = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: chef } = supabase.storage.from('pictures').getPublicUrl('chef.png');
      setLogoUrl(logo.publicUrl);
      setChefUrl(chef.publicUrl);
    };

    if (hasMounted) fetchImages();
  }, [hasMounted]);

  // Set Supabase session from query parameters (for recovery token)
  useEffect(() => {
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Session error:', error.message);
            setError("Invalid or expired link. Please try resetting your password again.");
          } else {
            setSessionLoaded(true);
          }
        });
    } else {
      setError("Missing recovery token. Please use the password reset link from your email.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="reset-password">
      <div className="background-img-rp">
        {chefUrl && (
          <Image id="Chef-rp" src={chefUrl} alt="Chef" width={100} height={100} />
        )}
        <div className="text-box-rp">
          {logoUrl && (
            <Image id="Logo-rp" src={logoUrl} alt="Logo" width={250} height={100} />
          )}
          <br /><br /><br /><br /><br />
          <div className='Reset-pw-text'>Reset Your Password</div>

          {!sessionLoaded ? (
            <div style={{ color: 'red', marginTop: '1rem' }}>{error || 'Loading session...'}</div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-15 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
              />
              <br />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-15 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
              />
              <button className="update-password-button" type="submit">
                Update Password
              </button>
            </form>
          )}

          {error && <div className='rp-error' style={{ color: 'red' }}>{error}</div>}
          {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
