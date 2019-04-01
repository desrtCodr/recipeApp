import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader, elementStrings } from "./views/base";

//Global state of the app
// - search obj
// - current receipe obj
// - shopping list obj
// - like recipies
const state = {}; 

const controlSearch = async () => {
    //get query from the view
    const query = searchView.getInput();
    //TESTING WITH LOADED RESULTS
    // const query = 'pizza'; 
    //create a new search obj if query exists
    if (query) {
        state.search = new Search(query);
        //Prepare UI for results
        searchView.clearInput(); 
        searchView.clearResults(); 
        renderLoader(elements.searchRes);   
        try {
            //Search for recipes 
            await state.search.getResults(); 
            //render results on UI
            clearLoader(); 
            searchView.renderResults(state.search.result); 
        } catch (err) {
            alert('Error retrieving recipies!');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); 
    controlSearch(); 
});
//FOR TESTING to have the page loading with pizza results
// window.addEventListener('load', e => {
//     e.preventDefault(); 
//     controlSearch(); 
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest(`.${elementStrings.btnInline}`); 
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); 
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);         
    } 
});

//RECIPE CONTROLLER
//testing: 
// const r = new Recipe(46956); 
// r.getRecipe(); 
const controlRecipe = async () => {
    //GET id from URL we created in the Search View href= setting
    const id = window.location.hash.replace('#', ''); 
    //if exists, create new recipe obj
    if (id) {
        //prepare UI for new recipe

        //create new recipe obj
        state.recipe = new Recipe(id); 
        //TESTING - expose recipe to the window object
        // window.r = state.recipe;
        //error handling
        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();  
            state.recipe.parseIngredients(); 
            //calc servings and time
            state.recipe.calcTime(); 
            state.recipe.calcServings(); 
            //render the recipe
        } catch(err) {
            alert('Error processing recipe!'); 
            console.log(err); 
        }
    }
};
 
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 
 

