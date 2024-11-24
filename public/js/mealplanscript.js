var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var dayElements = [];
for (var i = 1; i <= 7; i++) {
    dayElements.push(document.getElementById("day" + i));
}
var mealElements = [];
for (var i = 1; i <= 7; i++) {
    mealElements.push(document.getElementById("breakfast" + i));
    mealElements.push(document.getElementById("lunch" + i));
    mealElements.push(document.getElementById("dinner" + i));
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

            // Set the data-date attribute for each meal element
            mealElements[j * 3].setAttribute("data-date", currentDay);
            mealElements[j * 3].setAttribute("data-meal-type", "breakfast");
            mealElements[j * 3 + 1].setAttribute("data-date", currentDay);
            mealElements[j * 3 + 1].setAttribute("data-meal-type", "lunch");
            mealElements[j * 3 + 2].setAttribute("data-date", currentDay);
            mealElements[j * 3 + 2].setAttribute("data-meal-type", "dinner");
        }



        // Calculate and display the end date (6 days after the start date)
        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        var endFormattedDate = endDate.toLocaleDateString('en-US', options);
        endDateElement.textContent = endFormattedDate;

        // Display the meal plan
        displayMealPlan(startDate);
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

            // Set the data-date attribute for each meal element
            mealElements[j * 3].setAttribute("data-date", currentDay);
            mealElements[j * 3].setAttribute("data-meal-type", "breakfast");
            mealElements[j * 3 + 1].setAttribute("data-date", currentDay);
            mealElements[j * 3 + 1].setAttribute("data-meal-type", "lunch");
            mealElements[j * 3 + 2].setAttribute("data-date", currentDay);
            mealElements[j * 3 + 2].setAttribute("data-meal-type", "dinner");
        }

        // Calculate and display the end date (6 days after today)
        var endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 6);
        var endFormattedDate = endDate.toLocaleDateString('en-US', options);
        endDateElement.textContent = endFormattedDate;

        // Display the meal plan
        displayMealPlan(startDate);
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
        currentDay.setDate(currentDay.getDate() + j);
        var dayOfWeekText = daysOfWeek[currentDay.getDay()];
        dayElements[j].textContent = dayOfWeekText;

        // Set the data-date attribute for each meal element
        mealElements[j * 3].setAttribute("data-date", currentDay);
        mealElements[j * 3].setAttribute("data-meal-type", "breakfast");
        mealElements[j * 3 + 1].setAttribute("data-date", currentDay);
        mealElements[j * 3 + 1].setAttribute("data-meal-type", "lunch");
        mealElements[j * 3 + 2].setAttribute("data-date", currentDay);
        mealElements[j * 3 + 2].setAttribute("data-meal-type", "dinner");
    }

    // Save the selected start date to localStorage
    localStorage.setItem("startDate", newDate.toISOString());

    // Calculate and display the new end date (6 days after the new start date)
    var endDateElement = document.getElementById("enddate");
    var endDate = new Date(newDate);
    endDate.setDate(endDate.getDate() + 6);
    var endFormattedDate = endDate.toLocaleDateString('en-US', options);
    endDateElement.textContent = endFormattedDate;

    // Display the meal plan
    displayMealPlan(newDate);
});


// Display meal plan
async function displayMealPlan(startDate) {
    startDate = startDate.toISOString().split('T')[0]; 

    for (meal of mealElements) {
        meal.src = "/imgs/nomealselected.png";
    }

    await fetch(`/mealplanweek?date=${startDate}`, {
        method: "GET",
    }).then(response => response.json())
    .then(data => {
        data.forEach(function(row) {
            var date = new Date(row.date);

            var mealType = row.meal_type;
            var recipeName = row.name;
            var recipeInstructions = row.instructions;
            var recipeThumbnail = row.thumbnail;

            // Find the meal element to update
            var mealElement = document.querySelector(`[data-date="${date}"][data-meal-type="${mealType}"]`);
            if (!mealElement) {
                console.log("Meal element not found:",startDate, date, mealType);
                return;
            } else {
                mealElement.src = recipeThumbnail;
            }
        });
    });
};

var modal = document.getElementById("myModal");
var selectedMeal = null;
var meals = document.querySelectorAll(".meal");
meals.forEach(function(meal) {
    meal.addEventListener("click", function() {
        selectedMeal = this.id;
        modal.style.display = "block";
    });
});


document.querySelector(".close").addEventListener("click", function() {
    modal.style.display = "none";
});

// Add event listeners to recipe items
var recipeItems = document.querySelectorAll(".recipe-item");
recipeItems.forEach(function(item) {
    item.addEventListener("click", function() {
        var recipeId = this.getAttribute("data-recipe-id");
        var recipeName = this.textContent;

        // Update the selected meal with the recipe name
        var recipeImg = this.getAttribute("data-recipe-img");
        var selectedMealElement = document.getElementById(selectedMeal);
        selectedMealElement.src = recipeImg;

        // Get the selected date and meal type
        var selectedMealType = selectedMealElement.getAttribute("data-meal-type");
        var selectedDate = selectedMealElement.getAttribute("data-date");
        selectedDate = new Date(selectedDate).toISOString().split('T')[0];

        // Send the selected recipe data to the server
        postSelectedRecipe(recipeId, selectedDate, selectedMealType);


        // Close the modal after selection
        modal.style.display = "none";
    });
});

async function postSelectedRecipe(recipeId, date, mealType) {
    await fetch(`/mealplan?user_id=1&recipe_id=${recipeId}&date=${date}&meal_type=${mealType}`, {
        method: "POST"
    });
};