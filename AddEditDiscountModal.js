// src/AddEditDiscountModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddEditDiscountModal = ({ isOpen, onClose, onSave, student, discount = null }) => {
    const [amount, setAmount] = useState(discount ? discount.amount : '');
    const [reason, setReason] = useState(discount ? discount.reason : '');

    useEffect(() => {
        if (discount) {
            setAmount(discount.amount);
            setReason(discount.reason);
        } else {
            setAmount('');
            setReason('');
        }
    }, [discount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount === '' || isNaN(amount) || parseFloat(amount) <= 0 || !reason.trim()) {
            alert('Please enter a valid positive amount and a reason for the discount.');
            return;
        }
        onSave(student.id, { ...discount, amount: parseFloat(amount), reason });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{discount ? 'Edit Discount' : 'Add New Discount'} for {student.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountAmount">Amount (INR)</label>
                        <input type="number" id="discountAmount" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0" step="0.01" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountReason">Reason</label>
                        <textarea id="discountReason" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 h-24" value={reason} onChange={(e) => setReason(e.target.value)} required></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 hover:scale-105">
                            {discount ? 'Update Discount' : 'Add Discount'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditDiscountModal;
