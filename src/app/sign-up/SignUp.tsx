'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './SignUp.css';
import Image from 'next/image';
import { supabase } from '../supabaseClient'; 

const logo = '/pictures/Food4Thought.png';
const chef = '/pictures/chef.png';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
          data: {
            username: username, // stores in user_metadata
          }
        }
      });

      if (error && !data?.user) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Signup successful! Please check your email to confirm.');
        // Optionally redirect to login
        // router.push('/login');
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
          <Image id="Chef-3" src={chef} alt="Chef Image" width={100} height={100} />
          <br />
          <Image id="Logo-signup" src={logo} alt="Food 4 Thought Logo" width={250} height={100} />
          <br />
          <div className="Sign-up-text">Sign up</div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <br />
            <button type="submit">Sign Up</button>
          </form>

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