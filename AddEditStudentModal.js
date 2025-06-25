// src/AddEditStudentModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddEditStudentModal = ({ isOpen, onClose, onSave, student = null }) => {
    const [name, setName] = useState(student ? student.name : '');
    const [rollNumber, setRollNumber] = useState(student ? student.rollNumber : '');
    const [studentClass, setStudentClass] = useState(student ? student.class : '');
    const [grade, setGrade] = useState(student ? student.grade : '');
    const [totalFees, setTotalFees] = useState(student ? student.totalFees : '');

    useEffect(() => {
        if (student) {
            setName(student.name);
            setRollNumber(student.rollNumber);
            setStudentClass(student.class);
            setGrade(student.grade);
            setTotalFees(student.totalFees);
        } else {
            setName('');
            setRollNumber('');
            setStudentClass('');
            setGrade('');
            setTotalFees('');
        }
    }, [student]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !rollNumber || !studentClass || !grade || totalFees === '' || isNaN(totalFees) || parseFloat(totalFees) <= 0) {
            alert('Please fill in all fields correctly. Total Fees must be a positive number.');
            return;
        }
        onSave({
            ...student,
            name,
            rollNumber,
            class: studentClass,
            grade,
            totalFees: parseFloat(totalFees),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{student ? 'Edit Student' : 'Add New Student'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                        <input type="text" id="name" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rollNumber">Roll Number</label>
                        <input type="text" id="rollNumber" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class">Class</label>
                        <input type="text" id="class" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grade">Grade</label>
                        <input type="text" id="grade" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={grade} onChange={(e) => setGrade(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalFees">Total Fees</label>
                        <input type="number" id="totalFees" className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={totalFees} onChange={(e) => setTotalFees(e.target.value)} required min="0" step="0.01" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 hover:scale-105">
                            {student ? 'Update Student' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditStudentModal;
