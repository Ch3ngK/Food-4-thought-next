'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './SignUp.css';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input"

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🟡 New image URLs
  const [logoUrl, setLogoUrl] = useState('');
  const [chefUrl, setChefUrl] = useState('');

  useEffect(() => {
    const fetchImageUrls = async () => {
      const { data: logo } = supabase.storage.from('pictures').getPublicUrl('Food4Thought.png');
      const { data: chef } = supabase.storage.from('pictures').getPublicUrl('chef.png');

      setLogoUrl(logo.publicUrl);
      setChefUrl(chef.publicUrl);
    };

    fetchImageUrls();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
    } else if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error && !data?.user) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Signup successful! Please check your email to confirm.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    }
  };

  return (
    <div className="SignUp">
      <div className="background-img-3">
        <div className="text-box-3">
          {chefUrl && <Image id="Chef-3" src={chefUrl} alt="Chef Image" width={100} height={100} />}
          <br />
          {logoUrl && <Image id="Logo-signup" src={logoUrl} alt="Food 4 Thought Logo" width={250} height={100} />}
          <br />
          <div className="Sign-up-text">Sign up</div>
          <div className="flex flex-col space-y-2 mx-auto translate-x-8 translate-y-2">
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className = "pr-10 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
            />
            <br />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className = "pr-10 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
            />
            <br />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className = "pr-10 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
            />
            <br />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className = "pr-10 focus-visible:ring-3 focus-visible:ring-orange-500 focus:border-orange-500"
            />
            <br />
            <button type="submit" className = "-translate-x-8">Sign Up</button>
          </form>
          </div>
          

          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

          <br />
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;