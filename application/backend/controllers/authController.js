const AuthService = require('../services/authService');
const { sanitizeInput } = require('../utils/sanitizer');
const { metrics } = require('../utils/metrics');

class AuthController {
    async register(req, res, next) {
        try {
            let { username, password } = req.body;
            username = sanitizeInput(username);
            password = sanitizeInput(password);

            const { token, user, message } = await AuthService.register(username, password);
            res.status(201).json({ token, user, message });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            // Increment metrics
            metrics.userLoginCounter.inc();
            metrics.activeUsers.inc();

            const { token, user } = await AuthService.login(username, password);
            res.status(200).json({ token, user });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();