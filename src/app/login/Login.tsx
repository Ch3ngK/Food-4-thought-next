import React from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';
import Image from 'next/image';
import Link from 'next/link';

const logo = '/pictures/Food4Thought.png';
const userIcon = '/pictures/user-icon.png';
const passIcon = '/pictures/password-icon.png';
const chef = '/pictures/chef.png';

function Login() {
  const router = useRouter();

  return (
    <div className="App">
      <header className="App-header">
        <div className="background-img-0"></div>
        <div className="text-box">
          <Image
            id="Chef"
            src={chef}
            alt="Chef Image"
            width={100}
            height={100}
          />
          <div className="Welcome">Welcome to</div>
          <br />
          <Image
            id="Logo"
            src={logo}
            alt="Food 4 Thought Logo"
            width={250}
            height={100}
          />
          <div className="Login-text">Login</div>
          <br />
          <br />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push('/home');
            }}
          >
            <div>
              <input
                className="Username"
                name="username"
                type="text"
                placeholder="Username"
                required
              />
              <Image
                id="UserIcon"
                src={userIcon}
                alt="User Icon"
                width={40}
                height={40}
              />
            </div>
            <div>
              <input
                className="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <Image
                id="PassIcon"
                src={passIcon}
                alt="Password Icon"
                width={40}
                height={40}
              />
            </div>
            <button type="submit" className="Login-button">Login</button>
          </form>
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
            <a href="/sign-up">Sign up</a>
          </div>
          <br /><br />
        </div>
      </header>
    </div>
  );
}

export default Login;
