// Variables to hold data
let employees = [];
let clockRecords = [];
let holidays = [];
let payrollRecords = [];

// Constants
const DAILY_BASE_HOURS = 9;  // Base working day is 9 hours
const OVERTIME_WEEKDAY_MULTIPLIER = 1.5;  // 1.5x for Mon-Sat
const OVERTIME_WEEKEND_MULTIPLIER = 2.0;  // 2x for Sunday/holidays

// Initialize the page
function init() {
    loadData();
    
    // Set default date to today
    const today = new Date();
    document.getElementById("weekDate").value = formatDateInput(today);
    
    calculatePayroll();
}

// Load all data from localStorage
function loadData() {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
    }
    
    const savedRecords = localStorage.getItem("clockRecords");
    if (savedRecords) {
        clockRecords = JSON.parse(savedRecords);
    }
    
    const savedHolidays = localStorage.getItem("holidays");
    if (savedHolidays) {
        holidays = JSON.parse(savedHolidays);
    }
    const savedPayrollRecords = localStorage.getItem("payrollRecords");

    if (savedPayrollRecords) {
    payrollRecords = JSON.parse(savedPayrollRecords);
    }
}
// Save payroll records to localStorage
function savePayrollRecords() {
    localStorage.setItem(
        "payrollRecords",
        JSON.stringify(payrollRecords)
    );
}
// Create a payroll record for the selected week
function createPayrollRecord(employeePayroll, weekRange) {

    const weekStarting = formatDateInput(weekRange.monday);

    // Check whether this employee already has payroll
    // for this particular week
    const existingRecord = payrollRecords.find(function(record) {
        return record.employeeId === employeePayroll.employee.id &&
               record.weekStarting === weekStarting;
    });

    // If payroll already exists, don't create another one
    if (existingRecord) {
        return existingRecord;
    }

    const payrollRecord = {
        employeeId: employeePayroll.employee.id,
        employeeName: employeePayroll.employee.name,

        weekStarting: weekStarting,

        totalHours: employeePayroll.totalHours,
        regularHours: employeePayroll.regularHours,
        overtimeHours: employeePayroll.overtimeHours,

        regularPay: employeePayroll.regularPay,
        overtimePay: employeePayroll.overtimePay,
        totalPay: employeePayroll.totalPay,

        incompleteShifts: employeePayroll.incompleteShifts,

        status: "Draft",

        createdAt: new Date().toISOString(),
        approvedAt: null
    };

    payrollRecords.push(payrollRecord);

    savePayrollRecords();

    return payrollRecord;
}
// Approve a payroll record
function approvePayroll(employeeId, weekStarting) {

    const payrollRecord = payrollRecords.find(function(record) {
        return record.employeeId === employeeId &&
               record.weekStarting === weekStarting;
    });

    if (!payrollRecord) {
        alert("Payroll record not found.");
        return;
    }

    if (payrollRecord.status === "Locked") {
        alert("This payroll is already locked.");
        return;
    }

    if (payrollRecord.status === "Approved") {
        alert("This payroll has already been approved.");
        return;
    }

    // Do not approve payroll with incomplete attendance
    if (payrollRecord.incompleteShifts > 0) {
        alert(
            "Payroll cannot be approved because there are incomplete attendance records."
        );
        return;
    }

    const confirmation = confirm(
        "Approve payroll for " +
        payrollRecord.employeeName +
        "?\n\n" +
        "Amount: KSh " +
        payrollRecord.totalPay.toFixed(2)
    );

    if (!confirmation) {
        return;
    }

    payrollRecord.status = "Approved";
    payrollRecord.approvedAt = new Date().toISOString();

    savePayrollRecords();

    alert("Payroll approved successfully.");
}
// Lock an approved payroll record
function lockPayroll(employeeId, weekStarting) {

    const payrollRecord = payrollRecords.find(function(record) {
        return record.employeeId === employeeId &&
               record.weekStarting === weekStarting;
    });

    if (!payrollRecord) {
        alert("Payroll record not found.");
        return;
    }

    if (payrollRecord.status !== "Approved") {
        alert("Only approved payroll can be locked.");
        return;
    }

    const confirmation = confirm(
        "LOCK this payroll?\n\n" +
        payrollRecord.employeeName +
        "\n" +
        "Amount: KSh " +
        payrollRecord.totalPay.toFixed(2) +
        "\n\n" +
        "Once locked, this payroll should not be changed."
    );

    if (!confirmation) {
        return;
    }

    payrollRecord.status = "Locked";
    payrollRecord.lockedAt = new Date().toISOString();

    savePayrollRecords();

    alert("Payroll locked successfully.");
}
// Format date for input field (YYYY-MM-DD)
function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// Get Monday and Sunday for the week containing the given date
function getWeekRange(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Calculate how many days to go back to reach Monday
    // If today is Monday (1), go back 0 days
    // If today is Tuesday (2), go back 1 day
    // If today is Sunday (0), go back 6 days
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
}
// Check if a date is a Sunday
function isSunday(date) {
    return date.getDay() === 0;
}

// Check if a date is a public holiday
function isHoliday(date) {
    const dateStr = formatDateInput(date);
    return holidays.some(function(holiday) {
        return holiday.date === dateStr;
    });
}

// Get the overtime multiplier for a given day
function getOvertimeMultiplier(date) {
    if (isSunday(date) || isHoliday(date)) {
        return OVERTIME_WEEKEND_MULTIPLIER; // 2.0
    }
    return OVERTIME_WEEKDAY_MULTIPLIER; // 1.5
}
// Get clock records for an employee on a specific day
function getDayRecords(employeeId, date) {
    const dateStr = formatDateInput(date);
    
    return clockRecords.filter(function(record) {
        const recordDate = new Date(record.timestamp);
        return record.employeeId === employeeId && 
               formatDateInput(recordDate) === dateStr;
    }).sort(function(a, b) {
        // Sort by time
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
}

// Calculate hours worked for an employee on a specific day
// Handles night shifts where Clock Out is the next day
// Calculate hours worked for an employee on a specific day
// Handles multiple shifts and overnight shifts
// Calculate attendance details for an employee on a specific day
// Handles multiple shifts and overnight shifts

function calculateDayAttendance(employeeId, date) {

    const dateStr = formatDateInput(date);

    // The next calendar day
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const nextDateStr = formatDateInput(nextDate);

    // Find Clock In records for this employee on this date
    const clockIns = clockRecords
        .filter(function(record) {

            const recordDate = new Date(record.timestamp);

            return record.employeeId === employeeId &&
                   record.action === "Clock In" &&
                   formatDateInput(recordDate) === dateStr;
        })
        .sort(function(a, b) {

            return new Date(a.timestamp) -
                   new Date(b.timestamp);

        });

    let totalHours = 0;
    let completedShifts = 0;
    let incompleteShifts = 0;

    let usedClockOuts = [];

    // Store completed shifts
    const shifts = [];

    // Process each Clock In
    clockIns.forEach(function(clockInRecord) {

        const clockInTime =
            new Date(clockInRecord.timestamp);

        // Find the first unused Clock Out after this Clock In
        // on the same day or the following day.
        const matchingOut = clockRecords

            .filter(function(record) {

                const recordDate =
                    new Date(record.timestamp);

                return record.employeeId === employeeId &&
                       record.action === "Clock Out" &&
                       (
                           formatDateInput(recordDate) === dateStr ||
                           formatDateInput(recordDate) === nextDateStr
                       ) &&
                       recordDate > clockInTime &&
                       !usedClockOuts.includes(record.timestamp);

            })

            .sort(function(a, b) {

                return new Date(a.timestamp) -
                       new Date(b.timestamp);

            })[0];

        // No Clock Out means incomplete shift
        if (!matchingOut) {

            incompleteShifts++;

            return;
        }

        const clockOutTime =
            new Date(matchingOut.timestamp);

        const hoursWorked =
            (clockOutTime - clockInTime) /
            (1000 * 60 * 60);

        // Ignore invalid records
        if (hoursWorked <= 0) {

            incompleteShifts++;

            return;
        }

        totalHours += hoursWorked;

        completedShifts++;

        // Save the individual shift
        shifts.push({

            clockIn: clockInTime.toISOString(),

            clockOut: clockOutTime.toISOString(),

            elapsedHours: hoursWorked

        });

        // Prevent this Clock Out from being used again
        usedClockOuts.push(
            matchingOut.timestamp
        );

    });

    return {

        totalHours: totalHours,

        completedShifts: completedShifts,

        incompleteShifts: incompleteShifts,

        shifts: shifts

    };
}

// Calculate payroll for one employee for the week

function calculateEmployeePayroll(employee, weekRange) {

    const dailyRate = Number(employee.dailyRate) || 800;

    // Normal working day:
    // 8 actual working hours
    // + 1 paid break hour
    const NORMAL_WORKING_HOURS = 8;
    const PAID_BREAK_HOURS = 1;

    // Hourly rate is based on actual working hours.
    const hourlyRate =
        dailyRate / NORMAL_WORKING_HOURS;

    let totalHours = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalRegularPay = 0;
    let totalOvertimePay = 0;

    const dailyBreakdown = [];
    let totalIncompleteShifts = 0;

    // Calculate each day of the week
    for (let i = 0; i < 7; i++) {

        const currentDate =
            new Date(weekRange.monday);

        currentDate.setDate(
            weekRange.monday.getDate() + i
        );

        const attendance =
            calculateDayAttendance(
                employee.id,
                currentDate
            );
         totalIncompleteShifts +=
         attendance.incompleteShifts;

        const elapsedHours =
            attendance.totalHours;

        // No completed attendance
        if (elapsedHours <= 0) {
            continue;
        }

        /*
         * Determine the paid break.
         *
         * A shift of 9 hours or more contains:
         * 8 working hours + 1 paid break.
         *
         * The break is paid but is NOT working time.
         */
        const paidBreakHours =
            elapsedHours >= 9
                ? PAID_BREAK_HOURS
                : 0;

        // Remove the paid break from elapsed time
        // to determine actual working hours.
        const workingHours =
            Math.max(
                0,
                elapsedHours - paidBreakHours
            );

        // First 8 actual working hours are regular.
        const regularHours =
            Math.min(
                workingHours,
                NORMAL_WORKING_HOURS
            );

        // Anything beyond 8 actual working hours
        // is overtime.
        const overtimeHours =
            Math.max(
                0,
                workingHours -
                NORMAL_WORKING_HOURS
            );

        const isSunday =
            currentDate.getDay() === 0;

        const holidayStatus =
            isHoliday(currentDate);

        /*
         * Sunday and public holiday:
         * ALL actual working hours are paid at 2x.
         *
         * Normal weekday/Saturday:
         * Regular hours = 1x
         * Overtime = 1.5x
         */
        let regularMultiplier = 1.0;
        let overtimeMultiplier = 1.5;

        if (isSunday || holidayStatus) {

            regularMultiplier = 2.0;
            overtimeMultiplier = 2.0;
        }

        const regularPay =
            regularHours *
            hourlyRate *
            regularMultiplier;

        const overtimePay =
            overtimeHours *
            hourlyRate *
            overtimeMultiplier;

        /*
         * The paid break is paid at the normal hourly rate.
         *
         * On Sunday/public holiday it is also paid at 2x,
         * because the entire paid day is treated at the
         * applicable holiday/Sunday rate.
         */
        const breakPay =
            paidBreakHours *
            hourlyRate *
            regularMultiplier;

        const totalDayRegularPay =
            regularPay + breakPay;

        const paidRegularHours =
            regularHours +
            paidBreakHours;

        totalHours += elapsedHours;

        totalRegularHours +=
            paidRegularHours;

        totalOvertimeHours +=
            overtimeHours;

        totalRegularPay +=
            totalDayRegularPay;

        totalOvertimePay +=
            overtimePay;

        dailyBreakdown.push({

            date: currentDate,

            hoursWorked: elapsedHours,

            workingHours: workingHours,

            regularHours: paidRegularHours,

            paidBreakHours: paidBreakHours,

            overtimeHours: overtimeHours,

            hourlyRate: hourlyRate,

            regularMultiplier: regularMultiplier,

            overtimeMultiplier: overtimeMultiplier,

            regularPay: totalDayRegularPay,

            overtimePay: overtimePay,

            totalPay:
                totalDayRegularPay +
                overtimePay,

            isSunday: isSunday,

            isHoliday: holidayStatus
        });
    }

    return {

        employee: employee,

        dailyRate: dailyRate,

        hourlyRate: hourlyRate,

        totalHours: totalHours,

        totalRegularHours: totalRegularHours,

        totalOvertimeHours: totalOvertimeHours,

        totalRegularPay: totalRegularPay,

        totalOvertimePay: totalOvertimePay,

        totalPay:
            totalRegularPay +
            totalOvertimePay,

        dailyBreakdown: dailyBreakdown,

        incompleteShifts:
    totalIncompleteShifts
    };
}
// Main function to calculate and display payroll
function calculatePayroll() {
    const selectedDate = new Date(document.getElementById("weekDate").value);
    const weekRange = getWeekRange(selectedDate);
    
    // Display the week range
    const weekRangeText = formatDateDisplay(weekRange.monday) + 
                          " - " + 
                          formatDateDisplay(weekRange.sunday);
    document.getElementById("weekRange").textContent = weekRangeText;
    
    // Calculate payroll for each employee
   const payrollData = [];
let totalPayroll = 0;

employees.forEach(function(employee) {

    // Calculate the current attendance-based payroll
    const calculatedData =
        calculateEmployeePayroll(
            employee,
            weekRange
        );

    // Check whether a saved payroll record exists
    const weekStarting =
        formatDateInput(weekRange.monday);

    const savedRecord =
        payrollRecords.find(function(record) {

            return record.employeeId === employee.id &&
                   record.weekStarting === weekStarting;
        });

    // If payroll is LOCKED, use the saved historical values
    if (savedRecord && savedRecord.status === "Locked") {

        payrollData.push({
            employee: employee,

            totalHours: savedRecord.totalHours,

            regularHours: savedRecord.regularHours,

            overtimeHours: savedRecord.overtimeHours,

            regularPay: savedRecord.regularPay,

            overtimePay: savedRecord.overtimePay,

            totalPay: savedRecord.totalPay,

            incompleteShifts: savedRecord.incompleteShifts,

            dailyBreakdown: []
        });

        totalPayroll += savedRecord.totalPay;

        return;
    }

    // Otherwise use the current calculated values
    if (
        calculatedData.totalHours > 0 ||
        calculatedData.incompleteShifts > 0
    ) {

        payrollData.push(calculatedData);

        totalPayroll += calculatedData.totalPay;
    }
});
    
    // Display the table
    displayPayrollTable(payrollData);
    
    // Display total
    document.getElementById("totalPayroll").textContent = 
        "Total Payroll: KES " + totalPayroll.toFixed(2);
}

// Format date for display (e.g., "Mon Jan 05")
function formatDateDisplay(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return days[date.getDay()] + " " + 
           months[date.getMonth()] + " " + 
           String(date.getDate()).padStart(2, '0');
}

// Display the payroll table
function displayPayrollTable(payrollData) {

    const tbody = document.querySelector("#payrollTable tbody");

    tbody.innerHTML = "";

    if (payrollData.length === 0) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="9" style="text-align: center;">' +
            'No clock records for this week.' +
            '</td>' +
            '</tr>';

        return;
    }

    // Get the selected week's Monday
    const selectedDate =
        new Date(document.getElementById("weekDate").value);

    const weekRange = getWeekRange(selectedDate);

    const weekStarting =
        formatDateInput(weekRange.monday);

    payrollData.forEach(function(data) {

        // Look for an existing payroll record
        const existingRecord = payrollRecords.find(function(record) {

            return record.employeeId === data.employee.id &&
                   record.weekStarting === weekStarting;

        });

        // If no payroll record exists yet, treat it as Draft
        const status =
            existingRecord
                ? existingRecord.status
                : "Draft";

        let statusText = status;

        // Create action buttons
        let actions = "";

        if (!existingRecord) {

            actions =
                '<button onclick="createAndShowPayroll(\'' +
                data.employee.id +
                '\')">' +
                'Create Draft' +
                '</button>';

        } else if (status === "Draft") {

            actions =
                '<button onclick="approvePayroll(\'' +
                data.employee.id +
                '\', \'' +
                weekStarting +
                '\')">' +
                'Approve' +
                '</button>';

        } else if (status === "Approved") {

            actions =
                '<button onclick="lockPayroll(\'' +
                data.employee.id +
                '\', \'' +
                weekStarting +
                '\')">' +
                'Lock' +
                '</button>';

        } else if (status === "Locked") {

            actions =
                '<span>Locked</span>';
        }

        const row = `
            <tr>
                <td>${data.employee.name}</td>

                <td>${data.totalHours.toFixed(1)}</td>

                <td>${data.regularHours.toFixed(1)}</td>

                <td>${data.overtimeHours.toFixed(1)}</td>

                <td>${data.regularPay.toFixed(2)}</td>

                <td>${data.overtimePay.toFixed(2)}</td>

                <td>
                    <strong>
                        ${data.totalPay.toFixed(2)}
                    </strong>
                </td>

                <td>
                    ${statusText}
                </td>

                <td>
                    ${actions}

                    <button
                        onclick="showDetails('${data.employee.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;

        tbody.innerHTML += row;
    });
}

// Create a Draft payroll record
function createAndShowPayroll(employeeId) {

    const selectedDate =
        new Date(document.getElementById("weekDate").value);

    const weekRange =
        getWeekRange(selectedDate);

    const employeePayroll =
        calculateEmployeePayroll(
            employees.find(function(employee) {
                return employee.id === employeeId;
            }),
            weekRange
        );

    const record =
        createPayrollRecord(
            employeePayroll,
            weekRange
        );

    alert(
        "Payroll Draft created for " +
        record.employeeName +
        "."
    );

    // Refresh the payroll table
    calculatePayroll();
}
// Show details for an employee (placeholder for now)
function showDetails(employeeId) {
  const selectedDate = document.getElementById("weekDate").value;
    const weekRange = getWeekRange(new Date(selectedDate));
    const weekDateStr = formatDateInput(weekRange.monday);
    
    window.location.href = `employee-payroll.html?id=${employeeId}&week=${weekDateStr}`;
}
// Initialize Employee Payroll Details page
function initEmployeePayrollDetails() {
     // Load employees, attendance and holidays from localStorage
    loadData();
    const urlParams = new URLSearchParams(window.location.search);

    const employeeId = urlParams.get("id");
    const weekStarting = urlParams.get("week");

    if (!employeeId || !weekStarting) {
        alert("Employee or payroll week was not specified.");
        return;
    }

    // Find employee
    const employee = employees.find(function(employee) {
        return employee.id === employeeId;
    });

    if (!employee) {
        alert("Employee not found.");
        return;
    }

    // Convert week starting date into a Date object
    const monday = new Date(weekStarting + "T00:00:00");

    if (isNaN(monday.getTime())) {
        alert("Invalid payroll week.");
        return;
    }

    // Get the full week
    const weekRange = getWeekRange(monday);

    // Calculate payroll using the SAME payroll engine
    const payrollData = calculateEmployeePayroll(
        employee,
        weekRange
    );

    // Display employee information
    document.getElementById("employeeName").textContent =
        employee.name;

    document.getElementById("employeeId").textContent =
        employee.id;

    document.getElementById("dailyRate").textContent =
        employee.dailyRate || 800;

    document.getElementById("weekRange").textContent =
        formatDateDisplay(weekRange.monday) +
        " - " +
        formatDateDisplay(weekRange.sunday);

    // Display daily breakdown
    displayEmployeePayrollDetails(
        payrollData,
        weekRange
    );
}


// Display the employee's daily payroll breakdown
function displayEmployeePayrollDetails(payrollData, weekRange) {

    const tbody = document.querySelector("#detailsTable tbody");

    tbody.innerHTML = "";

    let totalHours = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalRegularPay = 0;
    let totalOvertimePay = 0;

    // Display all seven days
    for (let i = 0; i < 7; i++) {

        const currentDate = new Date(weekRange.monday);

        currentDate.setDate(
            weekRange.monday.getDate() + i
        );

        // Find the calculation for this day
        const dayData = payrollData.dailyBreakdown.find(
            function(day) {
                return formatDateInput(day.date) ===
                       formatDateInput(currentDate);
            }
        );

       // Get attendance information
const attendance = calculateDayAttendance(
    payrollData.employee.id,
    currentDate
);

const dayHours = attendance.totalHours;

// Get clock in and clock out times
let clockInText = "-";
let clockOutText = "-";

if (attendance.shifts && attendance.shifts.length > 0) {

    const firstShift = attendance.shifts[0];

    if (firstShift.clockIn) {
        clockInText = new Date(firstShift.clockIn).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (firstShift.clockOut) {
        clockOutText = new Date(firstShift.clockOut).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
}

        let regularHours = 0;
        let overtimeHours = 0;
        let regularPay = 0;
        let overtimePay = 0;
        let rateText = "-";
        let notes = "";

        if (dayData) {

            regularHours = dayData.regularHours;
            overtimeHours = dayData.overtimeHours;
            regularPay = dayData.regularPay;
            overtimePay = dayData.overtimePay;

            rateText =
                dayData.multiplier.toFixed(1) + "x";

            if (dayData.isSunday) {
                notes = "Sunday";
            }

            if (dayData.isHoliday) {
                notes = notes
                    ? notes + " / Public Holiday"
                    : "Public Holiday";
            }

        } else if (attendance.incompleteShifts > 0) {

            notes = "Incomplete attendance";

        } else {

            notes = "No attendance";
        }

        // Add to weekly totals
        totalHours += dayHours;
        totalRegularHours += regularHours;
        totalOvertimeHours += overtimeHours;
        totalRegularPay += regularPay;
        totalOvertimePay += overtimePay;

        const row = `
            <tr>
                <td>${formatDateDisplay(currentDate).split(" ")[0]}</td>

                <td>${formatDateInput(currentDate)}</td>

                <td>${clockInText}</td>

                <td>${clockOutText}</td>

                <td>${dayHours.toFixed(2)}</td>

                <td>${regularHours.toFixed(2)}</td>

                <td>${overtimeHours.toFixed(2)}</td>

                <td>${rateText}</td>

                <td>${regularPay.toFixed(2)}</td>

                <td>${overtimePay.toFixed(2)}</td>

                <td>
                    ${(regularPay + overtimePay).toFixed(2)}
                </td>

                <td>${notes}</td>
            </tr>
        `;

        tbody.innerHTML += row;
    }

    // Display weekly totals
    document.getElementById("totalHours").textContent =
        totalHours.toFixed(2);

    document.getElementById("totalRegularHours").textContent =
        totalRegularHours.toFixed(2);

    document.getElementById("totalOvertimeHours").textContent =
        totalOvertimeHours.toFixed(2);

    document.getElementById("totalRegularPay").textContent =
        totalRegularPay.toFixed(2);

    document.getElementById("totalOvertimePay").textContent =
        totalOvertimePay.toFixed(2);

    document.getElementById("totalPay").textContent =
        (totalRegularPay + totalOvertimePay).toFixed(2);
}
// Start the correct page
if (document.getElementById("weekDate")) {
    // Payroll Summary page
    init();

} else if (document.getElementById("detailsTable")) {
    // Employee Payroll Details page
    initEmployeePayrollDetails();
}