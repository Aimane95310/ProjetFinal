 
const Comment = require('../../models/comment'); // Assurez-vous que le chemin est correct
const { getAllComments } = require('../../controllers/comment'); // Assurez-vous que le chemin est correct

// Mock du modèle Comment
jest.mock('../../models/comment');

describe('getAllComments Controller', () => {
  let req, res, next;

  // Configuration initiale avant chaque test
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Mock de console.error pour éviter les logs dans la console pendant les tests
    console.error = jest.fn();
  });

  // Nettoyage après chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test : Retourne tous les commentaires avec userId peuplé
  it('should return all comments with populated userId', async () => {
    // Arrange : Création de mock de commentaires
    const mockComments = [
      { _id: 'comment1', text: 'Comment 1', userId: { _id: 'user1', email: 'user1@example.com' } },
      { _id: 'comment2', text: 'Comment 2', userId: { _id: 'user2', email: 'user2@example.com' } }
    ];
    Comment.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockComments)
    });

    // Act : Appel de la fonction à tester
    await getAllComments(req, res, next);

    // Assert : Vérification des résultats
    expect(Comment.find).toHaveBeenCalled();
    expect(Comment.find().populate).toHaveBeenCalledWith('userId', 'email');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockComments);
  });

  // Test : Gère les erreurs et retourne le statut 400
  it('should handle errors and return 400 status', async () => {
    // Arrange : Simulation d'une erreur de base de données
    const error = new Error('Database error');
    Comment.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(error)
    });

    // Act : Appel de la fonction à tester
    await getAllComments(req, res, next);

    // Assert : Vérification des résultats
    expect(Comment.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error });
  });
});