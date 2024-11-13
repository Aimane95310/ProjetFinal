/*const bcrypt = require('bcrypt');
const User = require('../models/user');
const { signup } = require('../middleware/auth'); // Assurez-vous que le chemin est correct

// Mock de bcrypt et du modèle User
jest.mock('bcrypt');
jest.mock('../models/user');

describe('Signup Controller', () => {
  // Réinitialisation des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Création d'objets mock pour req, res, et next
  const mockRequest = (body) => ({ body });
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  it('should create a new user successfully', async () => {
    // Arrangement
    const req = mockRequest({ email: 'test@example.com', password: 'password123' });
    const res = mockResponse();
    
    // Mock de bcrypt.hash pour retourner un hash
    bcrypt.hash.mockResolvedValue('hashedPassword');
    
    // Mock de User.prototype.save pour simuler une sauvegarde réussie
    User.prototype.save = jest.fn().mockResolvedValue();

    // Action
    await signup(req, res, mockNext);

    // Assertions
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(User).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashedPassword'
    });
    expect(User.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur créé !' });
  });

  it('should handle validation errors', async () => {
    // Arrangement
    const req = mockRequest({ email: 'invalid-email', password: 'short' });
    const res = mockResponse();
    
    // Mock de User.prototype.save pour simuler une erreur de validation
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    User.prototype.save = jest.fn().mockRejectedValue(validationError);

    // Action
    await signup(req, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  it('should handle duplicate email', async () => {
    // Arrangement
    const req = mockRequest({ email: 'existing@example.com', password: 'password123' });
    const res = mockResponse();
    
    // Mock de User.prototype.save pour simuler une erreur de duplication
    const duplicateError = new Error('Duplicate key');
    duplicateError.code = 11000;
    User.prototype.save = jest.fn().mockRejectedValue(duplicateError);

    // Action
    await signup(req, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cet email est déjà utilisé' });
  });

  it('should handle unexpected errors', async () => {
    // Arrangement
    const req = mockRequest({ email: 'test@example.com', password: 'password123' });
    const res = mockResponse();
    
    // Mock de bcrypt.hash pour simuler une erreur inattendue
    bcrypt.hash.mockRejectedValue(new Error('Unexpected error'));

    // Action
    await signup(req, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur est survenue lors de l\'inscription' });
  });
});*/