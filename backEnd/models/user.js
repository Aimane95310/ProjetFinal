const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

// Vérifie si le modèle existe déjà pour éviter l'erreur OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;