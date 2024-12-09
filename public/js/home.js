var today = new Date();
today = today.toLocaleDateString('en-US');
console.log(today);

document.addEventListener("DOMContentLoaded", function() {
    getTodaysMeals(today);
});

async function getTodaysMeals(today) {
    await fetch(`/mealplanweek?date=${today}`, {
        method: "GET",
    }).then(response => response.json())
    .then(data => {
        data.forEach(function(row) {
            var date = new Date(row.date).toLocaleDateString('en-US');
            if (date < today || date > today) {
                return;
            }
            var mealType = row.meal_type;
            var recipeId = row.recipe_id;
            var recipeName = row.name;
            var recipeThumbnail = row.thumbnail;
            console.log(mealType);

            // Find the meal element to update
            var mealElement = document.querySelector(`[data-meal-type="${mealType}"]`);
            var mealElement2 = document.querySelector(`[data-meal-name="${mealType}"]`);
            console.log(mealElement);
            if (!mealElement) {
                console.log("Meal element not found");
                return;
            } else {
                mealElement.setAttribute("data-recipe-id", recipeId);
                mealElement.src = recipeThumbnail;
                mealElement2.innerText= recipeName;
            }
        });

    });
};

var modal = document.getElementById("myModal");
var recipeDetailsModal = document.getElementById("recipeDetailsModal");
var meals = document.querySelectorAll("#meal");
meals.forEach(function(meal) {
    meal.addEventListener("click", async function() {
        selectedMeal = this.id;
        recipeId = this.getAttribute("data-recipe-id");
        if (!recipeId) {
            modal.style.display = "block";
            return;
        }
        await getRecipeDetails(recipeId);
        recipeDetailsModal.style.display = "block";
    });
});

async function getRecipeDetails(recipeId) {
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
            <img style="width:200px" src="${data.thumbnail}">
            <h2>Recipe Name: ${recipeName}</h2>
            <p>${recipeInstructions}</p>
            `;
        var favoriteBtn = `
        <form action="/addFavMeal" method="POST">
        <input type="hidden" name="recipe_id" value="${recipeId}">
        <button id="favBut" type="submit">
            <img src="/imgs/heart.png" alt="Heart Icon" width="20" height="20">
        </button>
        </form>`;
        document.getElementById("recipeDetails").innerHTML = recipeDetails;
        document.getElementById("favButton").innerHTML = favoriteBtn;
    });
};


document.querySelector("#close2").addEventListener("click", function() {
    recipeDetailsModal.style.display = "none";
});
