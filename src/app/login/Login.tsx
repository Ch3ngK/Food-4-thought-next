'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
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

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [userIconUrl, setUserIconUrl] = useState('');
  const [passIconUrl, setPassIconUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  return (
    <div className="App">
      <div className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-4">
      <div className="w-full max-w-md px-4">
      {showSuccessAlert && (
        <Alert className="mb-4 bg-green-100 border-green-200 text-green-700 animate-slideDown">
          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
          <AlertTitle>Successful Login!</AlertTitle>
          <AlertDescription>Redirecting you to the home page...</AlertDescription>
        </Alert>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="mb-0 animate-slideDown">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}. Please try logging in again. </AlertDescription>
          </Alert>
          )}
      </div>
      </div>

      <header className="App-header">
        <div className="background-img-0"></div>
        <div className="text-box">
          {chefUrl && <Image id="Chef" src={chefUrl} alt="Chef Image" width={100} height={100} />}
          <div className="Welcome">Welcome to</div>
          <br />
          {logoUrl && <Image id="Logo" src={logoUrl} alt="Logo" width={250} height={100} />}
          <div className="Login-text">Login</div>
          <br /><br />

          

          <form onSubmit={handleLogin}>
            <div className = "w-full max-w-sm space-y-30">
              <div className="relative space-y-2">
                <Label htmlFor="email">Enter your email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="abc@xyz.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className = "pr-15 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
                />
              {userIconUrl && <Image id="UserIcon" src={userIconUrl} alt="User Icon" width={30} height={30} className="absolute right-2 top-1/2 -translate-y-1" />}
              </div>
            </div>
            <div className="relative space-y-2"> 
              <Label htmlFor="password">Enter your password</Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className = "pr-15 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
                />
              {passIconUrl && <Image id="PassIcon" src={passIconUrl} alt="Password Icon" width={30} height={30} className="absolute right-2 -translate-y-10"/>}
            </div>
            <button type="submit" className="Login-button">Login</button>
          </form>

          <br /><br />
          <div className="Checkbox-container">
            <input 
              type="checkbox" 
              checked = {rememberMe} 
              onChange={() => setRememberMe(!rememberMe)}
              className="Checkbox" />
            <label htmlFor="Remember-me">Remember me</label>
          </div>
          <br /><br />
          <div className="Forgot-password">
            <Link href="/forget-pw/">Forgot password?</Link>
          </div>
          <div className="Sign-up">
            <Link href="/sign-up">Sign up here</Link>
          </div>
          <br /><br />
        </div>
      </header>
    </div>
  );
}

export default Login;
