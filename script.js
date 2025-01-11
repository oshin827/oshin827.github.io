const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#search');
const resultsList = document.querySelector('#results');
const apiChoice = document.querySelector('#api-choice'); // Dropdown or radio to select API
const loadMoreButton = document.querySelector('#load-more'); // Load More button
let currentPage = 1; // Track the current page of results
let searchValue = ''; // Store the search value to re-query when loading more

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1; // Reset to page 1 on new search
    searchValue = searchInput.value.trim(); // Save the search value
    searchRecipes();
});

loadMoreButton.addEventListener('click', () => {
    currentPage++; // Increment the current page
    searchRecipes(); // Fetch the next page of results
});

async function searchRecipes() {
    const selectedAPI = apiChoice.value;

    let url = '';
    const startIndex = (currentPage - 1) * 10; // Determine the starting index for the current page

    if (selectedAPI === 'edamam') {
        url = `https://api.edamam.com/search?q=${searchValue}&app_id=7aa516a5&app_key=dc836a223fb788b11ae390504d9e97ce&from=${startIndex}&to=${startIndex + 10}`;
    } else if (selectedAPI === 'spoonacular') {
        const spoonacularApiKey = 'your_actual_api_key_here'; // Replace with your actual API key
        url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchValue}&apiKey=${spoonacularApiKey}&number=10&offset=${startIndex}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    handleAPIResponse(data, selectedAPI);
}

function handleAPIResponse(data, selectedAPI) {
    let recipes = [];
    let totalResults = 0;

    if (selectedAPI === 'edamam') {
        recipes = data.hits;
        totalResults = data.count;
    } else if (selectedAPI === 'spoonacular') {
        recipes = data.results;
        totalResults = data.totalResults;
    }

    displayRecipes(recipes, totalResults);
}

function displayRecipes(recipes, totalResults) {
    let html = '';
    recipes.forEach((recipe) => {
        html += `
        <div>
            <img src="${recipe.image || recipe.recipe.image}" alt="${recipe.title || recipe.recipe.label}">
            <h3>${recipe.title || recipe.recipe.label}</h3>
            <ul>
                ${(recipe.ingredients || recipe.recipe.ingredientLines).map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <a href="${recipe.sourceUrl || recipe.recipe.url}" target="_blank">View Recipe</a>
        </div>
        `;
    });
    resultsList.innerHTML = html;

    // Handle the Load More button visibility
    if (currentPage * 10 < totalResults) {
        loadMoreButton.style.display = 'block'; // Show the Load More button if there are more pages
    } else {
        loadMoreButton.style.display = 'none'; // Hide the Load More button if there are no more results
    }

    // Remove the fade-in class to restart the animation
    resultsList.classList.remove('fade-in');
    
    // Trigger the fade-in effect again
    void resultsList.offsetWidth; // Forces a reflow to restart the animation
    resultsList.classList.add('fade-in');
}
