'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './ForgotPassword.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, CheckCircle2Icon, MailIcon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [userIconUrl, setUserIconUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: user } = supabase.storage.from('pictures').getPublicUrl('user-icon.png');
      const { data: chef } = supabase.storage.from('pictures').getPublicUrl('chef.png');

      setLogoUrl(logo.publicUrl);
      setUserIconUrl(user.publicUrl);
      setChefUrl(chef.publicUrl);
    };
    loadImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowSuccessAlert(false);
    setIsLoading(true);

    if (!email) {
      setErrorMsg('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-pw`,
      });

      if (error) {
        throw error;
      }

      setShowSuccessAlert(true);
      setEmail('');
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred while sending reset link');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">

      <div className="alert-container-forgot">
        <div className="alert-wrapper-forgot">
          {showSuccessAlert && (
            <Alert className="alert-forgot success">
              <CheckCircle2Icon className="alert-icon-forgot" />
              <div>
                <AlertTitle className="alert-title-forgot">Reset Link Sent!</AlertTitle>
                <AlertDescription className="alert-description-forgot">
                  A password reset link has been sent to {email}. Redirecting to login...
                </AlertDescription>
              </div>
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="destructive" className="alert-forgot error">
              <AlertCircleIcon className="alert-icon-forgot" />
              <div>
                <AlertTitle className="alert-title-forgot">Error</AlertTitle>
                <AlertDescription className="alert-description-forgot">
                  {errorMsg}. Please try again.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>

      <div className="background-img"></div>
      
      <main className="forgot-password-content">
        <div className="logo-section-forgot">
          <div className="welcome-text-forgot">Welcome to</div>
          {logoUrl && <Image 
            src={logoUrl} 
            alt="Logo" 
            width={200} 
            height={80} 
            className="logo-image-forgot"
            priority
          />}
        </div>

        <h1 className="forgot-password-title">Forgot Password</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="input-group-forgot">
            <Label htmlFor="email">Email Address</Label>
            <div className="input-wrapper-forgot">
              <Input
                name="email"
                type="email"
                placeholder="abc@xyz.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="forgot-password-input"
                disabled={isLoading}
              />
              {userIconUrl ? (
                <Image 
                  src={userIconUrl} 
                  alt="User Icon" 
                  width={20} 
                  height={20} 
                  className="input-icon-forgot"
                />
              ) : (
                <MailIcon className="input-icon-forgot" size={20} />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className={`forgot-password-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="back-to-login">
          <Link href="/login">← Back to Login</Link>
        </div>
      </main>
    </div>
  );
}

export default ForgetPassword;