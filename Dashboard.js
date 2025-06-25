// src/Dashboard.js
import React, { useRef } from 'react';
import { Search, X, PlusCircle, UploadCloud, Download, Users, DollarSign, FileText, BarChart3, ListFilter, ChevronUp, ChevronDown, Eye, Edit3, Trash2 } from 'lucide-react';

const Dashboard = ({
    students,
    loggedInUser,
    openModal,
    handleImportStudentsFromFile,
    confirmDeleteStudent,
    handleViewStudent,
    totalPendingAcrossAll,
    uniqueClasses,
    uniqueGrades,
    searchTerm,
    setSearchTerm,
    filterClass,
    setFilterClass,
    filterGrade,
    setFilterGrade,
    sortConfig,
    requestSort,
    getSortIndicator,
    sortedStudents,
    exportMainReportsToCSV,
    exportStudentListToCSV,
    exportAllTransactionsToCSV
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleImportStudentsFromFile(file);
        }
        event.target.value = null;
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="mr-3 text-blue-600" size={32} /> Dashboard
            </h2>

            {loggedInUser.permissions.canViewDashboardSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transform transition duration-300 hover:scale-105">
                        <div>
                            <p className="text-sm font-medium opacity-90">Total Students</p>
                            <p className="text-4xl font-bold mt-1">{students.length}</p>
                        </div>
                        <Users size={48} className="opacity-70" />
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transform transition duration-300 hover:scale-105">
                        <div>
                            <p className="text-sm font-medium opacity-90">Total Fees Due</p>
                            <p className="text-4xl font-bold mt-1">INR {totalPendingAcrossAll.toLocaleString()}</p>
                        </div>
                        <DollarSign size={48} className="opacity-70" />
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transform transition duration-300 hover:scale-105">
                        <div>
                            <p className="text-sm font-medium opacity-90">Unique Classes</p>
                            <p className="text-4xl font-bold mt-1">{uniqueClasses.length}</p>
                        </div>
                        <FileText size={48} className="opacity-70" />
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Student Records</h3>
                    <div className="flex flex-wrap gap-3">
                        {loggedInUser.permissions.canAddStudents && (
                            <button
                                onClick={() => openModal('addStudent')}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                            >
                                <PlusCircle size={20} className="mr-2" /> Add Student
                            </button>
                        )}
                        {loggedInUser.permissions.canImportExport && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                                >
                                    <UploadCloud size={20} className="mr-2" /> Import Students
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv, .xlsx, .xls"
                                    className="hidden"
                                />
                                <button
                                    onClick={exportMainReportsToCSV}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                                >
                                    <Download size={20} className="mr-2" /> Export Summary (Excel)
                                </button>
                                <button
                                    onClick={exportStudentListToCSV}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                                >
                                    <Download size={20} className="mr-2" /> Export Student List (Excel)
                                </button>
                                <button
                                    onClick={exportAllTransactionsToCSV}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5"
                                >
                                    <Download size={20} className="mr-2" /> Export All Transactions (Excel)
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                    >
                        <option value="">All Grades</option>
                        {uniqueGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                </div>
            </div>

            {loggedInUser.permissions.canViewStudents ? (
                <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                                    Name {getSortIndicator('name')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('rollNumber')}>
                                    Roll No. {getSortIndicator('rollNumber')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('class')}>
                                    Class {getSortIndicator('class')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('grade')}>
                                    Grade {getSortIndicator('grade')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalFees')}>
                                    Total Fees {getSortIndicator('totalFees')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalPaid')}>
                                    Total Paid {getSortIndicator('totalPaid')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalDiscount')}>
                                    Total Discount {getSortIndicator('totalDiscount')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('remainingBalance')}>
                                    Balance Due {getSortIndicator('remainingBalance')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedStudents.length > 0 ? (
                                sortedStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">INR {student.totalFees.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">INR {student.totalPaid.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">INR {student.totalDiscount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`font-semibold ${student.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                INR {student.remainingBalance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleViewStudent(student)} className="text-blue-600 hover:text-blue-900 transition-colors duration-150" title="View Details">
                                                    <Eye size={20} />
                                                </button>
                                                {loggedInUser.permissions.canEditStudents && (
                                                    <button onClick={() => openModal('editStudent', student)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" title="Edit Student">
                                                        <Edit3 size={20} />
                                                    </button>
                                                )}
                                                {loggedInUser.permissions.canDeleteStudents && (
                                                    <button onClick={() => confirmDeleteStudent(student.id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete Student">
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No students found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-lg text-center py-10">
                    <p className="text-xl text-gray-600">You do not have permission to view student records.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
