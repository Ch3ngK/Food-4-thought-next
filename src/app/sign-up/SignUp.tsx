'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './SignUp.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [userIconUrl, setUserIconUrl] = useState('');
  const [passIconUrl, setPassIconUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: user } = supabase.storage.from('pictures').getPublicUrl('user-icon.png');
      const { data: pass } = supabase.storage.from('pictures').getPublicUrl('password-icon.png');
      const { data: chef } = supabase.storage.from('pictures').getPublicUrl('chef.png');

      setLogoUrl(logo.publicUrl);
      setUserIconUrl(user.publicUrl);
      setPassIconUrl(pass.publicUrl);
      setChefUrl(chef.publicUrl);
    };
    loadImages();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowSuccessAlert(false);

    // improved input validation
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        throw error;
      }

      setShowSuccessAlert(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('./login');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred during sign up');
      }
    }
  };

  return (
    <div className="signup-container">
      
      <div className="alert-container-signup">
        <div className="alert-wrapper-signup">
          {showSuccessAlert && (
            <Alert className="alert-signup success">
              <CheckCircle2Icon className="alert-icon-signup" />
              <div>
                <AlertTitle className="alert-title-signup">Sign Up Successful!</AlertTitle>
                <AlertDescription className="alert-description-signup">
                  Please check your email to verify your account. Redirecting you to login...
                </AlertDescription>
              </div>
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="destructive" className="alert-signup error">
              <AlertCircleIcon className="alert-icon-signup" />
              <div>
                <AlertTitle className="alert-title-signup">Error</AlertTitle>
                <AlertDescription className="alert-description-signup">
                  {errorMsg}. Please try again.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>

      <div className="background-img"></div>
      
      <main className="signup-content">
        <div className="logo-section-signup">
          <div className="welcome-text-signup">Welcome to</div>
          {logoUrl && <Image 
            src={logoUrl} 
            alt="Logo" 
            width={200} 
            height={80} 
            className="logo-image"
            priority
          />}
        </div>

        <h1 className="signup-title">Sign Up</h1>

        <form onSubmit={handleSignUp} className="signup-form">
          <div className="input-group">
            <Label htmlFor="username">Username</Label>
            <div className="input-wrapper">
              <Input
                name="username"
                type="text"
                placeholder="Your preferred username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="signup-input"
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
            <Label htmlFor="email">Email</Label>
            <div className="input-wrapper">
              <Input
                name="email"
                type="email"
                placeholder="abc@xyz.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signup-input"
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
                className="signup-input"
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="input-wrapper">
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="signup-input"
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

          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <div className="login-link">
          Already have an account? <Link href="/login">Login here</Link>
        </div>
      </main>
    </div>
  );
}

export default SignUp;