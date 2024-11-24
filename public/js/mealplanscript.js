var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var dayElements = [];
for (var i = 1; i <= 7; i++) {
    dayElements.push(document.getElementById("day" + i));
}

document.addEventListener("DOMContentLoaded", function() {
    var startDateElement = document.getElementById("startdate");
    var endDateElement = document.getElementById("enddate");
    var options = { month: 'long', day: 'numeric' };

    // Retrieve saved start date from localStorage
    var savedStartDate = localStorage.getItem("startDate");
    if (savedStartDate) {
        // If a saved start date exists, use it
        var startDate = new Date(savedStartDate);
        var formattedStartDate = startDate.toLocaleDateString('en-US', options);
        startDateElement.textContent = formattedStartDate;

        // Display the day of the week
        for (var j = 0; j < 7; j++) {
            var currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + j);
            var dayOfWeekText = daysOfWeek[currentDay.getDay()];
            dayElements[j].textContent = dayOfWeekText;
        }

        // Calculate and display the end date (6 days after the start date)
        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        var endFormattedDate = endDate.toLocaleDateString('en-US', options);
        endDateElement.textContent = endFormattedDate;
    } else {
        // If no saved start date exists, use today's date
        var today = new Date();
        var formattedDate = today.toLocaleDateString('en-US', options);
        startDateElement.textContent = formattedDate;

        // Display the day of the week
        for (var j = 0; j < 7; j++) {
            var currentDay = new Date(today);
            currentDay.setDate(currentDay.getDate() + j);
            var dayOfWeekText = daysOfWeek[currentDay.getDay()];
            dayElements[j].textContent = dayOfWeekText;
        }

        // Calculate and display the end date (6 days after today)
        var endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 6);
        var endFormattedDate = endDate.toLocaleDateString('en-US', options);
        endDateElement.textContent = endFormattedDate;
    }
});

document.querySelector("#submit").addEventListener("click", function() {
    // Show the date input field and hide the current start date display
    document.querySelector("#newstartdate").style.display = "block";
    document.querySelector("#startdate").style.display = "none";
});

document.querySelector("#newstartdate").addEventListener("change", function() {
    // Get the new date from the input field
    var newDate = new Date(document.querySelector("#newstartdate").value);
    newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset()); // Adjust for timezone offset
    var options = { month: 'long', day: 'numeric' };
    var formattedDate = newDate.toLocaleDateString('en-US', options);

    // Display the new start date and hide the input field
    document.querySelector("#startdate").textContent = formattedDate;
    document.querySelector("#startdate").style.display = "block";
    document.querySelector("#newstartdate").style.display = "none";


    // Display the day of the week
    for (var j = 0; j < 7; j++) {
        var currentDay = new Date(newDate);
        currentDay.setDate(newDate.getDate() + j);
        var dayOfWeekText = daysOfWeek[currentDay.getDay()];
        dayElements[j].textContent = dayOfWeekText;
    }

    // Save the selected start date to localStorage
    localStorage.setItem("startDate", newDate.toISOString());

    // Calculate and display the new end date (6 days after the new start date)
    var endDateElement = document.getElementById("enddate");
    var endDate = new Date(newDate);
    endDate.setDate(endDate.getDate() + 6);
    var endFormattedDate = endDate.toLocaleDateString('en-US', options);
    endDateElement.textContent = endFormattedDate;
});
