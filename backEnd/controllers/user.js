const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const globals = require('../globals');
exports.signup = async (req, res, next) => {
    try {
        // Hachage du mot de passe
        const hash = await bcrypt.hash(req.body.password, 10);

        // Création d'un nouvel utilisateur
        const user = new User({
            email: req.body.email,
            password: hash
        });

        // Sauvegarde de l'utilisateur dans la base de données
        await user.save();

        // Envoi de la réponse de succès
        res.status(201).json({ message: 'Utilisateur créé !' });

    } catch (error) {
        console.error(error);

        // Gestion des erreurs
        if (error.name === 'ValidationError') {
            // Erreur de validation MongoDB (ex: email invalide)
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            // Erreur de duplication (email déjà utilisé)
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        } else {
            // Autres erreurs
            res.status(500).json({ error: 'Une erreur est survenue lors de l\'inscription' });
        }
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
        }

        const valid = await bcrypt.compare(req.body.password, user.password);

        if (!valid) {
            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
        }

        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la connexion' });
    }
};
exports.ensureAdminExists = async () => {
    try {
        // Récupérer les identifiants administrateur depuis les variables d'environnement
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Vérification des variables d'environnement nécessaires
        if (!adminEmail || !adminPassword) {
            console.error(
                'Les identifiants administrateur ne sont pas définis dans les variables d\'environnement'
            );
            return; // Sortie si les variables d'environnement sont absentes
        }

        // Rechercher le compte administrateur dans la base de données
        let existingAdmin = await User.findOne({ email: adminEmail });

        // Si le compte administrateur n'existe pas
        if (!existingAdmin) {
            console.log('Aucun compte administrateur trouvé, création en cours...');

            // Hasher le mot de passe administrateur
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Créer une nouvelle instance d'utilisateur avec les informations administrateur
            const adminUser = new User({
                email: adminEmail,
                password: hashedPassword, // Enregistre le mot de passe haché pour plus de sécurité
            });

            // Sauvegarder le compte administrateur dans la base de données
            existingAdmin = await adminUser.save();
            console.log('Compte administrateur créé avec succès');
        } else {
            // Si le compte administrateur existe déjà, afficher un message d'information
            console.log('Le compte administrateur existe déjà');
        }

        // Stocker l'ID de l'administrateur dans une variable globale
        globals.adminId = existingAdmin._id;
        console.log(`ID administrateur stocké : ${globals.adminId}`);
    } catch (error) {
        // Gestion des erreurs lors de l'exécution
        console.error('Erreur lors de la création/vérification du compte administrateur:', error);
    }
};
