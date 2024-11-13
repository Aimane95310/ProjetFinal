const { modifyPost } = require('../../controllers/post');
const Post = require('../../models/post');
const globals = require('../../globals');

jest.mock('../../models/post');
jest.mock('../../globals', () => ({
  adminId: 'adminUserId'
}));

describe('modifyPost Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'postId123' },
      body: { post: JSON.stringify({ text: 'Updated post text' }) },
      auth: { userId: 'normalUserId' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    console.error = jest.fn();
    jest.clearAllMocks();
  });

  it('should modify a post successfully for the post owner', async () => {
    const mockPost = {
      _id: 'postId123',
      userId: 'normalUserId',
      text: 'Original text'
    };
    Post.findOne.mockResolvedValue(mockPost);
    Post.updateOne.mockResolvedValue({});

    await modifyPost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postId123' });
    expect(Post.updateOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Objet modifié!' });
  });

  it('should modify a post successfully for the admin', async () => {
    req.auth.userId = 'adminUserId';
    const mockPost = {
      _id: 'postId123',
      userId: 'someOtherUserId',
      text: 'Original text'
    };
    Post.findOne.mockResolvedValue(mockPost);
    Post.updateOne.mockResolvedValue({});

    await modifyPost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postId123' });
    expect(Post.updateOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Objet modifié!' });
  });
/*
  it('should return 404 if post is not found', async () => {
    Post.findOne.mockResolvedValue({ userId: null });

    await modifyPost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postId123' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post non trouvé' });
  });

  it('should return 401 if user is not authorized', async () => {
    const mockPost = {
      _id: 'postId123',
      userId: 'differentUserId',
      text: 'Original text'
    };
    Post.findOne.mockResolvedValue(mockPost);

    await modifyPost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postId123' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('should handle file upload correctly', async () => {
    req.file = { filename: 'newimage.jpg' };
    const mockPost = {
      _id: 'postId123',
      userId: 'normalUserId',
      text: 'Original text'
    };
    Post.findOne.mockResolvedValue(mockPost);
    Post.updateOne.mockResolvedValue({});

    await modifyPost(req, res, next);

    expect(Post.updateOne).toHaveBeenCalledWith(
      { _id: 'postId123' },
      expect.objectContaining({
        imageUrl: 'http://localhost/images/newimage.jpg'
      })
    );
  });

  it('should handle CastError and return 404', async () => {
    const error = new Error('Invalid ID');
    error.name = 'CastError';
    error.kind = 'ObjectId';
    Post.findOne.mockRejectedValue(error);

    await modifyPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post non trouvé' });
  });

  it('should handle other errors and return 500', async () => {
    const error = new Error('Database error');
    Post.findOne.mockRejectedValue(error);

    await modifyPost(req, res, next);

    expect(console.error).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Database error'
    });
  });*/
});