const Comment = require('../../models/comment'); // Chemin du modèle Comment
const { getOneComment } = require('../../controllers/comment'); // Chemin du contrôleur

jest.mock('../../models/comment'); // Mock du modèle Comment

describe('getOneComment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: 'someCommentId' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks(); // Nettoyez les mocks entre les tests
  });

  it('should return the comment if it exists', async () => {
    const mockPopulate = jest.fn().mockResolvedValue({
      _id: 'someCommentId',
      text: 'This is a test comment',
      userId: { email: 'user@example.com' }
    });

    // Mock de `findOne` avec `populate`
    Comment.findOne.mockReturnValue({ populate: mockPopulate });

    // Appel de la méthode
    await getOneComment(req, res, next);

    // Assertions
    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'someCommentId' }); // Vérifie l'appel de `findOne`
    expect(mockPopulate).toHaveBeenCalledWith('userId', 'email'); // Vérifie l'appel de `populate`
    expect(res.status).toHaveBeenCalledWith(200); // Vérifie que le code de statut est 200
    expect(res.json).toHaveBeenCalledWith({
      _id: 'someCommentId',
      text: 'This is a test comment',
      userId: { email: 'user@example.com' }
    }); // Vérifie la réponse JSON
  });
/*
  it('should return 404 if comment is not found', async () => {
    // Simulez `findOne` pour retourner null (commentaire non trouvé)
    Comment.findOne.mockResolvedValue(null);

    await getOneComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404); // Vérifie que le code de statut est 404
    expect(res.json).toHaveBeenCalledWith('comment not found'); // Vérifie que le message de réponse est correct
  });*/
/*
  it('should return 500 if there is a database error', async () => {
    const error = new Error('Database error');
    // Simule une erreur de base de données
    Comment.findOne.mockRejectedValue(error); // Rejet de la promesse pour simuler l'erreur

    await getOneComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Database error'
    });
  });

  it('should log the error in case of a database failure', async () => {
    const error = new Error('Test error');
    Comment.findOne.mockRejectedValue(error);

    await getOneComment(req, res, next);

    // Vérifie que l'erreur a bien été loguée
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la recherche du commentaire:', error);
  });*/
});
