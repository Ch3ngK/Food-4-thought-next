'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input"

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [userIconUrl, setUserIconUrl] = useState('');
  const [passIconUrl, setPassIconUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');

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
            <div>
              <Input
                className="Username"
                name="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {userIconUrl && <Image id="UserIcon" src={userIconUrl} alt="User Icon" width={40} height={40} />}
            </div>
            <div>
              <Input
                className="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passIconUrl && <Image id="PassIcon" src={passIconUrl} alt="Password Icon" width={40} height={40} />}
            </div>
            <button type="submit" className="Login-button">Login</button>
          </form>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <br /><br />
          <div className="Checkbox-container">
            <input type="checkbox" className="Checkbox" />
            <label htmlFor="Remember-me">Remember me</label>
          </div>
          <br /><br />
          <div className="Forgot-password">
            <Link href="/forget-pw/">Forgot password?</Link>
          </div>
          <div className="Sign-up">
            <Link href="/sign-up">Sign up</Link>
          </div>
          <br /><br />
        </div>
      </header>
    </div>
  );
}

export default Login;
