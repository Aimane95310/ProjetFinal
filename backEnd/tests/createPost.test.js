const { createPost } = require('../controllers/post');
const Post = require('../models/post');

jest.mock('../models/post');

describe('createPost', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { post: JSON.stringify({ text: 'Hello world', _id: '1', _userId: 'userId' }) },
      auth: { userId: 'userId' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
      file: { filename: 'image.jpg' }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should create a post and return status 201', async () => {
    const mockPost = { _id: 'newPostId' };
    Post.prototype.save = jest.fn().mockResolvedValueOnce(mockPost);

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Objet enregistré !' });
  });

  it('should return status 400 if post cannot be saved', async () => {
    const error = new Error('Save failed');
    Post.prototype.save = jest.fn().mockRejectedValueOnce(error);

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error });
  });
});
