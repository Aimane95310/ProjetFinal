// Importation des modules nécessaires
const { createComment } = require('../../controllers/comment'); // Ajustez le chemin selon votre structure
const Comment = require('../../models/comment'); // Ajustez le chemin selon votre structure

// Mock du modèle Comment pour éviter les interactions réelles avec la base de données
jest.mock('../../models/comment');

describe('createComment Controller', () => {
  let req, res, next;

  // Configuration initiale avant chaque test
  beforeEach(() => {
    // Réinitialisation des mocks avant chaque test
    jest.clearAllMocks();

    // Préparation des objets req, res et next pour simuler une requête HTTP
    req = {
      body: {
        comment: JSON.stringify({
          _id: 'someId', // Cet ID sera supprimé dans la fonction
          _userId: 'someUserId', // Cet ID sera également supprimé
          postId: 'somePostId',
          text: 'This is a test comment'
        })
      },
      auth: {
        userId: 'authenticatedUserId' // Simule l'ID de l'utilisateur authentifié
      }
    };
    res = {
      status: jest.fn().mockReturnThis(), // Mock de la méthode status
      json: jest.fn() // Mock de la méthode json
    };
    next = jest.fn(); // Mock de la fonction next (non utilisée dans cette fonction)

    // Mock de Date.now() pour avoir une valeur constante dans les tests
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  // Restauration des mocks après chaque test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test de création réussie d'un commentaire
  it('should create a comment successfully', async () => {
    // Arrange : Préparation du commentaire sauvegardé simulé
    const savedComment = {
      _id: 'newCommentId',
      userId: 'authenticatedUserId',
      postId: 'somePostId',
      text: 'This is a test comment',
      date: 1234567890
    };
    // Mock de la méthode save pour simuler une sauvegarde réussie
    Comment.prototype.save = jest.fn().mockResolvedValue(savedComment);

    // Act : Exécution de la fonction à tester
    await createComment(req, res, next);

    // Assert : Vérification des résultats
    // Vérifier que le constructeur de Comment a été appelé avec les bons arguments
    expect(Comment).toHaveBeenCalledWith({
      userId: 'authenticatedUserId',
      postId: 'somePostId',
      text: 'This is a test comment',
      date: 1234567890
    });
    // Vérifier que la réponse a le bon statut et le bon contenu
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Commentaire enregistré !',
      commentId: 'newCommentId'
    });
  });

  // Test de gestion d'erreur lors de la sauvegarde
  it('should handle errors when saving fails', async () => {
    // Arrange : Préparation d'une erreur simulée
    const error = new Error('Save failed');
    // Mock de la méthode save pour simuler un échec de sauvegarde
    Comment.prototype.save = jest.fn().mockRejectedValue(error);

    // Act : Exécution de la fonction à tester
    await createComment(req, res, next);

    // Assert : Vérification de la gestion d'erreur
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Save failed' });
  });

  // Test de suppression des champs _id et _userId
  it('should remove _id and _userId from the comment object', async () => {
    // Arrange : Mock de la méthode save
    Comment.prototype.save = jest.fn().mockResolvedValue({});

    // Act : Exécution de la fonction à tester
    await createComment(req, res, next);

    // Assert : Vérification que _id et _userId ont été supprimés
    expect(Comment).toHaveBeenCalledWith(
      expect.not.objectContaining({
        _id: expect.any(String),
        _userId: expect.any(String)
      })
    );
  });
});