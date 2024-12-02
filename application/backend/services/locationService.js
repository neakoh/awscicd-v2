const { initializeDatabase } = require('../config/db');

class LocationService {
    async getAll() {
        const db = await initializeDatabase()
        const result = await db.query('SELECT * FROM location');
        return result.rows;
    }

    async getById(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'SELECT * FROM location WHERE id = \$1',
            [id]
        );
        return result.rows[0];
    }

    async create(name) {
        const db = await initializeDatabase()
        const result = await db.query(
            'INSERT INTO location (name) VALUES (\$1) RETURNING *',
            [name]
        );
        return result.rows[0];
    }

    async update(name, id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'UPDATE location SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'DELETE FROM location WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

}

module.exports = new LocationService();