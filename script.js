const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#search');
const resultsList = document.querySelector('#results');
const loadMoreButton = document.querySelector('#load-more');
const apiChoice = document.querySelector('#api-choice'); // Add API selection dropdown
let currentPage = 1;
let searchValue = '';
let allResults = []; // Store all results locally
let totalResults = 0; // Store the total number of results
const RESULTS_PER_PAGE = 10;

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1;
    searchValue = searchInput.value.trim();
    searchRecipes();
});

loadMoreButton.addEventListener('click', () => {
    currentPage++;
    searchRecipes();
});

async function searchRecipes() {
    const selectedAPI = apiChoice.value;  // Get the selected API
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    let url = '';

    if (selectedAPI === 'themealdb') {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`;
    } else if (selectedAPI === 'thecocktaildb') {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchValue}`;
    } else if (selectedAPI === 'spoonacular') {
        const spoonacularApiKey = 'YOUR_SPOONACULAR_API_KEY';
        url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchValue}&apiKey=${spoonacularApiKey}&number=${RESULTS_PER_PAGE}&offset=${startIndex}`;
    } else if (selectedAPI === 'edamam') {
        const edamamAppId = 'YOUR_EDAMAM_APP_ID';
        const edamamAppKey = 'YOUR_EDAMAM_APP_KEY';
        url = `https://api.edamam.com/search?q=${searchValue}&app_id=${edamamAppId}&app_key=${edamamAppKey}&from=${startIndex}&to=${startIndex + RESULTS_PER_PAGE}`;
    } else if (selectedAPI === 'tasty') {
        const tastyApiKey = 'YOUR_RAPIDAPI_KEY';
        url = `https://tasty.p.rapidapi.com/recipes/list?from=${startIndex}&size=${RESULTS_PER_PAGE}&query=${searchValue}&rapidapi-key=${tastyApiKey}`;
    } else if (selectedAPI === 'openrecipes') {
        // This URL is a placeholder based on available open sources (may vary)
        url = `https://openrecipes-api.onrender.com/search?name=${searchValue}`;
    } else if (selectedAPI === 'openfoodfacts') {
        url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchValue}&search_simple=1&action=process&json=1`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        handleAPIResponse(data, selectedAPI);
    } catch (error) {
        console.error('Fetch error:', error);
        resultsList.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
        loadMoreButton.style.display = 'none';
    }
}

function handleAPIResponse(data, selectedAPI) {
    let recipes = [];
    if (selectedAPI === 'edamam') {
        recipes = data.hits;
        totalResults = data.count;
    } else if (selectedAPI === 'spoonacular') {
        recipes = data.results;
        totalResults = data.totalResults;
    } else if (selectedAPI === 'themealdb' || selectedAPI === 'thecocktaildb') {
        recipes = data.meals || data.drinks || [];
        totalResults = recipes.length;
    } else if (selectedAPI === 'tasty') {
        recipes = data.results || [];
        totalResults = data.results.length;
    }

    displayRecipes(recipes, totalResults);
}

// Your existing variables and event listeners here...

function displayRecipes(recipes, totalResults) {
    let html = '';
    recipes.forEach((recipe) => {
        let image = '', title = '', ingredients = [], link = '', id = '';

        if (recipe.strMeal) { // TheMealDB and TheCocktailDB
            image = recipe.strMealThumb || recipe.strDrinkThumb;
            title = recipe.strMeal || recipe.strDrink;
            ingredients = getIngredients(recipe);
            link = recipe.strSource || recipe.strYoutube || '#';
            id = recipe.idMeal || recipe.idDrink;
        } else if (recipe.title) { // Spoonacular and Tasty
            image = recipe.image || recipe.thumbnail_url;
            title = recipe.title;
            ingredients = []; // no ingredients in response
            link = recipe.sourceUrl || recipe.original_video_url || '#';
            id = recipe.id || '';
        } else if (recipe.recipe) { // Edamam
            image = recipe.recipe.image;
            title = recipe.recipe.label;
            ingredients = recipe.recipe.ingredientLines;
            link = recipe.recipe.url || '#';
            id = recipe.recipe.uri || '';
        }

        html += `
        <div data-id="${id}" class="recipe-card">
            <img src="${image}" alt="${title}">
            <h3>${title}</h3>
            <ul>
                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <a href="${link}" target="_blank">View Recipe</a>
            <button class="like-btn">❤️ Like</button>
        </div>
        `;
    });

    resultsList.innerHTML = (currentPage === 1) ? html : resultsList.innerHTML + html;

    // Show or hide load more button
    if (currentPage * RESULTS_PER_PAGE < totalResults) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }

    // Add event listeners to Like buttons
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.recipe-card');
            const recipeData = {
                id: card.dataset.id,
                title: card.querySelector('h3').innerText,
                image: card.querySelector('img').src,
                link: card.querySelector('a').href
            };
            likeRecipe(recipeData);
        });
    });

    // Remove and re-trigger fade-in class for animation
    resultsList.classList.remove('fade-in');
    void resultsList.offsetWidth; // trigger reflow
    resultsList.classList.add('fade-in');
}

// Like recipe function stored outside displayRecipes
function likeRecipe(recipe) {
    const username = localStorage.getItem('loggedInUser');
    if (!username) {
        alert('Please log in first.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users[username]) {
        users[username] = { liked: [] };
    }

    // Check if already liked
    if (users[username].liked.find(r => r.id === recipe.id)) {
        alert('You already liked this recipe.');
        return;
    }

    users[username].liked.push(recipe);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Recipe liked!');
}


    resultsList.innerHTML = (currentPage === 1) ? html : resultsList.innerHTML + html;

    // Handle the Load More button visibility
    if (currentPage * RESULTS_PER_PAGE < totalResults) {
        loadMoreButton.style.display = 'block'; // Show the Load More button if there are more pages
    } else {
        loadMoreButton.style.display = 'none'; // Hide the Load More button if there are no more results
    }

    // Remove the fade-in class to restart the animation
    resultsList.classList.remove('fade-in');
    
    // Trigger the fade-in effect again
    function likeRecipe(recipe) {
  const username = localStorage.getItem('loggedInUser');
  if (!username) return alert('Please log in first.');

  const users = JSON.parse(localStorage.getItem('users'));
  const user = users[username];
  user.liked.push(recipe);
  localStorage.setItem('users', JSON.stringify(users));

  alert('Recipe liked!');
}


