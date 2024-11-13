const { deleteComment } = require('../../controllers/comment'); // Ajustez le chemin selon votre structure
const Comment = require('../../models/comment'); // Ajustez le chemin selon votre structure

// Mock du modèle Comment
jest.mock('../../models/comment');

describe('deleteComment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Réinitialisation des mocks avant chaque test
    jest.clearAllMocks();

    // Préparation des objets req, res et next pour chaque test
    req = {
      params: { id: 'commentId123' },
      auth: { userId: 'authenticatedUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should delete a comment successfully', (done) => {
    // Arrange
    const mockComment = {
      _id: 'commentId123',
      userId: 'authenticatedUserId',
      text: 'Comment to delete'
    };
    Comment.findOne.mockResolvedValue(mockComment);
    Comment.deleteOne.mockResolvedValue({});

    // Act
    deleteComment(req, res, next);

    // Assert
    setImmediate(() => {
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(Comment.deleteOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Commentaire supprimé !' });
      done();
    });
  });

  it('should return 401 if user is not authorized', (done) => {
    // Arrange
    const mockComment = {
      _id: 'commentId123',
      userId: 'differentUserId',
      text: 'Comment by another user'
    };
    Comment.findOne.mockResolvedValue(mockComment);

    // Act
    deleteComment(req, res, next);

    // Assert
    setImmediate(() => {
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(Comment.deleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
      done();
    });
  });

  it('should handle errors when finding the comment', (done) => {
    // Arrange
    const error = new Error('Comment not found');
    Comment.findOne.mockRejectedValue(error);

    // Act
    deleteComment(req, res, next);

    // Assert
    setImmediate(() => {
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
      done();
    });
  });

  it('should handle errors when deleting the comment', (done) => {
    // Arrange
    const mockComment = {
      _id: 'commentId123',
      userId: 'authenticatedUserId',
      text: 'Comment to delete'
    };
    const deleteError = new Error('Delete failed');
    Comment.findOne.mockResolvedValue(mockComment);
    Comment.deleteOne.mockRejectedValue(deleteError);

    // Act
    deleteComment(req, res, next);

    // Assert
    setImmediate(() => {
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(Comment.deleteOne).toHaveBeenCalledWith({ _id: 'commentId123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: deleteError });
      done();
    });
  });
});