// Variable to hold holidays
let holidays = [];

// Current selected year
let currentYear = 2026;

// Calculate Easter Sunday for any year (Anonymous Gregorian algorithm)
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
}

// Generate the 11 fixed + Easter holidays for a given year
function generateKenyanHolidays(year) {
    const easterSunday = calculateEaster(year);
    const goodFriday = new Date(easterSunday);
    goodFriday.setDate(easterSunday.getDate() - 2);
    
    const easterMonday = new Date(easterSunday);
    easterMonday.setDate(easterSunday.getDate() + 1);
    
    const holidays = [
        { name: "New Year's Day", date: `${year}-01-01` },
        { name: "Good Friday", date: formatDate(goodFriday) },
        { name: "Easter Monday", date: formatDate(easterMonday) },
        { name: "Labour Day", date: `${year}-05-01` },
        { name: "Madaraka Day", date: `${year}-06-01` },
        { name: "Moi Day", date: `${year}-06-10` },
        { name: "Huduma Day", date: `${year}-10-10` },
        { name: "Mashujaa Day", date: `${year}-10-20` },
        { name: "Jamhuri Day", date: `${year}-12-12` },
        { name: "Christmas Day", date: `${year}-12-25` },
        { name: "Boxing Day", date: `${year}-12-26` }
    ];
    
    return holidays;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Load holidays for the selected year (auto-add if not already loaded)
function loadYearHolidays() {
    const year = currentYear;
    
    // Generate the 11 Kenyan holidays for this year
    const kenyanHolidays = generateKenyanHolidays(year);
    
    // Check which holidays are already in the system
    kenyanHolidays.forEach(function(holiday) {
        const exists = holidays.some(function(h) {
            return h.date === holiday.date && h.name === holiday.name;
        });
        
        // If it doesn't exist, add it
        if (!exists) {
            holidays.push(holiday);
        }
    });
    
    // Save and refresh display
    saveHolidays();
    displayHolidays();
    
    alert(`Loaded holidays for ${year}!`);
}

// Change year and auto-load if needed
function changeYear() {
    currentYear = Number(document.getElementById("yearSelect").value);
    displayHolidays();
    
    // Check if this year's holidays are already loaded
    const kenyanHolidays = generateKenyanHolidays(currentYear);
    const allLoaded = kenyanHolidays.every(function(holiday) {
        return holidays.some(function(h) {
            return h.date === holiday.date && h.name === holiday.name;
        });
    });
    
    // If not all loaded, auto-load them
    if (!allLoaded) {
        loadYearHolidays();
    }
}

// Initialize the page
function init() {
    loadHolidays();
    
    // Set the dropdown to current year
    document.getElementById("yearSelect").value = currentYear;
    
    // Auto-load holidays for the current year
    changeYear();
}

// Load holidays from localStorage
function loadHolidays() {
    const savedHolidays = localStorage.getItem("holidays");
    if (savedHolidays) {
        holidays = JSON.parse(savedHolidays);
    }
}

// Save holidays to localStorage
function saveHolidays() {
    localStorage.setItem("holidays", JSON.stringify(holidays));
}

// Add a new holiday
function addHoliday() {
    const name = document.getElementById("holidayName").value.trim();
    const date = document.getElementById("holidayDate").value;

    // Validation
    if (name === "" || date === "") {
        alert("Please fill in both holiday name and date.");
        return;
    }

    // Check if holiday already exists on this date
    const exists = holidays.some(function(holiday) {
        return holiday.date === date;
    });

    if (exists) {
        alert("A holiday already exists on this date.");
        return;
    }

    // Create holiday object
    const holiday = {
        name: name,
        date: date
    };

    // Add to array
    holidays.push(holiday);

    // Save and refresh display
    saveHolidays();
    displayHolidays();

    // Clear form
    document.getElementById("holidayName").value = "";
    document.getElementById("holidayDate").value = "";

    alert("Holiday added successfully!");
}

// Delete a holiday
function deleteHoliday(index) {
    const confirmDelete = confirm("Are you sure you want to delete this holiday?");

    if (confirmDelete) {
        holidays.splice(index, 1);
        saveHolidays();
        displayHolidays();
    }
}

// Display holidays in the table
function displayHolidays() {
    const table = document.getElementById("holidayTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    // Filter holidays for the selected year
    const yearHolidays = holidays.filter(function(holiday) {
        return holiday.date.startsWith(currentYear);
    });

    if (yearHolidays.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No holidays for ' + currentYear + '.</td></tr>';
        return;
    }

    // Sort holidays by date
    const sortedHolidays = yearHolidays.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Display each holiday
    sortedHolidays.forEach(function(holiday) {
        const formattedDate = new Date(holiday.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const originalIndex = holidays.indexOf(holiday);

        const row = `
            <tr>
                <td>${formattedDate}</td>
                <td>${holiday.name}</td>
                <td>
                    <button onclick="deleteHoliday(${originalIndex})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Start the page
init();