let employees = [];
let nextEmployeeNumber = 1;
let usedEmployeeIds = [];
let idMode = ""; // "" = nothing selected, "system" or "manual"

function init() {
    loadEmployees();
    displayEmployees();
    setIDMode(idMode);
}

function setIDMode(mode) {
    idMode = mode;

    const manualInput = document.getElementById("employeeIdInput");

    if (manualInput) {
        if (mode === "manual") {
            manualInput.style.display = "block";
        } else {
            manualInput.style.display = "none";
            manualInput.value = "";
        }
    }
}
function formatName(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, function(letter) {
            return letter.toUpperCase();
        });
}
function addEmployee() {
  if (idMode === "") {
        alert("Please select an Employee ID assignment method.");
        return;
    }
   const name = formatName(document.getElementById("name").value);
const telephone = document.getElementById("telephone").value.trim();
    if (!/^\d+$/.test(telephone)) {
    alert("Telephone number can only contain numbers.");
    return;
}
    const department = document.getElementById("department").value;
    const dailyRate = Number(document.getElementById("dailyRate").value);
    let employeeId = "";

    if (name === "" || telephone === "" || department === "") {
        alert("Please complete all fields.");
        return;
    }

    if (idMode === "system") {
        employeeId = getNextEmployeeId();
        if (employeeId === null) {
            alert("The maximum number of employee IDs has been reached.");
            return;
        }
    } else if (idMode === "manual") {
        const rawId = document.getElementById("employeeIdInput").value;

        if (rawId.trim() === "") {
            alert("Please enter an Employee ID.");
            return;
        }

        const trimmedId = rawId.trim();

        // Validate format: letters, numbers, hyphens only
        const regex = /^[A-Za-z0-9\-]+$/;
        if (!regex.test(trimmedId)) {
            alert("Employee ID can only contain letters, numbers, and hyphens.");
            return;
        }

        // Convert to uppercase for consistent storage and comparison
        const normalizedId = trimmedId.toUpperCase();

        // Case-insensitive duplicate check against permanent history
        if (usedEmployeeIds.includes(normalizedId)) {
            alert(
                'Employee ID "' +
                    trimmedId +
                    '" has already been used. Please choose a different ID.'
            );
            return;
        }

        employeeId = normalizedId;
    }

    const employee = {
        id: employeeId,
        name: name,
        telephone: telephone,
        department: department,
        dailyRate: dailyRate,
        status: "Active",
    };

    employees.push(employee);

    // Record in permanent history (uppercase)
    usedEmployeeIds.push(employeeId.toUpperCase());

    if (idMode === "system") {
        const numUsed = parseInt(employeeId.replace("SBC", ""), 10);
        nextEmployeeNumber = numUsed + 1;
    }

    saveData();
    displayEmployees();

    // Clear inputs
document.getElementById("name").value = "";
document.getElementById("telephone").value = "";
document.getElementById("department").value = "";
document.getElementById("dailyRate").value = "800";

const idInput = document.getElementById("employeeIdInput");

if (idInput) {
    idInput.value = "";
}

const idModeSelect = document.getElementById("idMode");

if (idModeSelect) {
    idModeSelect.value = "";
}

idMode = "";

if (idInput) {
    idInput.style.display = "none";
}

}

function getNextEmployeeId() {
    let num = nextEmployeeNumber;
    const usedSet = new Set(usedEmployeeIds);
    const maxNum = 999999; // Safety limit

    while (num <= maxNum) {
        // Dynamic padding: 3 digits for 1–999, 4+ for 1000+
        const padding = Math.max(3, String(num).length);
        const candidateId = "SBC" + String(num).padStart(padding, "0");

        if (!usedSet.has(candidateId)) {
            return candidateId;
        }

        num++;
    }

    return null;
}

function displayEmployees() {
    const table = document.getElementById("employeeTable");
    table.innerHTML = "";

    employees.forEach(function (employee) {
        if (employee.status === "Former") {
            const row = `
                <tr>
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.telephone}</td>
                    <td>${employee.department}</td>
                    <td>KES ${employee.dailyRate}</td>
                    <td>
                        <button onclick="reactivateEmployee('${employee.id}')">
                            Reactivate
                        </button>
                        <button onclick="changeRate('${employee.id}')">
                            Change Rate
                        </button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
            return;
        }

        const row = `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.telephone}</td>
                <td>${employee.department}</td>
                <td>KES ${employee.dailyRate}</td>
                <td>
                    <button onclick="updateEmployee('${employee.id}')">
                        Update
                    </button>
                    <button onclick="deactivateEmployee('${employee.id}')">
                        Deactivate
                    </button>
                    <button onclick="changeRate('${employee.id}')">
                        Change Rate
                    </button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

function updateEmployee(employeeId) {
    const newTelephone = prompt("Enter new telephone number:");

    if (newTelephone === null || newTelephone === "") {
        return;
    }

    const employee = employees.find(function (employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.telephone = newTelephone;
    }

    saveData();
    displayEmployees();
}
function changeRate(employeeId) {
    const newRate = prompt("Enter new daily rate (KES):");

    if (newRate === null || newRate === "") {
        return;
    }

    const rateNumber = Number(newRate);

    if (isNaN(rateNumber) || rateNumber <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    const employee = employees.find(function (employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.dailyRate = rateNumber;
    }
    saveData();
    displayEmployees();
}
function deactivateEmployee(employeeId) {
    const employee = employees.find(function (employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.status = "Former";
        // ID remains in usedEmployeeIds — it is NEVER freed
    }

    saveData();
    displayEmployees();
}

function reactivateEmployee(employeeId) {
    const employee = employees.find(function (employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.status = "Active";
        // Original ID preserved — no changes to ID needed
    }

    saveData();
    displayEmployees();
}

function searchEmployees() {
    const searchText = document.getElementById("search").value.toLowerCase();
    const table = document.getElementById("employeeTable");
    table.innerHTML = "";

    employees.forEach(function (employee) {
        if (employee.status === "Former") {
            return;
        }

        const matches =
            employee.id.toLowerCase().includes(searchText) ||
            employee.name.toLowerCase().includes(searchText) ||
            employee.telephone.includes(searchText);

        if (matches) {
            const row = `
                <tr>
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.telephone}</td>
                    <td>${employee.department}</td>
                    <td>KES ${employee.dailyRate}</td>
                    <td>
                        <button onclick="updateEmployee('${employee.id}')">
                            Update
                        </button>
                        <button onclick="deactivateEmployee('${employee.id}')">
                            Deactivate
                        </button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        }
    });
}

function saveData() {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("nextEmployeeNumber", nextEmployeeNumber);
    localStorage.setItem("usedEmployeeIds", JSON.stringify(usedEmployeeIds));
    localStorage.setItem("idMode", idMode);
}

function loadEmployees() {
    const savedEmployees = localStorage.getItem("employees");
    const savedNextEmployeeNumber = localStorage.getItem("nextEmployeeNumber");
    const savedUsedIds = localStorage.getItem("usedEmployeeIds");

    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
    }

    if (savedNextEmployeeNumber) {
        nextEmployeeNumber = Number(savedNextEmployeeNumber);
    }

    // Load usedEmployeeIds — normalize to uppercase for case-insensitive checks.
    // This does NOT modify any existing employee record's id field.
    if (savedUsedIds) {
        usedEmployeeIds = JSON.parse(savedUsedIds).map(function (id) {
            return id.toUpperCase();
        });
    } else {
        // First-time migration: seed from all existing employee IDs
        usedEmployeeIds = employees.map(function (e) {
            return e.id.toUpperCase();
        });
}

}
// Start the app
init();
