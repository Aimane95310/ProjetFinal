const request = require('supertest');
const app = require('../backEnd/app');
const mongoose = require('mongoose');
const User = require('../backEnd/models/user');
const bcrypt = require('bcrypt');

describe('POST /api/auth/signup', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test pour vérifier la création d'un nouvel utilisateur
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        // Vérifier le statut de réponse et le message pour un utilisateur créé
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Utilisateur créé !');

        // Vérifier que l'utilisateur a été créé et que le mot de passe est haché
        const user = await User.findOne({ email: 'test@example.com' });
        expect(user).not.toBeNull();
        const isPasswordValid = await bcrypt.compare('password123', user.password);
        expect(isPasswordValid).toBe(true);
    });

    // Test pour vérifier la gestion d'un utilisateur déjà existant
    it('should return 400 if user already exists', async () => {
        await User.create({
            email: 'test2@example.com',
            password: await bcrypt.hash('password123', 10)
        });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'test2@example.com',
                password: 'password123'
            });

        // Vérifier le statut de réponse et le message d'erreur pour un utilisateur déjà existant
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
