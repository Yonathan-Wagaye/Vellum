import mongoose from "mongoose";

mongoose.connect(process.env.DSN);


const Movie = new mongoose.Schema({
    name: {type: String, required: true},
    releaseYear: {type: String, required: true},
    director: {type: String, required: true},
    genre: {type: [String],required: true},
    comment: {type: String, required: true},
    length: {type:Number, required:true},
    postedBy: {type:String, required:true},
}, {timestamps: true});

const Book = new mongoose.Schema({
    name: {type:String, required: true},
    publicationYear: {type: String, required: true},
    author: {type: String, required: true},
    genre: {type: [String], required: true},
    comment: {type: String, required: true},
    postedBy: {type:String, required:true},
}, {timestamps: true});

const User = new mongoose.Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    followers: {type: [String]},
    following: {type: [String] },
    about:{type: [String]},
    books: {type:[Book]},
    movie: {type:[Movie]},
});

mongoose.model('Movie', Movie);
mongoose.model('Book', Book);
mongoose.model('User', User);
