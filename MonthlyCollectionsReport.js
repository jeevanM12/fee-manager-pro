// src/MonthlyCollectionsReport.js
import React, { useState, useEffect } from 'react';
import { CalendarDays, Download } from 'lucide-react';
import { formatDateTime, exportToCSV } from './utils.js';

const MonthlyCollectionsReport = ({ students, loggedInUser }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
    const [monthlyPayments, setMonthlyPayments] = useState([]);
    const [monthlyDiscounts, setMonthlyDiscounts] = useState([]);

    useEffect(() => {
        const paymentsInMonth = students.flatMap(student =>
            student.payments.filter(p => p.date.startsWith(selectedMonth))
                .map(p => ({ ...p, studentName: student.name, studentRollNumber: student.rollNumber }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        const discountsInMonth = students.flatMap(student =>
            student.discounts.filter(d => d.date.startsWith(selectedMonth))
                .map(d => ({ ...d, studentName: student.name, studentRollNumber: student.rollNumber }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        setMonthlyPayments(paymentsInMonth);
        setMonthlyDiscounts(discountsInMonth);
    }, [selectedMonth, students]);

    const totalMonthlyCollection = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalMonthlyDiscount = monthlyDiscounts.reduce((sum, d) => sum + d.amount, 0);

    const exportMonthlyPaymentsToCSV = () => {
        const data = monthlyPayments.map(p => ({
            'Student Name': p.studentName,
            'Roll Number': p.studentRollNumber,
            'Amount (INR)': p.amount,
            'Date & Time': formatDateTime(p.date),
            'Remarks': p.remarks
        }));
        const headers = ['Student Name', 'Roll Number', 'Amount (INR)', 'Date & Time', 'Remarks'];
        const keys = ['Student Name', 'Roll Number', 'Amount (INR)', 'Date & Time', 'Remarks'];
        exportToCSV(data, `monthly_payments_${selectedMonth}`, headers, keys, loggedInUser.permissions);
    };

    const exportMonthlyDiscountsToCSV = () => {
        const data = monthlyDiscounts.map(d => ({
            'Student Name': d.studentName,
            'Roll Number': d.studentRollNumber,
            'Amount (INR)': d.amount,
            'Date & Time': formatDateTime(d.date),
            'Reason': d.reason
        }));
        const headers = ['Student Name', 'Roll Number', 'Amount (INR)', 'Date & Time', 'Reason'];
        const keys = ['Student Name', 'Roll Number', 'Amount (INR)', 'Date & Time', 'Reason'];
        exportToCSV(data, `monthly_discounts_${selectedMonth}`, headers, keys, loggedInUser.permissions);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <CalendarDays className="mr-3 text-blue-600" size={32} /> Monthly Collections Report
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap items-center gap-4">
                <label htmlFor="reportMonth" className="text-lg font-medium text-gray-700">Select Month:</label>
                <input
                    type="month"
                    id="reportMonth"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="ml-auto text-lg font-semibold text-gray-800">
                    Total Collection: <span className="text-green-600">INR {totalMonthlyCollection.toLocaleString()}</span>
                    <span className="ml-4">Total Discounts: <span className="text-purple-600">INR {totalMonthlyDiscount.toLocaleString()}</span></span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Payments in {selectedMonth}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportMonthlyPaymentsToCSV}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                        >
                            <Download size={18} className="mr-1" /> Excel
                        </button>
                    </div>
                </div>
                {monthlyPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyPayments.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.studentRollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">INR {p.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(p.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.remarks || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No payments recorded for this month.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Discounts in {selectedMonth}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportMonthlyDiscountsToCSV}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                        >
                            <Download size={18} className="mr-1" /> Excel
                        </button>
                    </div>
                </div>
                {monthlyDiscounts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyDiscounts.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.studentRollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">INR {d.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(d.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.reason || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No discounts recorded for this month.</p>
                )}
            </div>
        </div>
    );
};

export default MonthlyCollectionsReport;
