'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('./home');
      alert("Successful Login!");
    }
  };

  return (
    <div className="App">
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
          {errorMsg && <div className="error-message">{errorMsg}</div>}
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
