'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [userIconUrl, setUserIconUrl] = useState('');
  const [passIconUrl, setPassIconUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [googleIconUrl, setGoogleIconUrl] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: user } = supabase.storage.from('pictures').getPublicUrl('user-icon.png');
      const { data: pass } = supabase.storage.from('pictures').getPublicUrl('password-icon.png');
      const { data: chef } = supabase.storage.from('pictures').getPublicUrl('chef.png');
      const { data: google } = supabase.storage.from('pictures').getPublicUrl('googleIcon.png');

      setLogoUrl(logo.publicUrl);
      setUserIconUrl(user.publicUrl);
      setPassIconUrl(pass.publicUrl);
      setChefUrl(chef.publicUrl);
      setGoogleIconUrl(google.publicUrl);
    };
    loadImages();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowSuccessAlert(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setShowSuccessAlert(true);
      
      await new Promise(resolve => setTimeout(resolve, 700));
      router.push('./home');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred during login');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });

      if (error) {
        throw error;
      }

      // the redirect will happen automatically, so we don't need to do anything else here
    } catch (error) {
      setIsGoogleLoading(false);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An error occurred during Google sign-in');
      }
    }
  };

  return (
    <div className="login-container">

  <div className="alert-container-login">
  <div className="alert-wrapper-login">
    {showSuccessAlert && (
      <Alert className="alert-login success">
        <CheckCircle2Icon className="alert-icon-login" />
        <div>
          <AlertTitle className="alert-title-login">Successful Login!</AlertTitle>
          <AlertDescription className="alert-description-login">
            Redirecting you to the home page...
          </AlertDescription>
        </div>
      </Alert>
    )}
    {errorMsg && (
      <Alert variant="destructive" className="alert-login error">
        <AlertCircleIcon className="alert-icon-login" />
        <div>
          <AlertTitle className="alert-title-login">Error</AlertTitle>
          <AlertDescription className="alert-description-login">
            {errorMsg}. Please try logging in again.
          </AlertDescription>
        </div>
      </Alert>
    )}
  </div>
</div>

      <div className="background-img"></div>
      
      <main className="login-content">
        <div className="logo-section-login">
          {chefUrl && <Image
            src={chefUrl} 
            alt="Chef Image" 
            width={80} 
            height={80} 
            className="chef-image-login"
            priority
          />}
          <div className="welcome-text-login">Welcome to</div>
          {logoUrl && <Image 
            src={logoUrl} 
            alt="Logo" 
            width={200} 
            height={80} 
            className="logo-image"
            priority
          />}
        </div>

        <h1 className="login-title">Login</h1>

        {/* google sign in Button */}
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="google-login-button"
        >
          <div className="google-button-content">
            {googleIconUrl && (
              <Image 
                src={googleIconUrl} 
                alt="Google Icon" 
                width={20} 
                height={20} 
                className="google-icon"
              />
            )}
            <span>{isGoogleLoading ? 'Signing in...' : 'Sign In with Google'}</span>
          </div>
        </button>

        {/* Divider */}
        <div className="login-divider">
          <div className="divider-line"></div>
          <span className="divider-text">or</span>
          <div className="divider-line"></div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <Label htmlFor="email">Email</Label>
            <div className="input-wrapper">
              <Input
                name="email"
                type="email"
                placeholder="abc@xyz.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
              {userIconUrl && <Image 
                src={userIconUrl} 
                alt="User Icon" 
                width={20} 
                height={20} 
                className="input-icon"
              />}
            </div>
          </div>

          <div className="input-group">
            <Label htmlFor="password">Password</Label>
            <div className="input-wrapper">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
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

          <div className="remember-forgot">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)}
                className="checkbox-login"
              />
              Remember me
            </label>
            <Link href="/forget-pw/" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="sign-up-link">
          Don't have an account? <Link href="/sign-up">Sign up here</Link>
        </div>
      </main>
    </div>
  );
}

export default Login;