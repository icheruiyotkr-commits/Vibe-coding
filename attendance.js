// Variables to hold data
let employees = [];
let clockRecords = [];

// Initialize the page
function init() {
    loadEmployees();
    loadClockRecords();
    populateEmployeeList();
    displayClockRecords();
}

// Load employees from localStorage (shared with Employee Directory)
function loadEmployees() {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
    }
}

// Load clock records from localStorage
function loadClockRecords() {
    const savedRecords = localStorage.getItem("clockRecords");
    if (savedRecords) {
        clockRecords = JSON.parse(savedRecords);
    }
}

// Save clock records to localStorage
function saveClockRecords() {
    localStorage.setItem("clockRecords", JSON.stringify(clockRecords));
}

// Populate the combobox with employee names and IDs
function populateEmployeeList() {
    const datalist = document.getElementById("employeeList");
    datalist.innerHTML = "";

    employees.forEach(function(employee) {
        if (employee.status === "Active") {
            // Add option with both ID and name
            const option = document.createElement("option");
            option.value = employee.id + " - " + employee.name;
            datalist.appendChild(option);
        }
    });
}

// Clock In function
function clockIn() {
    const selectedValue = document.getElementById("employeeSelect").value;

    if (selectedValue === "") {
        alert("Please select an employee.");
        return;
    }

    // Extract employee ID
    const employeeId = selectedValue.split(" - ")[0];

    // Find the employee in the Employee Directory
    const employee = employees.find(function(emp) {
        return emp.id === employeeId;
    });

    // Make sure the employee exists and is Active
    if (!employee || employee.status !== "Active") {
        alert("Invalid employee. Please select an active employee from the list.");
        return;
    }
// Check if employee is already clocked in
const lastRecord = clockRecords
    .filter(function(record) {
        return record.employeeId === employeeId;
    })
    .sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
    })[0];

if (lastRecord && lastRecord.action === "Clock In") {
    alert("This employee is already clocked in.");
    return;
}

    // Create clock record
    const record = {
        employeeId: employeeId,
        action: "Clock In",
        timestamp: new Date().toISOString()
    };

    clockRecords.push(record);
    saveClockRecords();
    displayClockRecords();

    // Clear the selection
    document.getElementById("employeeSelect").value  = "";

alert("Clocked in successfully!");
}

// Clock Out function
function clockOut() {
    const selectedValue = document.getElementById("employeeSelect").value;

    if (selectedValue === "") {
        alert("Please select an employee.");
        return;
    }

    // Extract employee ID
    const employeeId = selectedValue.split(" - ")[0];

    // Find the employee in the Employee Directory
    const employee = employees.find(function(emp) {
        return emp.id === employeeId;
    });

    // Make sure the employee exists and is Active
    if (!employee || employee.status !== "Active") {
        alert("Invalid employee. Please select an active employee from the list.");
        return;
    }

    // Find the employee's most recent clock record
    const lastRecord = clockRecords
        .filter(function(record) {
            return record.employeeId === employeeId;
        })
        .sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        })[0];

    // Employee must have clocked in first
    if (!lastRecord || lastRecord.action !== "Clock In") {
        alert("This employee is not currently clocked in.");
        return;
    }

    // Create clock-out record
    const record = {
        employeeId: employeeId,
        action: "Clock Out",
        timestamp: new Date().toISOString()
    };

    clockRecords.push(record);
    saveClockRecords();
    displayClockRecords();

    // Clear the selection
    document.getElementById("employeeSelect").value = "";

    alert("Clocked out successfully!");
}
function displayClockRecords() {
    const table = document.getElementById("clockTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    // Get today's date
    const today = new Date();
    const todayStr = today.toDateString();

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Get today's records
    const todayRecords = clockRecords.filter(function(record) {
        const recordDate = new Date(record.timestamp).toDateString();
        return recordDate === todayStr;
    });

    // Find unpaired Clock Ins from yesterday
    const yesterdayRecords = clockRecords.filter(function(record) {
        const recordDate = new Date(record.timestamp).toDateString();
        return recordDate === yesterdayStr;
    });

    // Check which yesterday Clock Ins are still unpaired
    const unpairedClockIns = [];

    yesterdayRecords.forEach(function(record) {
        if (record.action === "Clock In") {
            const hasMatchingOut = clockRecords.some(function(r) {
                return r.employeeId === record.employeeId &&
                       r.action === "Clock Out" &&
                       new Date(r.timestamp) > new Date(record.timestamp);
            });

            if (!hasMatchingOut) {
                unpairedClockIns.push(record);
            }
        }
    });

    // Combine yesterday's unpaired records with today's records
    const displayRecords = unpairedClockIns.concat(todayRecords);

    // Sort by time
    displayRecords.sort(function(a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Display each record
    displayRecords.forEach(function(record) {
        const employee = employees.find(function(emp) {
            return emp.id === record.employeeId;
        });

        if (employee) {
            const time = new Date(record.timestamp).toLocaleTimeString();

            const row = `
                <tr>
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${record.action}</td>
                    <td>${time}</td>
                    <td>
                        <button onclick="editRecord(${clockRecords.indexOf(record)})">Edit</button>
                    </td>
                </tr>
            `;

            tbody.innerHTML += row;
        }
    });
}
// Edit a clock record (for admin to fix mistakes)
function editRecord(recordIndex) {
    const record = clockRecords[recordIndex];
    const newTime = prompt("Enter new time (HH:MM):", new Date(record.timestamp).toTimeString().slice(0, 5));

    if (newTime === null || newTime === "") {
        return;
    }

    // Parse the time and update the record
    const [hours, minutes] = newTime.split(":");
    const date = new Date(record.timestamp);
    date.setHours(hours);
    date.setMinutes(minutes);

    record.timestamp = date.toISOString();
    saveClockRecords();
    displayClockRecords();
}

// Start the page
init();