// src/ReportsScreen.js
import React, { useMemo } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { exportToCSV } from './utils.js';

const ReportsScreen = ({ students, studentsWithFeeDetails, totalPendingAcrossAll, classWisePending, loggedInUser }) => {
    const overallSummary = [
        { metric: "Total Students", value: students.length },
        { metric: "Total Fees Expected", value: students.reduce((sum, s) => sum + s.totalFees, 0) },
        { metric: "Total Fees Collected", value: studentsWithFeeDetails.reduce((sum, s) => sum + s.totalPaid, 0) },
        { metric: "Total Discounts Given", value: studentsWithFeeDetails.reduce((sum, s) => sum + s.totalDiscount, 0) },
        { metric: "Overall Balance Due", value: totalPendingAcrossAll },
    ];

    const classWiseSummary = Object.entries(classWisePending)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([className, pendingAmount]) => ({
            class: className,
            pending: pendingAmount,
            totalStudentsInClass: students.filter(s => s.class === className).length,
            totalCollectedInClass: studentsWithFeeDetails.filter(s => s.class === className).reduce((sum, s) => sum + s.totalPaid, 0)
        }));

    const studentBalanceSummary = studentsWithFeeDetails
        .filter(s => s.remainingBalance > 0)
        .sort((a, b) => b.remainingBalance - a.remainingBalance)
        .map(s => ({
            name: s.name,
            rollNumber: s.rollNumber,
            class: s.class,
            balance: s.remainingBalance
        }));

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="mr-3 text-blue-600" size={32} /> Summary Reports
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
                    {overallSummary.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                            <p className="font-medium">{item.metric}:</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">
                                {typeof item.value === 'number' ? `INR ${item.value.toLocaleString()}` : item.value}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => exportToCSV(overallSummary.map(item => ({ Metric: item.metric, Value: typeof item.value === 'number' ? item.value : item.value })), "overall_fee_summary", ["Metric", "Value"], ["metric", "value"], loggedInUser.permissions)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                    >
                        <Download size={18} className="mr-1" /> Excel
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Class-wise Pending Fees</h3>
                {classWiseSummary.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending (INR)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classWiseSummary.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Class {item.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.totalStudentsInClass}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">INR {item.totalCollectedInClass.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">INR {item.pending.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No class-wise data available.</p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => exportToCSV(classWiseSummary.map(item => ({ Class: item.class, 'Total Students': item.totalStudentsInClass, 'Collected (INR)': item.totalCollectedInClass, 'Pending (INR)': item.pending })), "class_wise_pending", ["Class", "Total Students", "Collected (INR)", "Pending (INR)"], ["class", "totalStudentsInClass", "totalCollectedInClass", "pending"], loggedInUser.permissions)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                    >
                        <Download size={18} className="mr-1" /> Excel
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Students with Pending Balance</h3>
                {studentBalanceSummary.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due (INR)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studentBalanceSummary.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">INR {item.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">All students have cleared their balances!</p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => exportToCSV(studentBalanceSummary, "students_pending_balance", ["Name", "Roll No.", "Class", "Balance Due (INR)"], ["name", "rollNumber", "class", "balance"], loggedInUser.permissions)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                    >
                        <Download size={18} className="mr-1" /> Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
