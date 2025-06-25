// src/DailyCollectionsReport.js
import React, { useState, useEffect } from 'react';
import { CalendarDays, Download } from 'lucide-react';
import { formatDate, formatDateTime, exportToCSV } from './utils.js';

const DailyCollectionsReport = ({ students, loggedInUser }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyPayments, setDailyPayments] = useState([]);
    const [dailyDiscounts, setDailyDiscounts] = useState([]);

    useEffect(() => {
        const paymentsOnSelectedDate = students.flatMap(student =>
            student.payments.filter(p => formatDate(p.date) === formatDate(selectedDate))
                .map(p => ({ ...p, studentName: student.name, studentRollNumber: student.rollNumber }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        const discountsOnSelectedDate = students.flatMap(student =>
            student.discounts.filter(d => formatDate(d.date) === formatDate(selectedDate))
                .map(d => ({ ...d, studentName: student.name, studentRollNumber: student.rollNumber }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        setDailyPayments(paymentsOnSelectedDate);
        setDailyDiscounts(discountsOnSelectedDate);
    }, [selectedDate, students]);

    const totalDailyCollection = dailyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalDailyDiscount = dailyDiscounts.reduce((sum, d) => sum + d.amount, 0);

    const exportDailyPaymentsToCSV = () => {
        const data = dailyPayments.map(p => ({
            'Student Name': p.studentName,
            'Roll Number': p.studentRollNumber,
            'Amount (INR)': p.amount,
            'Time': formatDateTime(p.date).split(' ')[1],
            'Remarks': p.remarks
        }));
        const headers = ['Student Name', 'Roll Number', 'Amount (INR)', 'Time', 'Remarks'];
        const keys = ['Student Name', 'Roll Number', 'Amount (INR)', 'Time', 'Remarks'];
        exportToCSV(data, `daily_payments_${selectedDate}`, headers, keys, loggedInUser.permissions);
    };

    const exportDailyDiscountsToCSV = () => {
        const data = dailyDiscounts.map(d => ({
            'Student Name': d.studentName,
            'Roll Number': d.studentRollNumber,
            'Amount (INR)': d.amount,
            'Time': formatDateTime(d.date).split(' ')[1],
            'Reason': d.reason
        }));
        const headers = ['Student Name', 'Roll Number', 'Amount (INR)', 'Time', 'Reason'];
        const keys = ['Student Name', 'Roll Number', 'Amount (INR)', 'Time', 'Reason'];
        exportToCSV(data, `daily_discounts_${selectedDate}`, headers, keys, loggedInUser.permissions);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <CalendarDays className="mr-3 text-blue-600" size={32} /> Daily Collections Report
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap items-center gap-4">
                <label htmlFor="reportDate" className="text-lg font-medium text-gray-700">Select Date:</label>
                <input
                    type="date"
                    id="reportDate"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="ml-auto text-lg font-semibold text-gray-800">
                    Total Collection: <span className="text-green-600">INR {totalDailyCollection.toLocaleString()}</span>
                    <span className="ml-4">Total Discounts: <span className="text-purple-600">INR {totalDailyDiscount.toLocaleString()}</span></span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Payments on {formatDate(selectedDate)}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportDailyPaymentsToCSV}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                        >
                            <Download size={18} className="mr-1" /> Excel
                        </button>
                    </div>
                </div>
                {dailyPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dailyPayments.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.studentRollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">INR {p.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(p.date).split(' ')[1]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.remarks || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No payments recorded for this date.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Discounts on {formatDate(selectedDate)}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportDailyDiscountsToCSV}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                        >
                            <Download size={18} className="mr-1" /> Excel
                        </button>
                    </div>
                </div>
                {dailyDiscounts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dailyDiscounts.map(d => (
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
                    <p className="text-gray-600 text-center py-4">No discounts recorded for this date.</p>
                )}
            </div>
        </div>
    );
};

export default DailyCollectionsReport;
