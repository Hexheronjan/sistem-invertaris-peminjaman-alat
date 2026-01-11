'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        const role = data.user.role;
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'petugas') router.push('/petugas/dashboard');
        else router.push('/peminjam/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">

      {/* Background Ambience (Optional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* ROTATING LINE BORDER CONTAINER */}
      {/* We add 'p-[2px]' (padding 2px) to the outer container. The inner content will cover the center, leaving only 2px visible. */}
      {/* Then we spin the background gradient behind it. */}
      <div className="relative w-full max-w-4xl h-[600px] rounded-3xl z-10 overflow-hidden flex items-center justify-center bg-black/50">

        {/* THE SPINNING LINE */}
        {/* We make this div HUGE and spin it. The overflow-hidden on parent cuts it off. */}
        {/* Conic Gradient allows us to make 'segments' of color (Red & Blue) with transparency between them */}
        <div className="absolute w-[150%] h-[150%] animate-spin-slow bg-[conic-gradient(transparent_0deg,#dc2626_80deg,transparent_100deg,transparent_180deg,#2563eb_260deg,transparent_280deg)]"></div>

        {/* 2. Main Card Content (Sits on top, creating the mask) */}
        {/* inset-1 means 4px gap roughly, let's make it tighter. changing wrapper to use padding usually works best or calc */}
        {/* Let's try: Parent has p-[2px]. This div fills 100% height/width */}
        <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-[22px] overflow-hidden flex shadow-2xl relative z-20 backdrop-blur-sm">

          {/* Left Side - Abstract Tech Illustration */}
          <div className="hidden md:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-white/5 bg-black/40">
            <div className="relative w-64 h-64 mb-12">
              {/* Using the CSS animations from globals.css */}
              <div className="absolute inset-0 border-2 border-dashed border-red-500/30 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-4 border border-blue-500/40 rounded-full animate-spin-reverse-slow"></div>
              <div className="absolute inset-[30%] bg-gradient-to-tr from-red-600 to-blue-600 rounded-full blur-xl animate-pulse-glow"></div>
              <div className="absolute inset-[35%] bg-white rounded-full mix-blend-overlay animate-pulse"></div>
              <div className="absolute top-0 left-10 w-2 h-2 bg-blue-400 rounded-full animate-float-random"></div>
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-red-400 rounded-full animate-float-random" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full text-left">
              <div className="typewriter mb-4">
                <h2 className="text-4xl font-bold text-white mb-2">Welcome back!</h2>
              </div>
              <p className="text-slate-400 font-light text-lg animate-fade-in-up delay-300">Aplikasi Inventaris Alat & Laboratorium.</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative z-10 bg-[#0f0f12]/90 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ef4444,transparent_50%),radial-gradient(circle_at_0%_100%,#3b82f6,transparent_50%)] animate-aurora"></div>

            <div className="relative z-10">
              <div className="text-center mb-10 animate-fade-in-up">
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Login Account</h3>
                <p className="text-slate-500 text-sm">Masuk dengan akun yang telah terdaftar.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm animate-fade-in-up rounded-r">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group animate-fade-in-up delay-100">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#1a1a20] border border-white/10 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-all duration-300 shadow-inner"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="username" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 pointer-events-none">Username</label>
                </div>

                <div className="relative group animate-fade-in-up delay-200">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#1a1a20] border border-white/10 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-red-500 peer transition-all duration-300 shadow-inner"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-red-500 pointer-events-none">Password</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(59,130,246,0.6)] transform transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 animate-fade-in-up delay-300 border border-white/10"
                >
                  {loading ? 'Logging in...' : 'Login Now'}
                </button>
              </form>

              <p className="text-center text-slate-600 text-xs mt-10 animate-fade-in-up delay-300">
                &copy; 2026 Aplikasi Inventaris.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
