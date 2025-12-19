import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
    const [salaries, setSalaries] = useState([]);

    useEffect(() => {
        // Fetch user-specific salary slips [cite: 17]
        axios.get('http://localhost:5000/api/salary-slip', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setSalaries(res.data));
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Payroll Dashboard</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Month</th>
                            <th className="p-3">Base Salary</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.map((slip) => (
                            <tr key={slip.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{slip.month}</td>
                                <td className="p-3">${slip.amount}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        Paid
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeDashboard;