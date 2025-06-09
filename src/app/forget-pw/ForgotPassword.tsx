'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
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

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-pw`,
  });

  if (error) {
    alert(`Error: ${error.message}`);
  } else {
    alert(`A password reset link has been sent to ${email}`);
    setEmail('');
  }
};

  return (
    <div className="ForgotPassword">
      <div className="background-img-2">
        <div className="text-box-2">
          {chefUrl && (
            <Image id="Chef-2" src={chefUrl} alt="Chef Image" width={100} height={100} />
          )}
          <br></br><br></br><br></br><br></br><br></br>
          {logoUrl && (
            <Image id="Logo-fp" src={logoUrl} alt="Food 4 Thought Logo" width={250} height={100} />
          )}
          <div className="Forgot-password-text">Forgot Password</div>
          <br></br>
          <p>Please enter your email below to reset your password.</p>
          <br></br>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <br /><br />
            <button className="Submit-2" type="submit">
              Send Reset Link
            </button>
          </form>
          <br /><br />
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;