// src/AddPaymentModal.js
import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddPaymentModal = ({ isOpen, onClose, onAddPayment, student }) => {
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount === '' || isNaN(amount) || parseFloat(amount) <= 0) {
            alert('Please enter a valid positive amount.');
            return;
        }
        if (!paymentDate) {
            alert('Please select a payment date.');
            return;
        }

        const dateIsoString = new Date(paymentDate).toISOString();

        onAddPayment(student.id, { amount: parseFloat(amount), remarks, date: dateIsoString });
        setAmount('');
        setRemarks('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Payment for {student.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentAmount">Amount (INR)</label>
                        <input type="number" id="paymentAmount" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0" step="0.01" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentDate">Payment Date</label>
                        <input type="date" id="paymentDate" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentRemarks">Remarks (Optional)</label>
                        <textarea id="paymentRemarks" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 h-24" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 hover:scale-105">
                            Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
