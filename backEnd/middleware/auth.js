const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log('token:', token);
        console.log('Secret JWT:', process.env.JWT_SECRET);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        console.log('Secret JWT:', process.env.JWT_SECRET);
        res.status(401).json({ error });
    }
};