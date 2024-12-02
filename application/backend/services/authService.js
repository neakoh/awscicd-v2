const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeDatabase } = require('../config/db');
const { JWT_SECRET } = require('../config/jwt');

class AuthService {
    async register(username, password) {
        const hashedPassword = await bcrypt.hash(password, 8);
        
        const query = 'INSERT INTO credentials (username, password) VALUES (\$1, \$2) RETURNING *';
        const db = await initializeDatabase()
        const result = await db.query(query, [username, hashedPassword]);
        
        const user = { 
            username, 
            role: result.rows[0].role 
        };
        
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
        
        return { 
            token, 
            user, 
            message: 'User registered successfully' 
        };
    }

    async login(username, password) {
        const query = 'SELECT password, role FROM credentials WHERE username = \$1';
        const db = await initializeDatabase()
        const result = await db.query(query, [username]);

        if (result.rows.length === 0) {
            throw new Error('Invalid username or password');
        }

        const retrieved_hash = result.rows[0].password;
        const isPasswordValid = await bcrypt.compare(password, retrieved_hash);

        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        const user = { 
            username, 
            role: result.rows[0].role 
        };
        
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

        return { token, user };
    }
}

module.exports = new AuthService();