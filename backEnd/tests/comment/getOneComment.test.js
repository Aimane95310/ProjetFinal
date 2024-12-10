const Comment = require('../../models/comment'); // Chemin du modèle Comment
const { getOneComment } = require('../../controllers/comment'); // Chemin du contrôleur

jest.mock('../../models/comment'); // Mock du modèle Comment

describe('getOneComment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'someCommentId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    console.error = jest.fn(); // Mock de console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*it('should return 404 if comment is not found', async () => {
    // Mock pour indiquer que aucun commentaire n'est trouvé
    Comment.findOne.mockResolvedValue(null);

    await getOneComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("comment not found");
  });*/

  it('should return the comment if found', async () => {
    const mockComment = { 
      _id: 'someCommentId', 
      text: 'This is a comment',
      userId: 'someUserId' 
    };
    const mockUser = { email: 'user@example.com' };

    // Mock de findOne pour retourner un commentaire
    Comment.findOne.mockResolvedValue(mockComment);
    // Mock de populate pour retourner l'utilisateur
    Comment.findOne.mockReturnValueOnce({
      ...mockComment,
      populate: jest.fn().mockResolvedValueOnce({
        ...mockComment,
        userId: mockUser
      })
    });

    await getOneComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...mockComment,
      userId: mockUser
    });
  });
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
