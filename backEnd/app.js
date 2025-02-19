const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
 
const comment = require('./routes/comment');
const userRoutes = require('./routes/user');
const post = require('./routes/post');
const path = require('path');
const user = require('./controllers/user');


const MONGODB_ACESS = process.env.MONGOLAB_URI;

console.log('Connecting to:', process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI)
    .then(() => {
        console.log('Connexion à MongoDB réussie !');

        // Assurez-vous que le compte administrateur existe
        return user.ensureAdminExists();
    })    
    .catch((err) => console.log('Connexion à MongoDB échouée !', err));




app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use('/api/comments', comment);
app.use('/api/posts', post);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;