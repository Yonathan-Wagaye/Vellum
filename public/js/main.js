function main() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('movie-btn')) 
        {
            document.querySelector('#movie-content').style.display = 'block';
            document.querySelector('#book-content').style.display = 'none';
        } 
        else if (event.target.classList.contains('book-btn')) 
        {
            document.querySelector('#movie-content').style.display = 'none';
            document.querySelector('#book-content').style.display = 'block'; 
        }
    });
}



document.addEventListener('DOMContentLoaded', main);


