const fs = require('fs');
const Post = require('../../models/post');  
const { deletePost } = require('../../controllers/post');  

// Mocks
jest.mock('../../models/post');
jest.mock('fs', () => ({
  unlink: jest.fn((path, callback) => callback())
}));

describe('deletePost Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'somePostId' },
      auth: { userId: 'someUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if post is not found', (done) => {
    Post.findOne.mockReturnValue(Promise.resolve(null));

    deletePost(req, res, next);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Pos not found' });
      done();
    });
  });

  it('should return 401 if user is not authorized', (done) => {
    Post.findOne.mockReturnValue(Promise.resolve({ userId: 'differentUserId', imageUrl: 'http://example.com/images/image.jpg' }));

    deletePost(req, res, next);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
      done();
    });
  });

  it('should delete post and return 200 if everything is okay', (done) => {
    Post.findOne.mockReturnValue(Promise.resolve({ 
      userId: 'someUserId', 
      imageUrl: 'http://example.com/images/image.jpg' 
    }));
    Post.deleteOne.mockReturnValue(Promise.resolve({}));

    deletePost(req, res, next);

    setImmediate(() => {
      expect(fs.unlink).toHaveBeenCalledWith('images/image.jpg', expect.any(Function));
      expect(Post.deleteOne).toHaveBeenCalledWith({ _id: 'somePostId' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Objet supprimé !' });
      done();
    });
  });

  it('should return 401 if there is an error during post deletion', (done) => {
    Post.findOne.mockReturnValue(Promise.resolve({ 
      userId: 'someUserId', 
      imageUrl: 'http://example.com/images/image.jpg' 
    }));
    Post.deleteOne.mockReturnValue(Promise.reject(new Error('Deletion error')));

    deletePost(req, res, next);

    setImmediate(() => {
      expect(fs.unlink).toHaveBeenCalledWith('images/image.jpg', expect.any(Function));
      expect(Post.deleteOne).toHaveBeenCalledWith({ _id: 'somePostId' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: new Error('Deletion error') });
      done();
    });
  });

  it('should return 500 if there is an error during post search', (done) => {
    Post.findOne.mockReturnValue(Promise.reject(new Error('Database error')));

    deletePost(req, res, next);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: new Error('Database error') });
      done();
    });
  });
});