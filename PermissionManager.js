// src/PermissionManager.js
import React, { useState, useEffect } from 'react';

const PermissionManager = ({ user, onUpdatePermissions }) => {
    const [currentPermissions, setCurrentPermissions] = useState(user.permissions);

    useEffect(() => {
        setCurrentPermissions(user.permissions);
    }, [user.permissions]);

    const handleTogglePermission = (permissionKey) => {
        setCurrentPermissions(prev => ({
            ...prev,
            [permissionKey]: !prev[permissionKey]
        }));
    };

    const handleSavePermissions = () => {
        onUpdatePermissions(user.email, currentPermissions);
    };

    const permissionList = [
        { key: 'canViewStudents', label: 'View Student Records (Dashboard Table)' },
        { key: 'canAddStudents', label: 'Add New Students' },
        { key: 'canEditStudents', label: 'Edit Student Information' },
        { key: 'canDeleteStudents', label: 'Delete Student Records' },
        { key: 'canManagePayments', label: 'Add/Manage Payments' },
        { key: 'canManageDiscounts', label: 'Add/Manage Discounts' },
        { key: 'canViewReports', label: 'View Reports (Summary, Daily, Monthly)' },
        { key: 'canImportExport', label: 'Import/Export Data (Excel)' },
        { key: 'canViewDashboardSummary', label: 'View Dashboard Summary Cards (Totals)' },
    ];

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Manage Permissions for {user.email}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {permissionList.map(perm => (
                    <div key={perm.key} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={currentPermissions[perm.key]}
                                onChange={() => handleTogglePermission(perm.key)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSavePermissions}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
            >
                Save Permissions
            </button>
        </div>
    );
};

export default PermissionManager;
