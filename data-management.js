function exportData() {

    const data = {
        employees: JSON.parse(
            localStorage.getItem("employees") || "[]"
        ),

        nextEmployeeNumber: Number(
            localStorage.getItem("nextEmployeeNumber") || 1
        ),

        usedEmployeeIds: JSON.parse(
            localStorage.getItem("usedEmployeeIds") || "[]"
        ),

        idMode: localStorage.getItem("idMode") || "",

        clockRecords: JSON.parse(
            localStorage.getItem("clockRecords") || "[]"
        ),

        holidays: JSON.parse(
            localStorage.getItem("holidays") || "[]"
        ),

        payrollRecords: JSON.parse(
            localStorage.getItem("payrollRecords") || "[]"
        )
    };

    const jsonData = JSON.stringify(data, null, 2);

    const blob = new Blob(
        [jsonData],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const date = new Date()
        .toISOString()
        .slice(0, 10);

    link.download = "erp-backup-" + date + ".json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    document.getElementById("message").textContent =
        "Data exported successfully.";
}


function importData() {

    alert("Import function coming next.");
}


function clearAllData() {

    alert("Clear function coming next.");
}

function importData() {
    alert("Import function coming next.");
}


function clearAllData() {
    alert("Clear function coming next.");
}
function importData() {

    const fileInput = document.getElementById("importFile");

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a JSON file first.");
        return;
    }

    const file = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = function(event) {

        try {

            const importedData = JSON.parse(event.target.result);

            // Check that the basic structure exists
            if (
                !importedData ||
                !Array.isArray(importedData.employees) ||
                !Array.isArray(importedData.clockRecords) ||
                !Array.isArray(importedData.holidays)
            ) {
                alert(
                    "Invalid ERP data file. " +
                    "The file is missing required data."
                );
                return;
            }

            const confirmed = confirm(
                "Importing this file will replace the current " +
                "ERP data in this browser.\n\n" +
                "Do you want to continue?"
            );

            if (!confirmed) {
                return;
            }

            // Import employees
            localStorage.setItem(
                "employees",
                JSON.stringify(importedData.employees)
            );

            // Import employee ID sequence
            localStorage.setItem(
                "nextEmployeeNumber",
                importedData.nextEmployeeNumber || 1
            );

            // Import permanent employee ID history
            localStorage.setItem(
                "usedEmployeeIds",
                JSON.stringify(
                    importedData.usedEmployeeIds || []
                )
            );

            // Import ID assignment mode
            localStorage.setItem(
                "idMode",
                importedData.idMode || ""
            );

            // Import attendance
            localStorage.setItem(
                "clockRecords",
                JSON.stringify(importedData.clockRecords)
            );

            // Import holidays
            localStorage.setItem(
                "holidays",
                JSON.stringify(importedData.holidays)
            );

            // Import payroll records
            localStorage.setItem(
                "payrollRecords",
                JSON.stringify(
                    importedData.payrollRecords || []
                )
            );

            document.getElementById("message").textContent =
                "Data imported successfully.";

            alert(
                "Import successful. " +
                "The page will now refresh."
            );

            location.reload();

        } catch (error) {

            alert(
                "The selected file is not valid JSON."
            );

            console.error(error);
        }
    };

    reader.readAsText(file);
}

function clearAllData() {

    const confirmed = confirm(
        "WARNING\n\n" +
        "This will remove ALL ERP data currently stored " +
        "in this browser.\n\n" +
        "This includes:\n" +
        "- Employees\n" +
        "- Attendance records\n" +
        "- Holidays\n" +
        "- Payroll records\n" +
        "- Employee ID history\n\n" +
        "Your exported backup files will NOT be affected.\n\n" +
        "Are you sure you want to continue?"
    );

    if (!confirmed) {
        return;
    }

    // Remove ERP data
    localStorage.removeItem("employees");
    localStorage.removeItem("nextEmployeeNumber");
    localStorage.removeItem("usedEmployeeIds");
    localStorage.removeItem("idMode");

    localStorage.removeItem("clockRecords");
    localStorage.removeItem("holidays");
    localStorage.removeItem("payrollRecords");

    alert(
        "All prototype ERP data has been cleared."
    );

    location.reload();
}