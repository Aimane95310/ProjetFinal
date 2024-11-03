const { getAllPost } = require('../backEnd/controllers/post');
const Post = require('../backEnd/models/post');

// Mock the Post model
jest.mock('../models/post');

describe('getAllPost', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return all posts with status 200', async () => {
    const mockPosts = [
      { _id: '1', title: 'Post 1', userId: { email: 'user1@example.com' }, date: new Date() },
      { _id: '2', title: 'Post 2', userId: { email: 'user2@example.com' }, date: new Date() }
    ];

    // Mock the Post.find().populate().sort().then() chain
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => {
        callback(mockPosts);
        return {
          catch: jest.fn()
        };
      })
    });

    await getAllPost(req, res, next);

    expect(Post.find).toHaveBeenCalled();
    expect(Post.find().populate).toHaveBeenCalledWith('userId', 'email');
    expect(Post.find().populate().sort).toHaveBeenCalledWith({ date: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPosts);
  });

  it('should handle errors and return status 400', async () => {
    const errorMessage = 'Something went wrong';

    // Mock the Post.find().populate().sort().then() chain to reject
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      then: jest.fn().mockReturnValue({
        catch: jest.fn().mockImplementation(callback => {
          callback(new Error(errorMessage));
        })
      })
    });

    await getAllPost(req, res, next);

    expect(Post.find).toHaveBeenCalled();
    expect(Post.find().populate).toHaveBeenCalledWith('userId', 'email');
    expect(Post.find().populate().sort).toHaveBeenCalledWith({ date: -1 });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
  });
});