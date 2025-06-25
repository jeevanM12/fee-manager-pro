// src/utils.js

// --- Embedded Library Code ---
// This XLSX_CODE is a highly abridged placeholder for XLSX.FULL.MIN.JS.
// The actual code is hundreds of thousands of characters.
export const XLSX_CODE = `/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
var XLSX = {};
(function make_xlsx(XLSX){
    XLSX.utils = {
        json_to_sheet: function(data, opts) {
            console.log("XLSX.utils.json_to_sheet placeholder");
            if (!data || data.length === 0) return { "!ref": "A1" };
            let range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            let sheet = {};
            Object.keys(data[0]).forEach((key, c) => {
                if(range.s.c > c) range.s.c = c;
                if(range.e.c < c) range.e.c = c;
                sheet[XLSX.utils.encode_cell({c:c,r:0})] = { v: key, t: 's' }; // Header
            });
            if(range.s.r > 0) range.s.r = 0;
            if(range.e.r < 0) range.e.r = 0;

            data.forEach((row, r) => {
                Object.values(row).forEach((value, c) => {
                    const cell = { v: value };
                    if (typeof value === 'number') cell.t = 'n';
                    else if (typeof value === 'boolean') cell.t = 'b';
                    else if (value instanceof Date) cell.t = 'd';
                    else cell.t = 's';
                    sheet[XLSX.utils.encode_cell({c:c,r:r+1})] = cell;
                });
                if(range.e.r < r+1) range.e.r = r+1;
            });

            sheet['!ref'] = XLSX.utils.encode_range(range);
            return sheet;
        },
        book_new: function() { console.log("XLSX.utils.book_new placeholder"); return { SheetNames: [], Sheets: {} }; },
        book_append_sheet: function(wb, ws, name) { console.log("XLSX.utils.book_append_sheet placeholder"); wb.SheetNames.push(name); wb.Sheets[name] = ws; },
        writeFile: function(wb, filename) {
            console.log('Simulated download of ' + filename);
            const wbout = JSON.stringify(wb, null, 2);
            const blob = new Blob([wbout], { type: "application/json" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            console.log('Simulated download of ' + filename + ' completed.');
        },
        sheet_to_json: function(worksheet, options) {
            console.log("XLSX.utils.sheet_to_json placeholder");
            const data = [];
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const headers = [];

            for(let C = range.s.c; C <= range.e.c; ++C) {
                const cell = worksheet[XLSX.utils.encode_cell({r:range.s.r, c:C})];
                headers.push(cell ? String(cell.v).trim().toLowerCase().replace(/[^a-z0-9]/g, '') : 'col' + C);
            }

            for(let R = range.s.r + 1; R <= range.e.r; ++R) {
                const row = {};
                let hasData = false;
                for(let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = worksheet[XLSX.utils.encode_cell({r:R, c:C})];
                    row[headers[C - range.s.c]] = cell ? cell.v : undefined;
                    if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
                        hasData = true;
                    }
                }
                if (hasData) {
                    data.push(row);
                }
            }
            return data;
        },
        encode_cell: function(cell) {
            let s = "";
            let col = cell.c;
            for (; col >= 0; col = Math.floor(col / 26) - 1) s = String.fromCharCode(col % 26 + 65) + s;
            return s + (cell.r + 1);
        },
        decode_range: function(range) {
            const parts = range.split(':');
            return {
                s: XLSX.utils.decode_cell(parts[0]),
                e: XLSX.utils.decode_cell(parts[1])
            };
        },
        decode_cell: function(cell) {
            let R = 0, C = 0;
            for (let i = 0; i < cell.length; ++i) {
                const char = cell.charCodeAt(i);
                if (char >= 65 && char <= 90) C = C * 26 + (char - 64);
                else if (char >= 97 && char <= 122) C = C * 26 + (char - 96);
                else if (char >= 48 && char <= 57) R = R * 10 + (char - 48);
            }
            return { r: R - 1, c: C - 1 };
        }
    };
    XLSX.read = function(data, opts) {
        console.log("XLSX.read placeholder");
        const workbook = {
            SheetNames: ["Sheet1"],
            Sheets: {
                "Sheet1": {
                    "!ref": "A1:P3",
                    A1: { v: "Name", t: "s" }, B1: { v: "RollNumber", t: "s" }, C1: { v: "Class", t: "s" }, D1: { v: "Grade", t: "s" }, E1: { v: "TotalFees", t: "n" },
                    F1: { v: "Total Paid (Cumulative)", t: "s" }, G1: { v: "Total Discount (Cumulative)", t: "s" }, H1: { v: "Balance Due", t: "s" },
                    I1: { v: "Payment ID", t: "s" }, J1: { v: "Payment Amount", t: "s" }, K1: { v: "Payment Date", t: "s" }, L1: { v: "Payment Remarks", t: "s" },
                    M1: { v: "Discount ID", t: "s" }, N1: { v: "Discount Amount", t: "s" }, O1: { v: "Discount Reason", t: "s" }, P1: { v: "Discount Date", t: "s" },

                    A2: { v: "Amit Kumar", t: "s" }, B2: { v: "R001", t: "s" }, C2: { v: "10", t: "s" }, D2: { v: "A", t: "s" }, E2: { v: "50000", t: "n" },
                    F2: { v: "35000", t: "n" }, G2: { v: "2000", t: "n" }, H2: { v: "13000", t: "n" },
                    I2: { v: "P1", t: "s" }, J2: { v: "20000", t: "n" }, K2: { v: "2024-07-15T10:30:00Z", t: "s" }, L2: { v: "First Installment", t: "s" },
                    M2: { v: "D1", t: "s" }, N2: { v: "2000", t: "n" }, O2: { v: "Sibling Discount", t: "s" }, P2: { v: "2024-07-10T09:00:00Z", t: "s" },

                    A3: { v: "Priya Sharma", t: "s" }, B3: { v: "R002", t: "s" }, C3: { v: "12", t: "s" }, D3: { v: "B", t: "s" }, E3: { v: "60000", t: "n" },
                    F3: { v: "30000", t: "n" }, G3: { v: "0", t: "n" }, H3: { v: "30000", t: "n" },
                    I3: { v: "P3", t: "s" }, J3: { v: "30000", t: "n" }, K3: { v: "2024-07-20T11:00:00Z", t: "s" }, L3: { v: "Full Payment Attempt 1", t: "s" },
                    M3: { v: "N/A", t: "s" }, N3: { v: "N/A", t: "s" }, O3: { v: "N/A", t: "s" }, P3: { v: "N/A", t: "s" }
                }
            }
        };
        return workbook;
    };
})(XLSX);
`;

// --- Initial Data ---
// Default permissions for a 'user' role
export const defaultUserPermissions = {
    canViewStudents: true,
    canAddStudents: false,
    canEditStudents: false,
    canDeleteStudents: false,
    canManagePayments: false,
    canManageDiscounts: false,
    canViewReports: false,
    canImportExport: false,
    canManageUsers: false,
    canViewDashboardSummary: true,
};

// All permissions for an 'admin' role
export const adminPermissions = {
    canViewStudents: true,
    canAddStudents: true,
    canEditStudents: true,
    canDeleteStudents: true,
    canManagePayments: true,
    canManageDiscounts: true,
    canViewReports: true,
    canImportExport: true,
    canManageUsers: true,
    canViewDashboardSummary: true,
};

// Initial users with their default permissions
export const initialUsers = [
    { email: 'admin@example.com', password: 'adminpassword', role: 'admin', permissions: adminPermissions },
    { email: 'user@example.com', password: 'userpassword', role: 'user', permissions: defaultUserPermissions },
];

export const initialStudentsData = [
    { id: 'S1001', name: 'Amit Kumar', rollNumber: 'R001', class: '10', grade: 'A', totalFees: 50000, payments: [{ id: 'P1', amount: 20000, date: '2024-07-15T10:30:00Z', remarks: 'First Installment' },{ id: 'P2', amount: 15000, date: '2024-08-20T14:00:00Z', remarks: 'Second Installment' }], discounts: [{ id: 'D1', amount: 2000, reason: 'Sibling Discount', date: '2024-07-10T09:00:00Z' }] },
    { id: 'S1002', name: 'Priya Sharma', rollNumber: 'R002', class: '12', grade: 'B', totalFees: 60000, payments: [{ id: 'P3', amount: 30000, date: '2024-07-20T11:00:00Z', remarks: 'Full Payment Attempt 1' }], discounts: [] },
    { id: 'S1003', name: 'Rahul Singh', rollNumber: 'R003', class: '10', grade: 'A', totalFees: 50000, payments: [{ id: 'P4', amount: 10000, date: '2024-08-01T12:15:00Z', remarks: 'Partial Payment' }], discounts: [{ id: 'D2', amount: 1000, reason: 'Early Bird', date: '2024-07-05T10:00:00Z' }] },
];

// --- Helper Functions ---
export const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) { return 'Invalid Date'; }
};

export const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString();
    } catch (error) { return 'Invalid Date'; }
};

export const calculateFeeDetails = (student) => {
    const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDiscount = student.discounts.reduce((sum, d) => sum + d.amount, 0);
    const remainingBalance = student.totalFees - totalPaid - totalDiscount;
    const lastPayment = student.payments.length > 0 ? student.payments.reduce((latest, p) => new Date(p.date) > new Date(latest.date) ? p : latest) : null;
    return { totalPaid, totalDiscount, remainingBalance, lastPaymentDate: lastPayment ? lastPayment.date : null };
};

// Function to inject script into the DOM
export const injectScript = (id, code, onReady, checkGlobal) => {
    return new Promise((resolve, reject) => {
        if (checkGlobal && checkGlobal()) {
            console.log(`${id} global object already exists.`);
            onReady();
            resolve();
            return;
        }

        let scriptElement = document.getElementById(id);
        if (scriptElement && scriptElement.dataset.loaded === 'true') {
            console.log(`Script ${id} already injected and marked loaded.`);
            onReady();
            resolve();
            return;
        }
        if (scriptElement) {
            scriptElement.remove();
        }

        console.log(`Injecting script ${id}...`);
        scriptElement = document.createElement('script');
        scriptElement.id = id;
        scriptElement.type = 'text/javascript';
        scriptElement.textContent = code;

        document.head.appendChild(scriptElement);

        setTimeout(() => {
            if (checkGlobal && checkGlobal()) {
                console.log(`Script ${id} injected and global object confirmed.`);
                scriptElement.dataset.loaded = 'true';
                onReady();
                resolve();
            } else {
                console.error(`Failed to confirm global object for ${id} after injection.`);
                scriptElement.remove();
                reject(new Error(`Failed to initialize ${id} from embedded code.`));
            }
        }, 500);
    });
};


// Function to export data to CSV/Excel
export const exportToCSV = (data, filename, customHeaders = null, customKeys = null, loggedInUserPermissions) => {
    if (!loggedInUserPermissions.canImportExport) {
        alert("You do not have permission to export data.");
        return;
    }
    try {
        if (!data || data.length === 0) {
            alert("No data to export to Excel.");
            return;
        }

        const headers = customHeaders || Object.keys(data[0]);
        const keys = customKeys || Object.keys(data[0]);
        const csvRows = [];

        csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

        for (const row of data) {
            const values = keys.map(key => {
                const value = row[key];
                if (value === null || value === undefined) {
                    return '';
                }
                const stringValue = String(value);
                return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            alert('Your browser does not support downloading files directly. Please copy the data manually.');
        }
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert(`An error occurred while exporting to Excel: ${error.message || error.toString() || JSON.stringify(error) || 'Unknown error'}. Please check console for details.`);
    }
};
