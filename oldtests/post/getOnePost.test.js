const { getOnePost } = require('../../backEnd/controllers/post'); 
const Post = require('../../backEnd/models/post'); 

// Mock du modèle Post
jest.mock('../../models/post');

describe('getOnePost', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'somePostId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return a post when it exists', async () => {
    const mockPost = { _id: 'somePostId', title: 'Test Post', content: 'Test Content' };
    Post.findOne.mockResolvedValue(mockPost);

    await getOnePost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'somePostId' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPost);
  });

  it('should return 404 when post is not found', async () => {
    Post.findOne.mockResolvedValue(null);

    await getOnePost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'somePostId' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({"error": "post not found"});
  });

  it('should handle errors and return 404', async () => {
    const error = new Error('Database error');
    Post.findOne.mockRejectedValue(error);

    await getOnePost(req, res, next);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: 'somePostId' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: error });
  });
});