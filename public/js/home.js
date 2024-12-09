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