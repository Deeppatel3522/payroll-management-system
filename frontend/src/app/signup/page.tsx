"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserPlus, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignUp() {
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/signup', {
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);

            // New users are employees by default, so send to employee dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            {/* Main Card */}
            <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 relative overflow-hidden">

                {/* Decorative Background Element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />

                <div className="relative">
                    <header className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-200 animate-in zoom-in duration-500">
                            <UserPlus size={28} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get Started</h1>
                        <p className="text-slate-500 mt-2 font-medium">Create your employee account</p>
                    </header>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-red-100 p-1 rounded-full">
                                <ShieldCheck size={14} />
                            </div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="john@company.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <footer className="mt-10 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?
                            <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 ml-2 transition-colors">
                                Log In
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}