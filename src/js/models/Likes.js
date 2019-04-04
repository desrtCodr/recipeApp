export default class Likes {
    constructor() {
        this.likes = []; 
    }
    addLike(id, title, author, img) {
        const like = { id, title, author, img }; 
        this.likes.push(like); 
        //insert into local storage data and save
        this.persistData();
        
        return like; 
    } 
    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id); 
        this.likes.splice(index, 1); 
        //update local storage
        this.persistData(); 
    }
    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1; 
    }
    getNumLikes() {
        return this.likes.length; 
    }
    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes)); 
    }
    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        //restoring likes from local storage
        if (storage) this.likes = storage;  
    }
};   