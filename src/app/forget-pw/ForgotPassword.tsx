import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const logo = '/pictures/Food4Thought.png';
const chef = '/pictures/chef.png';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`A password reset link has been sent to ${email}`);
      setEmail('');
    } else {
      alert("Please enter your email address.");
    }
  };

  return (
    <div className="ForgotPassword">
      <div className="background-img-2">
        <div className="text-box-2">
          <Image
            id="Chef-2"
            src={chef}
            alt="Chef Image"
            width={100}
            height={100}
          />
          <br></br><br></br><br></br><br></br><br></br>
          <Image
            id="Logo-fp"
            src={logo}
            alt="Food 4 Thought Logo"
            width={250}
            height={100}
          />
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