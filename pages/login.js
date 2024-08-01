// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      setError('Invalid login credentials. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.log('Error logging in with Google:', error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <form className="p-10 bg-base-100 shadow-lg rounded-lg" onSubmit={handleLogin}>
        <h2 className="text-2xl mb-6">Login</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <div className="mb-4">
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account? <Link href="/signup" className="text-blue-500">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
