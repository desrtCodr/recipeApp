import Search from './models/Search';
import * as searchView from './views/searchView';
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
    //create a new search obj if query exists
    if (query) {
        state.search = new Search(query);
        //Prepare UI for results
        searchView.clearInput(); 
        searchView.clearResults(); 
        renderLoader(elements.searchRes);   
        //Search for recipes 
        await state.search.getResults(); 
        //render results on UI
        clearLoader(elements.searchRes); 
        searchView.renderResults(state.search.result); 
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); 
    controlSearch(); 
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest(`.${elementStrings.btnInline}`); 
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); 
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);         
    } 
});

 

