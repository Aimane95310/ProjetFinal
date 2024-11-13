const Post = require('../models/post');
const fs = require('fs');
const globals = require('../globals');

exports.getAllPost = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'email') // Populer l'userId pour obtenir l'email
      .sort({ date: -1 }); // Tri descendant

    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error });
  }
};
exports.createPost = async (req, res, next) => {
  try {
    const postObject = JSON.parse(req.body.post);
    delete postObject._id;
    delete postObject._userId;

    const post = new Post({
      ...postObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      date: Date.now(),
    });

    // Attendre que la sauvegarde soit terminée
    const savedPost = await post.save();
    res.status(201).json({ postId: savedPost._id });
  } catch (error) {
    res.status(400).json({ error });
  }
};



exports.getOnePost = async (req, res, next) => {
  try {
    // Utilisation de await pour attendre le résultat de findOne
    const post = await Post.findOne({ _id: req.params.id });

    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }

    // Retourner le post trouvé
    res.status(200).json(post);
  } catch (error) {
    // Gestion des erreurs
    res.status(404).json({ error });
  }
};
exports.modifyPost = async (req, res, next) => {

  try {
    // Création de l'objet postObject en fonction de la présence ou non d'un fichier
    const postObject = req.file ? {
      ...JSON.parse(req.body.post),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body.post };

    console.error(postObject.text); // Log du texte du post (à des fins de débogage)

    delete postObject._userId; // Suppression de l'userId du corps de la requête pour des raisons de sécurité

    // Recherche du post dans la base de données
    const post = await Post.findOne({ _id: req.params.id });

    // Vérification que post est bien recu
    if (!post.userId) {

      return res.status(404).json({ message: 'Post non trouvé' });
    }
 
    
    // L'utilisateur connecté est l'administrateur ou celui qui a créé le post
    if (( req.auth.userId != globals.adminId.toString()) && (post.userId != req.auth.userId)) {
      // Vérification de l'autorisation de l'utilisateur
     
      return res.status(401).json({ message: 'Not authorized' });
    }
   


    // Mise à jour du post
    await Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id });

    res.status(200).json({ message: 'Objet modifié!' });

  } catch (error) {
    // Gestion globale des erreurs
    console.log("errror" +error);
    // Vérification si l'erreur est due à un ID invalide (ce qui résulterait en un post non trouvé)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    console.error(error);
    res.status(500).json({ error: error.message || 'Une erreur est survenue lors de la modification du post' });
  }
};


exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      if (post == null) {
        res.status(404).json({ message: 'Pos not found' });
      } else {
        if (post.userId != req.auth.userId) {
          res.status(401).json({ message: 'Not authorized' });
        } else {
          const filename = post.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Post.deleteOne({ _id: req.params.id })
              .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
              .catch(error => res.status(401).json({ error }));
          });
        }
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};