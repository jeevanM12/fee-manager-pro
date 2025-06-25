// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Import components
import Navbar from './Navbar.js';
import LoginScreen from './LoginScreen.js';
import Dashboard from './Dashboard.js';
import StudentDetail from './StudentDetail.js';
import AddEditStudentModal from './AddEditStudentModal.js';
import AddPaymentModal from './AddPaymentModal.js';
import AddEditDiscountModal from './AddEditDiscountModal.js';
import ReportsScreen from './ReportsScreen.js';
import DailyCollectionsReport from './DailyCollectionsReport.js';
import MonthlyCollectionsReport from './MonthlyCollectionsReport.js';
import UserManagementScreen from './UserManagementScreen.js';
import ConfirmationModal from './ConfirmationModal.js';

// Import utilities and initial data
import {
    defaultUserPermissions,
    adminPermissions,
    initialUsers,
    initialStudentsData,
    formatDateTime,
    formatDate,
    calculateFeeDetails,
    injectScript,
    XLSX_CODE,
    exportToCSV
} from './utils.js';

function App() {
    const [loggedInUser, setLoggedInUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedInFeeUser'));
        if (storedUser && !storedUser.permissions) {
            if (storedUser.role === 'admin') {
                return { ...storedUser, permissions: adminPermissions };
            } else {
                return { ...storedUser, permissions: defaultUserPermissions };
            }
        }
        return storedUser;
    });

    const [appUsers, setAppUsers] = useState(() => {
        const storedUsers = JSON.parse(localStorage.getItem('appUsersData'));
        if (storedUsers) {
            return storedUsers.map(user => {
                if (!user.permissions) {
                    return { ...user, permissions: user.role === 'admin' ? adminPermissions : defaultUserPermissions };
                }
                return user;
            });
        }
        return initialUsers;
    });
    const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('studentsData')) || initialStudentsData);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentStudentForModal, setCurrentStudentForModal] = useState(null);
    const [currentDiscountForModal, setCurrentDiscountForModal] = useState(null);
    const [loginError, setLoginError] = useState('');

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalTitle, setConfirmModalTitle] = useState('');
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null);

    const [xlsxLibraryLoaded, setXlsxLibraryLoaded] = useState(false);

    // --- Effects for LocalStorage & Embedded Library Loading ---
    useEffect(() => { localStorage.setItem('studentsData', JSON.stringify(students)); }, [students]);
    useEffect(() => { localStorage.setItem('appUsersData', JSON.stringify(appUsers)); }, [appUsers]);
    useEffect(() => {
        if (loggedInUser) localStorage.setItem('loggedInFeeUser', JSON.stringify(loggedInUser));
        else localStorage.removeItem('loggedInFeeUser');
    }, [loggedInUser]);

    useEffect(() => {
        injectScript('xlsx-embed-script', XLSX_CODE,
            () => setXlsxLibraryLoaded(true),
            () => window.XLSX && typeof window.XLSX.utils.sheet_to_json === 'function'
        )
        .then(() => console.log("XLSX library embedded and ready for import."))
        .catch(error => console.error("Error embedding XLSX library:", error));
    }, []);

    // --- Authentication Logic ---
    const handleLogin = (email, password) => {
        const user = appUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            setLoggedInUser({ email: user.email, role: user.role, permissions: user.permissions || (user.role === 'admin' ? adminPermissions : defaultUserPermissions) });
            setLoginError('');
            setCurrentView('dashboard');
        } else {
            setLoginError('Invalid email or password.');
        }
    };
    const handleLogout = () => { setLoggedInUser(null); setCurrentView('dashboard'); };
    const handleAddAppUser = (newUser) => {
        if (appUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) { alert('User with this email already exists.'); return false; }
        setAppUsers([...appUsers, { ...newUser, role: 'user', permissions: defaultUserPermissions }]); return true;
    };

    const confirmDeleteAppUser = (emailToDelete) => {
        if (emailToDelete.toLowerCase() === 'admin@example.com') {
            alert("Cannot delete the default admin user.");
            return;
        }
        const userToModify = appUsers.find(user => user.email.toLowerCase() === emailToDelete.toLowerCase());
        if (userToModify && userToModify.role === 'admin') {
            const adminCount = appUsers.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert("Cannot delete the last admin user. Please promote another user to admin first.");
                return;
            }
        }

        setConfirmModalTitle('Confirm User Deletion');
        setConfirmModalMessage(`Are you sure you want to delete the user ${emailToDelete}? This action cannot be undone.`);
        setConfirmModalAction(() => () => {
            setAppUsers(appUsers.filter(user => user.email.toLowerCase() !== emailToDelete.toLowerCase()));
            setIsConfirmModalOpen(false);
        });
        setIsConfirmModalOpen(true);
    };

    const handleChangeUserRole = (emailToChange, newRole) => {
        if (emailToChange.toLowerCase() === loggedInUser.email.toLowerCase() && newRole !== 'admin') {
            alert("You cannot demote yourself from admin if you are the one making the change.");
            return;
        }
        if (emailToChange.toLowerCase() === 'admin@example.com' && newRole !== 'admin') {
            alert("The default admin (admin@example.com) role cannot be changed.");
            return;
        }

        const targetUser = appUsers.find(user => user.email.toLowerCase() === emailToChange.toLowerCase());
        if (targetUser && targetUser.role === 'admin' && newRole === 'user') {
            const adminCount = appUsers.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert("Cannot demote the last admin. Promote another user to admin first.");
                return;
            }
        }

        setAppUsers(appUsers.map(user =>
            user.email.toLowerCase() === emailToChange.toLowerCase() ?
            { ...user, role: newRole, permissions: newRole === 'admin' ? adminPermissions : defaultUserPermissions } : user
        ));
        alert(`User ${emailToChange}'s role has been updated to ${newRole}.`);
    };

    const handleUpdateUserPermissions = (userEmail, updatedPermissions) => {
        setAppUsers(prevUsers => prevUsers.map(user =>
            user.email === userEmail ? { ...user, permissions: updatedPermissions } : user
        ));
        if (loggedInUser && loggedInUser.email === userEmail) {
            setLoggedInUser(prev => ({ ...prev, permissions: updatedPermissions }));
        }
        alert(`Permissions for ${userEmail} updated successfully.`);
    };

    // --- Student Data & File Import Logic ---
    const handleImportStudentsFromFile = (file) => {
        if (!loggedInUser.permissions.canImportExport) {
            alert("You do not have permission to import students.");
            return;
        }
        if (!xlsxLibraryLoaded || !window.XLSX || !window.XLSX.utils || typeof window.XLSX.utils.sheet_to_json !== 'function') {
            alert("Excel processing library not loaded yet or missing required functions. Please try again in a moment.");
            console.error("XLSX library check failed. Loaded state:", xlsxLibraryLoaded, "window.XLSX:", window.XLSX, "sheet_to_json:", typeof window.XLSX?.utils?.sheet_to_json);
            return;
        }

        const reader = new FileReader();
        const fileExtension = file.name.split('.').pop().toLowerCase();

        reader.onload = (event) => {
            try {
                const data = event.target.result;
                let rawJsonData;

                if (fileExtension === 'csv') {
                    const lines = data.split(/\r\n|\n/).filter(line => line.trim() !== '');
                    if (lines.length < 1) throw new Error("CSV file is empty.");
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
                    rawJsonData = lines.slice(1).map(line => {
                        const values = line.split(',').map(v => v.trim());
                        const rowObject = {};
                        headers.forEach((header, index) => {
                            rowObject[header] = values[index];
                        });
                        return rowObject;
                    });
                } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                    const workbook = window.XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    rawJsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
                    if (rawJsonData.length < 1) throw new Error("Excel sheet is empty or has no data rows.");
                } else {
                    throw new Error("Unsupported file type. Please upload a CSV or XLSX file.");
                }

                const studentsToImportMap = new Map();

                rawJsonData.forEach((row, rowIndex) => {
                    const normalizedRollNumber = String(row.rollnumber || '').toLowerCase();

                    if (!normalizedRollNumber) {
                        console.warn(`Skipping row ${rowIndex + 2} due to missing Roll Number.`);
                        return;
                    }

                    let student = studentsToImportMap.get(normalizedRollNumber);

                    if (!student) {
                        student = {
                            id: `S${Date.now()}-${normalizedRollNumber}`,
                            name: String(row.name || ''),
                            rollNumber: String(row.rollnumber || ''),
                            class: String(row.class || ''),
                            grade: String(row.grade || ''),
                            totalFees: parseFloat(row.totalfees) || 0,
                            payments: [],
                            discounts: []
                        };
                        studentsToImportMap.set(normalizedRollNumber, student);
                    } else {
                        if (row.name !== undefined && row.name !== '') student.name = String(row.name);
                        if (row.class !== undefined && row.class !== '') student.class = String(row.class);
                        if (row.grade !== undefined && row.grade !== '') student.grade = String(row.grade);
                        if (row.totalfees !== undefined && row.totalfees !== '' && !isNaN(parseFloat(row.totalfees))) {
                            student.totalFees = parseFloat(row.totalfees);
                        }
                    }

                    const paymentAmount = parseFloat(row.paymentamount);
                    const paymentDateStr = String(row.paymentdate || '');
                    const paymentRemarks = String(row.paymentremarks || '');
                    const paymentId = String(row.paymentid || '');

                    if (!isNaN(paymentAmount) && paymentAmount > 0 && paymentDateStr.trim() !== '') {
                        try {
                            const parsedPaymentDate = new Date(paymentDateStr);
                            if (isNaN(parsedPaymentDate.getTime())) {
                                console.warn(`Invalid payment date in row ${rowIndex + 2}: "${paymentDateStr}". Skipping payment.`);
                            } else {
                                const paymentIsoDate = parsedPaymentDate.toISOString();
                                let existingPaymentIndex = -1;

                                if (paymentId !== '') {
                                    existingPaymentIndex = student.payments.findIndex(p => p.id === paymentId);
                                } else {
                                    existingPaymentIndex = student.payments.findIndex(p =>
                                        p.amount === paymentAmount &&
                                        p.date === paymentIsoDate &&
                                        p.remarks === paymentRemarks
                                    );
                                }

                                if (existingPaymentIndex !== -1) {
                                    student.payments[existingPaymentIndex] = {
                                        ...student.payments[existingPaymentIndex],
                                        id: paymentId || student.payments[existingPaymentIndex].id,
                                        amount: paymentAmount,
                                        date: paymentIsoDate,
                                        remarks: paymentRemarks
                                    };
                                } else {
                                    student.payments.push({
                                        id: paymentId || `P${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(7)}`,
                                        amount: paymentAmount,
                                        date: paymentIsoDate,
                                        remarks: paymentRemarks
                                    });
                                }
                            }
                        } catch (dateError) {
                            console.warn(`Error parsing payment date "${paymentDateStr}" in row ${rowIndex + 2}:`, dateError);
                        }
                    }

                    const discountAmount = parseFloat(row.discountamount);
                    const discountReason = String(row.discountreason || '');
                    const discountDateStr = String(row.discountdate || '');
                    const discountId = String(row.discountid || '');

                    if (!isNaN(discountAmount) && discountAmount > 0 && discountReason.trim() !== '' && discountDateStr.trim() !== '') {
                        try {
                            const parsedDiscountDate = new Date(discountDateStr);
                            if (isNaN(parsedDiscountDate.getTime())) {
                                console.warn(`Invalid discount date in row ${rowIndex + 2}: "${discountDateStr}". Skipping discount.`);
                            } else {
                                const discountIsoDate = parsedDiscountDate.toISOString();
                                let existingDiscountIndex = -1;

                                if (discountId !== '') {
                                    existingDiscountIndex = student.discounts.findIndex(d => d.id === discountId);
                                } else {
                                    existingDiscountIndex = student.discounts.findIndex(d =>
                                        d.amount === discountAmount &&
                                        d.reason === discountReason &&
                                        d.date === discountIsoDate
                                    );
                                }

                                if (existingDiscountIndex !== -1) {
                                    student.discounts[existingDiscountIndex] = {
                                        ...student.discounts[existingDiscountIndex],
                                        id: discountId || student.discounts[existingDiscountIndex].id,
                                        amount: discountAmount,
                                        reason: discountReason,
                                        date: discountIsoDate
                                    };
                                } else {
                                    student.discounts.push({
                                        id: discountId || `D${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(7)}`,
                                        amount: discountAmount,
                                        reason: discountReason,
                                        date: discountIsoDate
                                    });
                                }
                            }
                        } catch (dateError) {
                            console.warn(`Error parsing discount date "${discountDateStr}" in row ${rowIndex + 2}:`, dateError);
                        }
                    }
                });

                const importedStudentsArray = Array.from(studentsToImportMap.values());

                if (importedStudentsArray.length > 0) {
                    setStudents(prevStudents => {
                        const updatedStudents = new Map(prevStudents.map(s => [s.rollNumber.toLowerCase(), { ...s }]));
                        let newStudentsCount = 0;
                        let updatedStudentsCount = 0;

                        importedStudentsArray.forEach(importedStudent => {
                            const existingStudent = updatedStudents.get(importedStudent.rollNumber.toLowerCase());

                            if (existingStudent) {
                                existingStudent.name = importedStudent.name || existingStudent.name;
                                existingStudent.class = importedStudent.class || existingStudent.class;
                                existingStudent.grade = importedStudent.grade || existingStudent.grade;
                                existingStudent.totalFees = importedStudent.totalFees !== undefined && importedStudent.totalFees !== null ? importedStudent.totalFees : existingStudent.totalFees;

                                const mergedPayments = [...existingStudent.payments];
                                importedStudent.payments.forEach(newPayment => {
                                    const existingIndex = mergedPayments.findIndex(p => p.id === newPayment.id);
                                    if (existingIndex !== -1) {
                                        mergedPayments[existingIndex] = newPayment;
                                    } else {
                                        mergedPayments.push(newPayment);
                                    }
                                });
                                mergedPayments.sort((a,b) => new Date(a.date) - new Date(b.date));
                                existingStudent.payments = mergedPayments;

                                const mergedDiscounts = [...existingStudent.discounts];
                                importedStudent.discounts.forEach(newDiscount => {
                                    const existingIndex = mergedDiscounts.findIndex(d => d.id === newDiscount.id);
                                    if (existingIndex !== -1) {
                                        mergedDiscounts[existingIndex] = newDiscount;
                                    } else {
                                        mergedDiscounts.push(newDiscount);
                                    }
                                });
                                mergedDiscounts.sort((a,b) => new Date(a.date) - new Date(b.date));
                                existingStudent.discounts = mergedDiscounts;

                                updatedStudentsCount++;
                            } else {
                                updatedStudents.set(importedStudent.rollNumber.toLowerCase(), importedStudent);
                                newStudentsCount++;
                            }
                        });

                        alert(`${newStudentsCount} new students imported and ${updatedStudentsCount} existing students updated successfully!`);
                        return Array.from(updatedStudents.values());
                    });
                } else {
                    alert("No valid student data found to import. Please check file content and headers (Name, RollNumber, Class, Grade, TotalFees, Payment Amount, Payment Date, Payment Remarks, Discount Amount, Discount Reason, Discount Date).");
                }
            } catch (error) {
                console.error("Import error:", error);
                alert(`Error importing students: ${error.message || error.toString() || 'Unknown error'}`);
            }
        };
        reader.onerror = () => alert("Error reading file.");

        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            reader.readAsArrayBuffer(file);
        } else {
            alert("Unsupported file type. Please upload a CSV or XLSX file.");
        }
    };

    // --- Fee Calculation & Filtering/Sorting ---
    const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const uniqueGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);
    const studentsWithFeeDetails = useMemo(() => students.map(student => ({ ...student, ...calculateFeeDetails(student) })), [students]);
    const filteredStudents = useMemo(() => {
        return studentsWithFeeDetails
            .filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(student => filterClass === '' || student.class === filterClass)
            .filter(student => filterGrade === '' || student.grade === filterGrade);
    }, [studentsWithFeeDetails, searchTerm, filterClass, filterGrade]);
    const sortedStudents = useMemo(() => {
        let sortableItems = [...filteredStudents];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (['totalfees', 'totalpaid', 'totaldiscount', 'remainingbalance'].includes(sortConfig.key)) {
                    valA = parseFloat(valA) || 0;
                    valB = parseFloat(valB) || 0;
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                }
                if (typeof valB === 'string') {
                    valB = valB.toLowerCase();
                }
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredStudents, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) return sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />;
        return null; // Don't show icon if not sorted by this key
    };

    // --- CRUD Operations for Students, Payments, Discounts ---
    const handleViewStudent = (student) => { setSelectedStudent(student); setCurrentView('studentDetail'); };
    const handleAddStudent = (newStudent) => {
        if (!loggedInUser.permissions.canAddStudents) {
            alert("You do not have permission to add students.");
            return;
        }
        const newId = `S${Date.now()}`;
        setStudents([...students, { ...newStudent, id: newId, payments: [], discounts: [] }]);
        setCurrentView('dashboard');
    };
    const handleUpdateStudent = (updatedStudent) => {
        if (!loggedInUser.permissions.canEditStudents) {
            alert("You do not have permission to edit students.");
            return;
        }
        setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        if (selectedStudent && selectedStudent.id === updatedStudent.id) {
            setSelectedStudent({...updatedStudent, ...calculateFeeDetails(updatedStudent)});
        }
        setIsModalOpen(false);
    };

    const confirmDeleteStudent = (studentId) => {
        if (!loggedInUser.permissions.canDeleteStudents) {
            alert("You do not have permission to delete students.");
            return;
        }
        setConfirmModalTitle('Confirm Student Deletion');
        setConfirmModalMessage('Are you sure you want to delete this student and all their records? This action cannot be undone.');
        setConfirmModalAction(() => () => {
            setStudents(students.filter(s => s.id !== studentId));
            if (selectedStudent && selectedStudent.id === studentId) { setCurrentView('dashboard'); setSelectedStudent(null); }
            setIsConfirmModalOpen(false);
        });
        setIsConfirmModalOpen(true);
    };

    const handleAddPayment = (studentId, paymentDetails) => {
        if (!loggedInUser.permissions.canManagePayments) {
            alert("You do not have permission to add payments.");
            return;
        }
        setStudents(prevStudents => prevStudents.map(s => s.id === studentId ? { ...s, payments: [...s.payments, { ...paymentDetails, id: `P${Date.now()}`, date: paymentDetails.date || new Date().toISOString() }] } : s ));
        if (selectedStudent && selectedStudent.id === studentId) {
            const student = students.find(s => s.id === studentId);
            if (student) {
                const newPayments = [...student.payments, { ...paymentDetails, id: `P${Date.now()}`, date: paymentDetails.date || new Date().toISOString() }];
                setSelectedStudent(prev => ({...prev, payments: newPayments, ...calculateFeeDetails({...prev, payments: newPayments})}));
            }
        }
        setIsModalOpen(false);
    };
    const handleAddDiscount = (studentId, discountDetails) => {
        if (!loggedInUser.permissions.canManageDiscounts) {
            alert("You do not have permission to add discounts.");
            return;
        }
        setStudents(prevStudents => prevStudents.map(s => s.id === studentId ? { ...s, discounts: [...s.discounts, { ...discountDetails, id: `D${Date.now()}`, date: new Date().toISOString() }] } : s ));
        if (selectedStudent && selectedStudent.id === studentId) {
            const student = students.find(s => s.id === studentId);
            if(student) {
                const newDiscounts = [...student.discounts, { ...discountDetails, id: `D${Date.now()}`, date: new Date().toISOString() }];
                setSelectedStudent(prev => ({...prev, discounts: newDiscounts, ...calculateFeeDetails({...prev, discounts: newDiscounts})}));
            }
        }
        setIsModalOpen(false);
    };
    const handleUpdateDiscount = (studentId, updatedDiscount) => {
        if (!loggedInUser.permissions.canManageDiscounts) {
            alert("You do not have permission to edit discounts.");
            return;
        }
        setStudents(prevStudents => prevStudents.map(s => {
            if (s.id === studentId) {
                return { ...s, discounts: s.discounts.map(d => d.id === updatedDiscount.id ? { ...d, ...updatedDiscount, date: new Date().toISOString() } : d) };
            }
            return s;
        }));
        if (selectedStudent && selectedStudent.id === studentId) {
            const student = students.find(s => s.id === studentId);
            if (student) {
                const newDiscounts = student.discounts.map(d => d.id !== updatedDiscount.id ? d : { ...d, ...updatedDiscount, date: new Date().toISOString() });
                setSelectedStudent(prev => ({...prev, discounts: newDiscounts, ...calculateFeeDetails({...prev, discounts: newDiscounts})}));
            }
        }
        setIsModalOpen(false);
        setCurrentDiscountForModal(null);
    };

    const confirmDeleteDiscount = (studentId, discountId) => {
        if (!loggedInUser.permissions.canManageDiscounts) {
            alert("You do not have permission to delete discounts.");
            return;
        }
        setConfirmModalTitle('Confirm Discount Deletion');
        setConfirmModalMessage('Are you sure you want to delete this discount? This action cannot be undone.');
        setConfirmModalAction(() => () => {
            setStudents(prevStudents => prevStudents.map(s => {
                if (s.id === studentId) {
                    return { ...s, discounts: s.discounts.filter(d => d.id !== discountId) };
                }
                return s;
            }));
            if (selectedStudent && selectedStudent.id === studentId) {
                const student = students.find(s => s.id === studentId);
                if (student) {
                    const newDiscounts = student.discounts.filter(d => d.id !== discountId);
                    setSelectedStudent(prev => ({...prev, discounts: newDiscounts, ...calculateFeeDetails({...prev, discounts: newDiscounts})}));
                }
            }
            setIsConfirmModalOpen(false);
        });
        setIsConfirmModalOpen(true);
    };

    const openModal = (type, student = null, discount = null) => {
        setModalType(type);
        setCurrentStudentForModal(student || selectedStudent);
        setCurrentDiscountForModal(discount);
        setIsModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (confirmModalAction) {
            confirmModalAction();
        }
        setIsConfirmModalOpen(false);
        setConfirmModalAction(null);
    };

    // --- Report Calculations & Export Logic ---
    const totalPendingAcrossAll = useMemo(() => studentsWithFeeDetails.reduce((sum, s) => sum + s.remainingBalance, 0), [studentsWithFeeDetails]);
    const classWisePending = useMemo(() => studentsWithFeeDetails.reduce((acc, student) => {
        if (!acc[student.class]) acc[student.class] = 0;
        acc[student.class] += student.remainingBalance;
        return acc;
    }, {}), [studentsWithFeeDetails]);

    const exportMainReportsToCSV = () => {
        const summaryData = [
            { Report: "Total Students", Value: students.length },
            { Report: "Total Fees Expected", Value: students.reduce((sum, s) => sum + s.totalFees, 0) },
            { Report: "Total Fees Collected", Value: studentsWithFeeDetails.reduce((sum, s) => sum + s.totalPaid, 0) },
            { Report: "Total Discounts Given", Value: studentsWithFeeDetails.reduce((sum, s) => sum + s.totalDiscount, 0) },
            { Report: "Overall Balance Due", Value: totalPendingAcrossAll },
        ];
        const classWiseData = Object.entries(classWisePending)
            .sort((a,b) => a[0].localeCompare(b[0]))
            .map(([className, pendingAmount]) => ({ Class: className, "Total Pending (INR)": pendingAmount }));

        const combinedData = [];

        summaryData.forEach(item => {
            combinedData.push({
                Overall: "Overall Summary",
                Report: item.Report,
                Value: item.Value,
                Class: '',
                "Total Pending (INR)": ''
            });
        });

        combinedData.push({
            Overall: "Class-wise Pending",
            Report: '',
            Value: '',
            Class: '',
            "Total Pending (INR)": ''
        });

        classWiseData.forEach(item => {
            combinedData.push({
                Overall: "Class-wise Pending",
                Report: '',
                Value: '',
                Class: `Class ${item.Class}`,
                "Total Pending (INR)": item["Total Pending (INR)"]
            });
        });

        const headers = ["Overall", "Report", "Value", "Class", "Total Pending (INR)"];
        const keys = ["Overall", "Report", "Value", "Class", "Total Pending (INR)"];
        exportToCSV(combinedData, "fee_reports_summary", headers, keys, loggedInUser.permissions);
    };

    const exportStudentListToCSV = () => {
        const dataToExport = [];

        students.forEach(student => {
            const baseStudentData = {
                'Name': student.name,
                'RollNumber': student.rollNumber,
                'Class': student.class,
                'Grade': student.grade,
                'TotalFees': student.totalFees,
                'Total Paid (Cumulative)': calculateFeeDetails(student).totalPaid,
                'Total Discount (Cumulative)': calculateFeeDetails(student).totalDiscount,
                'Balance Due': calculateFeeDetails(student).remainingBalance,
            };

            let transactionsAdded = false;

            student.payments.forEach(p => {
                dataToExport.push({
                    ...baseStudentData,
                    'Payment ID': p.id,
                    'Payment Amount': p.amount,
                    'Payment Date': formatDateTime(p.date),
                    'Payment Remarks': p.remarks || 'N/A',
                    'Discount ID': '',
                    'Discount Amount': '',
                    'Discount Reason': '',
                    'Discount Date': '',
                });
                transactionsAdded = true;
            });

            student.discounts.forEach(d => {
                dataToExport.push({
                    ...baseStudentData,
                    'Payment ID': '',
                    'Payment Amount': '',
                    'Payment Date': '',
                    'Payment Remarks': '',
                    'Discount ID': d.id,
                    'Discount Amount': d.amount,
                    'Discount Reason': d.reason || 'N/A',
                    'Discount Date': formatDateTime(d.date),
                });
                transactionsAdded = true;
            });

            if (!transactionsAdded) {
                dataToExport.push({
                    ...baseStudentData,
                    'Payment ID': '',
                    'Payment Amount': '',
                    'Payment Date': '',
                    'Payment Remarks': '',
                    'Discount ID': '',
                    'Discount Amount': '',
                    'Discount Reason': '',
                    'Discount Date': '',
                });
            }
        });

        const headers = [
            'Name', 'RollNumber', 'Class', 'Grade', 'TotalFees',
            'Total Paid (Cumulative)', 'Total Discount (Cumulative)', 'Balance Due',
            'Payment ID', 'Payment Amount', 'Payment Date', 'Payment Remarks',
            'Discount ID', 'Discount Amount', 'Discount Reason', 'Discount Date'
        ];
        const keys = headers;

        exportToCSV(dataToExport, 'student_list_with_transactions', headers, keys, loggedInUser.permissions);
    };


    const exportAllTransactionsToCSV = () => {
        if (!loggedInUser.permissions.canImportExport) {
            alert("You do not have permission to export all transactions.");
            return;
        }

        const allTransactions = [];

        students.forEach(student => {
            student.payments.forEach(p => {
                allTransactions.push({
                    'Student Name': student.name,
                    'Roll Number': student.rollNumber,
                    'Type': 'Payment',
                    'Transaction ID': p.id,
                    'Amount (INR)': p.amount,
                    'Date': formatDateTime(p.date),
                    'Remarks/Reason': p.remarks || 'N/A'
                });
            });

            student.discounts.forEach(d => {
                allTransactions.push({
                    'Student Name': student.name,
                    'Roll Number': student.rollNumber,
                    'Type': 'Discount',
                    'Transaction ID': d.id,
                    'Amount (INR)': d.amount,
                    'Date': formatDateTime(d.date),
                    'Remarks/Reason': d.reason || 'N/A'
                });
            });
        });

        allTransactions.sort((a, b) => new Date(b.Date) - new Date(a.Date));

        const headers = [
            'Student Name', 'Roll Number', 'Type', 'Transaction ID',
            'Amount (INR)', 'Date', 'Remarks/Reason'
        ];
        const keys = headers;

        exportToCSV(allTransactions, 'all_transactions', headers, keys, loggedInUser.permissions);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Navbar
                loggedInUser={loggedInUser}
                setCurrentView={setCurrentView}
                handleLogout={handleLogout}
                currentView={currentView}
            />

            {!loggedInUser ? (
                <LoginScreen onLogin={handleLogin} errorMessage={loginError} />
            ) : (
                <>
                    {currentView === 'dashboard' && (
                        <Dashboard
                            students={students}
                            loggedInUser={loggedInUser}
                            openModal={openModal}
                            handleImportStudentsFromFile={handleImportStudentsFromFile}
                            confirmDeleteStudent={confirmDeleteStudent}
                            handleViewStudent={handleViewStudent}
                            totalPendingAcrossAll={totalPendingAcrossAll}
                            uniqueClasses={uniqueClasses}
                            uniqueGrades={uniqueGrades}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterClass={filterClass}
                            setFilterClass={setFilterClass}
                            filterGrade={filterGrade}
                            setFilterGrade={setFilterGrade}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                            getSortIndicator={getSortIndicator}
                            sortedStudents={sortedStudents}
                            studentsWithFeeDetails={studentsWithFeeDetails} // Pass this to dashboard if needed
                            exportMainReportsToCSV={exportMainReportsToCSV}
                            exportStudentListToCSV={exportStudentListToCSV}
                            exportAllTransactionsToCSV={exportAllTransactionsToCSV}
                        />
                    )}
                    {currentView === 'studentDetail' && selectedStudent && (
                        <StudentDetail
                            student={selectedStudent}
                            onBack={() => { setCurrentView('dashboard'); setSelectedStudent(null); }}
                            onAddPayment={handleAddPayment}
                            onAddDiscount={handleAddDiscount}
                            onUpdateDiscount={handleUpdateDiscount}
                            onDeleteDiscount={confirmDeleteDiscount}
                            loggedInUser={loggedInUser}
                            openModal={openModal}
                            confirmDeleteStudent={confirmDeleteStudent}
                        />
                    )}
                    {currentView === 'reports' && loggedInUser.permissions.canViewReports && (
                        <ReportsScreen
                            students={students}
                            studentsWithFeeDetails={studentsWithFeeDetails}
                            totalPendingAcrossAll={totalPendingAcrossAll}
                            classWisePending={classWisePending}
                            loggedInUser={loggedInUser}
                        />
                    )}
                    {currentView === 'dailyReport' && loggedInUser.permissions.canViewReports && (
                        <DailyCollectionsReport
                            students={students}
                            loggedInUser={loggedInUser}
                        />
                    )}
                    {currentView === 'monthlyReport' && loggedInUser.permissions.canViewReports && (
                        <MonthlyCollectionsReport
                            students={students}
                            loggedInUser={loggedInUser}
                        />
                    )}
                    {currentView === 'userManagement' && loggedInUser.role === 'admin' && (
                        <UserManagementScreen
                            users={appUsers}
                            onAddUser={handleAddAppUser}
                            onDeleteUser={confirmDeleteAppUser}
                            onChangeRole={handleChangeUserRole}
                            onUpdateUserPermissions={handleUpdateUserPermissions}
                            loggedInUser={loggedInUser}
                        />
                    )}

                    <AddEditStudentModal
                        isOpen={isModalOpen && modalType === 'addStudent'}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleAddStudent}
                    />
                    <AddEditStudentModal
                        isOpen={isModalOpen && modalType === 'editStudent'}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleUpdateStudent}
                        student={currentStudentForModal}
                    />
                    <AddPaymentModal
                        isOpen={isModalOpen && modalType === 'addPayment'}
                        onClose={() => setIsModalOpen(false)}
                        onAddPayment={handleAddPayment}
                        student={currentStudentForModal}
                    />
                    <AddEditDiscountModal
                        isOpen={isModalOpen && modalType === 'addDiscount'}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleAddDiscount}
                        student={currentStudentForModal}
                    />
                    <AddEditDiscountModal
                        isOpen={isModalOpen && modalType === 'editDiscount'}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleUpdateDiscount}
                        student={currentStudentForModal}
                        discount={currentDiscountForModal}
                    />

                    <ConfirmationModal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleConfirmAction}
                        title={confirmModalTitle}
                        message={confirmModalMessage}
                    />
                </>
            )}
        </div>
    );
}

export default App;
