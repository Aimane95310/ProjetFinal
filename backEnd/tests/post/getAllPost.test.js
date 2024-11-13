// Importation des dépendances nécessaires
const { createPost } = require('../../controllers/post'); // Importer la fonction à tester
const Post = require('../../models/post'); // Importer le modèle Post

// Mocker le modèle Post pour éviter les interactions réelles avec la base de données
jest.mock('../../models/post');

describe('createPost', () => {
  let req, res, next;

  // Avant chaque test, initialiser les objets req, res et next
  beforeEach(() => {
    req = {
      // Corps de la requête contenant les données du post
      body: { post: JSON.stringify({ text: 'Hello world', _id: '1', _userId: 'userId' }) },
      // Authentification simulée de l'utilisateur
      auth: { userId: 'userId' },
      // Protocole de la requête
      protocol: 'http',
      // Simulation de la méthode pour obtenir l'hôte
      get: jest.fn().mockReturnValue('localhost'),
      // Fichier simulé associé au post
      file: { filename: 'image.jpg' }
    };
    
    // Simuler la réponse de la requête
    res = { 
      status: jest.fn().mockReturnThis(), // Permet de chaîner les appels
      json: jest.fn() // Simule la méthode pour envoyer une réponse JSON
    };
    
    next = jest.fn(); // Simuler la fonction next
  });

  // Test pour vérifier la création d'un post avec succès
  it('should create a post and return status 201', async () => {
    const mockPost = { _id: 'newPostId' }; // Post simulé que nous voulons retourner
    Post.prototype.save = jest.fn().mockResolvedValueOnce(mockPost); // Simule la méthode save pour retourner un post

    // Appeler la fonction createPost avec les objets simulés
    await createPost(req, res, next);

    // Vérifier que la réponse a un code de statut 201
    expect(res.status).toHaveBeenCalledWith(201);
    // Vérifier que la réponse JSON contient l'ID du post
    expect(res.json).toHaveBeenCalledWith({ postId: mockPost._id });
  });

  // Test pour vérifier le comportement en cas d'échec de la sauvegarde du post
  it('should return status 400 if post cannot be saved', async () => {
    const error = new Error('Save failed'); // Erreur simulée lors de l'échec de la sauvegarde
    Post.prototype.save = jest.fn().mockRejectedValueOnce(error); // Simule l'échec de la méthode save

    // Appeler la fonction createPost avec les objets simulés
    await createPost(req, res, next);

    // Vérifier que la réponse a un code de statut 400
    expect(res.status).toHaveBeenCalledWith(400);
    // Vérifier que la réponse JSON contient l'erreur appropriée
    expect(res.json).toHaveBeenCalledWith({ error });
  });
});
