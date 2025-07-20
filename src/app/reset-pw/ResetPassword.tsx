'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import './ResetPassword.css';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logoUrl, setLogoUrl] = useState('');
  const [passIconUrl, setPassIconUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: pass } = supabase.storage.from('pictures').getPublicUrl('password-icon.png');

      setLogoUrl(logo.publicUrl);
      setPassIconUrl(pass.publicUrl);
    };

    if (hasMounted) {
      loadImages();
    }
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
            setErrorMsg("Invalid or expired link. Please try resetting your password again.");
          } else {
            setSessionLoaded(true);
          }
        });
    } else {
      setErrorMsg("Missing recovery token. Please use the password reset link from your email.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowSuccessAlert(false);

    // improved data input validation
    if (!newPassword || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      setShowSuccessAlert(true);
      setNewPassword('');
      setConfirmPassword('');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred while updating password');
      }
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="reset-password-container">
      
      <div className="alert-container-reset">
        <div className="alert-wrapper-reset">
          {showSuccessAlert && (
            <Alert className="alert-reset success">
              <CheckCircle2Icon className="alert-icon-reset" />
              <div>
                <AlertTitle className="alert-title-reset">Password Updated!</AlertTitle>
                <AlertDescription className="alert-description-reset">
                  Your password has been successfully updated. Redirecting you to login...
                </AlertDescription>
              </div>
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="destructive" className="alert-reset error">
              <AlertCircleIcon className="alert-icon-reset" />
              <div>
                <AlertTitle className="alert-title-reset">Error</AlertTitle>
                <AlertDescription className="alert-description-reset">
                  {errorMsg} Please try again.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>

      <div className="background-img"></div>
      
      <main className="reset-password-content">
        <div className="logo-section-reset">
          <div className="welcome-text-reset">Welcome back to</div>
          {logoUrl && <Image 
            src={logoUrl} 
            alt="Logo" 
            width={200} 
            height={80} 
            className="logo-image"
            priority
          />}
        </div>

        <h1 className="reset-password-title">Reset Your Password</h1>

        {!sessionLoaded ? (
          <div className="loading-container">
            <div className="loading-text">Loading session...</div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="reset-password-form">
            <div className="input-group">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="input-wrapper">
                <Input
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="reset-password-input"
                />
                {passIconUrl && <Image 
                  src={passIconUrl} 
                  alt="Password Icon" 
                  width={20} 
                  height={20} 
                  className="input-icon"
                />}
              </div>
            </div>

            <div className="input-group">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="input-wrapper">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="reset-password-input"
                />
                {passIconUrl && <Image 
                  src={passIconUrl} 
                  alt="Password Icon" 
                  width={20} 
                  height={20} 
                  className="input-icon"
                />}
              </div>
            </div>

            <button type="submit" className="reset-password-button">Update Password</button>
          </form>
        )}
      </main>
    </div>
  );
}

export default ResetPassword;