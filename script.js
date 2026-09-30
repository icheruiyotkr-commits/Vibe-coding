let employees = [];
let nextEmployeeNumber = 1;

function addEmployee() {

    const name = document.getElementById("name").value;
    const telephone = document.getElementById("telephone").value;
    const department = document.getElementById("department").value;

    if (name === "" || telephone === "" || department === "") {
        alert("Please complete all fields.");
        return;
    }

    if (nextEmployeeNumber > 999) {
        alert("The maximum number of employees has been reached.");
        return;
    }

   const employeeId = getNextEmployeeId();

if (employeeId === null) {
    alert("The maximum number of employee IDs has been reached.");
    return;
}

    const employee = {
        id: employeeId,
        name: name,
        telephone: telephone,
        department: department,
        status: "Active"
    };

  employees.push(employee);

nextEmployeeNumber++;

localStorage.setItem("employees", JSON.stringify(employees));
localStorage.setItem("nextEmployeeNumber", nextEmployeeNumber);

displayEmployees();

    document.getElementById("name").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("department").value = "";
}


function displayEmployees() {

    const table = document.getElementById("employeeTable");

    table.innerHTML = "";

    employees.forEach(function(employee) {

        if (employee.status === "Former") {

            const row = `
                <tr>
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.telephone}</td>
                    <td>${employee.department}</td>
                    <td>
                        <button onclick="reactivateEmployee('${employee.id}')">
                            Reactivate
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
    });
}


function updateEmployee(employeeId) {

    const newTelephone = prompt("Enter new telephone number:");

    if (newTelephone === null || newTelephone === "") {
        return;
    }

    const employee = employees.find(function(employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.telephone = newTelephone;
    }
    localStorage.setItem("employees", JSON.stringify(employees));

    displayEmployees();
}


function deactivateEmployee(employeeId) {

    const employee = employees.find(function(employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.status = "Former";
    }
localStorage.setItem("employees", JSON.stringify(employees));

    displayEmployees();
}


function reactivateEmployee(employeeId) {

    const employee = employees.find(function(employee) {
        return employee.id === employeeId;
    });

    if (employee) {
        employee.status = "Active";
    }
localStorage.setItem("employees", JSON.stringify(employees));
    displayEmployees();
}
function searchEmployees() {

    const searchText = document.getElementById("search").value.toLowerCase();

    const table = document.getElementById("employeeTable");

    table.innerHTML = "";

    employees.forEach(function(employee) {

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
function loadEmployees() {

    const savedEmployees = localStorage.getItem("employees");
    const savedNextEmployeeNumber =
        localStorage.getItem("nextEmployeeNumber");

    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
    }

    if (savedNextEmployeeNumber) {
        nextEmployeeNumber = Number(savedNextEmployeeNumber);
    }

    displayEmployees();
}
loadEmployees();
function getNextEmployeeId() {

    while (nextEmployeeNumber <= 999) {

        const employeeId =
            "SBC" + String(nextEmployeeNumber).padStart(3, "0");

        const idAlreadyUsed = employees.some(function(employee) {
            return employee.id === employeeId;
        });

        if (!idAlreadyUsed) {
            return employeeId;
        }

        nextEmployeeNumber++;
    }

    return null;
}
