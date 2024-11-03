const mongoose = require('mongoose');
const Comment = require('../models/comment');
const fs = require('fs');
const multer = require('multer');
const ObjectId = mongoose.Types.ObjectId;

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
exports.createComment = (req, res, next) => {
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

  comment.save()
    .then(() => { res.status(201).json({ message: 'Commentaire enregistré !',commentId: comment._id  }) })
    .catch(error => { res.status(400).json({ error }) });
};

exports.getOneComment = (req, res, next) => {
  console.error('getOneComment:', req.params.id); // Pour le debug
  Comment.findOne({ _id: req.params.id })
    .then((comment) => {
      if(comment == null){
        res.status(404).json("comment not found");
      }else{
        res.status(200).json(comment);
      }})
 

    .catch((error) => {
      console.error('Erreur lors de la recherche du commentaire:', error); // Pour le debug

      res.status(404).json({
        error: error
      });
    });
};


exports.modifyComment = (req, res, next) => {
  const commentObject =  { ...req.body };

  Comment.findOne({ _id: req.params.id })
    .then((comment) => {
      if (comment.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        commentObject.date = comment.date;
        commentObject.userId = comment.userId;
      
        Comment.updateOne({ _id: req.params.id }, { ...commentObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Commentaire modifié avec succes!',commentTxt: commentObject.text}))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      // Gérer l'erreur si le commentaire n'est pas trouvé ou autre erreur de requête
      console.error('Erreur lors de la recherche du commentaire:', error); // Pour le debug

      res.status(400).json({ error });
    });
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