const { getAllPost } = require('../../backEnd/controllers/post');
const Post = require('../../backEnd/models/post');

jest.mock('../../models/post');

describe('getAllPost', () => {
  let req, res, next;

  beforeEach(() => {
    req = {}; // Requête vide pour ce test
    res = {
      status: jest.fn().mockReturnThis(), // Permet le chaînage
      json: jest.fn(), // Simule la méthode json
    };
    next = jest.fn(); // Simule la fonction next
  });

  it('should return all posts with status 200', async () => {
    const mockPosts = [{ _id: '1', text: 'Post 1' }, { _id: '2', text: 'Post 2' }];
    Post.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockPosts), // Simule le retour de la promesse
    });

    await getAllPost(req, res, next);

    expect(Post.find).toHaveBeenCalled(); // Vérifie que find a été appelé
    expect(res.status).toHaveBeenCalledWith(200); // Vérifie le code de statut
    expect(res.json).toHaveBeenCalledWith(mockPosts); // Vérifie que les posts sont renvoyés
  });

  it('should return status 400 if an error occurs', async () => {
    const error = new Error('Database error');
    Post.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(error), // Simule une erreur
    });

    await getAllPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400); // Vérifie le code de statut
    expect(res.json).toHaveBeenCalledWith({ error: error.message }); // Vérifie que l'erreur est renvoyée
  });
});