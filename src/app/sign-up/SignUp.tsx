import React from 'react';
import Link from 'next/link';
import './SignUp.css';
import Image from 'next/image';

const logo = '/pictures/Food4Thought.png';
const chef = '/pictures/chef.png';

function SignUp() {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevents page reload
        if (!username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
        } else if (password !== confirmPassword) {
            alert("Passwords do not match.");
        } else {
            alert(`Sign up successful for ${username} with email ${email}`);
        // Reset fields after submission
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="SignUp">
        <div className="background-img-3">
            <div className="text-box-3">
            <Image 
                id="Chef-3" 
                src={chef} 
                alt="Chef Image" 
                width={100}
                height={100}
            />
            <br />
            <Image 
                id="Logo-signup" 
                src={logo} 
                alt="Food 4 Thought Logo" 
                width={250}
                height={100}
            />
            <br></br>
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
            <br></br>
            <Link href="/login">Back to Login</Link>
            </div>
        </div>
        </div>
  );
}

export default SignUp;