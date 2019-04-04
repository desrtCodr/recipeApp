import axios from 'axios';
import { key, proxy } from '../config'; 

export default class Recipe {
    constructor(id) {
        this.id = id; 
    };
    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title; 
            this.author = res.data.recipe.publisher; 
            this.img = res.data.recipe.image_url; 
            this.url = res.data.recipe.source_url; 
            this.ingredients = res.data.recipe.ingredients;  
        } catch (error) {
            console.log(error);
            alert('Something went wrong! :('); 
        }
        
    } 

    calcTime() {
        //assuming we need 15 min for every 3 ingredients
        const numIng = this.ingredients.length; 
        const periods = Math.ceil(numIng / 3); 
        this.time = periods * 15; 
    };

    calcServings() {
        this.servings = 4; 
    };

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']; 
        const units = [...unitsShort, 'g', 'kg', 'can', 'scant'];
        const newIngredients = this.ingredients.map(el=>{
            //uniform ingredients
            let ingredient = el.toLowerCase(); 
            unitsLong.forEach((unit, i) =>{
                ingredient = ingredient.replace(unit, unitsShort[i])
            });

            //remove () regex 
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            //parse into count, unit and ingredient
            //1 create an array of the ingredient string (separated by a space)
            const arrIng = ingredient.split(' '); 
            //find the index of the unit if there is one to find (returns -1 if no unit found)
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); 
            //sorting different scenarios
            let objIng; //returned object defined outside of if statement 
            //there is a unit found
            if (unitIndex > -1) {
                //find number of array items before unitIndex
                const arrCount = arrIng.slice(0, unitIndex); 
                let count; 
                //Ex 4 cups, arrCount is [4] - eval(4)=4
                //Ex 1-1/4 cups, arrCount is [1-1/4] replace '-' with '+' -> eval(1+1/4) = 1.25
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-','+')); 
                //Ex 4 1/2 cups, arrCount is [4, 1/2] -> eval(4+1/2) = 4.5
                } else {
                    count = eval(arrCount.join('+')); 
                }
                //return the object
                objIng = {
                    count, //count: count in ES6 -> count
                    unit: arrIng[unitIndex], 
                    //starting after unit join together separating with a space
                    ingredient: arrIng.slice(unitIndex + 1).join(' ') 
                }
            //no unit found, but first character in ingredient is a number (expression will be true)
            } else if (parseInt(arrIng[0],10)) {
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            //no unit and no number at the begining of array
            } else if (unitIndex === -1) {
                objIng = {
                    count: 1, 
                    unit: '',
                    //in ES6 ingredient: ingredient --> ingredient
                    ingredient
                }
            }
            return objIng; 
        });
        this.ingredients = newIngredients; 
    }
    updateServings(type) {
        //update servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1; 
        //update ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings; 
    }

}



