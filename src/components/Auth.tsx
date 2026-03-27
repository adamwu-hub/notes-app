'use client';

import { useState } from 'react';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAction = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        if (isLogin) {
          onLogin();
        } else {
          alert('Registered! Now please login.');
          setIsLogin(true);
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Authentication failed');
      }
    } catch (e) {
      setError('An error occurred');
    }
  };

  return (
    <div className="auth-view">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <input
        type="text"
        className="full-width"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="full-width"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAction} className="btn-primary">
        {isLogin ? 'Login' : 'Register'}
      </button>
      <button onClick={() => setIsLogin(!isLogin)} className="btn-outline">
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}
