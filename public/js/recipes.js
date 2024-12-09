var modal = document.getElementById("myModal");
var recipeDetailsModal = document.getElementById("recipeDetailsModal");
var meals = [...document.querySelectorAll(".recipe-item"), ...document.querySelectorAll(".recipe-item2")];
console.log(meals);
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
