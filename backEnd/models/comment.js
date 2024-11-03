const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const commentSchema = mongoose.Schema({
    text: {type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, 
    date: {type: Date, required: true}
});

commentSchema.plugin(uniqueValidator);

 

// Vérifie si le modèle existe déjà pour éviter l'erreur OverwriteModelError
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

module.exports = Comment;