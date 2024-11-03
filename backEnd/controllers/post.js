const Post = require('../models/post');
const fs = require('fs');

 
exports.getAllPost = (req, res, next) => {
  Post.find()
    .populate('userId', 'email') // Populer l'userId pour obtenir l'email
    .sort({ date: -1 }) // 1 pour un tri ascendant
    .then((posts) => {
      res.status(200).json(posts);
    }
    )

    .catch((error) => {
      res.status(400).json({
        error: error
      });
    }
    );
};



exports.createPost = (req, res, next) => {
  const postObject = JSON.parse(req.body.post);
  delete postObject._id;
  delete postObject._userId;
  const post = new Post({
    ...postObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    date: Date.now(), // Ajoute la date actuelle,
    text: postObject.text
  });
  post.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !', postId: post._id }) })
    .catch(error => { res.status(400).json({ error }) })
};


exports.getOnePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (post == null) {
        res.status(404).json("post not found");
      } else {
        res.status(200).json(post);
      }
    })

    .catch((error) => {
      res.status(404).json({
        error: error
      });
    });
};


exports.modifyPost = (req, res, next) => {
  const postObject = req.file ? {
    ...JSON.parse(req.body.post),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body.post };
  console.error(postObject.text);
  delete postObject._userId;
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (post.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
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