// src/Navbar.js
import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, LogOut, BarChart3, CalendarDays, UserCog } from 'lucide-react';

const Navbar = ({ loggedInUser, setCurrentView, handleLogout, currentView }) => {
    const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const reportsTimeoutRef = useRef(null);
    const adminTimeoutRef = useRef(null);

    const handleReportsMouseEnter = () => { clearTimeout(reportsTimeoutRef.current); setReportsDropdownOpen(true); };
    const handleReportsMouseLeave = () => { reportsTimeoutRef.current = setTimeout(() => { setReportsDropdownOpen(false); }, 300); };
    const handleAdminMouseEnter = () => { clearTimeout(adminTimeoutRef.current); setAdminDropdownOpen(true); };
    const handleAdminMouseLeave = () => { adminTimeoutRef.current = setTimeout(() => { setAdminDropdownOpen(false); }, 300); };

    const handleDropdownItemClick = (view) => {
        setCurrentView(view);
        setReportsDropdownOpen(false);
        setAdminDropdownOpen(false);
    };

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-lg">
            <div className="container mx-auto flex flex-wrap justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer mb-2 sm:mb-0" onClick={() => setCurrentView('dashboard')}>Fee<span className="text-blue-400">Manager</span> Pro</h1>
                {loggedInUser && (
                    <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 md:space-x-3">
                        <button onClick={() => setCurrentView('dashboard')} className={`hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm ${currentView === 'dashboard' ? 'text-blue-400 font-semibold' : ''}`}>Dashboard</button>
                        {loggedInUser.permissions.canViewReports && (
                            <div className="relative" onMouseEnter={handleReportsMouseEnter} onMouseLeave={handleReportsMouseLeave}>
                                <button className={`hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm flex items-center ${(currentView === 'reports' || currentView === 'dailyReport' || currentView === 'monthlyReport') ? 'text-blue-400 font-semibold' : ''}`}>
                                    Reports <ChevronDown size={16} className="ml-1"/>
                                </button>
                                {reportsDropdownOpen && (
                                    <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20" onMouseEnter={handleReportsMouseEnter} onMouseLeave={handleReportsMouseLeave}>
                                        <a onClick={() => handleDropdownItemClick('reports')} className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><BarChart3 size={16} className="mr-2"/> Summary Reports</a>
                                        <a onClick={() => handleDropdownItemClick('dailyReport')} className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><CalendarDays size={16} className="mr-2"/> Daily Collections</a>
                                        <a onClick={() => handleDropdownItemClick('monthlyReport')} className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><CalendarDays size={16} className="mr-2"/> Monthly Collections</a>
                                    </div>
                                )}
                            </div>
                        )}
                        {loggedInUser.role === 'admin' && (
                            <div className="relative" onMouseEnter={handleAdminMouseEnter} onMouseLeave={handleAdminMouseLeave}>
                                <button className={`hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm flex items-center ${currentView === 'userManagement' ? 'text-blue-400 font-semibold' : ''}`}>
                                    Admin <ChevronDown size={16} className="ml-1"/>
                                </button>
                                {adminDropdownOpen && (
                                    <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20" onMouseEnter={handleAdminMouseEnter} onMouseLeave={handleAdminMouseLeave}>
                                        <a onClick={() => handleDropdownItemClick('userManagement')} className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><UserCog size={16} className="mr-2"/> User Management</a>
                                    </div>
                                )}
                            </div>
                        )}
                        <span className="text-gray-300 text-xs sm:text-sm hidden md:inline">Logged in as: {loggedInUser.email} ({loggedInUser.role})</span>
                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm flex items-center"><LogOut size={16} className="mr-1"/> Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
