const { modifyComment } = require('../../controllers/comment'); // Ajustez le chemin selon votre structure
const Comment = require('../../models/comment'); // Ajustez le chemin selon votre structure
const globals = require('../../globals'); // Assurez-vous que ce chemin est correct

// Mock des modules
jest.mock('../../models/comment');
jest.mock('../../globals', () => ({
  adminId: 'adminUserId'
}));

describe('modifyComment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'commentId123' },
      body: { text: 'Updated comment text' },
      auth: { userId: 'normalUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should modify a comment successfully for the comment owner', async () => {
    const mockComment = {
      _id: 'commentId123',
      userId: 'normalUserId',
      date: '2023-01-01',
      text: 'Original text'
    };
    Comment.findOne.mockResolvedValue(mockComment);
    Comment.updateOne.mockResolvedValue({});

    await modifyComment(req, res, next);

    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
    expect(Comment.updateOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Commentaire modifié avec succès!',
      commentTxt: 'Updated comment text'
    });
  });

  it('should modify a comment successfully for the admin', async () => {
    req.auth.userId = 'adminUserId';
    const mockComment = {
      _id: 'commentId123',
      userId: 'someOtherUserId',
      date: '2023-01-01',
      text: 'Original text'
    };
    Comment.findOne.mockResolvedValue(mockComment);
    Comment.updateOne.mockResolvedValue({});

    await modifyComment(req, res, next);

    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
    expect(Comment.updateOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Commentaire modifié avec succès!',
      commentTxt: 'Updated comment text'
    });
  });

  it('should return 404 if comment is not found', async () => {
    Comment.findOne.mockResolvedValue(null);

    await modifyComment(req, res, next);

    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Commentaire non trouvé' });
  });

  it('should return 401 if user is not authorized', async () => {
    const mockComment = {
      _id: 'commentId123',
      userId: 'differentUserId',
      date: '2023-01-01',
      text: 'Original text'
    };
    Comment.findOne.mockResolvedValue(mockComment);

    await modifyComment(req, res, next);

    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('should handle errors and return 500', async () => {
    const error = new Error('Database error');
    Comment.findOne.mockRejectedValue(error);

    await modifyComment(req, res, next);

    expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentId123' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});