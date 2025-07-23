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
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Process recovery tokens and set up session
  useEffect(() => {
    if (!hasMounted) return;

    const processRecoveryToken = async () => {
      try {
        // Let Supabase automatically handle the auth callback from the URL
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Getting current session:', { 
          session: data.session,
          error,
          hash: window.location.hash,
          search: window.location.search
        });

        if (data.session) {
          console.log('Valid session found');
          setSessionReady(true);
          
          // Clean up the URL hash for security
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Try to handle the auth callback manually if no session exists
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const type = hashParams.get('type');
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (type === 'recovery' && accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Session setup error:', sessionError);
              setErrorMsg('Failed to validate recovery link. Please try again.');
            } else {
              console.log('Session established successfully');
              setSessionReady(true);
              
              // Clean up the URL hash for security
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }
          } else {
            console.log('No valid recovery tokens found');
            setErrorMsg('Invalid recovery link. Please use the password reset link from your email.');
          }
        }
      } catch (error) {
        console.error('Token processing error:', error);
        setErrorMsg('An error occurred while processing the recovery link.');
      } finally {
        setTokenProcessed(true);
        setIsLoading(false);
      }
    };

    processRecoveryToken();
  }, [hasMounted, searchParams]);

  // Listen for auth state changes (optional - mainly for debugging)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowSuccessAlert(false);

    // Validation
    if (!newPassword || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      setShowSuccessAlert(true);
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Password update error:', error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred while updating password');
      }
    } finally {
      setIsSubmitting(false);
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
                  {errorMsg}
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

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-text">Validating recovery link...</div>
          </div>
        ) : !sessionReady || errorMsg ? (
          <div className="error-container">
            <p>Unable to process password reset. Please request a new password reset link.</p>
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

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="reset-password-button"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default ResetPassword;