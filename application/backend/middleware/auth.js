const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

exports.authorize = (roles = []) => {
    return (req, res, next) => {
        if (req.path === '/auth/login' || req.path === '/auth/register' || req.method === 'GET') {
            return next();
        }

        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.sendStatus(403);

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            if (roles.length && !roles.includes(user.role)) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    };
};