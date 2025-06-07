'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import './ResetPassword.css'
import Image from 'next/image';

const logo = '/pictures/Food4Thought.png';
const chef = '/pictures/chef.png';

function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="reset-password">
        <div className="background-img-rp">
            <Image
                    id="Chef-rp"
                    src={chef}
                    alt="Chef Image"
                    width={100}
                    height={100}
                />
            <div className="text-box-rp">
                <Image 
                    id="Logo-rp" 
                    src={logo} 
                    alt="Food 4 Thought Logo" 
                    width={250} 
                    height={100} 
                />
                <br></br><br></br><br></br><br></br><br></br>
                <div className='Reset-pw-text'>Reset Your Password</div>
                <form onSubmit={handleResetPassword}>
                    <input
                    className="new-password"
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <input
                    className="confirm-new-password"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem' }}
                    />
                    <button 
                        className="update-password-button" 
                        type="submit"
                    >Update Password
                    </button>
                </form>
                {error && <div className='rp-error' style={{ color: 'red' }}>{error}</div>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </div>    
        </div>
    </div>
    );
    }

export default ResetPassword;