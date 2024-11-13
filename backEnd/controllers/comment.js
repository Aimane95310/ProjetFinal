const mongoose = require('mongoose');
const Comment = require('../models/comment');
const fs = require('fs');
const multer = require('multer');
const ObjectId = mongoose.Types.ObjectId;
const globals = require('../globals');

exports.getAllComments = (req, res, next) => {
  Comment.find()
    .populate('userId', 'email') // Populer l'userId pour obtenir l'email
    .then((comments) => {
      res.status(200).json(comments);
    }
    )

    .catch((error) => {
      res.status(400).json({
        error: error
      });
    }
    );
};
// Création d'un commentaire
exports.createComment = async (req, res, next) => {
  try {
    const commentObject = JSON.parse(req.body.comment);
    delete commentObject._id;
    delete commentObject._userId;

    const comment = new Comment({
      ...commentObject,
      userId: req.auth.userId,
      date: Date.now(), // Ajoute la date actuelle
      postId: commentObject.postId,
      text: commentObject.text
    });

    const savedComment = await comment.save();

    res.status(201).json({ 
      message: 'Commentaire enregistré !',
      commentId: savedComment._id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getOneComment = async (req, res, next) => {
  try {
    console.error('getOneComment:', req.params.id); // Pour le debug

    // Recherche du commentaire par ID
    const comment = await Comment.findOne({ _id: req.params.id });

    // Vérification si le commentaire existe
    if (comment == null) {
      return res.status(404).json("comment not found");
    }

    // Envoi du commentaire trouvé
    res.status(200).json(comment);
  } catch (error) {
    console.error('Erreur lors de la recherche du commentaire:', error); // Pour le debug

    // Gestion des erreurs
    res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de la recherche du commentaire'
    });
  }
};

exports.modifyComment = async (req, res, next) => {
  try {
    const commentObject = { ...req.body };
   
    const comment = await Comment.findOne({ _id: req.params.id });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }
     // L'utilisateur connecté est l'administrateur ou celui qui a créé le commentaire
    if ( (req.auth.userId != globals.adminId.toString() )&& (comment.userId != req.auth.userId)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    commentObject.date = comment.date;
    commentObject.userId = comment.userId;

    await Comment.updateOne({ _id: req.params.id }, { ...commentObject, _id: req.params.id });

    res.status(200).json({ message: 'Commentaire modifié avec succès!', commentTxt: commentObject.text });
  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteComment = (req, res, next) => {
  Comment.findOne({ _id: req.params.id })
      .then(comment => {
          if (comment.userId != req.auth.userId) {
              res.status(401).json({ message: 'Not authorized' });
          } else {
              Comment.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Commentaire supprimé !' }))
                  .catch(error => res.status(400).json({ error }));
          }
      })
    .catch(error => {
      res.status(500).json({ error });
    });
};