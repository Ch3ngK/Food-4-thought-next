'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../supabaseClient'; 

const logo = '/pictures/Food4Thought.png';
const userIcon = '/pictures/user-icon.png';
const passIcon = '/pictures/password-icon.png';
const chef = '/pictures/chef.png';

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
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
          <Image id="Chef" src={chef} alt="Chef Image" width={100} height={100} />
          <div className="Welcome">Welcome to</div>
          <br />
          <Image id="Logo" src={logo} alt="Food 4 Thought Logo" width={250} height={100} />
          <div className="Login-text">Login</div>
          <br /><br />
          <form onSubmit={handleLogin}>
            <div>
              <input
                className="Username"
                name="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Image id="UserIcon" src={userIcon} alt="User Icon" width={40} height={40} />
            </div>
            <div>
              <input
                className="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Image id="PassIcon" src={passIcon} alt="Password Icon" width={40} height={40} />
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