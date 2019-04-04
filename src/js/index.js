import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List'; 
import Likes from './models/Likes'; 
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
            console.log(err); 
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
        recipeView.clearRecipe(); 
        renderLoader(elements.recipe);
        //highlight search results
        if (state.search) searchView.highlightSelected(id); 
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
            clearLoader(); 
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            ); 
        } catch(err) {
            alert('Error processing recipe!'); 
            console.log(err); 
        }
    }
};
//selecting recipe from search, keeps recipe up if page refreshes
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 

//LIST Controller
const controlList = () => {
    //Create new list if state this isn't one
    if(!state.list) state.list = new List(); 
    //add each ingredient to list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient); 
        listView.renderItem(item); 
    });
}

//handle delete and item update buttons 
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item',).dataset.itemid; 
    //handle delete event
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id); 
        listView.deleteItem(id); 
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);  
    }
});


//LIKES CONTROLLER
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id; 
    //user has not yet liked current recipe 
    if (!state.likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.likes.addLike( 
            currentID, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
        ); 
        //toggle button
        likesView.toggleLikeBtn(true); 
        //add to ui list
        likesView.renderLike(newLike);  

    //user has liked the recipe
    } else {
        //remove button from state
        state.likes.deleteLike(currentID); 
        //toggle button
        likesView.toggleLikeBtn(false);
        //remove from the UI
        likesView.deleteLike(currentID); 
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes()); 
}

//restore likes recipes on page load
window.addEventListener('load', () => {
    //create likes object
    state.likes = new Likes();
    //adding likes back into storage
    state.likes.readStorage(); 
    //toggle likes button on or off depending on whether there is a liked recipe
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    //decrease serving size
     if (e.target.matches('.btn-decrease, .btn-decrease *')) {
         //prevent decreasing servings below 1
         if (state.recipe.servings > 1){
             //update data
             state.recipe.updateServings('dec'); 
             //update UI
             recipeView.updateServingsIngredients(state.recipe);
         }
          //increase serving size 
     } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //update data
        state.recipe.updateServings('inc');
        //update UI
        recipeView.updateServingsIngredients(state.recipe);
         //add to recipe to shopping list
     } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        controlList(); 
     } else if (e.target.matches('.recipe__love, .recipe__love *')) {
         controlLike(); 
     }
});