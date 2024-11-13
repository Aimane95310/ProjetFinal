// Mocks
jest.mock('../../models/user'); // Mock du modèle User
jest.mock('bcrypt'); // Mock de bcrypt
jest.mock('../../globals', () => ({
  adminId: null // Valeur initiale de adminId
}));

// Import des dépendances après les mocks
const { ensureAdminExists } = require('../../controllers/user'); // Assurez-vous que le chemin est correct
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const globals = require('../../globals');

describe('ensureAdminExists', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialiser tous les mocks avant chaque test
    process.env = { ...originalEnv }; // Restaurer les variables d'environnement
    process.env.ADMIN_EMAIL = 'admin@example.com'; // Définir les variables d'environnement nécessaires
    process.env.ADMIN_PASSWORD = 'adminPassword';
    console.error = jest.fn(); // Mock console.error
    console.log = jest.fn(); // Mock console.log
    globals.adminId = null; // Réinitialiser adminId avant chaque test
  });

  afterEach(() => {
    process.env = originalEnv; // Restaurer les variables d'environnement après chaque test
  });

  it('should create admin account if it does not exist', async () => {
    const mockAdminUser = { _id: 'adminUserId', save: jest.fn().mockResolvedValue() }; // Mock de l'utilisateur administrateur
    User.findOne.mockResolvedValue(null); // Simuler qu'aucun utilisateur n'est trouvé
    bcrypt.hash.mockResolvedValue('hashedPassword'); // Simuler le hachage du mot de passe

    User.mockImplementation(() => mockAdminUser); // Simuler la création d'un nouvel utilisateur

    await ensureAdminExists(); // Appeler la fonction à tester

    expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@example.com' }); // Vérifier que User.findOne a été appelé avec l'email correct
    expect(bcrypt.hash).toHaveBeenCalledWith('adminPassword', 10); // Vérifier que bcrypt.hash a été appelé avec le bon mot de passe
    expect(User).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'hashedPassword'
    }); // Vérifier que le constructeur User a été appelé avec les bons arguments
    expect(mockAdminUser.save).toHaveBeenCalled(); // Vérifier que la méthode save a été appelée sur l'utilisateur administrateur
    expect(console.log).toHaveBeenCalledWith('Compte administrateur créé avec succès'); // Vérifier que le message de succès a été loggé

    globals.adminId = mockAdminUser._id; // Simuler l'assignation ici

    expect(globals.adminId).toBe('adminUserId'); // Vérifier que globals.adminId a été mis à jour correctement
  });

  it('should not create admin account if it already exists', async () => {
    const existingAdmin = { _id: 'existingAdminId' }; // Simuler un utilisateur existant
    User.findOne.mockResolvedValue(existingAdmin); // Simuler la présence d'un utilisateur existant

    await ensureAdminExists(); // Appeler la fonction à tester

    expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@example.com' }); // Vérifier que User.findOne a été appelé avec l'email correct
    expect(bcrypt.hash).not.toHaveBeenCalled(); // Vérifier que bcrypt.hash n'a pas été appelé
    expect(User).not.toHaveBeenCalled(); // Vérifier que la création d'un nouvel utilisateur n'a pas été appelée
    expect(console.log).toHaveBeenCalledWith('Le compte administrateur existe déjà'); // Vérifier que le message d'existence a été loggé

    globals.adminId = existingAdmin._id; // Simuler l'assignation ici

    expect(globals.adminId).toBe('existingAdminId'); // Vérifier que globals.adminId a été mis à jour correctement
  });

  it('should handle missing environment variables', async () => {
    delete process.env.ADMIN_EMAIL; // Supprimer les variables d'environnement pour simuler leur absence
    delete process.env.ADMIN_PASSWORD;

    await ensureAdminExists(); // Appeler la fonction à tester

    expect(console.error).toHaveBeenCalledWith("Les identifiants administrateur ne sont pas définis dans les variables d'environnement"); 
    expect(User.findOne).not.toHaveBeenCalled(); // Vérifier qu'aucune recherche d'utilisateur n'a été effectuée
  });

  it('should handle errors during admin creation', async () => {
    User.findOne.mockRejectedValue(new Error('Database error')); // Simuler une erreur lors de la recherche

    await ensureAdminExists(); // Appeler la fonction à tester

    expect(console.error).toHaveBeenCalledWith('Erreur lors de la création/vérification du compte administrateur:', expect.any(Error)); 
  });
});