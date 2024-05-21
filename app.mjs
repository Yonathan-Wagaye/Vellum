import './config.mjs';
import './db.mjs';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { error } from 'console';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret for signing session id',
    resave: false,
    saveUninitialized: true
  }));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    res.locals.userID = req.session.userID;
    next();
})




const User = mongoose.model('User');
const Movie = mongoose.model('Movie');
const Book = mongoose.model('Book');


app.get('/', async (req, res) => {
    if(req.session.userID)
    {
        const foundUsers = await User.find({});
        res.render('home', {users:foundUsers});
    }
    else
    {
        res.redirect('/login');
    }
    
});

app.get('/login', (req, res) => {
    if(req.session.userID)
    {
        res.redirect('/');
    }
    else
    {
        res.render('login');
    }
    
});

app.post('/login', async (req, res) => 
{
    
    const foundUser = await User.findOne({userName: req.body.username});
    if(foundUser)
    {
        
        const isValid = await bcrypt.compare(req.body.password, foundUser.password);
        if(isValid)
        {
            req.session.userID = foundUser._id;
            res.redirect('/');
        }
        else
        {
            res.render('login', {error:'*Password Incorrect'});
        }
    }
    else
    {
        res.render('login', {error:'*Invalid Username'});
    }
})

app.get('/register', (req, res) => 
{
    res.render('register');
});

app.post('/register', async (req, res) => {
    const foundUser = await User.findOne({userName: req.body.username});
    if(foundUser)
    {
        
        res.render('register', {error:'*Duplicate User'});
    }
    else
    {
        try
        {
            const newUser = new User({userName: req.body.username, password: await bcrypt.hash(req.body.password, 10), firstName:req.body.firstname, lastName:req.body.lastname});
            
            const savedUser = await newUser.save();
            req.session.userID = savedUser._id;
            res.redirect('/');
        }
        catch(e)
        {
            res.render('register', {error:'*All fields are required'});
        }
    }
    

});

app.get('/logout', (req, res) => {
    req.session.userID = '';
    res.locals.userID = '';
    res.redirect('/login');
})

app.get('/addMovie', (req, res) => {
    if(req.session.userID)
    {
        res.render('addMovie');
    }
    else
    {
        res.redirect('/login');
    }
})

app.post('/addMovie', async (req, res) => {
    
    try
    {
        const moiveObj = {};
        moiveObj['name'] = req.body.moviename;
        moiveObj['releaseYear'] = req.body.year;
        moiveObj['director'] = req.body.director;
        moiveObj['length'] = req.body.length;
        moiveObj['comment'] = req.body.comment;
        moiveObj['genre'] = req.body.genre.split(',');
        moiveObj['genre'] = moiveObj.genre.map(tag => tag.trim());

        const currentUser = await User.findById(req.session.userID);
        moiveObj['postedBy'] = currentUser.userName;
        
        const newMovie = Movie(moiveObj);
        const savedMovie = await newMovie.save();
        const updatedUser = await User.findByIdAndUpdate(req.session.userID, 
            {$push: {movie: savedMovie}})
        res.redirect('/');
   }

    catch(e)
    {
        res.render('addMovie', {error:"*Error while creating post"});
    }

    
    
        //res.render('addMovie', {error:'*Error while creating post'})
   
})



app.all('/deleteMovie/:id', async (req, res) => {
    const movieId = req.params.id;
    try 
    {
      
      await User.findByIdAndUpdate(req.session.userID, {$pull: {movie:{_id: movieId}}});
      await Movie.findByIdAndDelete(movieId);
      res.redirect('/');
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

app.all('/deleteBook/:id', async (req, res) => {
    const bookId = req.params.id;
    try 
    {
      
      await User.findByIdAndUpdate(req.session.userID, {$pull: {books:{_id: bookId}}});
      await Book.findByIdAndDelete(bookId);
      res.redirect('/');
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});
  

app.get('/addBook', (req, res) => 
{
    if(req.session.userID)
    {
        res.render('addBook');
    }
    else
    {
        res.redirect('/login');
    }
});

app.post('/addBook', async (req, res) => 
{
    try
    {
        const bookObj = {};
        bookObj['name'] = req.body.bookname;
        bookObj['publicationYear'] = req.body.year;
        bookObj['author'] = req.body.author
        bookObj['comment'] = req.body.comment;
        bookObj['genre'] = req.body.genre.split(',');
        bookObj['genre'] = bookObj.genre.map(tag => tag.trim());
        
        const currentUser = await User.findById(req.session.userID);
        bookObj['postedBy'] = currentUser.userName;
        
        const newBook = Book(bookObj);
        const savedBook = await newBook.save();
        const updatedUser = await User.findByIdAndUpdate(req.session.userID, 
            {$push: {books: savedBook}})
        res.redirect('/');
   }
   

    catch(e)
    {
        res.render('addBook', {error:"*Error while creating post"});
    }
});


app.get('/profile/:id', async (req, res) => {
    if(req.session.userID)
    {
        try 
        {
            const userID =  new mongoose.Types.ObjectId(req.params.id);
            const currentUser = await User.findById(userID);
            const numberOfPosts = currentUser.movie.length + currentUser.books.length;
            const recentMovies = currentUser.movie.sort((a, b) => b.createdAt - a.createdAt);
            const recentBooks = currentUser.books.sort((a, b) => b.createdAt - a.createdAt);
            const abouts = currentUser.about;

            res.render('profile', {user:currentUser, posts:numberOfPosts, recentMovies:recentMovies, recentBooks:recentBooks, abouts:abouts});
        }
        catch
        {
            res.status(500).send('Server Error');
        }
    }
    else
    {
        res.redirect('/login');
    }
})
app.get('/profile/:id/update', async (req, res) => {
    if(req.session.userID)
    {
        try 
        {
            const userID =  new mongoose.Types.ObjectId(req.params.id);
            const currentUser = await User.findById(userID);
            

            res.render('editProfile', {user:currentUser});
        }
        catch
        {
            res.status(500).send('Server Error');
        }
    }
    else
    {
        res.redirect('/login');
    }
    
});

app.post('/profile/:id/update', async (req, res) => {
    try
    {
        const userID =  new mongoose.Types.ObjectId(req.session.userID);

        const userToBeUpdated = await User.findOne({userName: req.body.username});
        if(userToBeUpdated && (userToBeUpdated._id != req.session.userID))
        {
            throw error;
        }
        const aboutList =  req.body.about.split(',').map(about => about.trim());

        const updateData = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            userName: req.body.username,
            about:  aboutList,    
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userID },
            { $set: updateData },
            { new: false } 
        );
        res.redirect('/profile/' + userID);
        
    }
    catch(e)
    {
        res.render('editProfile', {error:"*Error while editing profile"});
   }
})

app.get('/updateBook/:id', async (req, res) => {
    if(req.session.userID)
    {
        try 
        {
            
            const bookID =  new mongoose.Types.ObjectId(req.params.id);
            const currentBook = await Book.findById(bookID);
            const genre = currentBook.genre.reduce((acc, current) => {
                if(acc == '')
                {
                    return current;
                }
                else
                {
                    return `${acc}, ${current}`;
                }
            }, '');
            

            res.render('updateBook', {book:currentBook, genre:genre});
        }
        catch
        {
            res.status(500).send('Server Error');
        }
    }
    else
    {
        res.redirect('/login');
    }
})

app.post('/updateBook/:id', async (req, res) => {
    if(req.session.userID)
    {
        try 
        {
            
            const updateData = {
                name: req.body.name,
                publicationYear: req.body.year,
                author: req.body.author,
                genre: req.body.genre.split(',').map(tag => tag.trim()),
                comment: req.body.comment,
            }
           
            const userID =  new mongoose.Types.ObjectId(req.session.userID);
            const bookID =  new mongoose.Types.ObjectId(req.params.id);
            await User.findByIdAndUpdate(userID, {$pull: {books:{_id: bookID}}});
            const updatedBook = await Book.findOneAndUpdate(
                { _id: bookID },
                { $set: updateData },
                { new: true } // Set to true to return the modified document, if false (default) it returns the original
            );
            const updatedUser = await User.findByIdAndUpdate(userID, 
                {$push: {books: updatedBook}});
            

            res.redirect('/profile/'+ userID);
        }
        catch
        {
            res.render('updateBook', {error:"*Error while editing post"});
        }
    }
    else
    {
        res.redirect('/login');
    }
})

app.get('/updateMovie/:id', async (req, res) => {
    if(req.session.userID)
    {
        try 
        {
            
            const movieID =  new mongoose.Types.ObjectId(req.params.id);
            const currentMovie = await Movie.findById(movieID);
            const genre = currentMovie.genre.reduce((acc, current) => {
                if(acc == '')
                {
                    return current;
                }
                else
                {
                    return `${acc}, ${current}`;
                }
            }, '');
            

            res.render('updateMovie', {movie:currentMovie, genre:genre});
        }
        catch
        {
            res.status(500).send('Server Error');
        }
    }
    else
    {
        res.redirect('/login');
    }
})

app.post('/updateMovie/:id', async (req, res) => {
    if(req.session.userID)
    {
        const updateData = {
            name: req.body.name,
            releaseYear: req.body.year,
            director: req.body.director,
            genre: req.body.genre.split(',').map(tag => tag.trim()),
            comment: req.body.comment,
            length: req.body.length,
        }

        const userID =  new mongoose.Types.ObjectId(req.session.userID);
        const movieID =  new mongoose.Types.ObjectId(req.params.id);
        await User.findByIdAndUpdate(userID, {$pull: {movie:{_id: movieID}}});
        const updatedMovie = await Movie.findOneAndUpdate(
            { _id: movieID },
            { $set: updateData },
            { new: true } // Set to true to return the modified document, if false (default) it returns the original
        );
        const updatedUser = await User.findByIdAndUpdate(userID, 
            {$push: {movie: updatedMovie}});
        res.redirect('/profile/'+ userID);

    }
    else
    {
        res.redirect('/login');
    }
})

app.listen(process.env.PORT || 3001);

export default app;
