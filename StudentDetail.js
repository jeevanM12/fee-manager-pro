// src/StudentDetail.js
import React from 'react';
import { ChevronLeft, Eye, Edit3, Trash2, PlusCircle, Download } from 'lucide-react';
import { calculateFeeDetails, formatDateTime, exportToCSV } from './utils.js';

const StudentDetail = ({ student, onBack, onAddPayment, onAddDiscount, onUpdateDiscount, onDeleteDiscount, loggedInUser, openModal, confirmDeleteStudent }) => {
    const { totalPaid, totalDiscount, remainingBalance, lastPaymentDate } = calculateFeeDetails(student);

    const exportStudentPaymentsToCSV = () => {
      const data = student.payments.map(p => ({
        'Payment ID': p.id,
        'Amount (INR)': p.amount,
        'Date': formatDateTime(p.date),
        'Remarks': p.remarks
      }));
      const headers = ['Payment ID', 'Amount (INR)', 'Date', 'Remarks'];
      const keys = ['Payment ID', 'Amount (INR)', 'Date', 'Remarks'];
      exportToCSV(data, `payments_${student.rollNumber}`, headers, keys, loggedInUser.permissions);
    };

    const exportStudentDiscountsToCSV = () => {
      const data = student.discounts.map(d => ({
        'Discount ID': d.id,
        'Amount (INR)': d.amount,
        'Reason': d.reason,
        'Date': formatDateTime(d.date)
      }));
      const headers = ['Discount ID', 'Amount (INR)', 'Reason', 'Date'];
      const keys = ['Discount ID', 'Amount (INR)', 'Reason', 'Date'];
      exportToCSV(data, `discounts_${student.rollNumber}`, headers, keys, loggedInUser.permissions);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150">
                <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
            </button>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <Eye className="mr-3 text-blue-600" size={32} /> Student Details: {student.name}
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div><span className="font-medium">Roll Number:</span> {student.rollNumber}</div>
                    <div><span className="font-medium">Class:</span> {student.class}</div>
                    <div><span className="font-medium">Grade:</span> {student.grade}</div>
                    <div><span className="font-medium">Total Fees:</span> INR {student.totalFees.toLocaleString()}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    {loggedInUser.permissions.canEditStudents && (
                        <button
                        onClick={() => openModal('editStudent', student)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                        >
                        <Edit3 size={18} className="mr-2" /> Edit Student Info
                        </button>
                    )}
                    {loggedInUser.permissions.canDeleteStudents && (
                        <button
                        onClick={() => confirmDeleteStudent(student.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                        >
                        <Trash2 size={18} className="mr-2" /> Delete Student
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Fee Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
                    <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
                        <p className="font-medium">Total Fees:</p>
                        <p className="text-xl font-bold text-blue-700">INR {student.totalFees.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <p className="font-medium">Total Paid:</p>
                        <p className="text-xl font-bold text-green-700">INR {totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg shadow-sm">
                        <p className="font-medium">Total Discount:</p>
                        <p className="text-xl font-bold text-yellow-700">INR {totalDiscount.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow-sm ${remainingBalance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="font-medium">Balance Due:</p>
                        <p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>INR {remainingBalance.toLocaleString()}</p>
                    </div>
                </div>
                {lastPaymentDate && (
                    <p className="text-sm text-gray-600 mt-4">Last Payment: {formatDateTime(lastPaymentDate)}</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Payments</h3>
                    <div className="flex gap-2">
                        {loggedInUser.permissions.canManagePayments && (
                            <button
                                onClick={() => openModal('addPayment', student)}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                            >
                                <PlusCircle size={18} className="mr-1" /> Add Payment
                            </button>
                        )}
                        {loggedInUser.permissions.canImportExport && (
                            <button
                                onClick={exportStudentPaymentsToCSV}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                            >
                                <Download size={18} className="mr-1" /> Excel
                            </button>
                        )}
                    </div>
                </div>
                {student.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {student.payments.sort((a,b) => new Date(b.date) - new Date(a.date)).map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INR {payment.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(payment.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.remarks || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No payments recorded for this student yet.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Discounts</h3>
                    <div className="flex gap-2">
                        {loggedInUser.permissions.canManageDiscounts && (
                            <button
                                onClick={() => openModal('addDiscount', student)}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                            >
                                <PlusCircle size={18} className="mr-1" /> Add Discount
                            </button>
                        )}
                        {loggedInUser.permissions.canImportExport && (
                            <button
                                onClick={exportStudentDiscountsToCSV}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md flex items-center text-sm transition duration-200 ease-in-out"
                            >
                                <Download size={18} className="mr-1" /> Excel
                            </button>
                        )}
                    </div>
                </div>
                {student.discounts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (INR)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {student.discounts.map(discount => (
                                    <tr key={discount.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INR {discount.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{discount.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(discount.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {loggedInUser.permissions.canManageDiscounts && (
                                                    <>
                                                        <button onClick={() => openModal('editDiscount', student, discount)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" title="Edit Discount">
                                                            <Edit3 size={20} />
                                                        </button>
                                                        <button onClick={() => onDeleteDiscount(student.id, discount.id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete Discount">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No discounts recorded for this student yet.</p>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
