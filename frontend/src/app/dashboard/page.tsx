"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    TrendingUp, Receipt, Calendar, Loader2,
    LogOut, Plus, X, Clock, CheckCircle2, XCircle, ChevronRight, Wallet
} from 'lucide-react';

export default function EmployeeDashboard() {
    const [slips, setSlips] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
    const [submitting, setSubmitting] = useState(false);

    const router = useRouter();

    const fetchEmployeeData = async () => {
        try {
            const [sRes, eRes] = await Promise.all([
                api.get('/salary-slip'),
                api.get('/expense')
            ]);
            setSlips(sRes.data);
            setExpenses(eRes.data);
        } catch (err) {
            console.error("Error loading dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/expense', newExpense);
            setNewExpense({ description: '', amount: '' });
            setIsModalOpen(false);
            fetchEmployeeData();
        } catch (err) {
            alert("Failed to submit expense");
        } finally {
            setSubmitting(false);
        }
    };

    // --- NEW: YTD Calculation Logic ---
    const currentYear = new Date().getFullYear().toString(); // "2025"

    const ytdEarnings = slips
        .filter((slip: any) => slip.month.includes(currentYear))
        .reduce((acc, curr: any) => acc + Number(curr.amount), 0);

    const approvedExpenses = expenses
        .filter((exp: any) => exp.status === 'approved')
        .reduce((acc, curr: any) => acc + Number(curr.amount), 0);

    const pendingExpenses = expenses
        .filter((exp: any) => exp.status === 'pending' || !exp.status)
        .reduce((acc, curr: any) => acc + Number(curr.amount), 0);

    // --- Grouping Slips by Year for Modal ---
    const groupedSlips = slips.reduce((acc: any, slip: any) => {
        const yearMatch = slip.month.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : 'Other';
        if (!acc[year]) acc[year] = [];
        acc[year].push(slip);
        return acc;
    }, {});

    const sortedYears = Object.keys(groupedSlips).sort((a, b) => Number(b) - Number(a));

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Payroll</h1>
                    <p className="text-slate-500 font-medium">Manage your earnings and expenses.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                        <Plus size={18} /> Claim Expense
                    </button>
                    <button onClick={handleLogout} className="bg-white border px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-sm shadow-sm">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Stat 1: YTD Earnings (Updated) */}
                <div
                    onClick={() => setIsSlipModalOpen(true)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div className="p-3 rounded-2xl bg-blue-50 w-fit mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Earnings YTD ({currentYear})</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold text-slate-900">${ytdEarnings.toLocaleString()}</h3>
                        <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            View History <ChevronRight size={12} />
                        </span>
                    </div>
                </div>

                {/* Stat 2: Claims */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="p-3 rounded-2xl bg-orange-50 w-fit mb-4 text-orange-600">
                        <Receipt size={24} />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Approved Claims</p>
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-900">${approvedExpenses.toLocaleString()}</h3>
                        {pendingExpenses > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                    <Clock size={10} strokeWidth={3} />
                                    ${pendingExpenses.toLocaleString()} pending
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat 3: Next Pay */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="p-3 rounded-2xl bg-green-50 w-fit mb-4 text-green-600">
                        <Calendar size={24} />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Next Pay Date</p>
                    <h3 className="text-2xl font-bold text-slate-900">Dec 30, 2025</h3>
                </div>
            </div>

            {/* Expenses List Table (Kept same as previous) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-800">Recent Claims</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{expenses.length} Total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {expenses.length > 0 ? expenses.map((exp: any) => (
                                <tr key={exp._id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700">{exp.description}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">${Number(exp.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {exp.status === 'approved' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase border border-green-100">
                                                <CheckCircle2 size={12} /> Approved
                                            </span>
                                        ) : exp.status === 'declined' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase border border-red-100">
                                                <XCircle size={12} /> Declined
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-black uppercase border border-orange-100">
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                                        No expense claims found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: ALL PAY SLIPS --- */}
            {isSlipModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsSlipModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Salary History</h2>
                            <p className="text-slate-500 text-sm font-medium">Review your earnings record.</p>
                        </div>

                        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4">
                            {sortedYears.length > 0 ? sortedYears.map(year => (
                                <div key={year} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{year}</h4>
                                        <div className="h-px bg-slate-100 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {groupedSlips[year].map((slip: any) => (
                                            <div key={slip._id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                                                        <Calendar size={16} className="text-blue-500" />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{slip.month}</span>
                                                </div>
                                                <span className="font-black text-slate-900">${slip.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20">
                                    <Wallet size={40} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 italic">No salary records found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: NEW CLAIM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">New Claim</h2>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Submit a work-related expense for approval.</p>

                        <form onSubmit={handleAddExpense} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expense Description</label>
                                <input
                                    required
                                    placeholder="e.g. Office Supplies, Travel"
                                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Amount ($)</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}