const request = require('supertest');
const app = require('../../app'); // Chemin vers ton fichier app.js ou server.js
const mongoose = require('mongoose');
const User = require('../../models/user'); // Chemin vers ton modèle utilisateur
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Pour vérifier le jeton JWT

describe('POST /api/auth/login', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Crée un utilisateur de test
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            email: 'testlogin@example.com',
            password: hashedPassword
        });
    });

    afterAll(async () => {
        // Supprimer les utilisateurs de test
        await User.deleteMany({});

        // Fermer la connexion à la base de données
        await mongoose.connection.close();
    });

    it('should log in an existing user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testlogin@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('token');

        // Vérifier que le jeton est valide
        const decodedToken = jwt.verify(res.body.token, 'aimaneguerfi2');
        expect(decodedToken.userId).toBe(res.body.userId);
    });

    it('should return 401 for invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testlogin@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Paire identifiant/mot de passe incorrecte');
    });

    it('should return 401 if user does not exist', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Paire identifiant/mot de passe incorrecte');
    });
});
