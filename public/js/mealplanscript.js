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
    var options = { month: 'long', day: 'numeric' };

    // Retrieve saved start date from localStorage
    var savedStartDate = localStorage.getItem("startDate");
    if (savedStartDate) {
        // If a saved start date exists, use it
        var startDate = new Date(savedStartDate);
        var formattedStartDate = startDate.toLocaleDateString('en-US', options);
        startDateElement.textContent = formattedStartDate;

        displayDays(startDate);

        // Display the meal plan
        displayMealPlan(startDate);
    } else {
        // If no saved start date exists, use today's date
        var today = new Date();
        var formattedDate = today.toLocaleDateString('en-US', options);
        startDateElement.textContent = formattedDate;

        displayDays(today);

        // Display the meal plan
        displayMealPlan(today);
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

    displayDays(newDate);

    // Save the selected start date to localStorage
    localStorage.setItem("startDate", newDate.toISOString());

    // Display the meal plan
    displayMealPlan(newDate);
});

function displayDays(startDate) {
    var options = { month: 'long', day: 'numeric' };
    // Display the day of the week
    for (var j = 0; j < 7; j++) {
        var currentDay = new Date(startDate);
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

    // Calculate and display the new end date (6 days after the new start date)
    var endDateElement = document.getElementById("enddate");
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    var endFormattedDate = endDate.toLocaleDateString('en-US', options);
    endDateElement.textContent = endFormattedDate;
};


// Display meal plan
async function displayMealPlan(startDate) {
    for (meal of mealElements) {
        meal.src = "/imgs/nomealselected.png";
        meal.setAttribute("data-recipe-id", "");
        meal.setAttribute("data-meal-id", "");
    }

    await fetch(`/mealplanweek?date=${startDate}`, {
        method: "GET",
    }).then(response => response.json())
    .then(data => {
        data.forEach(function(row) {
            var date = new Date(row.date);
            if (date < startDate) {
                return;
            }
            var mealType = row.meal_type;
            var recipeId = row.recipe_id;
            var recipeName = row.name;
            var recipeInstructions = row.instructions;
            var recipeThumbnail = row.thumbnail;
            var mealPlanId = row.plan_id;

            // Find the meal element to update
            var mealElement = document.querySelector(`[data-date="${date}"][data-meal-type="${mealType}"]`);
            if (!mealElement) {
                return;
            } else {
                mealElement.setAttribute("data-recipe-id", recipeId);
                mealElement.setAttribute("data-meal-id", mealPlanId);
                mealElement.src = recipeThumbnail;
                console.log(recipeThumbnail);
            }
        });
    });
};

var modal = document.getElementById("myModal");
var recipeDetailsModal = document.getElementById("recipeDetailsModal");
var selectedMeal = null;
var meals = document.querySelectorAll(".meal");
meals.forEach(function(meal) {
    meal.addEventListener("click", async function() {
        selectedMeal = this.id;
        recipeId = this.getAttribute("data-recipe-id");
        mealPlanId = this.getAttribute("data-meal-id");
        if (!recipeId) {
            modal.style.display = "block";
            return;
        }
        await getRecipeDetails(recipeId, mealPlanId);
        recipeDetailsModal.style.display = "block";
    });
});

async function getRecipeDetails(recipeId, mealPlanId) {
    if (!recipeId) {
        return;
    }
    await fetch(`/recipe?recipe_id=${recipeId}`, {
        method: "GET"
    }).then(response => response.json())
    .then(data => {
        // Update the modal with recipe details
        var recipeName = data.name;
        var recipeInstructions = data.instructions;
        var recipeDetails = `
            <h1>Recipe Details</h1>
            <h2>Recipe Name: ${recipeName}</h2>
            <p>${recipeInstructions}</p>
            `;
       // Define meal plans with placeholders for mealPlanId
    var mealPlan = `
    <form action="/deletemealplan" method="POST">
    <input type="hidden" name="plan_id" value="${mealPlanId}">
    <button type="submit">Remove</button>
    </form>`;

    var mealPlan2 = `
    <form action="/addFavMeal" method="POST">
    <input type="hidden" name="recipe_id" value="${recipeId}">
    <button id="favBut" type="submit">
        <img src="/imgs/heart.png" alt="Heart Icon" width="20" height="20">
    </button>
    </form>`;

    // Update the innerHTML of the containers
    document.getElementById("recipeDetails").innerHTML = recipeDetails;
    document.getElementById("mealplanid").innerHTML = mealPlan;
    document.getElementById("mealplanid2").innerHTML = mealPlan2;

    // If needed, manipulate 'favBut' further after it's added to the DOM
    // var button1 = document.getElementById('favBut');
    // if (button1) {
    // console.log("Favorite button is now accessible:", button1);
    // }

    });
};


document.querySelector("#close2").addEventListener("click", function() {
    recipeDetailsModal.style.display = "none";
});

document.querySelector("#close").addEventListener("click", function() {
    modal.style.display = "none";
});

// Add event listeners to recipe items
var recipeItems = document.querySelectorAll(".recipe-item");
recipeItems.forEach(function(item) {
    item.addEventListener("click", function() {
        var recipeId = this.getAttribute("data-recipe-id");

        // Update the selected meal with the recipe name
        var recipeImg = this.getAttribute("data-recipe-img");
        var selectedMealElement = document.getElementById(selectedMeal);
        selectedMealElement.src = recipeImg;

        // Get the selected date and meal type
        var selectedMealType = selectedMealElement.getAttribute("data-meal-type");
        var selectedDate = selectedMealElement.getAttribute("data-date");
        selectedDate = new Date(selectedDate).toISOString().split('T')[0];

        // Send the selected recipe data to the server to update the meal plan
        postSelectedRecipe(recipeId, selectedDate, selectedMealType);

        // Close the modal after selection
        modal.style.display = "none";
    });
});

async function postSelectedRecipe(recipeId, date, mealType) {
    await fetch(`/mealplan?recipe_id=${recipeId}&date=${date}&meal_type=${mealType}`, {
        method: "POST"
    }); 

    // Update the meal plan display
    var savedStartDate = localStorage.getItem("startDate");
    if (savedStartDate) {

        var startDate = new Date(savedStartDate);

        displayMealPlan(startDate);
    }
};