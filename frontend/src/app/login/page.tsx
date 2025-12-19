"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link'; // 1. Import Link

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("❌ Login failed:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Check if backend is running");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-[440px] m-auto bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-200">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 mt-2 font-medium">Sign in to your account</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                    </button>
                </form>

                {/* 2. THE SIGN UP LINK */}
                <footer className="mt-10 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an account?
                        <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 ml-2 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}