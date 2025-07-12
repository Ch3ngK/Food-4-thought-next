'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './SignUp.css';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";



function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const router = useRouter();

  // new image URLs
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
    setErrorMsg(false);
    setSuccessMsg(false);

    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg(true);
    } else if (password !== confirmPassword) {
      setErrorMsg(true);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error && !data?.user) {
        setErrorMsg(true);
      } else {
        setSuccessMsg(true);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('./login');
      }
    }
  };

  return (

    <div className="SignUp">
      
      <div className="background-img-3">
      <div className="top-0 left-0 right-0 flex justify-center z-50 pt-4">
        <div className="w-full max-w-md px-4 flex justify-center">
        {successMsg && (
          <Alert className="mb-4 bg-green-100 border-green-200 text-green-700 animate-slideDown">
          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
          <AlertTitle>Signup Successful !</AlertTitle>
          <AlertDescription>Redirecting you to the login page to log in...</AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="mb-0 animate-slideDown">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}. Please try signing up again. </AlertDescription>
          </Alert>
        )}
      
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
    </div>
    </div>
   
  );
}

export default SignUp;