const Comment = require('../../models/comment'); // Assurez-vous que le chemin est correct
const { getOneComment } = require('../../controllers/comment'); // Assurez-vous que le chemin est correct

// Mock du modèle Comment
jest.mock('../../models/comment');

describe('getOneComment Controller', () => {
  let req, res, next;

  // Configuration initiale avant chaque test
  beforeEach(() => {
    req = {
      params: { id: 'someCommentId' }
    };
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

  // Test : Commentaire non trouvé
  it('should return 404 if comment is not found', async () => {
    // Arrange : Mock de la méthode findOne pour retourner null
    Comment.findOne.mockResolvedValue(null);

    // Act : Appel de la fonction à tester
    await getOneComment(req, res, next);

    // Assert : Vérification des résultats
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith("comment not found");
  });

  // Test : Commentaire trouvé avec succès
  it('should return the comment if found', async () => {
    // Arrange : Création d'un mock de commentaire
    const mockComment = { _id: 'someCommentId', text: 'This is a comment' };
    Comment.findOne.mockResolvedValue(mockComment);

    // Act : Appel de la fonction à tester
    await getOneComment(req, res, next);

    // Assert : Vérification des résultats
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockComment);
  });

  // Test : Erreur lors de la recherche du commentaire
  it('should return 500 if there is a database error', async () => {
    // Arrange : Simulation d'une erreur de base de données
    const error = new Error('Database error');
    Comment.findOne.mockRejectedValue(error);

    // Act : Appel de la fonction à tester
    await getOneComment(req, res, next);

    // Assert : Vérification des résultats
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Database error'
    });
  });

  // Test optionnel : Vérification de l'appel à console.error
  it('should log the comment ID and any errors', async () => {
    // Arrange : Simulation d'une erreur
    const error = new Error('Test error');
    Comment.findOne.mockRejectedValue(error);

    // Act : Appel de la fonction à tester
    await getOneComment(req, res, next);

    // Assert : Vérification des appels à console.error
    expect(console.error).toHaveBeenCalledWith('getOneComment:', 'someCommentId');
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la recherche du commentaire:', error);
  });
});