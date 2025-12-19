"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    Users, Receipt, DollarSign, PlusCircle, ChevronDown,
    ChevronUp, X, Loader2, Check, XCircle, Clock, LogOut, Edit2
} from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [slips, setSlips] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
    const [newSlip, setNewSlip] = useState({ employeeId: '', month: '', amount: '' });

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [uRes, sRes, eRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/salary-slip'),
                api.get('/expense')
            ]);
            setUsers(uRes.data);
            setSlips(sRes.data);
            setExpenses(eRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
    };

    // Open Modal for Editing
    const openEditModal = (slip: any) => {
        setEditingSlipId(slip._id);
        setNewSlip({
            employeeId: slip.employeeId?._id || slip.employeeId,
            month: slip.month,
            amount: slip.amount.toString()
        });
        setShowModal(true);
    };

    // Open Modal for New Slip
    const openCreateModal = () => {
        setEditingSlipId(null);
        setNewSlip({ employeeId: '', month: '', amount: '' });
        setShowModal(true);
    };

    const handleSubmitSlip = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingSlipId) {
                // UPDATE Logic
                await api.put(`/salary-slip/${editingSlipId}`, {
                    ...newSlip,
                    amount: Number(newSlip.amount)
                });
            } else {
                // CREATE Logic
                await api.post('/salary-slip', {
                    ...newSlip,
                    amount: Number(newSlip.amount)
                });
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateExpenseStatus = async (expenseId: string, newStatus: string) => {
        try {
            await api.patch(`/expense/${expenseId}`, { status: newStatus });
            setExpenses((prev: any) => prev.map((exp: any) =>
                exp._id === expenseId ? { ...exp, status: newStatus } : exp
            ));
        } catch (err) {
            alert("Error updating expense status");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 relative animate-in fade-in duration-500">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Center</h1>
                    <p className="text-slate-500 font-medium">Control payroll and approve claims.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-black transition flex items-center gap-2 text-sm"
                    >
                        <PlusCircle size={18} /> New Salary Slip
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Employee Directory */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2 text-blue-600">
                            <Users size={20} strokeWidth={2.5} />
                            <h2 className="font-bold text-xl text-slate-800">Employees</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {users.map((user: any) => (
                                <div key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <div
                                        className="p-5 flex justify-between items-center cursor-pointer"
                                        onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.email}</p>
                                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{user._id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                            {expandedUser === user._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Expandable Section: User Slips with Edit Button */}
                                    {expandedUser === user._id && (
                                        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
                                                    <DollarSign size={14} /> Issued Salary Slips
                                                </h4>
                                                <div className="space-y-2">
                                                    {slips.filter((s: any) => (s.employeeId?._id || s.employeeId) === user._id).length > 0 ? (
                                                        slips.filter((s: any) => (s.employeeId?._id || s.employeeId) === user._id).map((slip: any) => (
                                                            <div key={slip._id} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm border border-slate-100 group">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-900">${slip.amount.toLocaleString()}</span>
                                                                    <span className="text-[10px] font-medium text-slate-500">{slip.month}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openEditModal(slip);
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                                                                >
                                                                    <Edit2 size={14} /> Edit
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic py-2">No salary slips issued yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT: Expenses */}
                <div className="space-y-6">
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center gap-2 text-orange-600 mb-6">
                            <Receipt size={20} strokeWidth={2.5} />
                            <h2 className="font-bold text-xl text-slate-800">Expense Claims</h2>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {expenses.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 italic">
                                    <Clock size={30} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No requests to show</p>
                                </div>
                            ) : expenses.map((exp: any) => (
                                <div key={exp._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="max-w-[70%]">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                {typeof exp.employeeId === 'object' ? exp.employeeId?.email : 'User'}
                                            </p>
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight">{exp.description}</h3>
                                        </div>
                                        <span className="font-bold text-slate-900 text-sm">${exp.amount}</span>
                                    </div>

                                    <div className="flex items-center">
                                        {exp.status === 'approved' ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-md uppercase">
                                                <Check size={10} strokeWidth={3} /> Approved
                                            </span>
                                        ) : exp.status === 'declined' ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-md uppercase">
                                                <XCircle size={10} strokeWidth={3} /> Declined
                                            </span>
                                        ) : (
                                            <div className="w-full space-y-2">
                                                <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-md uppercase w-fit">
                                                    <Clock size={10} strokeWidth={3} /> Pending
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateExpenseStatus(exp._id, 'approved')}
                                                        className="flex-1 bg-white border border-green-200 text-green-600 py-2 rounded-xl text-[10px] font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateExpenseStatus(exp._id, 'declined')}
                                                        className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-xl text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* --- MODAL: CREATE OR EDIT SALARY SLIP --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{editingSlipId ? 'Update Salary' : 'Issue Salary'}</h2>
                        <p className="text-slate-500 text-sm mb-8 font-medium">
                            {editingSlipId ? 'Modify this existing payment record.' : 'Assign a new payment record to an employee.'}
                        </p>

                        <form onSubmit={handleSubmitSlip} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                                <select
                                    disabled={!!editingSlipId} // Disable changing employee during edit
                                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold disabled:opacity-50"
                                    value={newSlip.employeeId}
                                    onChange={(e) => setNewSlip({ ...newSlip, employeeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select from list...</option>
                                    {users.filter((u: any) => u.role !== 'admin').map((u: any) => (
                                        <option key={u._id} value={u._id}>{u.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Month</label>
                                    <input
                                        type="text" placeholder="Nov 2025"
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold"
                                        value={newSlip.month}
                                        onChange={(e) => setNewSlip({ ...newSlip, month: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                                    <input
                                        type="number" placeholder="5000"
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold"
                                        value={newSlip.amount}
                                        onChange={(e) => setNewSlip({ ...newSlip, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : editingSlipId ? "Update Transaction" : "Confirm Transaction"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}