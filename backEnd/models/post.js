const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const postSchema = mongoose.Schema({
    text: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }
});

postSchema.plugin(uniqueValidator);

 

// Vérifie si le modèle existe déjà pour éviter l'erreur OverwriteModelError
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = Post;