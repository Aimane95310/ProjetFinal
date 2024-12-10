const bcrypt = require('bcrypt');
const User = require('../../models/user'); // Modèle utilisateur
const { ensureAdminExists } = require('../../controllers/user'); // Méthode à tester
const globals = require('../../globals'); // Variable globale pour stocker l'ID administrateur

jest.mock('../../models/user'); // Mock du modèle User
jest.mock('bcrypt'); // Mock de bcrypt pour éviter des hachages réels

describe('ensureAdminExists', () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'securePassword';
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
        // Configuration des variables d'environnement pour chaque test
        process.env.ADMIN_EMAIL = adminEmail;
        process.env.ADMIN_PASSWORD = adminPassword;
        globals.adminId = null; // Réinitialiser l'ID administrateur global avant chaque test

        jest.clearAllMocks(); // Réinitialiser tous les mocks
    });

    test('crée un compte administrateur si inexistant', async () => {
        // Simule qu'aucun compte administrateur n'existe
        User.findOne.mockResolvedValue(null);
        // Simule le hachage du mot de passe
        bcrypt.hash.mockResolvedValue(hashedPassword);

        // Mock de la méthode `save` sur une instance de User
        const mockSave = jest.fn().mockResolvedValue({ _id: '12345' });
        User.mockImplementation(function () {
            this.save = mockSave;
        });

        // Exécute la méthode à tester
        await ensureAdminExists();

        // Assertions
        expect(User.findOne).toHaveBeenCalledWith({ email: adminEmail }); // Vérifie la recherche de l'utilisateur
        expect(bcrypt.hash).toHaveBeenCalledWith(adminPassword, 10); // Vérifie le hachage du mot de passe
        expect(mockSave).toHaveBeenCalled(); // Vérifie que la sauvegarde a été appelée
        expect(globals.adminId).toBe('12345'); // Vérifie que l'ID admin est stocké correctement
    });

    test('ne crée pas de compte si un administrateur existe déjà', async () => {
        // Simule qu'un compte administrateur existe déjà
        User.findOne.mockResolvedValue({ _id: '12345', email: adminEmail });

        // Exécute la méthode à tester
        await ensureAdminExists();

        // Assertions
        expect(User.findOne).toHaveBeenCalledWith({ email: adminEmail }); // Vérifie la recherche de l'utilisateur
        expect(bcrypt.hash).not.toHaveBeenCalled(); // Vérifie qu'aucun hachage n'a été effectué
        expect(globals.adminId).toBe('12345'); // Vérifie que l'ID admin est stocké correctement
    });

    test('affiche une erreur si les variables d’environnement sont manquantes', async () => {
        // Supprime les variables d'environnement
        delete process.env.ADMIN_EMAIL;
        delete process.env.ADMIN_PASSWORD;

        // Mock de console.error pour capturer les erreurs
        console.error = jest.fn();

        // Exécute la méthode à tester
        await ensureAdminExists();

        // Assertions
        expect(console.error).toHaveBeenCalledWith(
            "Les identifiants administrateur ne sont pas définis dans les variables d'environnement"
        );
        expect(User.findOne).not.toHaveBeenCalled(); // Vérifie que la recherche n'a pas été effectuée
    });

    test('gère les erreurs lors de l’exécution', async () => {
        // Simule une erreur lors de la recherche de l'utilisateur
        const mockError = new Error('Erreur lors de la recherche');
        User.findOne.mockRejectedValue(mockError);

        // Mock de console.error pour capturer les erreurs
        console.error = jest.fn();

        // Exécute la méthode à tester
        await ensureAdminExists();

        // Assertions
        expect(console.error).toHaveBeenCalledWith(
            'Erreur lors de la création/vérification du compte administrateur:',
            mockError
        );
    });
});
