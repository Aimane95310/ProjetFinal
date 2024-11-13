const Comment = require('../../models/comment'); // Assurez-vous que le chemin est correct
const { getAllComments } = require('../../controllers/comment'); // Assurez-vous que le chemin est correct

// Mock du modèle Comment
jest.mock('../../models/comment');

describe('getAllComments Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all comments with populated userId', (done) => {
    const mockComments = [
      { _id: 'comment1', text: 'Comment 1', userId: { _id: 'user1', email: 'user1@example.com' } },
      { _id: 'comment2', text: 'Comment 2', userId: { _id: 'user2', email: 'user2@example.com' } }
    ];

    // Mock de la méthode find() et populate()
    Comment.find = jest.fn().mockReturnThis();
    Comment.populate = jest.fn().mockReturnValue(Promise.resolve(mockComments));

    getAllComments(req, res, next);

    setImmediate(() => {
      expect(Comment.find).toHaveBeenCalled();
      expect(Comment.populate).toHaveBeenCalledWith('userId', 'email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComments);
      done();
    });
  });

  it('should handle errors and return 400 status', (done) => {
    const error = new Error('Database error');

    // Mock de la méthode find() pour simuler une erreur
    Comment.find = jest.fn().mockReturnThis();
    Comment.populate = jest.fn().mockReturnValue(Promise.reject(error));

    getAllComments(req, res, next);

    setImmediate(() => {
      expect(Comment.find).toHaveBeenCalled();
      expect(Comment.populate).toHaveBeenCalledWith('userId', 'email');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error });
      done();
    });
  });
});